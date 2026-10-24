import type { TypingSession } from "@/store/history";
import { avgLatencyMs, errorRate, type KeyMetric } from "@/lib/keypressStats";

export type CountSample = { time: number; count: number };
export type PacePoint = {
    time: number;
    raw: number;
    correct: number;
    burst: number;
    errors: number;
};

export const speedFromCount = (count: number, seconds: number) =>
    seconds > 0
        ? Math.ceil(Math.ceil((Math.max(0, count) * 60) / seconds) / 5)
        : 0;

/** Match the typing engine's word-aware comparison, including skipped letters. */
export function measureSessionText(typed: string, target: string) {
    const typedWords = typed.trim().split(" ").filter(Boolean);
    const targetWords = target.trim().split(" ").filter(Boolean);
    let errors = 0;
    typedWords.forEach((word, index) => {
        const expected = targetWords[index] ?? "";
        const length = Math.max(
            word.length,
            index < typedWords.length - 1 ? expected.length : 0,
        );
        for (let i = 0; i < length; i++) if (word[i] !== expected[i]) errors++;
    });
    return {
        characters: typed.length,
        errors,
        correct: Math.max(0, typed.length - errors),
    };
}

/** Keep one final sample per timestamp so completion cannot leave stale totals. */
export function upsertSample(
    samples: CountSample[],
    sample: CountSample,
): CountSample[] {
    const last = samples.at(-1);
    if (last?.time === sample.time) return [...samples.slice(0, -1), sample];
    return [...samples, sample];
}

export function buildPacePoints(
    raw: CountSample[],
    errors: CountSample[],
): PacePoint[] {
    let errorIndex = 0;
    let previousErrors = 0;
    return raw
        .filter((point) => point.time > 0)
        .map((point, index, valid) => {
            while (
                errorIndex + 1 < errors.length &&
                errors[errorIndex + 1].time <= point.time
            )
                errorIndex++;
            const count =
                errors[errorIndex]?.time <= point.time
                    ? errors[errorIndex].count
                    : 0;
            const previous = valid[index - 1] ?? { time: 0, count: 0 };
            const result = {
                time: point.time,
                raw: speedFromCount(point.count, point.time),
                correct: speedFromCount(point.count - count, point.time),
                burst: speedFromCount(
                    point.count - previous.count,
                    point.time - previous.time,
                ),
                errors: Math.max(0, count - previousErrors),
            };
            previousErrors = count;
            return result;
        });
}

/** Disjoint bins preserve error totals, and retain the exact final speed. */
export function downsamplePace(
    points: PacePoint[],
    maxPoints: number,
): PacePoint[] {
    if (points.length <= maxPoints || maxPoints < 2) return points;
    const duration = points.at(-1)!.time;
    if (duration <= 0) return points;
    const buckets: PacePoint[][] = Array.from({ length: maxPoints }, () => []);
    for (const point of points) {
        const index = Math.min(
            maxPoints - 1,
            Math.floor((point.time / duration) * maxPoints),
        );
        buckets[index].push(point);
    }
    return buckets
        .filter((bucket) => bucket.length > 0)
        .map((bucket) => ({
            ...bucket.at(-1)!,
            burst: Math.round(
                bucket.reduce((sum, point) => sum + point.burst, 0) /
                    bucket.length,
            ),
            errors: bucket.reduce((sum, point) => sum + point.errors, 0),
        }));
}

/** Pace stability uses 2-second windows; short attempts have too little evidence. */
export function getRhythm(samples: CountSample[]): number | null {
    const duration = samples.at(-1)?.time ?? 0;
    if (duration < 6) return null;
    const countAt = (time: number) => {
        let prev = { time: 0, count: 0 };
        for (const sample of samples) {
            if (sample.time >= time) {
                const span = sample.time - prev.time;
                return span > 0
                    ? prev.count +
                          ((sample.count - prev.count) * (time - prev.time)) /
                              span
                    : sample.count;
            }
            prev = sample;
        }
        return prev.count;
    };
    const pace: number[] = [];
    for (let end = 2; end <= duration; end += 2)
        pace.push(Math.max(0, countAt(end) - countAt(end - 2)));
    const mean = pace.reduce((sum, count) => sum + count, 0) / pace.length;
    if (mean === 0) return null;
    const variance =
        pace.reduce((sum, count) => sum + (count - mean) ** 2, 0) / pace.length;
    return Math.round(Math.max(0, 1 - Math.sqrt(variance) / mean) * 100);
}

export function getSessionComparison(
    current: TypingSession,
    history: TypingSession[],
) {
    const previous = history
        .filter((session) => {
            if (session.id && session.id === current.id) return false;
            if (
                session.timestamp >= current.timestamp ||
                session.mode !== current.mode
            )
                return false;
            if (
                session.source &&
                current.source &&
                session.source !== current.source
            )
                return false;
            if (
                current.mode === "time" &&
                Math.abs(session.duration - current.duration) >
                    Math.max(1, current.duration * 0.2)
            )
                return false;
            return Number.isFinite(session.wpm) && session.duration > 0;
        })
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5);
    if (previous.length === 0) return null;
    const avgWpm = Math.round(
        previous.reduce((sum, session) => sum + session.wpm, 0) /
            previous.length,
    );
    const avgAccuracy = Math.round(
        previous.reduce((sum, session) => sum + session.accuracy, 0) /
            previous.length,
    );
    return {
        count: previous.length,
        avgWpm,
        avgAccuracy,
        wpmDelta: current.wpm - avgWpm,
        accuracyDelta: current.accuracy - avgAccuracy,
    };
}

export function getKeyFocus(keys: Record<string, KeyMetric>) {
    // Repeated observations keep a single slip from becoming a firm recommendation.
    const repeated = Object.entries(keys).filter(
        ([, metric]) => metric.expected >= 3,
    );
    const errors = repeated
        .filter(([, metric]) => metric.errors > 0)
        .sort(
            (a, b) =>
                errorRate(b[1]) - errorRate(a[1]) || b[1].errors - a[1].errors,
        )
        .slice(0, 3);
    const delayed = Object.entries(keys)
        .filter(([, metric]) => metric.presses >= 3 && avgLatencyMs(metric) > 0)
        .sort((a, b) => avgLatencyMs(b[1]) - avgLatencyMs(a[1]))
        .slice(0, 3);
    return { errors, delayed };
}
