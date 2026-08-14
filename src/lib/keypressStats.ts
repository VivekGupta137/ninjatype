import { KEYBOARD } from "@/constants/keyboard";

export type KeyMetric = {
    expected: number;
    errors: number;
    presses: number;
    totalLatencyMs: number;
};

export type KeypressEvent = {
    typed: string;
    expected: string;
    correct: boolean;
    time: number;
    latencyMs: number;
};

export type KeypressAttempt = {
    sessionId: string;
    timestamp: number;
    keys: Record<string, KeyMetric>;
};

export type KeyAnalyticsMetric = "error" | "latency";

export type KeyAnalyticsRange = "latest" | "last5" | "last10" | "overTime";

const SHIFT_TO_BASE: Record<string, string> = {
    "!": KEYBOARD.Number1,
    "@": KEYBOARD.Number2,
    "#": KEYBOARD.Number3,
    $: KEYBOARD.Number4,
    "%": KEYBOARD.Number5,
    "^": KEYBOARD.Number6,
    "&": KEYBOARD.Number7,
    "*": KEYBOARD.Number8,
    "(": KEYBOARD.Number9,
    ")": KEYBOARD.Number0,
    _: KEYBOARD.Minus,
    "+": KEYBOARD.Equal,
    "{": KEYBOARD.BracketLeft,
    "}": KEYBOARD.BracketRight,
    "|": KEYBOARD.Backslash,
    ":": KEYBOARD.Semicolon,
    '"': KEYBOARD.Quote,
    "<": KEYBOARD.Comma,
    ">": KEYBOARD.Period,
    "?": KEYBOARD.Slash,
    "~": KEYBOARD.Backquote,
};

export const emptyKeyMetric = (): KeyMetric => ({
    expected: 0,
    errors: 0,
    presses: 0,
    totalLatencyMs: 0,
});

export const normalizeKey = (char: string): string => {
    if (!char) return "";
    if (SHIFT_TO_BASE[char]) return SHIFT_TO_BASE[char];
    return char.toLowerCase();
};

export const keyDisplayLabel = (key: string): string => {
    if (key === KEYBOARD.Space) return "space";
    return key.length === 1 ? key.toUpperCase() : key;
};

const commonPrefixLength = (a: string, b: string): number => {
    const max = Math.min(a.length, b.length);
    let i = 0;
    while (i < max && a[i] === b[i]) i += 1;
    return i;
};

/**
 * Diff sequential typed text into per-character press events.
 * Deletions emit nothing. Multi-character inserts emit one event per char.
 */
export const diffTypedText = (
    prevText: string,
    nextText: string,
    sentence: string,
    lastEventTime: number,
    now: number,
): KeypressEvent[] => {
    if (nextText === prevText || nextText.length === 0) return [];
    if (nextText.length < prevText.length) return [];

    const prefixLen = commonPrefixLength(prevText, nextText);
    const events: KeypressEvent[] = [];
    let previousEventTime = lastEventTime;

    for (let i = prefixLen; i < nextText.length; i++) {
        const typedChar = nextText[i];
        if (typedChar === KEYBOARD.Space && i > 0 && nextText[i - 1] === KEYBOARD.Space) {
            continue;
        }

        const expectedChar = sentence[i] ?? "";
        const latencyMs =
            previousEventTime === 0 ? 0 : Math.max(0, now - previousEventTime);

        events.push({
            typed: normalizeKey(typedChar),
            expected: expectedChar ? normalizeKey(expectedChar) : "",
            correct: typedChar === expectedChar,
            time: now,
            latencyMs,
        });
        previousEventTime = now;
    }

    return events;
};

export const mergeKeyStats = (a: KeyMetric, b: KeyMetric): KeyMetric => ({
    expected: a.expected + b.expected,
    errors: a.errors + b.errors,
    presses: a.presses + b.presses,
    totalLatencyMs: a.totalLatencyMs + b.totalLatencyMs,
});

export const mergeKeyMaps = (
    maps: Array<Record<string, KeyMetric>>,
): Record<string, KeyMetric> => {
    const merged: Record<string, KeyMetric> = {};
    for (const map of maps) {
        for (const [key, metric] of Object.entries(map)) {
            merged[key] = merged[key] ? mergeKeyStats(merged[key], metric) : { ...metric };
        }
    }
    return merged;
};

export const aggregateKeyStats = (
    events: KeypressEvent[],
): Record<string, KeyMetric> => {
    const stats: Record<string, KeyMetric> = {};
    const ensure = (key: string): KeyMetric => {
        if (!stats[key]) stats[key] = emptyKeyMetric();
        return stats[key];
    };

    for (const event of events) {
        if (event.typed) {
            const typed = ensure(event.typed);
            typed.presses += 1;
            typed.totalLatencyMs += event.latencyMs;
        }
        if (event.expected) {
            const expected = ensure(event.expected);
            expected.expected += 1;
            if (!event.correct) expected.errors += 1;
        }
    }

    return stats;
};

export const mergeAttempts = (
    attempts: KeypressAttempt[],
): Record<string, KeyMetric> => mergeKeyMaps(attempts.map((attempt) => attempt.keys));

export const errorRate = (metric: KeyMetric): number => {
    if (metric.expected === 0) return 0;
    return (metric.errors / metric.expected) * 100;
};

export const avgLatencyMs = (metric: KeyMetric): number => {
    if (metric.presses === 0) return 0;
    return metric.totalLatencyMs / metric.presses;
};

export const hasKeyData = (metric: KeyMetric | undefined): metric is KeyMetric =>
    Boolean(metric && (metric.expected > 0 || metric.presses > 0));

/** Error-rate heat: 0% is best, 50%+ is worst. */
export const errorHeat = (metric: KeyMetric): number => {
    if (metric.expected === 0) return 0;
    return Math.min(1, errorRate(metric) / 50);
};

/** Latency heat relative to the min/max of keys that were actually pressed. */
export const latencyHeatMap = (
    keys: Record<string, KeyMetric>,
): Record<string, number> => {
    const latencies: number[] = [];
    for (const metric of Object.values(keys)) {
        if (metric.presses > 0) latencies.push(avgLatencyMs(metric));
    }
    const min = latencies.length ? Math.min(...latencies) : 0;
    const max = latencies.length ? Math.max(...latencies) : 0;
    const span = max - min;

    const heats: Record<string, number> = {};
    for (const [key, metric] of Object.entries(keys)) {
        if (metric.presses === 0) {
            heats[key] = 0;
            continue;
        }
        heats[key] = span === 0 ? 0 : (avgLatencyMs(metric) - min) / span;
    }
    return heats;
};

export const heatBackground = (heat: number): string => {
    const clamped = Math.min(1, Math.max(0, heat));
    if (clamped <= 0.5) {
        const t = clamped * 2 * 100;
        return `color-mix(in srgb, var(--main-color) ${t}%, var(--success-color))`;
    }
    const t = (clamped - 0.5) * 2 * 100;
    return `color-mix(in srgb, var(--error-color) ${t}%, var(--main-color))`;
};
