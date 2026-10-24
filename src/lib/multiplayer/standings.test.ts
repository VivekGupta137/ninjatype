import { expect, test } from 'bun:test';
import { raceStandings } from './standings';
import type { LiveStandings, Metrics, Round } from './protocol';
const round: Round = { id: 'round-one', text: 'x'.repeat(100), candidates: [],
    players: Array.from({ length: 7 }, (_, i) => ({ id: `p${i}`, nickname: `Ninja ${i}`, metrics: null })),
    startAt: 1000, deadline: 121000, endedAt: null, reason: null, winnerId: null, collectionUntil: null, resultsUntil: null };
const live: LiveStandings = { type: 'standings', roundId: round.id, serverTime: 31000,
    players: round.players.map((p, i) => ({ id: p.id, correctChars: i * 10, updatedAt: 31000 })) };
const metrics = (correctChars: number, wpm: number): Metrics => ({ correctChars, wpm, completedWords: 0, attempts: correctChars, errors: 0, accuracy: 100, duration: 30 });
test('top five rank by completion and merge immediate local typing without adding spectators', () => {
    const rows = raceStandings(round, { ...live, players: [...live.players, { id: 'spectator', correctChars: 100, updatedAt: 31000 }] }, 'p0', metrics(90, 36));
    expect(rows.slice(0, 5).map(p => p.id)).toEqual(['p0', 'p6', 'p5', 'p4', 'p3']);
    expect(rows[0]).toMatchObject({ completion: 90, wpm: 36 });
    expect(rows.find(p => p.id === 'p6')?.wpm).toBe(24);
    expect(rows).toHaveLength(7);
});
test('rematches discard old reports and unreported players have no fabricated speed', () => {
    expect(raceStandings({ ...round, id: 'round-two' }, live, undefined, null).every(p => p.wpm === null && p.completion === 0)).toBe(true);
});
test('final validated metrics replace estimates and pending results do not retain live claims', () => {
    const final = { ...round, endedAt: 31000, winnerId: 'p1', players: round.players.map(p => ({ ...p, metrics: p.id === 'p1' ? metrics(100, 40) : null })) };
    const rows = raceStandings(final, live, 'p0', metrics(90, 36));
    expect(rows[0]).toMatchObject({ id: 'p1', wpm: 40, completion: 100 });
    expect(rows.find(p => p.id === 'p0')).toMatchObject({ wpm: null, completion: null });
});
