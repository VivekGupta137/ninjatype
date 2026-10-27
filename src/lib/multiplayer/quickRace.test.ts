import { expect, test } from 'bun:test';
import { QuickRace } from './quickRace';
import { botFinishAt } from './bots';
import { COUNTDOWN_MS, DEFAULT_AVATAR } from './protocol';

function quick() {
    let id = 0;
    return new QuickRace('My racer', { ...DEFAULT_AVATAR, seed: 'my-random-seed' }, 100_000, () => .5, () => `random-${++id}`);
}
function ready(q: QuickRace) {
    let now = 100_000;
    q.command({ type: 'ready', value: true }, now);
    for (let i = 0; i < 20 && q.engine.state.phase === 'lobby'; i++) { now = q.engine.nextDeadline(now); q.tick(now); }
    return q.engine.state.round!;
}
test('local quick race staggers opponents, waits for readiness and shares a ten-second countdown', () => {
    const q = quick(), initial = q.tick(100_000);
    expect(initial.snapshot.room.members).toHaveLength(1);
    expect(initial.snapshot.room.members.find(m => m.id === q.selfId)?.ready).toBe(false);
    expect(initial.snapshot.room.allowSpectators).toBe(false);
    expect(q.command({ type: 'chat', text: 'hello' }, 100_001)).toBe(false);
    let now = 100_001;
    for (let i = 0; i < 20 && (!q.engine.state.quickMatchFilled || q.engine.state.members.some(m => m.bot && !m.ready)); i++) { now = q.engine.nextDeadline(now); q.tick(now); }
    expect(q.engine.state.phase).toBe('lobby');
    expect(q.engine.state.members).toHaveLength(4);
    q.command({ type: 'ready', value: true }, now);
    const round = q.engine.state.round!;
    expect(round.startAt - now).toBe(COUNTDOWN_MS);
    expect(COUNTDOWN_MS).toBe(10_000);
    const preview = q.tick(now + 1);
    expect(preview.snapshot.room.phase).toBe('countdown');
    expect(preview.run?.text.split(' ')).toHaveLength(30);
    q.type('the', round.startAt - 1);
    expect(q.run?.typedText).toBe('');
    expect(q.tick(round.startAt).snapshot.room.phase).toBe('racing');
});
test('quick lobby has no start deadline until the human explicitly selects Ready', () => {
    const q = quick();
    // Advance beyond every bot join/readiness deadline and the old short timer.
    for (let now = 100_000; now <= 160_000; now += 200) {
        const state = q.tick(now);
        expect(state.snapshot.room.phase).toBe('lobby');
        expect(state.snapshot.room.round).toBeNull();
        expect(state.closed).toBeNull();
    }
    expect(q.engine.state.members.filter(m => m.bot).every(m => m.ready)).toBe(true);
    q.command({ type: 'ready', value: true }, 160_000);
    expect(q.engine.state.phase).toBe('countdown');
    expect(q.engine.state.round?.startAt).toBe(160_000 + COUNTDOWN_MS);
    expect(q.tick(160_000 + COUNTDOWN_MS - 1).snapshot.room.phase).toBe('countdown');
    expect(q.tick(160_000 + COUNTDOWN_MS).snapshot.room.phase).toBe('racing');
});
test('local human finish provides all scores and trends immediately, and rematch clears the passage', () => {
    const q = quick(), round = ready(q);
    q.tick(round.startAt);
    q.type(round.text, round.startAt + 15_000);
    const result = q.tick(round.startAt + 15_000);
    expect(result.snapshot.room.phase).toBe('results');
    expect(result.snapshot.room.round?.winnerId).toBe(q.selfId);
    expect(result.snapshot.room.round?.players.every(p => p.metrics !== null)).toBe(true);
    expect(result.run?.stopped).toBe(true);
    expect(result.trends?.samples[q.selfId].at(-1)?.correctChars).toBe(round.text.length);
    q.command({ type: 'rematch', roundId: round.id, value: true }, round.startAt + 15_001);
    const rematch = q.tick(round.startAt + 15_001);
    expect(rematch.snapshot.room.phase).toBe('countdown');
    expect(rematch.snapshot.room.round?.id).not.toBe(round.id);
    expect(rematch.run?.typedText).toBe('');
    expect(rematch.trends?.roundId).not.toBe(round.id);
});
test('local bot win uses its scheduled finish time and stops typing even after a delayed browser tick', () => {
    const q = quick(), round = ready(q);
    q.tick(round.startAt);
    q.type('the', round.startAt + 2000);
    const finish = Math.min(...q.engine.state.round!.players.filter(p => p.bot).map(p => botFinishAt(round, p)));
    const result = q.tick(finish + 5000);
    expect(result.snapshot.room.phase).toBe('results');
    expect(result.snapshot.room.round?.endedAt).toBe(finish);
    expect(result.snapshot.room.round?.players.find(p => p.id === result.snapshot.room.round?.winnerId)?.bot).toBe(true);
    expect(result.snapshot.room.round?.players.every(p => p.metrics !== null)).toBe(true);
    const typed = q.run?.typedText;
    q.type(round.text, finish + 5001);
    expect(q.run?.typedText).toBe(typed);
});
