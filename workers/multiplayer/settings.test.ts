import { expect, test } from 'bun:test';
import { RoomEngine } from './engine';

const settings = { mode: 'time' as const, duration: 45, dictionary: '5k' as const };
const entry = { name: 'Settings-test', nickname: 'Ninja', browserId: 'browser-test' };
function room(quickMatch = false) {
    return new RoomEngine(RoomEngine.create(entry.name, 15, 100_000, 'settings-epoch', 10, { quickMatch }), () => 'one two three');
}
test('quick match enforces its fixed format and lock survives restoration', () => {
    const e = room(true);
    expect(e.state.wordCount).toBe(30);
    expect(e.state.dictionary).toBe('1k');
    const restored = new RoomEngine(structuredClone(e.state), () => 'one two');
    const id = restored.join(entry, 100_000);
    expect(() => restored.command(id, { type: 'configure', wordCount: 50, settings, sequence: restored.state.sequence }, 100_001)).toThrow('locked');
});
test('lobby reconfiguration preserves room identity and clears all readiness', () => {
    const e = room(), id = e.join(entry, 100_000), other = e.join({ ...entry, nickname: 'Other' }, 100_000);
    e.command(id, { type: 'ready', value: true }, 100_000);
    e.command(other, { type: 'ready', value: true }, 100_000);
    const expiresAt = e.state.expiresAt, epoch = e.state.epoch;
    e.command(id, { type: 'configure', wordCount: 50, settings, sequence: e.state.sequence }, 100_010);
    expect(e.state.mode).toBe('time');
    expect(e.state.duration).toBe(45);
    expect(e.state.dictionary).toBe('5k');
    expect(e.state.members.every(m => !m.ready)).toBe(true);
    expect(e.state.expiresAt).toBe(expiresAt);
    expect(e.state.epoch).toBe(epoch);
});
test('stale, invalid and nonmember settings commands cannot change state', () => {
    const e = room(), id = e.join(entry, 100_000);
    const before = structuredClone(e.state);
    expect(() => e.command(id, { type: 'configure', wordCount: 50, settings, sequence: 0 }, 100_010)).toThrow('changed');
    expect(() => e.command(id, { type: 'configure', wordCount: 999, settings, sequence: e.state.sequence }, 100_010)).toThrow('Choose');
    expect(() => e.command('outsider', { type: 'configure', wordCount: 50, settings, sequence: e.state.sequence }, 100_010)).toThrow('connected');
    expect(e.state).toEqual(before);
});
test('settings cannot change once countdown starts', () => {
    const e = room(), id = e.join(entry, 100_000), other = e.join({ ...entry, nickname: 'Other' }, 100_000);
    e.command(id, { type: 'ready', value: true }, 100_000);
    e.command(other, { type: 'ready', value: true }, 100_000);
    e.command(id, { type: 'start' }, 100_000);
    expect(() => e.command(id, { type: 'configure', wordCount: 50, settings, sequence: e.state.sequence }, 100_010)).toThrow('only in the lobby');
});
test('host controls transfer to a connected racer when the host disconnects', () => {
    const e = room(), host = e.join(entry, 100_000), other = e.join({ ...entry, nickname: 'Other' }, 100_000);
    expect(e.state.hostId).toBe(host);
    expect(() => e.command(other, { type: 'configure', wordCount: 30, settings, sequence: e.state.sequence }, 100_001)).toThrow('host');
    e.disconnect(host, 100_002);
    expect(e.state.hostId).toBe(other);
    e.command(other, { type: 'configure', wordCount: 30, settings, sequence: e.state.sequence }, 100_003);
    expect(e.state.dictionary).toBe('5k');
});
test('auto-start waits for every connected racer and ignores spectators', () => {
    const e = new RoomEngine(RoomEngine.create(entry.name, 30, 100_000, 'auto-epoch', 10, { autoStart: true }), () => 'one two');
    const a = e.join(entry, 100_000), b = e.join({ ...entry, nickname: 'B' }, 100_000), c = e.join({ ...entry, nickname: 'C' }, 100_000);
    e.join({ ...entry, nickname: 'Viewer', spectator: true }, 100_000);
    e.command(a, { type: 'ready', value: true }, 100_001);
    e.command(b, { type: 'ready', value: true }, 100_001);
    expect(e.state.phase).toBe('lobby');
    e.command(c, { type: 'ready', value: true }, 100_002);
    expect(e.state.phase).toBe('countdown');
    e.advance(110_002);
    expect(e.state.round?.players).toHaveLength(3);
});
test('ten spectators have separate reserved seats and cannot join racing or rematches as players', () => {
    const e = new RoomEngine(RoomEngine.create(entry.name, 30, 100_000, 'spectator-epoch', 2), () => 'one two');
    const a = e.join(entry, 100_000), b = e.join({ ...entry, nickname: 'B' }, 100_000);
    e.command(a, { type: 'ready', value: true }, 100_001);
    e.command(b, { type: 'ready', value: true }, 100_001);
    e.command(a, { type: 'start' }, 100_002);
    e.advance(110_002);
    const viewers = Array.from({ length: 10 }, (_, i) => e.join({ ...entry, nickname: `Viewer${i}` }, 110_003));
    expect(e.state.members.filter(m => m.spectator)).toHaveLength(10);
    expect(e.state.members.filter(m => !m.spectator)).toHaveLength(2);
    expect(() => e.join({ ...entry, nickname: 'Extra' }, 110_004)).toThrow('ten spectator');
    e.disconnect(viewers[0], 110_005);
    expect(() => e.join({ ...entry, nickname: 'Replacement' }, 110_006)).toThrow('ten spectator');
    expect(e.join({ ...entry, participantId: viewers[0], epoch: e.state.epoch }, 110_007)).toBe(viewers[0]);
    expect(e.state.round?.players).toHaveLength(2);
});
test('spectator control blocks late entry while preserving participant reconnects', () => {
    const e = room(), a = e.join(entry, 100_000), b = e.join({ ...entry, nickname: 'B' }, 100_000);
    e.command(a, { type: 'configure', wordCount: 15, settings: { mode: 'words', duration: 120, dictionary: '1k' }, sequence: e.state.sequence, allowSpectators: false }, 100_001);
    e.command(a, { type: 'ready', value: true }, 100_002);
    e.command(b, { type: 'ready', value: true }, 100_002);
    e.command(a, { type: 'start' }, 100_003);
    expect(() => e.join({ ...entry, nickname: 'Viewer' }, 100_004)).toThrow('disabled spectators');
    e.disconnect(b, 100_005);
    expect(e.join({ ...entry, participantId: b, epoch: e.state.epoch }, 100_006)).toBe(b);
});
test('chat is bounded, rejects controls and oversized text, and retains plain text safely', () => {
    const e = room(), a = e.join(entry, 100_000);
    for (let i = 0; i < 25; i++) e.command(a, { type: 'chat', text: `Message ${i}` }, 100_001 + i);
    expect(e.state.chat).toHaveLength(20);
    expect(e.state.chat?.[0].text).toBe('Message 5');
    for (const text of ['', 'x'.repeat(241), 'unsafe\u0000']) expect(() => e.command(a, { type: 'chat', text }, 100_030)).toThrow('visible characters');
    e.command(a, { type: 'chat', text: '<script>alert(1)</script>' }, 100_031);
    expect(e.state.chat?.at(-1)?.text).toBe('<script>alert(1)</script>');
});
test('disabling spectators removes existing viewer seats and keeps racers', () => {
    const e = room(), host = e.join(entry, 100_000);
    e.join({ ...entry, nickname: 'Viewer', spectator: true }, 100_001);
    e.command(host, { type: 'configure', wordCount: 15, settings: { mode: 'words', duration: 120, dictionary: '1k' }, sequence: e.state.sequence, allowSpectators: false }, 100_002);
    expect(e.state.members).toHaveLength(1);
    expect(e.state.members[0].id).toBe(host);
    expect(e.state.allowSpectators).toBe(false);
});

