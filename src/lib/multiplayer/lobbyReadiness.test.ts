import { expect, test } from 'bun:test';
import { lobbyReadiness } from './lobbyReadiness';
import { RoomEngine } from './engine';
import { COUNTDOWN_MS } from './protocol';

const racer = (id: string, ready: boolean, connected = true, spectator = false) => ({ id, ready, connected, spectator });
const room = () => ({ phase: 'lobby' as const, hostId: 'you', autoStart: false,
    members: [racer('you', false), racer('a', true), racer('b', true), racer('c', true)] });

test('three ready opponents do not make the unready user appear ready', () => {
    expect(lobbyReadiness(room(), 'you', true)).toMatchObject({ action: 'ready', label: 'I’m ready', allReady: false });
});

test('ready hosts wait for every racer before the start action appears', () => {
    const lobby = room();
    lobby.members[0].ready = true;
    lobby.members[2].ready = false;
    expect(lobbyReadiness(lobby, 'you', true)).toMatchObject({ action: 'waiting', label: 'Waiting for racers…', allReady: false });
    lobby.members[2].ready = true;
    expect(lobbyReadiness(lobby, 'you', true)).toMatchObject({ action: 'start', label: 'Start race now', allReady: true });
    lobby.members[0].ready = false;
    expect(lobbyReadiness(lobby, 'you', true).action).toBe('ready');
});

test('non-hosts wait for the host or automatic countdown instead of seeing a disabled start button', () => {
    const lobby = room();
    lobby.members[0].ready = true;
    expect(lobbyReadiness(lobby, 'a', true).label).toBe('Waiting for host…');
    lobby.autoStart = true;
    expect(lobbyReadiness(lobby, 'a', true).label).toBe('Waiting for countdown…');
});

test('spectators cannot ready or start and do not block ready racers', () => {
    const lobby = room();
    lobby.members[0].ready = true;
    lobby.members.push(racer('watcher', false, true, true));
    expect(lobbyReadiness(lobby, 'you', true).action).toBe('start');
    expect(lobbyReadiness(lobby, 'watcher', true)).toMatchObject({ action: 'waiting', label: 'Watching' });
});

test('connections, minimum racer count and quick-match filling gate the action', () => {
    const lobby = room();
    lobby.members[0].ready = true;
    expect(lobbyReadiness(lobby, 'you', false).label).toBe('Reconnecting…');
    lobby.members[1].connected = false;
    expect(lobbyReadiness(lobby, 'you', true).action).toBe('waiting');
    expect(lobbyReadiness(lobby, 'you', true).hint).toContain('reconnect');
    lobby.members = [racer('you', true)];
    expect(lobbyReadiness(lobby, 'you', true).label).toBe('Waiting for another racer…');
    lobby.members.push(racer('a', true));
    expect(lobbyReadiness({ ...lobby, quickMatch: true, quickMatchFilled: false }, 'you', true).action).toBe('waiting');
    expect(lobbyReadiness({ ...lobby, quickMatch: true, quickMatchFilled: true }, 'you', true).action).toBe('start');
});

test('ready then start works with the existing engine and keeps the ten-second countdown', () => {
    const now = 100_000;
    const engine = new RoomEngine(RoomEngine.create('Lobby-test', 15, now, 'epoch', 5, { autoStart: false }), () => 'one two three');
    const selfId = engine.join({ name: 'Lobby-test', nickname: 'You', browserId: 'you' }, now);
    const otherId = engine.join({ name: 'Lobby-test', nickname: 'Friend', browserId: 'friend' }, now);
    engine.command(otherId, { type: 'ready', value: true }, now);
    expect(lobbyReadiness(engine.state, selfId, true).action).toBe('ready');
    engine.command(selfId, { type: 'ready', value: true }, now);
    expect(lobbyReadiness(engine.state, selfId, true).action).toBe('start');
    engine.command(selfId, { type: 'start' }, now);
    expect(engine.state.phase).toBe('countdown');
    expect(engine.state.round?.startAt).toBe(now + COUNTDOWN_MS);
});
