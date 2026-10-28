export interface LearnKeyMetric {
    attempts: number;
    errors: number;
    latencySamples: number;
    totalLatencyMs: number;
}
export type LearnKeyMetrics = Record<string, LearnKeyMetric>;
export interface LearnKeyCapture { keys: LearnKeyMetrics; lastTime: number | null }
export const emptyLearnKeyCapture = (): LearnKeyCapture => ({ keys: {}, lastTime: null });

/** Attribute mistakes to the intended key, and time only correct character presses. */
export const captureLearnKeys = (capture: LearnKeyCapture, before: string, after: string, sentence: string, now: number): LearnKeyCapture => {
    if (before === after) return capture;
    let prefix = 0;
    while (prefix < Math.min(before.length, after.length) && before[prefix] === after[prefix]) prefix++;
    let suffix = 0;
    while (suffix < before.length - prefix && suffix < after.length - prefix && before[before.length - 1 - suffix] === after[after.length - 1 - suffix]) suffix++;
    const keys = { ...capture.keys };
    let previousTime = capture.lastTime;
    for (let i = prefix; i < after.length - suffix; i++) {
        const expected = sentence[i];
        const correct = expected === after[i];
        const delay = previousTime === null ? null : now - previousTime;
        // First presses, pauses over five seconds and batched inserts have no reliable latency.
        const measured = correct && delay !== null && delay > 0 && delay <= 5000;
        if (expected && expected !== ' ') {
            const metric = keys[expected] ?? { attempts: 0, errors: 0, latencySamples: 0, totalLatencyMs: 0 };
            keys[expected] = {
                attempts: metric.attempts + 1,
                errors: metric.errors + (correct ? 0 : 1),
                latencySamples: metric.latencySamples + (measured ? 1 : 0),
                totalLatencyMs: metric.totalLatencyMs + (measured ? delay! : 0),
            };
        }
        previousTime = now;
    }
    return { keys, lastTime: now };
};

export const mergeLearnKeyMetrics = (saved: LearnKeyMetrics, current: LearnKeyMetrics): LearnKeyMetrics => {
    const keys = { ...saved };
    for (const [key, metric] of Object.entries(current)) {
        const previous = saved[key];
        keys[key] = previous ? {
            attempts: previous.attempts + metric.attempts,
            errors: previous.errors + metric.errors,
            latencySamples: previous.latencySamples + metric.latencySamples,
            totalLatencyMs: previous.totalLatencyMs + metric.totalLatencyMs,
        } : { ...metric };
    }
    return keys;
};

export const readLearnKeyMetric = (metric?: LearnKeyMetric) => ({
    accuracy: metric?.attempts ? (1 - metric.errors / metric.attempts) * 100 : null,
    latency: metric?.latencySamples ? metric.totalLatencyMs / metric.latencySamples : null,
});

/** Fixed scales avoid turning a tiny timing difference into a red/green extreme. */
export const learnKeyHeat = (metric: LearnKeyMetric | undefined, view: 'latency' | 'accuracy'): number | null => {
    const readings = readLearnKeyMetric(metric);
    const value = readings[view === 'latency' ? 'latency' : 'accuracy'];
    if (value === null) return null;
    return Math.max(0, Math.min(1, view === 'latency' ? (value - 200) / 800 : (100 - value) / 20));
};

export const sanitizeLearnKeyMetrics = (value: unknown, allowedKeys: string[]): LearnKeyMetrics => {
    const keys: LearnKeyMetrics = {};
    if (!value || typeof value !== 'object') return keys;
    for (const key of allowedKeys) {
        const metric = (value as Record<string, Partial<LearnKeyMetric>>)[key];
        if (!metric || !['attempts', 'errors', 'latencySamples', 'totalLatencyMs'].every(field => {
            const number = metric[field as keyof LearnKeyMetric];
            return typeof number === 'number' && Number.isFinite(number) && number >= 0;
        })) continue;
        if (!Number.isInteger(metric.attempts) || !Number.isInteger(metric.errors) || !Number.isInteger(metric.latencySamples) || !metric.attempts || metric.errors! > metric.attempts! || metric.latencySamples! > metric.attempts! || metric.totalLatencyMs! > metric.latencySamples! * 5000) continue;
        keys[key] = { ...metric } as LearnKeyMetric;
    }
    return keys;
};
