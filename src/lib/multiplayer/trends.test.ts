import { expect, test } from 'bun:test';
import { recordRaceTrends, trendWpm } from './trends';
import { typingWindow, wordOffsets } from './typingWindow';
import type { Round } from './protocol';
const round: Round = { id: 'round-one', text: 'x'.repeat(100), candidates: ['a', 'b'], players: [
    { id: 'a', nickname: 'A', metrics: null }, { id: 'b', nickname: 'B', metrics: null }], startAt: 1000, deadline: 121000,
    endedAt: null, winnerId: null, reason: null, collectionUntil: null, resultsUntil: null };
test('trend samples keep all participants and discard spectators, duplicates and old samples', () => {
    let data = recordRaceTrends(round, null, [{ id: 'a', correctChars: 10, updatedAt: 4000 }, { id: 'spectator', correctChars: 100, updatedAt: 4000 }]);
    data = recordRaceTrends(round, data, [{ id: 'a', correctChars: 12, updatedAt: 4200 }, { id: 'a', correctChars: 1, updatedAt: 4100 }]);
    expect(Object.keys(data.samples)).toEqual(['a', 'b']);
    expect(data.samples.a).toEqual([{ at: 1000, correctChars: 0 }, { at: 4200, correctChars: 12 }]);
    expect(trendWpm({ at: 31000, correctChars: 100 }, 1000)).toBe(40);
});
test('final endpoints replace estimates, discard samples past the finish, and reset for rematches', () => {
    const live = recordRaceTrends(round, null, [{ id: 'a', correctChars: 90, updatedAt: 7000 }]);
    const final: Round = { ...round, endedAt: 6000, reason: 'finish', winnerId: 'a', players: round.players.map(p => ({ ...p, metrics: p.id === 'a' ? { correctChars: 100, completedWords: 1, wpm: 240, attempts: 100, errors: 0, accuracy: 100, duration: 5 } : null })) };
    const data = recordRaceTrends(final, live, []);
    expect(data.samples.a.at(-1)).toEqual({ at: 6000, correctChars: 100 });
    expect(data.samples.a.every(p => p.at <= 6000)).toBe(true);
    expect(recordRaceTrends({ ...round, id: 'round-two' }, data, []).samples.a).toHaveLength(1);
});
test('two-minute trend histories are bounded', () => {
    let data = recordRaceTrends(round, null, []);
    for (let i = 1; i <= 120; i++) data = recordRaceTrends(round, data, [{ id: 'a', correctChars: 1, updatedAt: 1000 + i * 1000 }]);
    expect(data.samples.a.length).toBeLessThanOrEqual(42);
    expect(data.samples.a[0].at).toBe(round.startAt);
});
test('timed passages render a bounded window around the typing cursor, including backspacing', () => {
    const text = Array.from({ length: 2000 }, (_, i) => `word${i}`).join(' '), offsets = wordOffsets(text);
    const part = typingWindow(text, text.slice(0, offsets[1100]) + 'wor', offsets);
    expect(part.text.split(' ').length).toBeLessThanOrEqual(60);
    expect(part.text).toContain('word1100');
    expect(part.typedText.endsWith('wor')).toBe(true);
    expect(typingWindow(text, '', offsets).start).toBe(0);
});
