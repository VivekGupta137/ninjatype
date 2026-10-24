import { expect, test } from 'bun:test';
import { RoomEngine } from './engine';
import { raceText } from './dictionaries';
import { COUNTDOWN_MS, DICTIONARIES, METRICS_MS, RACE_DURATIONS, raceSettings, type RoomState } from '../../src/lib/multiplayer/protocol';

const base = 100_000;
function timed(duration = 15) {
    let id = 0;
    const engine = new RoomEngine(RoomEngine.create('Timed-room', 15, base, 'epoch-time', 10,
        { mode: 'time', duration, dictionary: '2k-long' }), raceText, () => `id-${++id}`);
    const a = engine.join({ name: 'Timed-room', nickname: 'A', browserId: 'browser-a' }, base);
    const b = engine.join({ name: 'Timed-room', nickname: 'B', browserId: 'browser-b' }, base);
    for (const player of [a, b]) engine.command(player, { type: 'ready', value: true }, base);
    engine.command(a, { type: 'start' }, base);
    engine.advance(base + COUNTDOWN_MS);
    return { engine, a, b };
}
function score(engine: RoomEngine, player: string, length: number, errors = 0) {
    const round = engine.state.round!;
    engine.command(player, { type: 'metrics', roundId: round.id, typedText: round.text.slice(0, length),
        attempts: length + errors, errors }, round.endedAt! + 100);
}

test('race settings validate mode, duration and dictionary, with legacy defaults', () => {
    expect(raceSettings({})).toEqual({ mode: 'words', duration: 120, dictionary: '1k' });
    expect(raceSettings({ mode: 'time' }).duration).toBe(60);
    for (const input of [{ mode: 'other' }, { mode: 'time', duration: 45 }, { mode: 'time', duration: '15' }, { dictionary: 'quotes' }])
        expect(() => raceSettings(input)).toThrow();
    const legacy = RoomEngine.create('Legacy-room', 15, base, 'epoch-legacy') as Partial<RoomState>;
    delete legacy.mode; delete legacy.duration; delete legacy.dictionary;
    expect(new RoomEngine(legacy as RoomState, raceText).state.mode).toBe('words');
    expect(legacy.dictionary).toBe('1k');
});

test('every dictionary generates exact word counts and bounded timed passages above the accepted pace', () => {
    for (const dictionary of DICTIONARIES) {
        for (const count of [15, 30, 50]) expect(raceText(count, dictionary.id).split(/\s+/)).toHaveLength(count);
        for (const duration of RACE_DURATIONS) {
            const text = raceText(15, dictionary.id, duration);
            expect(text.length).toBeGreaterThan(duration / 60 * 5000);
            expect(text.length).toBeLessThan(10_300);
            expect(text.startsWith(' ') || text.endsWith(' ') || text.includes('  ')).toBe(false);
        }
    }
});

test('timed races use their selected duration and never accept early completion', () => {
    const { engine, a } = timed(30), round = engine.state.round!;
    expect(round.deadline - round.startAt).toBe(30_000);
    expect(() => engine.command(a, { type: 'finish', roundId: round.id, typedText: round.text,
        attempts: round.text.length, errors: 0 }, round.startAt + 5000)).toThrow('timer');
    engine.advance(round.deadline - 1); expect(engine.state.phase).toBe('racing');
    engine.advance(round.deadline + 2000);
    expect(engine.state.phase).toBe('results');
    expect(round.endedAt).toBe(round.deadline);
    expect(round.winnerFinalized).toBe(false);
    expect(round.winnerId).toBeNull();
});

test('timed winner waits for final scores, ranks correct characters and keeps settings on rematch', () => {
    const { engine, a, b } = timed(), round = engine.state.round!;
    engine.advance(round.deadline);
    score(engine, a, 50);
    expect(round.winnerFinalized).toBe(false);
    score(engine, b, 100);
    expect(round.winnerFinalized).toBe(true); expect(round.winnerId).toBe(b);
    const expiry = engine.state.expiresAt;
    for (const player of [a, b]) engine.command(player, { type: 'rematch', value: true, roundId: round.id }, round.endedAt! + 200);
    engine.advance(round.collectionUntil!);
    expect(engine.state.phase).toBe('countdown');
    expect(engine.state.round!.id).not.toBe(round.id);
    expect(engine.state.round!.deadline - engine.state.round!.startAt).toBe(15_000);
    expect(engine.state.dictionary).toBe('2k-long');
    expect(engine.state.mode).toBe('time'); expect(engine.state.expiresAt).toBe(expiry);
});

test('missing final scores close at the collection deadline and cannot replace a finalized winner', () => {
    const { engine, a, b } = timed(), round = engine.state.round!;
    engine.advance(round.deadline); score(engine, a, 50);
    engine.advance(round.collectionUntil! - 1); expect(round.winnerFinalized).toBe(false);
    engine.advance(round.collectionUntil!); expect(round.winnerId).toBe(a);
    expect(() => score(engine, b, 100)).toThrow('finalized');
    expect(round.winnerId).toBe(a);
});

test('timed ties use accuracy then stable identity, and zero input produces no winner', () => {
    for (const errors of [0, 10]) {
        const { engine, a, b } = timed(), round = engine.state.round!;
        engine.advance(round.deadline); score(engine, b, 50, errors); score(engine, a, 50);
        expect(round.winnerId).toBe(a);
    }
    const { engine, a, b } = timed(), round = engine.state.round!;
    engine.advance(round.deadline); score(engine, a, 0); score(engine, b, 0);
    expect(round.winnerId).toBeNull(); expect(round.winnerFinalized).toBe(true);
});

test('timed scores exceeding 1000 WPM are rejected', () => {
    const { engine, a } = timed(), round = engine.state.round!;
    engine.advance(round.deadline);
    expect(() => score(engine, a, round.text.length)).toThrow('speed');
    expect(round.players[0].metrics).toBeNull();
});

test('timed starts and rematches must fit before hard room expiry', () => {
    const { engine, a, b } = timed(), round = engine.state.round!;
    engine.state.expiresAt = round.deadline + METRICS_MS + 1000;
    engine.advance(round.deadline); score(engine, a, 50); score(engine, b, 50);
    for (const player of [a, b]) engine.command(player, { type: 'rematch', value: true, roundId: round.id }, round.endedAt! + 200);
    expect(engine.advance(round.collectionUntil!)).toBeNull();
    expect(engine.state.phase).toBe('results');
    engine.state.phase = 'lobby'; engine.state.round = null;
    engine.command(a, { type: 'ready', value: true }, round.collectionUntil!);
    engine.command(b, { type: 'ready', value: true }, round.collectionUntil!);
    expect(() => engine.command(a, { type: 'start' }, round.collectionUntil!)).toThrow('expiring');
    expect(engine.state.phase).toBe('lobby');
});