test('quick-match host can pause auto-start while bots fill and resume with readiness preserved', () => {
    const e = room(true), host = e.join(entry, 100_000);
    const expiresAt = e.state.expiresAt, fillAt = e.state.botFillAt!;
    e.command(host, { type: 'room_controls', autoStart: false }, 100_001);
    expect(e.state.autoStart).toBe(false);
    expect(e.state.members.find(m => m.id === host)?.ready).toBe(true);
    e.advance(fillAt);
    let readyAt = fillAt;
    for (let i = 0; i < 20 && (!e.state.quickMatchFilled || e.state.members.some(m => m.bot && !m.ready)); i++) { readyAt = e.nextDeadline(readyAt); e.advance(readyAt); }
    expect(e.state.phase).toBe('lobby');
    expect(e.state.members.filter(m => m.bot).length).toBeGreaterThanOrEqual(2);
    const sequence = e.state.sequence;
    e.command(host, { type: 'room_controls', autoStart: false }, readyAt + 1);
    expect(e.state.sequence).toBe(sequence);
    e.command(host, { type: 'room_controls', autoStart: true }, readyAt + 2);
    expect(e.state.phase).toBe('countdown');
    expect(e.state.wordCount).toBe(30);
    expect(e.state.dictionary).toBe('1k');
    expect(e.state.expiresAt).toBe(expiresAt);
    expect(() => e.command(host, { type: 'room_controls', autoStart: false }, readyAt + 3)).toThrow('only in the lobby');
});
test('room controls are host-only, validate booleans and remove viewers without clearing racer readiness', () => {
    const e = room(true), host = e.join(entry, 100_000);
    const other = e.join({ ...entry, nickname: 'Other' }, 100_001);
    e.join({ ...entry, nickname: 'Viewer', spectator: true }, 100_002);
    expect(() => e.command(other, { type: 'room_controls', autoStart: false }, 100_003)).toThrow('host');
    expect(() => e.command(host, { type: 'room_controls' }, 100_003)).toThrow('valid');
    expect(() => e.command(host, { type: 'room_controls', autoStart: 'false' as unknown as boolean }, 100_003)).toThrow('valid');
    e.command(host, { type: 'room_controls', autoStart: false, allowSpectators: false }, 100_004);
    expect(e.state.members.some(m => m.spectator)).toBe(false);
    expect(e.state.members.every(m => m.ready)).toBe(true);
    expect(() => e.join({ ...entry, nickname: 'New viewer', spectator: true }, 100_005)).toThrow('disabled spectators');
});
