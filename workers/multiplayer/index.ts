import { MULTIPLAYER_PATH, PROGRESS_MS, SOCKET_PROTOCOL, WORD_COUNTS, MultiplayerError, avatarSettings, decodeHeader, encodeHeader, identifier, nickname, roomName, roomPlayerLimit, raceSettings, type Entry, type RoomListing, type RaceSettings } from '../../src/lib/multiplayer/protocol';
import { type Env, json } from './env';
export { Room } from './room';
export { Directory } from './directory';

async function hash(value: string) {
    return [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))].map(n => n.toString(16).padStart(2, '0')).join('');
}
/** Binding idempotency to action + room + token prevents a cached verification admitting a different room. */
async function verify(token: unknown, action: string, name: string, origin: string, env: Env, ip: string, requestHostname: string) {
    if (typeof token !== 'string' || !token || token.length > 2048) throw new MultiplayerError('challenge_required', 'Complete the security check before entering a room.', 403);
    const digest = await hash(`${action}:${name}:${token}`);
    const key = `${digest.slice(0, 8)}-${digest.slice(8, 12)}-4${digest.slice(13, 16)}-a${digest.slice(17, 20)}-${digest.slice(20, 32)}`;
    let response: Response;
    try {
        response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST', body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip, idempotency_key: key }),
            headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(8_000),
        });
    } catch { throw new MultiplayerError('challenge_unavailable', 'Security checks are unavailable. You can keep practicing.', 503); }
    if (!response.ok) throw new MultiplayerError('challenge_unavailable', 'Security checks are unavailable. You can keep practicing.', 503);
    const result = await response.json() as { success?: boolean; hostname?: string; action?: string; challenge_ts?: string };
    const age = Date.now() - Date.parse(result.challenge_ts || '');
    const hostname = new URL(origin).hostname;
    // Cloudflare's public test keys return example.com and no action. Accept that
    // response only with both exact test keys and a loopback browser origin.
    const loopback = ['localhost', '127.0.0.1', '[::1]'];
    const localTest = loopback.includes(hostname) && loopback.includes(requestHostname)
        && env.TURNSTILE_SITE_KEY === '1x00000000000000000000AA'
        && env.TURNSTILE_SECRET_KEY === '1x0000000000000000000000000000000AA'
        && result.hostname === 'example.com' && !result.action;
    // The shared entry widget can protect either operation; legacy clients keep
    // their operation-specific action. Receipts still bind verification to room/operation.
    const matchesAction = result.action === action || result.action === 'room_entry';
    if (!result.success || (!localTest && (!matchesAction || result.hostname !== hostname)) || !Number.isFinite(age) || age < -30_000 || age > 300_000)
        throw new MultiplayerError('challenge_failed', 'The security check expired or failed. Please try again.', 403);
    // Dummy widgets reuse their token; give local test admissions separate receipts.
    if (localTest) return hash(`${token}:${crypto.randomUUID()}`);
    return hash(token);
}
function origins(env: Env) { return env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean); }
async function readBody(request: Request): Promise<unknown> {
    if (Number(request.headers.get('Content-Length')) > 4096) throw new MultiplayerError('invalid_request', 'Request is too large.', 413);
    const reader = request.body?.getReader();
    if (!reader) throw new MultiplayerError('invalid_request', 'A JSON body is required.');
    let size = 0;
    const chunks: Uint8Array[] = [];
    for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 4096) { await reader.cancel(); throw new MultiplayerError('invalid_request', 'Request is too large.', 413); }
        chunks.push(value);
    }
    const bytes = new Uint8Array(size); let position = 0;
    for (const chunk of chunks) { bytes.set(chunk, position); position += chunk.byteLength; }
    return JSON.parse(new TextDecoder().decode(bytes));
}
export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        try {
            const url = new URL(request.url);
            if (!url.pathname.startsWith(`${MULTIPLAYER_PATH}/`)) return json({ message: 'Not found.' }, 404);
            if (url.pathname === `${MULTIPLAYER_PATH}/config` && request.method === 'GET')
                return json({ enabled: env.MULTIPLAYER_ENABLED === 'true' && !!env.TURNSTILE_SECRET_KEY && !!env.TURNSTILE_SITE_KEY,
                    siteKey: env.TURNSTILE_SITE_KEY || '', maxPlayers: roomPlayerLimit(env.MAX_PLAYERS_PER_ROOM), liveProgress: true, progressIntervalMs: PROGRESS_MS });
            const origin = request.headers.get('Origin');
            if (!origin || !origins(env).includes(origin)) throw new MultiplayerError('invalid_origin', 'This request must come from NinjaType.', 403);
            if (env.MULTIPLAYER_ENABLED !== 'true') throw new MultiplayerError('maintenance', 'Multiplayer is under maintenance. You can keep practicing.', 503);
            const ip = request.headers.get('CF-Connecting-IP') || 'local';
            if (url.pathname === `${MULTIPLAYER_PATH}/socket`) {
                if (request.method !== 'GET' || request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') return json({ message: 'WebSocket upgrade required.' }, 426);
                const header = request.headers.get('Sec-WebSocket-Protocol') || '';
                if (header.length > 8000) throw new MultiplayerError('invalid_request', 'Connection request is too large.');
                const protocols = header.split(',').map(s => s.trim());
                if (protocols.length !== 3 || !protocols.includes(SOCKET_PROTOCOL)) throw new MultiplayerError('invalid_request', 'Invalid connection protocol.');
                const entry = JSON.parse(decodeHeader(protocols.find(p => p.startsWith('entry.'))?.slice(6) || '')) as Entry;
                entry.avatar = avatarSettings(entry.avatar);
                entry.name = roomName(entry.name); entry.nickname = nickname(entry.nickname); entry.browserId = identifier(entry.browserId);
                if (entry.spectator !== undefined && typeof entry.spectator !== 'boolean') throw new MultiplayerError('invalid_request', 'Invalid spectator request.');
                if (entry.epoch) entry.epoch = identifier(entry.epoch);
                if (entry.participantId) { entry.participantId = identifier(entry.participantId); if (!entry.epoch) throw new MultiplayerError('invalid_request', 'Reconnect requires the original room.'); }

                const token = decodeHeader(protocols.find(p => p.startsWith('turnstile.'))?.slice(10) || '');
                const digest = await verify(token, 'join_room', entry.name, origin, env, ip, url.hostname);
                const headers = new Headers({ Upgrade: 'websocket', 'X-Room-Entry': encodeHeader(JSON.stringify(entry)), 'X-Challenge-Hash': digest });
                // Server-only namespace binding; clients cannot call internal room endpoints.
                return env.ROOMS.get(env.ROOMS.idFromName(`room:v1:${entry.name}`)).fetch('https://room/join', { headers });
            }
            if (request.method !== 'POST' || !request.headers.get('Content-Type')?.startsWith('application/json')) throw new MultiplayerError('invalid_request', 'Use a JSON request.');
            const body = await readBody(request) as Partial<RaceSettings> & { browserId: unknown; name: unknown; wordCount?: number; token?: string; offset?: number; fresh?: boolean; quickMatch?: boolean; enterExisting?: boolean; epoch?: string };
            identifier(body.browserId);
            if (url.pathname === `${MULTIPLAYER_PATH}/rooms`) {
                const name = roomName(body.name);
                if (body.quickMatch !== undefined && typeof body.quickMatch !== 'boolean' || body.enterExisting !== undefined && typeof body.enterExisting !== 'boolean') throw new MultiplayerError('invalid_request', 'Invalid room type.');
                const epoch = body.epoch === undefined ? undefined : identifier(body.epoch);
                const wordCount = body.quickMatch ? 30 : body.wordCount ?? 30;
                if (!(WORD_COUNTS as readonly number[]).includes(wordCount)) throw new MultiplayerError('invalid_request', 'Choose a 15, 30 or 50-word race.');
                const settings = raceSettings(body.quickMatch ? { mode: 'words', dictionary: '1k' } : body);

                const digest = await verify(body.token, 'create_room', name, origin, env, ip, url.hostname);
                return env.ROOMS.get(env.ROOMS.idFromName(`room:v1:${name}`)).fetch('https://room/create', {
                    method: 'POST', body: JSON.stringify({ name, wordCount, ...settings, quickMatch: !!body.quickMatch, enterExisting: !!body.enterExisting, epoch, hash: digest,
                        fingerprint: `${name}:${wordCount}:${settings.mode}:${settings.duration}:${settings.dictionary}:${!!body.quickMatch}:${!!body.enterExisting}:${epoch ?? ""}` }),
                });
            }
            if (url.pathname === `${MULTIPLAYER_PATH}/directory`) {
                const offset = Number(body.offset ?? 0);
                if (!Number.isSafeInteger(offset) || offset < 0) throw new MultiplayerError('invalid_request', 'Invalid room list page.');
                if (body.fresh !== undefined && typeof body.fresh !== 'boolean') throw new MultiplayerError('invalid_request', 'Invalid room refresh.');
                const liveDirectory = () => env.DIRECTORY.get(env.DIRECTORY.idFromName('public-v1')).fetch(`https://directory/list?offset=${offset}`);
                // An explicit refresh reads one bounded SQL page, without publishing to KV.
                if (body.fresh) return liveDirectory();
                const cacheKey = new Request(`${url.origin}${MULTIPLAYER_PATH}/cached-directory?offset=${offset}`);
                const cached = await caches.default.match(cacheKey);
                if (cached) return cached;
                const snapshot = await env.ROOM_DIRECTORY.get<{ publishedAt: number; rooms: RoomListing[] }>('public-v1', { type: 'json', cacheTtl: 180 });
                if (!snapshot) {
                    // Local cron is not automatic; an empty initial KV also needs a useful list.
                    const response = await liveDirectory();
                    if (response.ok) ctx.waitUntil(caches.default.put(cacheKey, new Response(response.clone().body,
                        { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=30', 'X-Content-Type-Options': 'nosniff' } })));
                    return response;
                }
                const active = (snapshot?.rooms ?? []).filter(r => r.expiresAt > Date.now()).map(r => ({ ...r, maxPlayers: roomPlayerLimit(r.maxPlayers) }));
                const response = Response.json({ publishedAt: snapshot?.publishedAt ?? null, rooms: active.slice(offset, offset + 20), nextOffset: offset + 20 < active.length ? offset + 20 : null }, { headers: { 'Cache-Control': 'public, max-age=30', 'X-Content-Type-Options': 'nosniff' } });
                ctx.waitUntil(caches.default.put(cacheKey, response.clone()));
                return response;
            }
            return json({ message: 'Not found.' }, 404);
        } catch (e) {
            if (e instanceof MultiplayerError) return json({ code: e.code, message: e.message }, e.status);
            if (e instanceof SyntaxError || e instanceof TypeError) return json({ code: 'invalid_request', message: 'Invalid multiplayer request.' }, 400);
            return json({ code: 'unavailable', message: 'Multiplayer is temporarily unavailable. You can keep practicing.' }, 503);
        }
    },
    async scheduled(_event: ScheduledController, env: Env) {
        // Publishing even during maintenance allows the directory index to prune expired metadata.
        const response = await env.DIRECTORY.get(env.DIRECTORY.idFromName('public-v1')).fetch('https://directory/publish', { method: 'POST' });
        if (!response.ok) throw new Error('Room directory publication failed');
    },
} satisfies ExportedHandler<Env>;
