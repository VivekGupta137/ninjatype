import { PROGRESS_MS, ROUND_MS, type LiveProgress, type Round } from './protocol';

export interface TrendPoint { at: number; correctChars: number }
export interface RaceTrends { roundId: string; samples: Record<string, TrendPoint[]> }
const MAX_POINTS = Math.ceil(ROUND_MS / PROGRESS_MS) + 2;

/** Browser-only, bounded samples. Final scores use the round's authoritative end time. */
export function recordRaceTrends(round: Round, previous: RaceTrends | null, reports: LiveProgress[]): RaceTrends {
    const samples = previous?.roundId === round.id ? { ...previous.samples } : {};
    const endAt = round.endedAt ?? round.deadline;
    for (const player of round.players) {
        samples[player.id] = (samples[player.id] ?? [{ at: round.startAt, correctChars: 0 }]).filter(p => p.at <= endAt);
    }
    const updates = [...reports, ...round.players.flatMap(p => p.metrics && round.endedAt !== null
        ? [{ id: p.id, correctChars: p.metrics.correctChars, updatedAt: round.endedAt }] : [])];
    for (const update of updates) {
        if (!round.players.some(p => p.id === update.id) || !Number.isFinite(update.updatedAt) || update.updatedAt < round.startAt || update.updatedAt > endAt
            || !Number.isSafeInteger(update.correctChars) || update.correctChars < 0 || update.correctChars > round.text.length) continue;
        const point = { at: Math.min(update.updatedAt, endAt), correctChars: update.correctChars };
        const points = [...samples[update.id]], last = points.at(-1);
        if (last && point.at < last.at) continue;
        if (last && (point.at === last.at || last.at !== round.startAt
            && Math.floor((point.at - round.startAt) / PROGRESS_MS) === Math.floor((last.at - round.startAt) / PROGRESS_MS)))
            points[points.length - 1] = point;
        else points.push(point);
        samples[update.id] = points.length > MAX_POINTS ? [points[0], ...points.slice(-(MAX_POINTS - 1))] : points;
    }
    return { roundId: round.id, samples };
}
export function trendWpm(point: TrendPoint, startAt: number): number {
    const elapsed = (point.at - startAt) / 1000;
    return elapsed > 0 ? Math.round(point.correctChars / 5 / (elapsed / 60)) : 0;
}
