import { diffTypedText } from "./keypressStats";

export const MIN_PAIR_SAMPLES = 5;
export const MAX_PAIR_GAP_MS = 2000;
export type BigramTotal = { attempts: number; errors: number; timed: number; totalMs: number };
export type BigramTotals = Record<string, BigramTotal>;
export type BigramStat = BigramTotal & { pair: string; errorRate: number; avgMs: number | null };

type Stroke = { text: string; expected: string; correct: boolean; time: number };

/** Capture accepted native input BEFORE render batching. Never reconstruct timing from text flushes. */
export function createBigramCapture() {
    let previous: Stroke | null = null;
    return {
        reset() { previous = null; },
        record(before: string, after: string, sentence: string, time: number, inputType: string, composing = false): { pair: string; total: BigramTotal } | null {
            const last = previous;
            previous = null;
            // Only one appended letter from a direct input event is measurable.
            // Paste, autocomplete, replacement, deletion and IME break the chain.
            if (composing || inputType !== "insertText" || !after.startsWith(before) || after.length !== before.length + 1) return null;
            const event = diffTypedText(before, after, sentence, 0, time)[0];
            if (!event || !/^\p{L}$/u.test(event.typed) || !/^\p{L}$/u.test(event.expected)) return null;
            previous = { text: after, expected: event.expected, correct: event.correct, time };
            if (!last || last.text !== before) return null;
            const gap = time - last.time;
            const correct = last.correct && event.correct;
            const timed = correct && gap > 0 && gap <= MAX_PAIR_GAP_MS;
            return {
                pair: last.expected + event.expected,
                total: { attempts: 1, errors: correct ? 0 : 1, timed: timed ? 1 : 0, totalMs: timed ? gap : 0 },
            };
        },
    };
}

/** Raw counts are merged before calculating rates (not an average of session averages). */
export function mergeBigramTotals(maps: Array<BigramTotals | undefined>): BigramTotals {
    const out: BigramTotals = {};
    for (const map of maps) for (const [pair, value] of Object.entries(map ?? {})) {
        // Old/imported history may not have valid pair data.
        if (!/^\p{L}{2}$/u.test(pair) || !value ||
            ![value.attempts, value.errors, value.timed, value.totalMs].every(n => Number.isFinite(n) && n >= 0) ||
            ![value.attempts, value.errors, value.timed].every(Number.isInteger) ||
            value.errors > value.attempts || value.timed > value.attempts - value.errors ||
            value.totalMs > value.timed * MAX_PAIR_GAP_MS || (value.timed === 0 && value.totalMs !== 0)) continue;
        const sum = out[pair] ??= { attempts: 0, errors: 0, timed: 0, totalMs: 0 };
        sum.attempts += value.attempts;
        sum.errors += value.errors;
        sum.timed += value.timed;
        sum.totalMs += value.totalMs;
    }
    return out;
}

export function rankBigrams(totals: BigramTotals): { slow: BigramStat[]; errors: BigramStat[]; observed: number } {
    const stats = Object.entries(mergeBigramTotals([totals])).map(([pair, t]): BigramStat => ({
        ...t, pair, errorRate: t.attempts ? t.errors / t.attempts * 100 : 0,
        avgMs: t.timed ? t.totalMs / t.timed : null,
    }));
    const tie = (a: BigramStat, b: BigramStat) => b.attempts - a.attempts || a.pair.localeCompare(b.pair);
    return {
        slow: stats.filter(s => s.timed >= MIN_PAIR_SAMPLES).sort((a, b) => b.avgMs! - a.avgMs! || tie(a, b)).slice(0, 5),
        errors: stats.filter(s => s.attempts >= MIN_PAIR_SAMPLES && s.errors > 0).sort((a, b) => b.errorRate - a.errorRate || tie(a, b)).slice(0, 5),
        observed: stats.reduce((sum, s) => sum + s.attempts, 0),
    };
}
