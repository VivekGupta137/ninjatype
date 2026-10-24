import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { Miniflare } from 'miniflare';

// Actual workerd + SQLite + hibernatable socket API. Siteverify is mocked; no external accounts or secrets.
const output = await mkdtemp(join(tmpdir(), 'ninjatype-worker-test-'));
let mf;
const sockets = [];
try {
    execFileSync('bun', ['build', 'workers/multiplayer/index.ts', '--target', 'browser', '--external', 'cloudflare:workers',
        '--outdir', output], { stdio: 'pipe' });
    const used = new Map();
    let verified = 0;
    const bindings = { ALLOWED_ORIGINS: 'https://ninjatype.com', MULTIPLAYER_ENABLED: 'true', TURNSTILE_SITE_KEY: 'test', TURNSTILE_SECRET_KEY: 'test', MAX_PLAYERS_PER_ROOM: '10' };
    const options = { modules: true, modulesRoot: output, scriptPath: join(output, 'index.js'), compatibilityDate: '2026-10-24',
        durableObjects: { ROOMS: { className: 'Room', useSQLite: true }, DIRECTORY: { className: 'Directory', useSQLite: true } },
        kvNamespaces: ['ROOM_DIRECTORY'],
        ratelimits: Object.fromEntries(['CREATE_BROWSER', 'CREATE_IP', 'ENTRY_BROWSER', 'ENTRY_IP', 'BROWSE_BROWSER', 'BROWSE_IP']
            .map(name => [name, { simple: { limit: name === 'CREATE_BROWSER' ? 1 : 200, period: 60 } }])),
        bindings,
        outboundService: async request => {
            assert.equal(new URL(request.url).hostname, 'challenges.cloudflare.com');
            const data = await request.json(); verified++;
            if (data.secret === '1x0000000000000000000000000000000AA')
                return Response.json({ success: data.response !== 'invalid-token', hostname: 'example.com',
                    challenge_ts: new Date(Date.now() - (data.response === 'expired-token' ? 301_000 : 0)).toISOString() });
            const existing = used.get(data.response);
            const success = data.response !== 'invalid-token' && (!existing || existing === data.idempotency_key);
            if (success) used.set(data.response, data.idempotency_key);
            return Response.json({ success, action: data.response.startsWith('access-') ? 'room_entry' : data.response.startsWith('create-') ? 'create_room' : 'join_room',
                hostname: data.response === 'wrong-host-token' ? 'elsewhere.com' : 'ninjatype.com',
                challenge_ts: new Date(Date.now() - (data.response === 'expired-token' ? 301_000 : 0)).toISOString() });
        },
    };
    mf = new Miniflare(options);
    const post = (path, body, origin = 'https://ninjatype.com') => mf.dispatchFetch(`https://ninjatype.com/api/multiplayer/${path}`, {
        method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'CF-Connecting-IP': randomUUID() }, body: JSON.stringify(body),
    });
    const createToken = `create-${randomUUID()}`;
    const create = (name, token = `create-${randomUUID()}`, browserId = randomUUID()) => post('rooms', { name, token, browserId, wordCount: 15 });
    const encode = text => Buffer.from(text).toString('base64url');
    async function enter(name, token = `join-${randomUUID()}`, extra = {}) {
        const entry = { name, nickname: 'Ninja', browserId: randomUUID(), ...extra };
        return mf.dispatchFetch('https://ninjatype.com/api/multiplayer/socket', { headers: {
            Upgrade: 'websocket', Origin: 'https://ninjatype.com', 'CF-Connecting-IP': randomUUID(),
            'Sec-WebSocket-Protocol': `ninjatype-v1, entry.${encode(JSON.stringify(entry))}, turnstile.${encode(token)}`,
        } });
    }
    function client(response) {
        assert.equal(response.status, 101);
        assert.equal(response.headers.get('Sec-WebSocket-Protocol'), 'ninjatype-v1');
        const ws = response.webSocket, messages = [];
        ws.addEventListener('message', event => messages.push(JSON.parse(event.data)));
        ws.accept(); sockets.push(ws);
        return { ws, messages, send: message => ws.send(JSON.stringify(message)) };
    }
    async function waitFor(c, predicate, timeout = 6000) {
        const end = Date.now() + timeout;
        while (Date.now() < end) {
            const message = c.messages.find(predicate);
            if (message) return message;
            await new Promise(resolve => setTimeout(resolve, 20));
        }
        throw new Error(`Socket event timed out: ${JSON.stringify(c.messages.slice(-3))}`);
    }
    const before = verified;
    assert.equal((await (await mf.dispatchFetch('https://ninjatype.com/api/multiplayer/config')).json()).maxPlayers, 10);
    assert.equal((await post('rooms', { name: 'Origin-room', browserId: randomUUID(), token: createToken }, 'https://elsewhere.com')).status, 403);
    assert.equal(verified, before, 'invalid origins must not invoke Siteverify');
    assert.equal((await create('Protected-room', '')).status, 403);
    assert.equal((await create('Protected-room', 'invalid-token')).status, 403);
    const beforeOversize = verified;
    assert.equal((await post('rooms', { name: 'Protected-room', browserId: randomUUID(), token: 'x'.repeat(5000) })).status, 413);
    assert.equal(verified, beforeOversize);
    const emptyDirectory = await post('directory', { browserId: randomUUID(), fresh: false });
    assert.equal((await emptyDirectory.json()).rooms.length, 0, 'initial discovery can read an unpublished directory');
    const created = await create('Protected-room', createToken); assert.equal(created.status, 200);
    const info = await created.json();
    await new Promise(resolve => setTimeout(resolve, 20));
    const unpublishedKv = await mf.getKVNamespace('ROOM_DIRECTORY');
    assert.equal(await unpublishedKv.get('public-v1'), null);
    const freshDirectory = await post('directory', { browserId: randomUUID(), fresh: true });
    assert.ok((await freshDirectory.json()).rooms.some(room => room.name === 'Protected-room'), 'manual refresh bypasses an empty cached list and missing cron publication');
    assert.equal(await unpublishedKv.get('public-v1'), null, 'manual refresh does not spend a KV write');
    assert.equal((await post('directory', { browserId: randomUUID(), fresh: 'true' })).status, 400);
    const duplicate = await create('Protected-room', createToken); assert.equal(duplicate.status, 200);
    assert.equal((await duplicate.json()).epoch, info.epoch, 'same verified operation returns original creation');
    assert.equal((await create('Other-room', createToken)).status, 403, 'cannot replay a token into another room');
    assert.equal((await enter('Protected-room', createToken)).status, 403, 'creation token cannot admit a socket');
    assert.equal((await enter('Protected-room', '')).status, 400);
    assert.equal((await enter('Protected-room', 'invalid-token')).status, 403);
    assert.equal((await enter('Protected-room', 'expired-token')).status, 403);
    assert.equal((await enter('Protected-room', 'wrong-host-token')).status, 403);
    assert.equal((await enter('Unknown-room')).status, 404);
    const accessCreate = `access-${randomUUID()}`;
    assert.equal((await create('Shared-widget-room', accessCreate)).status, 200, 'a shared entry challenge can create a room');
    assert.equal((await enter('Shared-widget-room', accessCreate)).status, 403, 'creation still consumes the shared entry challenge');
    const accessJoin = `access-${randomUUID()}`;
    client(await enter('Shared-widget-room', accessJoin));
    assert.equal((await enter('Shared-widget-room', accessJoin)).status, 409, 'a shared entry challenge cannot admit a second player');

    const firstToken = `join-${randomUUID()}`;
    const a = client(await enter('Protected-room', firstToken, { epoch: info.epoch }));
    const aSnapshot = await waitFor(a, m => m.type === 'snapshot');
    assert.equal((await enter('Protected-room', firstToken)).status, 409, 'cached Siteverify success cannot create a second socket');
    const b = client(await enter('Protected-room', `join-${randomUUID()}`, { nickname: '忍者 🥷' }));
    const bSnapshot = await waitFor(b, m => m.type === 'snapshot');
    assert.equal(bSnapshot.room.members.find(m => m.id === bSnapshot.selfId).nickname, '忍者 🥷');
    a.send({ type: 'ready', value: true }); b.send({ type: 'ready', value: true });
    await waitFor(a, m => m.type === 'snapshot' && m.room.members.filter(p => p.ready).length === 2);
    a.send({ type: 'start' });
    const started = await waitFor(a, m => m.type === 'snapshot' && m.room.phase === 'racing');
    const r = started.room.round;
    assert.equal(r.players.length, 2);
    a.send({ type: 'progress', roundId: r.id, correctChars: -1 });
    await waitFor(a, m => m.type === 'error' && m.code === 'invalid_progress');
    a.send({ type: 'progress', roundId: 'previous-round', correctChars: 1 });
    await waitFor(a, m => m.type === 'error' && m.code === 'stale_round');
    b.send({ type: 'progress', roundId: r.id, correctChars: 1 });
    const live = await waitFor(a, m => m.type === 'standings');
    assert.equal(live.players.find(p => p.id === bSnapshot.selfId).correctChars, 1);
    a.send({ type: 'progress', roundId: r.id, correctChars: r.text.length });
    b.send({ type: 'progress', roundId: r.id, correctChars: 2 });
    a.send({ type: 'sync' });
    const estimate = await waitFor(a, m => m.type === 'snapshot' && m.standings?.players.some(p => p.id === aSnapshot.selfId && p.correctChars === r.text.length));
    assert.equal(estimate.room.phase, 'racing', 'a live 100% claim cannot finish the race');
    assert.equal(estimate.room.round.winnerId, null);
    assert.equal(estimate.room.sequence, started.room.sequence, 'progress does not mutate authoritative room state');
    assert.equal(estimate.room.round.players[0].metrics, null, 'live counts are not final metrics');
    assert.equal(estimate.standings.players.find(p => p.id === bSnapshot.selfId).correctChars, 1, 'per-player progress is limited to one report per three-second window');
    assert.equal(b.messages.filter(m => m.type === 'standings').length, 1, 'room broadcasts are limited to once per three-second window');
    const late = client(await enter('Protected-room'));
    await waitFor(late, m => m.type === 'snapshot');
    late.send({ type: 'finish', roundId: r.id, typedText: r.text, attempts: r.text.length, errors: 0 });
    await waitFor(late, m => m.type === 'error' && m.code === 'not_in_round');
    late.send({ type: 'progress', roundId: r.id, correctChars: 10 });
    await waitFor(late, m => m.type === 'error' && m.code === 'not_in_round' && m.message.includes('player'));
    await new Promise(resolve => setTimeout(resolve, 3_050));
    a.send({ type: 'progress', roundId: r.id, correctChars: Math.floor(r.text.length / 2) });
    await waitFor(b, m => m.type === 'standings' && m.players.some(p => p.id === aSnapshot.selfId && p.correctChars === Math.floor(r.text.length / 2)));
    await new Promise(resolve => setTimeout(resolve, 1500));
    a.send({ type: 'finish', roundId: r.id, typedText: r.text, attempts: r.text.length, errors: 0 });
    const result = await waitFor(b, m => m.type === 'snapshot' && m.room.phase === 'results');
    assert.equal(result.room.round.winnerId, aSnapshot.selfId);
    assert.equal(result.standings, undefined, 'results discard the advisory leaderboard');
    a.send({ type: 'progress', roundId: r.id, correctChars: 1 });
    await waitFor(a, m => m.type === 'error' && m.code === 'not_racing');
    b.send({ type: 'metrics', roundId: r.id, typedText: '', attempts: 0, errors: 0 });
    await waitFor(a, m => m.type === 'snapshot' && !!m.room.round?.players.find(p => p.id === bSnapshot.selfId)?.metrics);
    b.ws.close();
    await waitFor(a, m => m.type === 'snapshot' && m.room.members.find(p => p.id === bSnapshot.selfId)?.connected === false);
    assert.equal((await enter('Protected-room', '', { participantId: bSnapshot.selfId, epoch: info.epoch })).status, 400);
    const reconnected = client(await enter('Protected-room', `join-${randomUUID()}`, { participantId: bSnapshot.selfId, epoch: info.epoch }));
    const resumed = await waitFor(reconnected, m => m.type === 'snapshot');
    assert.equal(resumed.selfId, bSnapshot.selfId);
    assert.equal(resumed.room.round.winnerId, aSnapshot.selfId);
    a.send({ type: 'rematch', value: true, roundId: r.id });
    reconnected.send({ type: 'rematch', value: true, roundId: r.id });
    const rematch = await waitFor(a, m => m.type === 'snapshot' && m.room.phase === 'countdown' && m.room.round.id !== r.id, 12_000);
    assert.equal(rematch.room.expiresAt, aSnapshot.room.expiresAt, 'rematch never resets room expiry');
    assert.equal(rematch.standings, undefined, 'a rematch never inherits progress from the old round');

    // Fill remaining seats concurrently; room authority admits exactly ten.
    const admissions = await Promise.all(Array.from({ length: 9 }, () => enter('Protected-room')));
    assert.equal(admissions.filter(response => response.status === 101).length, 7);
    assert.equal(admissions.filter(response => response.status === 409).length, 2);
    admissions.filter(response => response.status === 101).forEach(client);
    const browser = randomUUID();
    assert.equal((await create('Rate-room-one', undefined, browser)).status, 200);
    assert.equal((await create('Rate-room-two', undefined, browser)).status, 429);

    const directory = await mf.getDurableObjectNamespace('DIRECTORY');
    const publisher = directory.get(directory.idFromName('public-v1'));
    assert.equal((await publisher.fetch('https://directory/publish', { method: 'POST' })).status, 200);
    const listing = await post('directory', { browserId: randomUUID(), fresh: true });
    assert.equal(listing.status, 200);
    assert.ok((await listing.json()).rooms.some(room => room.name === 'Protected-room' && room.maxPlayers === 10));
    const publishedBeforeRefresh = await unpublishedKv.get('public-v1');
    const indexOnly = { name: 'New-index-room', epoch: randomUUID(), createdAt: Date.now(), expiresAt: Date.now() + 60_000, maxPlayers: 10 };
    await publisher.fetch('https://directory/register', { method: 'POST', body: JSON.stringify(indexOnly) });
    const afterRegister = await post('directory', { browserId: randomUUID(), fresh: true });
    assert.ok((await afterRegister.json()).rooms.some(room => room.name === indexOnly.name), 'refresh reads rooms newer than the published KV snapshot');
    await publisher.fetch('https://directory/remove', { method: 'POST', body: JSON.stringify(indexOnly) });
    assert.ok(!(await (await post('directory', { browserId: randomUUID(), fresh: true })).json()).rooms.some(room => room.name === indexOnly.name), 'refresh removes disbanded rooms');
    assert.equal(await unpublishedKv.get('public-v1'), publishedBeforeRefresh, 'refresh never republishes the global KV snapshot');
    const expiredIndex = { ...indexOnly, name: 'Expired-index-room', expiresAt: Date.now() - 1 };
    await publisher.fetch('https://directory/register', { method: 'POST', body: JSON.stringify(expiredIndex) });
    assert.ok(!(await (await post('directory', { browserId: randomUUID(), fresh: true })).json()).rooms.some(room => room.name === expiredIndex.name));

    assert.equal((await create('Existing-capacity')).status, 200);
    await mf.setOptions({ ...options, bindings: { ...bindings, MAX_PLAYERS_PER_ROOM: '4' } });
    assert.equal((await (await mf.dispatchFetch('https://ninjatype.com/api/multiplayer/config')).json()).maxPlayers, 4);
    const older = client(await enter('Existing-capacity'));
    assert.equal((await waitFor(older, m => m.type === 'snapshot')).room.maxPlayers, 10, 'existing room retains its saved capacity');
    assert.equal((await post('rooms', { name: 'Configured-capacity', browserId: randomUUID(), token: `create-${randomUUID()}`, wordCount: 15, maxPlayers: 999 })).status, 200);
    const smaller = await Promise.all(Array.from({ length: 5 }, () => enter('Configured-capacity')));
    assert.equal(smaller.filter(response => response.status === 101).length, 4);
    assert.equal(smaller.filter(response => response.status === 409).length, 1);
    const joined = smaller.filter(response => response.status === 101).map(client);
    assert.equal((await waitFor(joined[0], m => m.type === 'snapshot')).room.maxPlayers, 4, 'client cannot override the Worker limit');
    const updatedDirectory = await mf.getDurableObjectNamespace('DIRECTORY');
    await updatedDirectory.get(updatedDirectory.idFromName('public-v1')).fetch('https://directory/publish', { method: 'POST' });
    const kv = await mf.getKVNamespace('ROOM_DIRECTORY');
    assert.ok((await kv.get('public-v1', 'json')).rooms.some(room => room.name === 'Configured-capacity' && room.maxPlayers === 4));
    await mf.setOptions({ ...options, bindings: { ...bindings,
        ALLOWED_ORIGINS: 'https://ninjatype.com,http://127.0.0.1:4347',
        TURNSTILE_SITE_KEY: '1x00000000000000000000AA', TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA' } });
    const localPost = (name, token = 'XXXX.DUMMY.TOKEN.XXXX', url = 'http://127.0.0.1:8787') => mf.dispatchFetch(`${url}/api/multiplayer/rooms`, {
        method: 'POST', headers: { Origin: 'http://127.0.0.1:4347', 'Content-Type': 'application/json', 'CF-Connecting-IP': randomUUID() },
        body: JSON.stringify({ name, token, browserId: randomUUID(), wordCount: 15 }),
    });
    assert.equal((await localPost('Local-test-room')).status, 200, 'official test keys work on loopback requests');
    const localEntry = { name: 'Local-test-room', nickname: 'Local Ninja', browserId: randomUUID() };
    const localSocket = () => mf.dispatchFetch('http://127.0.0.1:8787/api/multiplayer/socket', { headers: {
        Upgrade: 'websocket', Origin: 'http://127.0.0.1:4347', 'CF-Connecting-IP': randomUUID(),
        'Sec-WebSocket-Protocol': `ninjatype-v1, entry.${encode(JSON.stringify({ ...localEntry, browserId: randomUUID() }))}, turnstile.${encode('XXXX.DUMMY.TOKEN.XXXX')}`,
    } });
    client(await localSocket()); client(await localSocket());
    assert.equal((await localPost('Local-invalid', 'invalid-token')).status, 403);
    assert.equal((await localPost('Local-expired', 'expired-token')).status, 403);
    assert.equal((await create('Public-test-keys')).status, 403, 'test keys do not admit a public origin');
    assert.equal((await localPost('Forged-local-origin', undefined, 'https://ninjatype.com')).status, 403, 'a forged loopback Origin does not enable test mode on a public URL');
    console.log('Cloudflare runtime checks passed: Turnstile/origin/replay protection, local-only official test keys, bounded requests, SQLite room authority, alarms, first finish, metrics, reconnect, rematch, configurable capacity across deployments, rate limits and batched KV discovery.');
} finally {
    for (const ws of sockets) { try { ws.close(); } catch {} }
    if (mf) await mf.dispose();
    await rm(output, { recursive: true, force: true });
}
