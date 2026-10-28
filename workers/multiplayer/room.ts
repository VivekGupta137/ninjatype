import { DurableObject } from 'cloudflare:workers';
import { MultiplayerError, PROGRESS_MS, SOCKET_PROTOCOL, decodeHeader, roomPlayerLimit, type ClientCommand, type Entry, type RoomState, type LiveStandings, type RaceSettings } from '../../src/lib/multiplayer/protocol';
import { raceText } from './dictionaries';
import { type Env, json } from './env';
import { RoomEngine } from './engine';
import { botCorrectChars } from '../../src/lib/multiplayer/bots';

interface Receipt { hash: string; kind: 'create' | 'entry'; until: number; epoch: string; fingerprint: string }
interface Stored { state: RoomState | null; previousResults: RoomState['round']; receipts: Receipt[] }
interface Attachment { id: string; epoch: string; window: number; commands: number; syncs: number; controls?: number;
    chats?: number; progress?: { roundId: string; correctChars: number; updatedAt: number }; standingsBroadcast?: { roundId: string; at: number } }

export class Room extends DurableObject<Env> {
    private engine: RoomEngine | null = null;
    private receipts: Receipt[] = [];
    private dirty = false;
    private unavailable = false;
    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env);
        ctx.blockConcurrencyWhile(async () => {
            const saved = await ctx.storage.get<Stored>('room');
            this.receipts = saved?.receipts ?? [];
            if (saved?.state) {
                const savedCapacity = saved.state.maxPlayers;
                this.engine = new RoomEngine(saved.state, raceText);
                this.dirty ||= savedCapacity !== this.engine.state.maxPlayers;
                this.engine.previousResults = saved.previousResults;
                const sockets = ctx.getWebSockets();
                for (const member of saved.state.members) {
                    if (member.bot) continue;
                    const connected = sockets.some(ws => { const a = ws.deserializeAttachment() as Attachment; return a.epoch === saved.state!.epoch && a.id === member.id; });
                    if (member.connected && !connected) { this.engine.disconnect(member.id, Date.now()); this.dirty = true; }
                }
            }
        });
    }
    private async persist(now: number) {
        try { await this.writeState(now); }
        catch (error) {
            // Never acknowledge an in-memory transition after storage/alarm failure.
            this.unavailable = true;
            for (const ws of this.ctx.getWebSockets()) {
                try { ws.close(1011, 'Multiplayer unavailable; keep practicing'); } catch { /* Already closed. */ }
            }
            throw error;
        }
    }
    private async writeState(now: number) {
        const retained = this.receipts.filter(r => now < r.until);
        if (retained.length !== this.receipts.length) this.dirty = true;
        this.receipts = retained;
        if (!this.engine && !this.receipts.length) {
            await this.ctx.storage.deleteAll(); this.dirty = false; return;
        }
        if (this.dirty) {
            await this.ctx.storage.put('room', { state: this.engine?.state ?? null,
                previousResults: this.engine?.previousResults ?? null, receipts: this.receipts } satisfies Stored);
            this.dirty = false;
        }
        const next = this.engine ? this.engine.nextDeadline(now) : Math.min(...this.receipts.map(r => r.until));
        if (await this.ctx.storage.getAlarm() !== next) await this.ctx.storage.setAlarm(next);
    }
    private close(reason: string) {
        const s = this.engine?.state;
        for (const ws of this.ctx.getWebSockets()) {
            try { ws.send(JSON.stringify({ type: 'closed', reason })); ws.close(1000, 'Room closed'); } catch { /* Already disconnected. */ }
        }
        this.engine = null; this.dirty = true;
        if (s) this.ctx.waitUntil(this.env.DIRECTORY.get(this.env.DIRECTORY.idFromName('public-v1'))
            .fetch('https://directory/remove', { method: 'POST', body: JSON.stringify({ name: s.name, epoch: s.epoch }) }).then(() => {}).catch(() => {}));
    }
    private advance(now: number) {
        if (!this.engine) return;
        const before = this.engine.state.sequence;
        const reason = this.engine.advance(now);
        if (reason) this.close(reason);
        else if (this.engine.state.sequence !== before) this.dirty = true;
    }
    private snapshot(ws: WebSocket, now: number) {
        if (!this.engine || this.unavailable) return;
        const a = ws.deserializeAttachment() as Attachment;
        if (a.epoch !== this.engine.state.epoch) return;
        if (!this.engine.state.members.some(m => m.id === a.id && m.connected)) {
            try { ws.send(JSON.stringify({ type: 'closed', reason: 'Your seat is no longer available in this room.' })); ws.close(1000, 'Seat removed'); } catch {}
            return;
        }
        try { ws.send(JSON.stringify({ type: 'snapshot', serverTime: now, selfId: a.id, room: this.engine.state, standings: this.standings(now) })); } catch { /* Close event reserves the seat. */ }
    }
    private broadcast(now: number) { for (const ws of this.ctx.getWebSockets()) this.snapshot(ws, now); }
    private standings(now: number): LiveStandings | undefined {
        const state = this.engine?.state, round = state?.round;
        if (!round || state?.phase !== 'racing') return;
        const players = this.ctx.getWebSockets().flatMap(ws => {
            const a = ws.deserializeAttachment() as Attachment;
            const progress = a.progress;
            return a.epoch === state.epoch && progress?.roundId === round.id && round.players.some(p => p.id === a.id)
                ? [{ id: a.id, correctChars: progress.correctChars, updatedAt: progress.updatedAt }] : [];
        });
        for (const player of round.players) if (player.bot) players.push({ id: player.id, correctChars: botCorrectChars(round, player, now), updatedAt: now });
        return { type: 'standings', roundId: round.id, serverTime: now, players };
    }
    private updateProgress(ws: WebSocket, a: Attachment, command: Extract<ClientCommand, { type: 'progress' }>, now: number) {
        const state = this.engine!.state, round = state.round;
        if (!round || command.roundId !== round.id) throw new MultiplayerError('stale_round', 'That round is no longer current.');
        if (state.phase !== 'racing' || now < round.startAt || now >= round.deadline)
            throw new MultiplayerError('not_racing', 'Progress is only available during a race.');
        if (!round.players.some(p => p.id === a.id) || !state.members.some(m => m.id === a.id && m.connected))
            throw new MultiplayerError('not_in_round', 'You are not a player in this round.');
        if (!Number.isSafeInteger(command.correctChars) || command.correctChars < 0 || command.correctChars > round.text.length)
            throw new MultiplayerError('invalid_progress', 'Invalid typing progress.');
        const window = Math.floor((now - round.startAt) / PROGRESS_MS);
        if (a.progress?.roundId === round.id && Math.floor((a.progress.updatedAt - round.startAt) / PROGRESS_MS) >= window) return;
        const lastBroadcast = Math.max(0, ...this.ctx.getWebSockets().map(socket => {
            const attached = socket.deserializeAttachment() as Attachment;
            return attached.standingsBroadcast?.roundId === round.id ? attached.standingsBroadcast.at : 0;
        }));
        // Socket attachments survive hibernation; live estimates never write room state or KV.
        a.progress = { roundId: round.id, correctChars: command.correctChars, updatedAt: now };
        const publish = lastBroadcast === 0 || Math.floor((lastBroadcast - round.startAt) / PROGRESS_MS) < window;
        ws.serializeAttachment(a);
        if (publish) {
            const message = JSON.stringify(this.standings(now));
            for (const socket of this.ctx.getWebSockets()) {
                const attached = socket.deserializeAttachment() as Attachment;
                attached.standingsBroadcast = { roundId: round.id, at: now };
                socket.serializeAttachment(attached);
                try { socket.send(message); } catch { /* Already disconnected. */ }
            }
        }
    }
    async fetch(request: Request): Promise<Response> {
        if (this.unavailable) return json({ code: 'unavailable', message: 'Multiplayer is temporarily unavailable. You can keep practicing.' }, 503);
        return this.ctx.blockConcurrencyWhile(async () => {
            const now = Date.now();
            let broadcast = false;
            try {
                this.advance(now);
                const url = new URL(request.url);
                if (url.pathname === '/create') {
                    const body = await request.json() as RaceSettings & { name: string; wordCount: number; hash: string; fingerprint: string; quickMatch?: boolean; enterExisting?: boolean; epoch?: string };
                    const existing = this.receipts.find(r => r.hash === body.hash && now < r.until);
                    if (existing) {
                        if (existing.kind !== 'create' || existing.fingerprint !== body.fingerprint) throw new MultiplayerError('token_reused', 'That challenge was already used.', 409);
                        return json({ name: body.name, epoch: existing.epoch });
                    }
                    if (this.engine) {
                        if (!body.enterExisting) throw new MultiplayerError('room_exists', 'That room name is already in use.', 409);
                        const state = this.engine.state;
                        if (body.epoch && body.epoch !== state.epoch) throw new MultiplayerError('room_replaced', 'This room has expired or been replaced.', 410);
                        if (state.phase === 'lobby' && state.members.filter(m => !m.spectator).length >= state.maxPlayers) throw new MultiplayerError('room_full', 'This room is full. Try another room.', 409);
                        this.recordReceipt(body.hash, 'create', now, body.fingerprint, state.epoch);
                        return json({ name: state.name, epoch: state.epoch, quickMatch: !!state.quickMatch });
                    }
                    if (body.epoch) throw new MultiplayerError('room_not_found', 'This invitation has expired. Create a new room.', 404);
                    this.recordReceipt(body.hash, 'create', now, body.fingerprint, crypto.randomUUID());
                    const epoch = this.receipts.at(-1)!.epoch;
                    this.engine = new RoomEngine(RoomEngine.create(body.name, body.wordCount, now, epoch, roomPlayerLimit(this.env.MAX_PLAYERS_PER_ROOM), { ...body, autoStart: true, allowSpectators: true }), raceText);
                    this.dirty = true;
                    const state = this.engine.state;
                    this.ctx.waitUntil(this.env.DIRECTORY.get(this.env.DIRECTORY.idFromName('public-v1')).fetch('https://directory/register', {
                        method: 'POST', body: JSON.stringify({ name: state.name, epoch: state.epoch, createdAt: state.createdAt, expiresAt: state.expiresAt, maxPlayers: state.maxPlayers }),
                    }).then(() => {}).catch(() => {}));
                    return json({ name: state.name, epoch: state.epoch });
                }
                if (!this.engine) throw new MultiplayerError('room_not_found', 'This room does not exist or has expired.', 404);
                const entry = JSON.parse(decodeHeader(request.headers.get('X-Room-Entry')!)) as Entry;
                const hash = request.headers.get('X-Challenge-Hash')!;
                if (this.receipts.some(r => r.hash === hash && now < r.until)) throw new MultiplayerError('token_reused', 'Use a fresh challenge for each connection.', 409);
                if (this.receipts.filter(r => now < r.until).length >= 1024) throw new MultiplayerError('rate_limited', 'This room has had too many connection attempts. Try later.', 429);
                const id = this.engine.join(entry, now);
                this.recordReceipt(hash, 'entry', now, '', this.engine.state.epoch);
                const [client, server] = Object.values(new WebSocketPair());
                server.serializeAttachment({ id, epoch: this.engine.state.epoch, window: now, commands: 0, syncs: 0 } satisfies Attachment);
                this.ctx.acceptWebSocket(server);
                this.dirty = true; broadcast = true;
                return new Response(null, { status: 101, webSocket: client, headers: { 'Sec-WebSocket-Protocol': SOCKET_PROTOCOL } });
            } catch (e) { return this.error(e); }
            finally { await this.persist(now); if (broadcast) this.broadcast(now); }
        });
    }
    private recordReceipt(hash: string, kind: Receipt['kind'], now: number, fingerprint: string, epoch: string) {
        this.receipts = this.receipts.filter(r => now < r.until);
        if (this.receipts.length >= 1024) throw new MultiplayerError('rate_limited', 'Too many room operations. Try later.', 429);
        this.receipts.push({ hash, kind, until: now + 5 * 60_000, epoch, fingerprint }); this.dirty = true;
    }
    private error(e: unknown) {
        if (e instanceof MultiplayerError) return json({ code: e.code, message: e.message }, e.status);
        return json({ code: 'unavailable', message: 'Multiplayer is temporarily unavailable. You can keep practicing.' }, 503);
    }
    async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
        await this.ctx.blockConcurrencyWhile(async () => {
            const now = Date.now();
            let changed = false;
            let progressOnly = false;
            try {
                if (this.unavailable) { ws.close(1011, 'Multiplayer unavailable'); return; }
                if (this.env.MULTIPLAYER_ENABLED !== 'true') { this.close('Multiplayer is under maintenance. You can keep practicing.'); return; }
                const before = this.engine?.state.sequence;
                this.advance(now);
                changed = this.engine?.state.sequence !== before;
                if (!this.engine) return;
                const a = ws.deserializeAttachment() as Attachment;
                if (a.epoch !== this.engine.state.epoch) { ws.close(1008, 'Room replaced'); return; }
                if (now - a.window >= 10_000) { a.window = now; a.commands = 0; a.syncs = 0; a.controls = 0; a.chats = 0; }
                a.commands++;
                ws.serializeAttachment(a);
                if (a.commands > 30) { ws.close(1008, 'Command rate exceeded'); return; }
                if (typeof message !== 'string' || message.length > (this.engine.state.mode === 'time' ? 32_768 : 4096)) throw new MultiplayerError('invalid_command', 'Invalid room command.');
                const command = JSON.parse(message) as ClientCommand;
                if (!command || typeof command !== 'object') throw new MultiplayerError('invalid_command', 'Invalid room command.');
                if (command.type === 'progress') {
                    progressOnly = true;
                    this.updateProgress(ws, a, command, now);
                    return;
                }
                // One-second progress uploads have their own aligned-window throttle.
                // Keep the existing control-command limit without blocking final scores.
                a.controls = (a.controls ?? 0) + 1; ws.serializeAttachment(a);
                if (a.controls > 10) throw new MultiplayerError('rate_limited', 'Too many commands. Wait a moment.', 429);
                if (command.type === 'chat') {
                    a.chats = (a.chats ?? 0) + 1; ws.serializeAttachment(a);
                    if (a.chats > 2) throw new MultiplayerError('rate_limited', 'Send at most two messages every ten seconds.', 429);
                }
                if (command.type === 'sync') {
                    a.syncs++; ws.serializeAttachment(a);
                    if (a.syncs > 2) throw new MultiplayerError('rate_limited', 'Wait before resyncing.', 429);
                }
                const seq = this.engine.state.sequence;
                this.engine.command(a.id, command, now);
                changed ||= seq !== this.engine.state.sequence;
                this.dirty ||= changed;
                if (!changed) this.snapshot(ws, now);
            } catch (e) {
                const error = e instanceof MultiplayerError ? e : new MultiplayerError('invalid_command', 'Invalid room command.');
                try { ws.send(JSON.stringify({ type: 'error', code: error.code, message: error.message })); } catch { /* Socket closed. */ }
            } finally { if (!progressOnly || changed) await this.persist(now); if (changed) this.broadcast(now); }
        });
    }
    async webSocketClose(ws: WebSocket) { await this.disconnect(ws); }
    async webSocketError(ws: WebSocket) { try { ws.close(1011, 'Connection error'); } catch {} await this.disconnect(ws); }
    private async disconnect(ws: WebSocket) {
        await this.ctx.blockConcurrencyWhile(async () => {
            const now = Date.now(); this.advance(now);
            const a = ws.deserializeAttachment() as Attachment;
            if (this.engine && a.epoch === this.engine.state.epoch) {
                const replacement = this.ctx.getWebSockets().some(other => {
                    if (other === ws || other.readyState !== WebSocket.OPEN) return false;
                    const attached = other.deserializeAttachment() as Attachment;
                    return attached.id === a.id && attached.epoch === a.epoch;
                });
                const seq = this.engine.state.sequence;
                if (!replacement) this.engine.disconnect(a.id, now);
                this.dirty ||= seq !== this.engine.state.sequence;
            }
            await this.persist(now); this.broadcast(now);
        });
    }
    async alarm() {
        await this.ctx.blockConcurrencyWhile(async () => {
            const now = Date.now(); this.advance(now); await this.persist(now); this.broadcast(now);
        });
    }
}
