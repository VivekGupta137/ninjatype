import { completedRaceWords, normalizeRaceInput } from '../onlineRace';
import { botFinishAt, botMetrics } from './bots';
import {
    COUNTDOWN_MS, DEFAULT_MAX_PLAYERS, MAX_SPECTATORS, GRACE_MS, METRICS_MS, RESULTS_MS, ROOM_LIFETIME_MS,
    MultiplayerError, WORD_COUNTS, avatarSettings, nickname, roomPlayerLimit, raceSettings, type ClientCommand, type Entry, type Metrics, type RoomState, type RaceSettings, type DictionaryKey,
} from './protocol';

/** Pure room transitions. The DO serializes, persists and broadcasts these changes. */
export class RoomEngine {
    constructor(public state: RoomState, private makeText: (words: number, dictionary: DictionaryKey, duration?: number) => string, private uuid: () => string = () => crypto.randomUUID(), private random = Math.random) {
        state.maxPlayers = roomPlayerLimit(state.maxPlayers); // Older persisted rooms retain their original ten-seat capacity.
        Object.assign(state, raceSettings(state));
        this.electHost();
    }
    static create(name: string, wordCount: number, now: number, epoch: string, maxPlayers = DEFAULT_MAX_PLAYERS, settings: Partial<RaceSettings> & { quickMatch?: boolean; autoStart?: boolean; allowSpectators?: boolean } = {}): RoomState {
        if (settings.quickMatch) { wordCount = 30; settings = { mode: 'words', dictionary: '1k', quickMatch: true, autoStart: true, allowSpectators: true }; }
        return { name, epoch, quickMatch: !!settings.quickMatch, autoStart: !!settings.autoStart, allowSpectators: settings.allowSpectators !== false, hostId: null, chat: [], createdAt: now, expiresAt: now + ROOM_LIFETIME_MS, emptyUntil: now + GRACE_MS,
            ...raceSettings(settings), wordCount, maxPlayers: roomPlayerLimit(maxPlayers), sequence: 0, phase: 'lobby', members: [], round: null, lastCountdownAt: 0 };
    }
    private change() { this.state.sequence++; }
    private electHost() {
        const s = this.state;
        if (!s.members.some(m => m.id === s.hostId && m.connected && !m.spectator && !m.bot)) s.hostId = s.members.find(m => m.connected && !m.spectator && !m.bot)?.id ?? null;
    }
    private autoCountdown(now: number) {
        const s = this.state, players = s.members.filter(m => !m.spectator);
        if (s.quickMatch && !s.quickMatchFilled) return;
        if (s.phase === 'lobby' && s.autoStart && players.some(m => !m.bot) && players.length >= 2 && players.every(m => m.connected && m.ready) && this.hasTimeForRound(now) && (!s.lastCountdownAt || now - s.lastCountdownAt >= 10_000)) this.countdown(players.map(m => m.id), now);
    }
    private fillBots(now: number) {
        const s = this.state;
        s.botFillAt = null;
        if (s.phase !== 'lobby' || !s.members.some(m => m.connected && !m.bot && !m.spectator)) { this.change(); return; }
        const count = Math.max(0, Math.min(2 + Math.floor(this.random() * 3) - s.members.filter(m => m.bot).length, s.maxPlayers - s.members.filter(m => !m.spectator).length));
        const first = ['Swift', 'Quiet', 'Pixel', 'Lucky', 'Cosmic', 'Silver', 'Amber', 'Blue'];
        const last = ['Fox', 'Panda', 'Owl', 'Otter', 'Tiger', 'Comet', 'Maple', 'Falcon'];
        s.pendingBots = [];
        let joinAt = now;
        for (let i = 0; i < count; i++) {
            const base = `${first[Math.floor(this.random() * first.length)]}${last[Math.floor(this.random() * last.length)]}`;
            let accepted = base;
            for (let suffix = 2; [...s.members, ...s.pendingBots].some(m => m.nickname === accepted); suffix++) accepted = `${base} ${suffix}`;
            if (i > 0) joinAt += 1000 + Math.floor(this.random() * 3001);
            s.pendingBots.push({ id: this.uuid(), nickname: accepted, avatar: { style: 'moods', background: 'auto', seed: this.uuid(), variant: Math.floor(this.random() * 32) },
                bot: true, botWpm: 40 + Math.floor(this.random() * 46), botDelayMs: 600 + Math.floor(this.random() * 1001),
                botJoinAt: joinAt, botReadyAt: joinAt + 2000 + Math.floor(this.random() * 5001),
                connected: true, disconnectedUntil: null, ready: false, rematch: false });
        }
        s.quickMatchFilled = count === 0; this.change();
    }
    private advanceBots(now: number) {
        const s = this.state;
        if (s.phase !== 'lobby') return;
        if (!s.members.some(m => m.connected && !m.bot && !m.spectator)) {
            if (s.pendingBots?.length) { s.pendingBots = []; this.change(); }
            return;
        }
        for (const bot of s.pendingBots ?? []) {
            if (bot.botJoinAt > now) continue;
            if (s.members.filter(m => !m.spectator).length < s.maxPlayers) {
                let accepted = bot.nickname;
                for (let suffix = 2; s.members.some(m => m.nickname === accepted); suffix++) accepted = `${bot.nickname} ${suffix}`;
                const member = { ...bot };
                delete (member as Partial<typeof bot>).botJoinAt;
                s.members.push({ ...member, nickname: accepted });
            }
            this.change();
        }
        s.pendingBots = s.pendingBots?.filter(bot => bot.botJoinAt > now);
        if (!s.quickMatchFilled && s.botFillAt == null && !s.pendingBots?.length) { s.quickMatchFilled = true; this.change(); }
        for (const bot of s.members) if (bot.bot && !bot.ready && bot.botReadyAt != null && now >= bot.botReadyAt) {
            bot.ready = true; delete bot.botReadyAt; this.change();
        }
    }
    /** Returns a closure reason; transitions use scheduled timestamps even if alarms arrive late. */
    advance(now: number): string | null {
        const s = this.state;
        if (now >= s.expiresAt) return 'Room reached its 20-minute lifetime.';
        if (s.emptyUntil !== null && now >= s.emptyUntil) return 'Room closed after two minutes without players.';
        if (s.quickMatch && s.botFillAt != null && now >= s.botFillAt) this.fillBots(s.botFillAt);
        if (s.quickMatch) this.advanceBots(now);
        if (s.phase === 'results' && s.round?.resultsUntil !== null && now >= s.round!.resultsUntil!)
            return 'The two-minute rematch window ended.';
        const retained = s.members.filter(m => m.connected || m.disconnectedUntil === null || now < m.disconnectedUntil);
        if (retained.length !== s.members.length) { s.members = retained; this.electHost(); this.change(); }
        this.autoCountdown(now);
        if (s.phase === 'countdown' && s.round && now >= s.round.startAt) {
            const r = s.round;
            r.players = s.members.filter(m => m.connected && r.candidates.includes(m.id))
                .map(m => ({ id: m.id, nickname: m.nickname, avatar: m.avatar, ...(m.bot ? { bot: true, botWpm: m.botWpm, botDelayMs: m.botDelayMs } : {}), metrics: null }));
            if (r.players.length < 2 || !r.players.some(p => !p.bot) || s.autoStart && r.candidates.some(id => !s.members.some(m => m.id === id && m.connected && m.ready))) {
                // A cancelled rematch retains the original results window and scoreboard.
                if (this.previousResults) { s.round = this.previousResults; s.phase = 'results'; this.previousResults = null; }
                else { s.phase = 'lobby'; s.round = null; }
            } else { s.phase = 'racing'; this.previousResults = null; }
            this.change();
        }
        if (s.phase === 'racing' && s.round && s.mode === 'words') {
            const r = s.round;
            const first = r.players.filter(p => p.bot && s.members.some(m => m.id === p.id && m.connected))
                .sort((a, b) => botFinishAt(r, a) - botFinishAt(r, b) || a.id.localeCompare(b.id))[0];
            if (first && now >= botFinishAt(r, first) && botFinishAt(r, first) <= r.deadline) this.end(botFinishAt(r, first), 'finish', first.id);
        }
        if (s.phase === 'racing' && s.round && now >= s.round.deadline) this.end(s.round.deadline, 'timeout');
        if (s.phase === 'results' && s.round && now >= s.round.resultsUntil!) return 'The two-minute rematch window ended.';
        if (s.phase === 'results' && s.round && now >= s.round.collectionUntil!) { this.finalizeTimedWinner(); this.tryRematch(now); }
        return null;
    }
    // Persisted by the adapter as part of its bounded snapshot, for cancelled countdown recovery.
    previousResults: RoomState['round'] = null;
    join(entry: Entry, now: number): string {
        const s = this.state;
        if (entry.epoch && entry.epoch !== s.epoch) throw new MultiplayerError('room_replaced', 'This room has expired or been replaced.', 410);
        let member = entry.participantId ? s.members.find(m => m.id === entry.participantId) : undefined;
        if (entry.participantId && !member) throw new MultiplayerError('seat_expired', 'Your reconnect window ended. Join again as a new player.', 410);
        if (member?.connected) throw new MultiplayerError('already_connected', 'That player is already connected.', 409);
        if (member) {
            if (member.disconnectedUntil === null || now >= member.disconnectedUntil)
                throw new MultiplayerError('seat_expired', 'Your reconnect window ended.', 410);
            member.connected = true; member.disconnectedUntil = null;
        } else {
            const spectator = entry.spectator === true || s.phase === 'countdown' || s.phase === 'racing';
            if (spectator && s.allowSpectators === false) throw new MultiplayerError('spectators_disabled', 'The host has disabled spectators for this room.', 403);
            if (spectator && s.members.filter(m => m.spectator).length >= MAX_SPECTATORS) throw new MultiplayerError('spectators_full', 'All ten spectator slots are occupied.', 409);
            if (!spectator && s.members.filter(m => !m.spectator).length >= s.maxPlayers) throw new MultiplayerError('room_full', 'This room is full. Try another room.', 409);
            const requested = nickname(entry.nickname);
            let accepted = requested;
            for (let suffix = 2; s.members.some(m => m.nickname === accepted); suffix++) accepted = `${requested.slice(0, 20)} ${suffix}`;
            member = { id: this.uuid(), nickname: accepted, avatar: { ...avatarSettings(entry.avatar), seed: entry.avatar?.seed ?? this.uuid() }, connected: true, disconnectedUntil: null, spectator, ready: !!s.quickMatch && !spectator, rematch: false };
            s.members.push(member);
        }
        s.emptyUntil = null;
        if (s.quickMatch && !s.quickMatchFilled && s.botFillAt == null && !s.pendingBots?.length && !member.spectator) s.botFillAt = now + 5000 + Math.floor(this.random() * 5001);
        this.electHost();
        this.change();
        this.autoCountdown(now);
        return member.id;
    }
    disconnect(id: string, now: number) {
        const m = this.state.members.find(m => m.id === id);
        if (!m?.connected || m.bot) return;
        m.connected = false; m.ready = false; m.rematch = false;
        m.disconnectedUntil = Math.min(now + GRACE_MS, this.state.expiresAt);
        this.electHost();
        if (!this.state.members.some(m => m.connected && !m.bot)) this.state.emptyUntil = Math.min(now + GRACE_MS, this.state.expiresAt);
        this.change();
        this.autoCountdown(now);
    }
    command(id: string, command: ClientCommand, now: number) {
        const s = this.state;
        const member = s.members.find(m => m.id === id && m.connected && !m.bot);
        if (!member) throw new MultiplayerError('not_member', 'You are no longer connected to this room.', 403);
        if (command.type === 'sync') return;
        if (command.type === 'room_controls') {
            if (s.phase !== 'lobby') throw new MultiplayerError('wrong_phase', 'Room controls can change only in the lobby.');
            if (s.hostId !== id) throw new MultiplayerError('not_host', 'Only the host can change room controls.');
            if (command.autoStart === undefined && command.allowSpectators === undefined || command.autoStart !== undefined && typeof command.autoStart !== 'boolean' || command.allowSpectators !== undefined && typeof command.allowSpectators !== 'boolean') throw new MultiplayerError('invalid_request', 'Choose valid room controls.');
            const autoStart = command.autoStart ?? !!s.autoStart, allowSpectators = command.allowSpectators ?? s.allowSpectators !== false;
            if (autoStart === !!s.autoStart && allowSpectators === (s.allowSpectators !== false)) return;
            Object.assign(s, { autoStart, allowSpectators });
            if (!allowSpectators) s.members = s.members.filter(m => !m.spectator);
            this.change(); this.autoCountdown(now); return;
        }
        if (command.type === 'configure') {
            if (s.quickMatch) throw new MultiplayerError('settings_locked', 'Quick match settings are locked.');
            if (s.phase !== 'lobby') throw new MultiplayerError('wrong_phase', 'Race settings can change only in the lobby.');
            if (s.hostId !== id) throw new MultiplayerError('not_host', 'Only the room host can change settings.');
            if (command.sequence !== s.sequence) throw new MultiplayerError('stale_settings', 'The lobby changed. Review the settings and try again.');
            if (!(WORD_COUNTS as readonly unknown[]).includes(command.wordCount)) throw new MultiplayerError('invalid_request', 'Choose a 15, 30 or 50-word race.');
            if (!command.settings || typeof command.settings !== 'object') throw new MultiplayerError('invalid_request', 'Choose valid race settings.');
            if (command.autoStart !== undefined && typeof command.autoStart !== 'boolean' || command.allowSpectators !== undefined && typeof command.allowSpectators !== 'boolean') throw new MultiplayerError('invalid_request', 'Invalid lobby controls.');
            const autoStart = command.autoStart ?? !!s.autoStart, allowSpectators = command.allowSpectators ?? s.allowSpectators !== false;
            const settings = raceSettings(command.settings);
            if (s.wordCount === command.wordCount && s.mode === settings.mode && s.duration === settings.duration && s.dictionary === settings.dictionary && !!s.autoStart === autoStart && (s.allowSpectators !== false) === allowSpectators) return;
            Object.assign(s, settings, { wordCount: command.wordCount, autoStart, allowSpectators });
            if (!allowSpectators) s.members = s.members.filter(m => !m.spectator);
            s.members.forEach(m => { m.ready = false; });
            this.change(); return;
        }
        if (command.type === 'chat') {
            if (s.phase !== 'lobby') throw new MultiplayerError('wrong_phase', 'Chat is available in the lobby.');
            if (typeof command.text !== 'string') throw new MultiplayerError('invalid_chat', 'Enter a message.');
            const text = command.text.normalize('NFC').trim();
            if (!text || text.length > 240 || /[\p{Cc}\p{Cf}]/u.test(text)) throw new MultiplayerError('invalid_chat', 'Use 1–240 visible characters.');
            s.chat = [...(s.chat ?? []), { id: this.uuid(), senderId: id, nickname: member.nickname, text, sentAt: now }].slice(-20);
            this.change(); return;
        }
        if (command.type === 'ready') {
            if (s.phase !== 'lobby' || typeof command.value !== 'boolean') throw new MultiplayerError('wrong_phase', 'Readiness can change in the lobby.');
            if (member.spectator) throw new MultiplayerError('spectator', 'Spectators cannot ready up.');
            if (member.ready !== command.value) { member.ready = command.value; this.change(); }
            this.autoCountdown(now); return;
        }
        if (command.type === 'start') {
            if (s.phase === 'countdown') return;
            if (s.phase !== 'lobby' || !member.ready) throw new MultiplayerError('not_ready', 'Ready up before starting.');
            if (s.hostId !== id) throw new MultiplayerError('not_host', 'Only the host can start the race manually.');
            if (s.quickMatch && !s.quickMatchFilled) throw new MultiplayerError('match_waiting', 'Wait while racers join Quick match.');
            const candidates = s.members.filter(m => m.connected && m.ready && !m.spectator).map(m => m.id);
            if (s.allowSpectators === false && s.members.some(m => m.connected && !m.spectator && !m.ready)) throw new MultiplayerError('need_players', 'Everyone must be ready when spectators are disabled.');
            if (candidates.length < 2) throw new MultiplayerError('need_players', 'At least two connected players must be ready.');
            this.countdown(candidates, now); return;
        }
        const round = s.round;
        if (!round || command.roundId !== round.id) throw new MultiplayerError('stale_round', 'That round is no longer current.');
        if (command.type === 'rematch') {
            if (s.phase !== 'results' || typeof command.value !== 'boolean') throw new MultiplayerError('wrong_phase', 'Rematch is available after the round.');
            if (member.spectator) throw new MultiplayerError('spectator', 'Spectators cannot enter a rematch.');
            const self = round.players.find(p => p.id === id);
            if (!self?.metrics && now < round.collectionUntil!) throw new MultiplayerError('collecting_metrics', 'Wait while results are collected.');
            if (member.rematch !== command.value) { member.rematch = command.value; this.change(); }
            if (now >= round.collectionUntil!) this.tryRematch(now);
            return;
        }
        if (command.type !== 'finish' && command.type !== 'metrics') throw new MultiplayerError('invalid_command', 'Unknown room command.');
        const player = round.players.find(p => p.id === id);
        if (!player) throw new MultiplayerError('not_in_round', 'You were not connected and ready at this round’s start.', 403);
        if (player.metrics) return; // Idempotent retries never rewrite a result.
        if (command.type === 'finish' && s.phase !== 'racing') throw new MultiplayerError('round_ended', 'This round has already ended.');
        if (command.type === 'finish' && s.mode === 'time') throw new MultiplayerError('wrong_phase', 'A timed race ends when the timer expires.');
        if (command.type === 'metrics' && s.phase !== 'results') throw new MultiplayerError('wrong_phase', 'Final metrics are collected after the round.');
        if (s.mode === 'time' && round.winnerFinalized) throw new MultiplayerError('metrics_closed', 'The timed race scores have been finalized.');
        const metrics = this.metrics(command, command.type === 'finish' ? now : round.endedAt!);
        player.metrics = metrics;
        if (command.type === 'finish') this.end(now, 'finish', id);
        else { this.change(); if (round.players.every(p => p.metrics)) this.finalizeTimedWinner(); }
    }
    private metrics(command: Extract<ClientCommand, { typedText: string }>, endedAt: number): Metrics {
        const r = this.state.round!;
        if (typeof command.typedText !== 'string' || command.typedText.length > r.text.length + 10 ||
            !Number.isInteger(command.attempts) || !Number.isInteger(command.errors) ||
            command.attempts < command.typedText.length || command.attempts > 100_000 || command.errors < 0 || command.errors > command.attempts)
            throw new MultiplayerError('invalid_metrics', 'Invalid typing metrics.');
        const text = normalizeRaceInput(r.text, command.typedText);
        if (text !== command.typedText || (command.type === 'finish' && text !== r.text))
            throw new MultiplayerError('invalid_finish', 'Correct the entire passage before finishing.');
        const duration = Math.max(.001, (endedAt - r.startAt) / 1000);
        const correctChars = [...text].filter((c, i) => c === r.text[i]).length;
        const wpm = Math.round(correctChars / 5 / (duration / 60));
        if (command.type === 'finish' && (duration < 1 || wpm > 1000)) throw new MultiplayerError('invalid_finish', 'Completion arrived too early.');
        if (this.state.mode === 'time' && wpm > 1000) throw new MultiplayerError('invalid_metrics', 'Typing speed exceeds the race limit.');
        return { correctChars, completedWords: completedRaceWords(r.text, text), attempts: command.attempts, errors: command.errors,
            accuracy: command.attempts ? Math.round((command.attempts - command.errors) / command.attempts * 100) : 100, wpm, duration };
    }
    private end(now: number, reason: 'finish' | 'timeout', winnerId: string | null = null) {
        const s = this.state, r = s.round!;
        s.phase = 'results'; r.endedAt = now; r.reason = reason; r.winnerId = winnerId;
        r.winnerFinalized = s.mode !== 'time';
        r.collectionUntil = Math.min(now + METRICS_MS, s.expiresAt);
        r.resultsUntil = Math.min(now + RESULTS_MS, s.expiresAt);
        for (const player of r.players) if (player.bot) player.metrics = botMetrics(r, player, now);
        s.members.forEach(m => { m.ready = false; m.rematch = false; });
        this.change();
    }
    private finalizeTimedWinner() {
        const s = this.state, r = s.round;
        if (s.mode !== 'time' || s.phase !== 'results' || !r || r.winnerFinalized) return;
        const ranked = r.players.filter(p => p.metrics && p.metrics.correctChars > 0).sort((a, b) =>
            b.metrics!.correctChars - a.metrics!.correctChars || b.metrics!.accuracy - a.metrics!.accuracy || a.id.localeCompare(b.id));
        r.winnerId = ranked[0]?.id ?? null; r.winnerFinalized = true; this.change();
    }
    private countdown(candidates: string[], now: number) {
        const s = this.state;
        if (!this.hasTimeForRound(now)) throw new MultiplayerError('room_expiring', 'This room is expiring. Create a new room for another race.');
        if (s.lastCountdownAt && now - s.lastCountdownAt < 10_000) throw new MultiplayerError('rate_limited', 'Wait a moment before starting another race.', 429);
        this.previousResults = s.phase === 'results' ? s.round : null;
        s.round = { id: this.uuid(), text: this.makeText(s.wordCount, s.dictionary, s.mode === 'time' ? s.duration : undefined), candidates, players: [], startAt: now + COUNTDOWN_MS,
            deadline: Math.min(now + COUNTDOWN_MS + s.duration * 1000, s.expiresAt), endedAt: null, reason: null, winnerId: null, winnerFinalized: false, collectionUntil: null, resultsUntil: null };
        s.lastCountdownAt = now; s.phase = 'countdown'; this.change();
    }
    private tryRematch(now: number) {
        const humans = this.state.members.filter(m => m.connected && m.rematch && !m.spectator && !m.bot);
        if (!humans.length) return;
        const candidates = this.state.members.filter(m => m.connected && (m.rematch || m.bot) && !m.spectator).map(m => m.id);
        if (candidates.length >= 2 && this.hasTimeForRound(now) && now - this.state.lastCountdownAt >= 10_000) {
            this.countdown(candidates, now);
            // Rematch opt-in is readiness for the new race; results cleared the old ready flags.
            for (const member of this.state.members) if (candidates.includes(member.id)) member.ready = true;
        }
    }
    private hasTimeForRound(now: number): boolean {
        // A timed round needs its entire duration and final-score collection before hard expiry.
        const required = this.state.mode === 'time' ? this.state.duration * 1000 + METRICS_MS : 1000;
        return now + COUNTDOWN_MS + required < this.state.expiresAt;
    }
    nextDeadline(now: number): number {
        const s = this.state, r = s.round;
        const dates = [s.expiresAt, s.emptyUntil, ...s.members.filter(m => !m.connected).map(m => m.disconnectedUntil)];
        if (s.phase === 'lobby' && s.botFillAt != null) dates.push(s.botFillAt);
        if (s.phase === 'lobby') {
            dates.push(...(s.pendingBots ?? []).map(bot => bot.botJoinAt), ...s.members.filter(m => m.bot && !m.ready && m.botReadyAt != null).map(m => m.botReadyAt!));
            const racers = s.members.filter(m => !m.spectator);
            if (s.autoStart && (!s.quickMatch || s.quickMatchFilled) && racers.length >= 2 && racers.some(m => !m.bot) && racers.every(m => m.connected && m.ready) && s.lastCountdownAt + 10_000 > now) dates.push(s.lastCountdownAt + 10_000);
        }
        if (s.phase === 'countdown') dates.push(r!.startAt);
        if (s.phase === 'racing') {
            dates.push(r!.deadline);
            if (s.mode === 'words') for (const player of r!.players) if (player.bot) dates.push(botFinishAt(r!, player));
        }
        if (s.phase === 'results') {
            dates.push(r!.resultsUntil);
            if (r!.collectionUntil! > now) dates.push(r!.collectionUntil);
        }
        return Math.min(...dates.filter((d): d is number => d !== null));
    }
}
