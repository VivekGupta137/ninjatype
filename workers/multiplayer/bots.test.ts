import { expect, test } from 'bun:test';
import { RoomEngine } from './engine';
import { botCorrectChars, botFinishAt } from '../../src/lib/multiplayer/bots';
import { raceStandings } from '../../src/lib/multiplayer/standings';

const now = 100_000;
const entry = { name: 'Bot-test', nickname: 'SwiftFox', browserId: 'browser-test' };
function quick(random = 0, capacity = 10) {
    let id = 0;
    return new RoomEngine(RoomEngine.create(entry.name, 30, now, 'bot-epoch', capacity, { quickMatch: true }),
        () => Array.from({ length: 30 }, () => 'hello').join(' '), () => `participant-${++id}`, () => random);
}
function settleBots(e: RoomEngine) {
    let time = now;
    for (let i = 0; i < 20 && (!e.state.quickMatchFilled || e.state.members.some(m => m.bot && !m.ready)); i++) {
        time = e.nextDeadline(time);
        e.advance(time);
    }
    return time;
}
function start(e: RoomEngine) {
    const human = e.join(entry, now);
    settleBots(e);
    e.advance(e.state.round!.startAt);
    return human;
}
test('quick match staggers joins and readiness after its initial 5–10 second wait', () => {
    for (const random of [0, .5, .999999]) {
        const e = quick(random), human = e.join(entry, now);
        expect(e.state.members[0].ready).toBe(true);
        expect(e.state.botFillAt! - now).toBeGreaterThanOrEqual(5000);
        expect(e.state.botFillAt! - now).toBeLessThanOrEqual(10_000);
        expect(e.nextDeadline(now)).toBe(e.state.botFillAt!);
        e.advance(e.state.botFillAt! - 1);
        expect(e.state.members).toHaveLength(1);
        const firstJoin = e.state.botFillAt!;
        e.advance(firstJoin);
        expect(e.state.phase).toBe('lobby');
        expect(e.state.members.filter(m => m.bot)).toHaveLength(1);
        expect(e.state.members.find(m => m.bot)?.ready).toBe(false);
        expect(e.state.pendingBots!.length).toBe(1 + Math.floor(random * 3));
        // A fresh DO resumes the persisted join/readiness schedule.
        const restored = new RoomEngine(structuredClone(e.state), () => Array(30).fill('hello').join(' '));
        settleBots(restored);
        const bots = restored.state.members.filter(m => m.bot);
        expect(bots.length).toBe(2 + Math.floor(random * 3));
        expect(new Set(restored.state.members.map(m => m.nickname)).size).toBe(restored.state.members.length);
        expect(bots.every(m => m.avatar?.style === 'moods' && m.ready)).toBe(true);
        expect(restored.state.hostId).toBe(human);
        expect(restored.state.phase).toBe('countdown');
        restored.advance(restored.state.round!.startAt);
        expect(restored.state.round!.players.filter(p => p.bot)).toHaveLength(bots.length);
    }
});
test('automatic start waits for every racer including slow bots and reconnecting humans', () => {
    const e = quick(), a = e.join(entry, now);
    const b = e.join({ ...entry, nickname: 'Other' }, now + 1);
    expect(() => e.command(a, { type: 'start' }, now + 2)).toThrow('Wait');
    e.command(a, { type: 'ready', value: false }, now + 3);
    const readyAt = settleBots(e);
    expect(e.state.phase).toBe('lobby');
    expect(e.state.members.filter(m => m.bot)).toHaveLength(2);
    e.disconnect(b, readyAt + 1);
    e.command(a, { type: 'ready', value: true }, readyAt + 2);
    expect(e.state.phase).toBe('lobby');
    e.join({ ...entry, nickname: 'Other', participantId: b }, readyAt + 3);
    expect(e.state.phase).toBe('lobby');
    e.command(b, { type: 'ready', value: true }, readyAt + 4);
    expect(e.state.phase).toBe('countdown');
});
test('scheduled bots yield their seats to humans and never consume spectator slots', () => {
    const e = quick(.9, 2);
    e.join(entry, now);
    for (let i = 0; i < 10; i++) e.join({ ...entry, nickname: `Viewer${i}`, spectator: true }, now);
    settleBots(e);
    expect(e.state.members.filter(m => m.bot)).toHaveLength(1);
    expect(e.state.members.filter(m => !m.spectator)).toHaveLength(2);
    expect(e.state.members.filter(m => m.spectator)).toHaveLength(10);
    const full = quick();
    for (let i = 0; i < 10; i++) full.join({ ...entry, nickname: `Human${i}` }, now);
    settleBots(full);
    expect(full.state.members.some(m => m.bot)).toBe(false);
    expect(full.state.phase).toBe('countdown');
    const competing = quick(0, 3);
    competing.join(entry, now);
    competing.advance(competing.state.botFillAt!);
    const joinAt = competing.state.pendingBots![0].botJoinAt;
    competing.join({ ...entry, nickname: 'Late human' }, joinAt - 1);
    competing.advance(joinAt);
    expect(competing.state.members.filter(m => !m.spectator)).toHaveLength(3);
    expect(competing.state.pendingBots).toHaveLength(0);
});
test('bots never fill an empty lobby or own the host seat; returning humans can retry', () => {
    const e = quick(), a = e.join(entry, now);
    const fill = e.state.botFillAt!;
    e.disconnect(a, now + 1);
    e.advance(fill);
    expect(e.state.members.some(m => m.bot)).toBe(false);
    expect(e.state.hostId).toBeNull();
    e.join({ ...entry, participantId: a }, fill + 1);
    expect(e.state.botFillAt).toBeGreaterThan(fill);
});
test('bots do not keep empty rooms alive or independently enter a rematch', () => {
    const e = quick(), human = start(e), r = e.state.round!;
    e.advance(Math.min(...r.players.filter(p => p.bot).map(p => botFinishAt(r, p))));
    expect(e.state.phase).toBe('results');
    e.advance(r.collectionUntil!);
    expect(e.state.phase).toBe('results');
    e.disconnect(human, r.collectionUntil! + 1);
    expect(e.state.hostId).toBeNull();
    expect(e.state.emptyUntil).not.toBeNull();
    expect(e.advance(e.state.emptyUntil!)).toContain('without players');
});
test('server bot finish alarm ends the race with scores, without progress writes', () => {
    const e = quick(), human = start(e), r = e.state.round!;
    const bot = r.players.find(p => p.bot)!;
    const sequence = e.state.sequence;
    const mid = r.startAt + 10_000;
    expect(botCorrectChars(r, bot, mid)).toBeGreaterThan(0);
    expect(raceStandings(r, null, human, null, mid).find(p => p.id === bot.id)?.wpm).toBeGreaterThan(0);
    expect(e.state.sequence).toBe(sequence);
    const finish = Math.min(...r.players.filter(p => p.bot).map(p => botFinishAt(r, p)));
    expect(e.nextDeadline(r.startAt)).toBe(finish);
    e.advance(finish + 30_000); // Late alarm keeps the scheduled finish time.
    expect(r.endedAt).toBe(finish);
    expect(r.players.find(p => p.id === r.winnerId)?.bot).toBe(true);
    expect(r.players.filter(p => p.bot).every(p => p.metrics && p.metrics.wpm > 0)).toBe(true);
    expect(r.players.find(p => p.id === r.winnerId)?.metrics?.correctChars).toBe(r.text.length);
    expect(() => e.command(bot.id, { type: 'sync' }, finish)).toThrow('connected');
});
test('human can finish first and request a bot rematch without resetting expiry', () => {
    const e = quick(), human = start(e), r = e.state.round!, expiry = e.state.expiresAt;
    e.command(human, { type: 'finish', roundId: r.id, typedText: r.text, attempts: r.text.length, errors: 0 }, r.startAt + 15_000);
    expect(r.winnerId).toBe(human);
    expect(r.players.filter(p => p.bot).every(p => p.metrics!.correctChars < r.text.length)).toBe(true);
    e.command(human, { type: 'rematch', roundId: r.id, value: true }, r.collectionUntil!);
    expect(e.state.phase).toBe('countdown');
    expect(e.state.round!.candidates).toHaveLength(3);
    expect(e.state.expiresAt).toBe(expiry);
});
test('canceled countdown with only bots returns to lobby', () => {
    const e = quick(), human = e.join(entry, now);
    settleBots(e);
    const startAt = e.state.round!.startAt;
    e.disconnect(human, startAt - 1);
    e.advance(startAt);
    expect(e.state.phase).toBe('lobby');
    expect(e.state.round).toBeNull();
});
test('friends rooms never schedule or add bots', () => {
    const e = new RoomEngine(RoomEngine.create(entry.name, 30, now, 'friend-epoch'), () => 'hello');
    e.join(entry, now);
    e.advance(now + 15_000);
    expect(e.state.botFillAt).toBeUndefined();
    expect(e.state.members.some(m => m.bot)).toBe(false);
    expect(e.state.phase).toBe('lobby');
});

test('bot typing varies by racer and round, pauses, stays monotonic and agrees with finish alarms', () => {
    const e = quick(), human = start(e), round = e.state.round!;
    const bot = round.players.find(p => p.bot)!;
    const samples = Array.from({ length: 160 }, (_, i) => botCorrectChars(round, bot, round.startAt + i * 1000));
    const deltas = samples.slice(1).map((value, i) => value - samples[i]);
    expect(deltas.every(d => d >= 0)).toBe(true);
    expect(deltas.slice(5, 60).some(d => d === 0)).toBe(true);
    expect(new Set(deltas.filter(d => d > 0)).size).toBeGreaterThan(2);
    const finish = botFinishAt(round, bot);
    expect(botCorrectChars(round, bot, finish)).toBe(round.text.length);
    expect(botCorrectChars(round, bot, finish - 1)).toBeLessThan(round.text.length);
    expect(botFinishAt({ ...round, id: 'another-round' }, bot)).not.toBe(finish);
    expect(botCorrectChars(round, bot, round.startAt)).toBe(0);
    const before = e.state.sequence;
    raceStandings(round, null, human, null, round.startAt + 15_000);
    expect(e.state.sequence).toBe(before);
});
