import { describe, expect, test } from 'bun:test';
import { RoomEngine } from './engine';
import { GRACE_MS, ROOM_LIFETIME_MS, roomPlayerLimit, type Entry, type RoomState } from '../../src/lib/multiplayer/protocol';
const base = 100_000;
function room(maxPlayers = 10) {
    let id = 0;
    return new RoomEngine(RoomEngine.create('Test-room', 15, base, 'epoch-original', maxPlayers), () => 'one two three', () => `player-or-round-${++id}`);
}
const entry = (name: string): Entry => ({ name: 'Test-room', nickname: name, browserId: 'browser-id' });
function race(engine: RoomEngine, at = base) {
    const a = engine.join(entry('A'), at), b = engine.join(entry('B'), at);
    engine.command(a, { type: 'ready', value: true }, at);
    engine.command(b, { type: 'ready', value: true }, at);
    engine.command(a, { type: 'start' }, at);
    engine.advance(at + 3000);
    return [a, b];
}
const finish = (engine: RoomEngine) => ({ type: 'finish' as const, roundId: engine.state.round!.id,
    typedText: engine.state.round!.text, attempts: engine.state.round!.text.length, errors: 0 });

describe('multiplayer room authority', () => {
    test('configured capacity counts reservations and lets the original player reclaim a full room', () => {
        const e = room(4);
        const ids = Array.from({ length: 4 }, (_, i) => e.join(entry(`N${i}`), base));
        e.disconnect(ids[0], base + 100);
        expect(() => e.join(entry('extra'), base + 200)).toThrow('full');
        expect(e.join({ ...entry('N0'), participantId: ids[0], epoch: e.state.epoch }, base + 200)).toBe(ids[0]);
        expect(e.state.members).toHaveLength(4);
    });
    test('a configured capacity above ten replaces the original fixed limit', () => {
        const e = room(12);
        Array.from({ length: 12 }, (_, i) => e.join(entry(`N${i}`), base));
        expect(e.state.members).toHaveLength(12);
        expect(() => e.join(entry('extra'), base)).toThrow('full');
    });
    test('stored capacity survives restoration and legacy snapshots default to ten', () => {
        const saved = structuredClone(room(4).state);
        expect(new RoomEngine(saved, () => 'one two').state.maxPlayers).toBe(4);
        const legacy: Partial<RoomState> = structuredClone(saved);
        delete legacy.maxPlayers;
        expect(new RoomEngine(legacy as RoomState, () => 'one two').state.maxPlayers).toBe(10);
    });
    test('invalid capacity configuration retains the default and valid integers are accepted', () => {
        for (const value of [undefined, '', '0', '1', '-2', '4.5', '1e2', 'Infinity', 'NaN', 'players', '9007199254740992', 1.5, NaN])
            expect(roomPlayerLimit(value)).toBe(10);
        expect(roomPlayerLimit(' 4 ')).toBe(4);
        expect(roomPlayerLimit('12')).toBe(12);
        expect(roomPlayerLimit(2)).toBe(2);
    });
    test('ten seats include reconnect reservations, without a global room-count gate', () => {
        const e = room();
        const ids = Array.from({ length: 10 }, (_, i) => e.join(entry(`N${i}`), base));
        expect(() => e.join(entry('eleventh'), base)).toThrow('full');
        e.disconnect(ids[0], base);
        expect(() => e.join(entry('replacement'), base + 100)).toThrow('full');
        e.advance(base + GRACE_MS);
        e.join(entry('replacement'), base + GRACE_MS);
        expect(e.state.members).toHaveLength(10);
    });
    test('reconnect restores its seat and rejects active-seat takeover and old epochs', () => {
        const e = room(); const id = e.join(entry('A'), base);
        expect(() => e.join({ ...entry('A'), participantId: id, epoch: e.state.epoch }, base)).toThrow('already connected');
        e.disconnect(id, base);
        expect(e.join({ ...entry('A'), participantId: id, epoch: e.state.epoch }, base + 1000)).toBe(id);
        expect(e.state.emptyUntil).toBeNull();
        expect(() => e.join({ ...entry('A'), epoch: 'epoch-other' }, base + 1000)).toThrow('replaced');
    });
    test('duplicate nicknames get deterministic visible suffixes', () => {
        const e = room(); e.join(entry('Ninja'), base); e.join(entry('Ninja'), base);
        expect(e.state.members.map(m => m.nickname)).toEqual(['Ninja', 'Ninja 2']);
    });
    test('only available candidates at actual start can submit a finish', () => {
        const e = room(); const [a] = race(e);
        const late = e.join(entry('Late'), base + 3500);
        expect(() => e.command(late, finish(e), base + 5000)).toThrow('not connected and ready');
        expect(e.state.phase).toBe('racing');
        e.command(a, finish(e), base + 5000);
        expect(e.state.round!.winnerId).toBe(a);
    });
    test('first accepted completion stops everyone; late finishes cannot replace it', () => {
        const e = room(); const [a, b] = race(e);
        const command = finish(e);
        e.command(a, command, base + 5000);
        const sequence = e.state.sequence;
        e.command(a, command, base + 5001);
        expect(e.state.sequence).toBe(sequence);
        expect(() => e.command(b, command, base + 5001)).toThrow('already ended');
        e.command(b, { ...command, type: 'metrics', typedText: 'one ', attempts: 4 }, base + 6000);
        expect(e.state.round!.winnerId).toBe(a);
        expect(e.state.round!.players.find(p => p.id === b)!.metrics!.completedWords).toBe(1);
        expect(e.state.round!.players.find(p => p.id === b)!.metrics!.duration).toBe(2);
    });
    test('timeout uses its scheduled deadline and never manufactures a winner', () => {
        const e = room(); race(e);
        const deadline = e.state.round!.deadline;
        e.advance(deadline + 5000);
        expect(e.state.phase).toBe('results');
        expect(e.state.round!.endedAt).toBe(deadline);
        expect(e.state.round!.winnerId).toBeNull();
        expect(e.state.round!.reason).toBe('timeout');
    });
    test('all-disconnected grace is two minutes and reconnect does not pause the game', () => {
        const e = room(); const [a, b] = race(e);
        const deadline = e.state.round!.deadline;
        e.disconnect(a, base + 4000); e.disconnect(b, base + 4000);
        expect(e.state.emptyUntil).toBe(base + 4000 + GRACE_MS);
        e.advance(base + 5000);
        e.join({ ...entry('A'), participantId: a, epoch: e.state.epoch }, base + 5000);
        expect(e.state.round!.deadline).toBe(deadline);
        expect(e.state.emptyUntil).toBeNull();
    });
    test('hard expiry clips grace and wins over delayed alarms/results', () => {
        const e = room(); e.join(entry('A'), base); e.disconnect(e.state.members[0].id, base + ROOM_LIFETIME_MS - 60_000);
        expect(e.state.emptyUntil).toBe(e.state.expiresAt);
        expect(e.advance(e.state.expiresAt)).toContain('20-minute');
        expect(room().advance(base + GRACE_MS)).toContain('without players');
    });
    test('metrics validation rejects falsified completion and malformed counts without ending the round', () => {
        const e = room(); const [a] = race(e);
        expect(() => e.command(a, { ...finish(e), typedText: 'one' }, base + 5000)).toThrow('entire passage');
        expect(() => e.command(a, { ...finish(e), errors: -1 }, base + 5000)).toThrow('Invalid typing');
        expect(() => e.command(a, finish(e), base + 3100)).toThrow('too early');
        expect(e.state.phase).toBe('racing');
        expect(e.state.round!.players[0].metrics).toBeNull();
    });
    test('rematch is opt-in, fresh-round, idempotent and preserves the original room expiry', () => {
        const e = room(); const [a, b] = race(e); const old = e.state.round!.id, expires = e.state.expiresAt;
        e.command(a, finish(e), base + 5000);
        e.command(b, { ...finish(e), type: 'metrics', typedText: 'one ', attempts: 4 }, base + 6000);
        e.command(a, { type: 'rematch', value: true, roundId: old }, base + 6000);
        expect(e.state.phase).toBe('results');
        e.command(b, { type: 'rematch', value: true, roundId: old }, base + 6000);
        e.advance(base + 15000);
        expect(e.state.phase).toBe('countdown');
        expect(e.state.round!.id).not.toBe(old);
        expect(e.state.expiresAt).toBe(expires);
        expect(e.state.maxPlayers).toBe(10);
        expect(() => e.command(a, { ...finish(e), roundId: old }, base + 15001)).toThrow('no longer current');
        e.advance(base + 18000); expect(e.state.round!.players).toHaveLength(2);
    });
    test('cancelled rematch survives restoration and keeps results until their original deadline', () => {
        const e = room(); const [a, b] = race(e);
        e.command(a, finish(e), base + 5000);
        const results = structuredClone(e.state.round!);
        e.command(a, { type: 'rematch', value: true, roundId: results.id }, base + 15000);
        e.command(b, { type: 'rematch', value: true, roundId: results.id }, base + 15000);
        const restored = new RoomEngine(structuredClone(e.state), () => 'one two three');
        restored.previousResults = structuredClone(e.previousResults);
        restored.disconnect(b, base + 16000); restored.advance(base + 18000);
        expect(restored.state.phase).toBe('results');
        expect(restored.state.round!.winnerId).toBe(a);
        expect(restored.state.round!.resultsUntil).toBe(results.resultsUntil);
        expect(restored.advance(results.resultsUntil!)).toContain('rematch window');
    });
});
