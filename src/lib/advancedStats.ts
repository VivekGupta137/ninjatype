import { mergeBigramTotals, type BigramTotals } from "./bigramStats";
import type { KeypressEvent } from "@/lib/keypressStats";

/** Pauses longer than this are thinking breaks, not rhythm. */
export const PAUSE_MS = 2000;
/** Keystrokes in the "burst" window. */
export const BURST_WINDOW = 10;
const MIN_INTERVALS = 8;

export type Consistency = { score: number; medianMs: number; cv: number };
export type BurstSustained = { burstWpm: number; sustainedWpm: number };
export type ErrorKind = "substitution" | "omission" | "transposition" | "extra";
export type ErrorBreakdown = { total: number; counts: Record<ErrorKind, number> };
export type FingerId = "L5" | "L4" | "L3" | "L2" | "thumb" | "R2" | "R3" | "R4" | "R5";
export type FingerLoad = { finger: FingerId; presses: number; share: number; errors: number; errorRate: number; avgLatencyMs: number };

/** Intervals between real key presses (skipped-key records carry no latency). */
const intervals = (events: KeypressEvent[]): number[] =>
    events.filter((e) => e.typed && e.latencyMs > 0 && e.latencyMs <= PAUSE_MS).map((e) => e.latencyMs);

const median = (values: number[]): number => {
    if (!values.length) return 0;
    const s = [...values].sort((a, b) => a - b);
    const mid = s.length >> 1;
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

/**
 * Rhythm score 0-100 from the spread of gaps between keystrokes
 * (100 = metronome-steady). Uses the coefficient of variation, with
 * pauses over 2s excluded. Null when there is too little data.
 */
export function consistencyScore(events: KeypressEvent[]): Consistency | null {
    const gaps = intervals(events);
    if (gaps.length < MIN_INTERVALS) return null;
    const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const variance = gaps.reduce((a, b) => a + (b - mean) ** 2, 0) / gaps.length;
    const cv = Math.sqrt(variance) / mean;
    // CV of 1 (very erratic) maps to 0.
    return { score: Math.round(Math.max(0, Math.min(1, 1 - cv)) * 100), medianMs: Math.round(median(gaps)), cv };
}

const wpmFrom = (chars: number, ms: number) => (ms > 0 ? Math.round((chars / 5) * (60000 / ms)) : 0);

/**
 * Burst = fastest run of BURST_WINDOW keystrokes; sustained = all typed
 * characters over the active time, pauses included.
 */
export function burstSustained(events: KeypressEvent[]): BurstSustained | null {
    const presses = events.filter((e) => e.typed);
    if (presses.length < BURST_WINDOW + 1) return null;
    let best = Infinity;
    for (let i = BURST_WINDOW; i < presses.length; i++) {
        const span = presses[i].time - presses[i - BURST_WINDOW].time;
        if (span > 0 && span < best) best = span;
    }
    const total = presses[presses.length - 1].time - presses[0].time;
    if (!Number.isFinite(best) || total <= 0) return null;
    return {
        burstWpm: wpmFrom(BURST_WINDOW, best),
        sustainedWpm: wpmFrom(presses.length - 1, total),
    };
}

/**
 * omission: expected key never typed · extra: key typed where none was expected ·
 * transposition: two neighbours typed in swapped order · substitution: any other wrong key.
 */
export function errorBreakdown(events: KeypressEvent[]): ErrorBreakdown {
    const counts: Record<ErrorKind, number> = { substitution: 0, omission: 0, transposition: 0, extra: 0 };
    for (let i = 0; i < events.length; i++) {
        const e = events[i];
        if (e.correct) continue;
        const next = events[i + 1];
        if (
            next && !next.correct && e.typed && next.typed && e.expected && next.expected &&
            e.typed === next.expected && next.typed === e.expected && e.typed !== next.typed
        ) {
            counts.transposition += 1;
            i += 1;
        } else if (!e.typed) counts.omission += 1;
        else if (!e.expected) counts.extra += 1;
        else counts.substitution += 1;
    }
    return { total: Object.values(counts).reduce((a, b) => a + b, 0), counts };
}

const ROWS: Array<[FingerId, string]> = [
    ["L5", "1qaz`"], ["L4", "2wsx"], ["L3", "3edc"], ["L2", "45rtfgvb"],
    ["R2", "67yuhjnm"], ["R3", "8ik,"], ["R4", "9ol."], ["R5", "0p;/-=[]'\\"],
    ["thumb", " "],
];

/** Standard touch-typing finger for each key (QWERTY; QWERTZ swaps y/z). */
export const fingerMap = (layout: "qwerty" | "qwertz" = "qwerty"): Record<string, FingerId> => {
    const map: Record<string, FingerId> = {};
    for (const [finger, keys] of ROWS) for (const k of keys) map[k] = finger;
    if (layout === "qwertz") { map.y = "L5"; map.z = "R2"; }
    return map;
};

export const FINGER_ORDER: FingerId[] = ["L5", "L4", "L3", "L2", "thumb", "R2", "R3", "R4", "R5"];

export type FingerTotals = { presses: number; expected: number; errors: number; latencyMs: number };
export type FingerTotalsMap = Partial<Record<FingerId, FingerTotals>>;

/** Raw per-finger sums (mergeable across sessions). */
export function fingerTotals(events: KeypressEvent[], layout: "qwerty" | "qwertz" = "qwerty"): FingerTotalsMap {
    const map = fingerMap(layout);
    const acc: FingerTotalsMap = {};
    const slot = (f: FingerId) => (acc[f] ??= { presses: 0, expected: 0, errors: 0, latencyMs: 0 });
    for (const e of events) {
        const typedFinger = map[e.typed];
        if (e.typed && typedFinger) { const s = slot(typedFinger); s.presses += 1; s.latencyMs += e.latencyMs; }
        const expectedFinger = map[e.expected];
        if (e.expected && expectedFinger) { const s = slot(expectedFinger); s.expected += 1; if (!e.correct) s.errors += 1; }
    }
    return acc;
}

export const mergeFingerTotals = (maps: FingerTotalsMap[]): FingerTotalsMap => {
    const out: FingerTotalsMap = {};
    for (const m of maps) for (const f of FINGER_ORDER) {
        const t = m[f];
        if (!t) continue;
        const o = (out[f] ??= { presses: 0, expected: 0, errors: 0, latencyMs: 0 });
        o.presses += t.presses; o.expected += t.expected; o.errors += t.errors; o.latencyMs += t.latencyMs;
    }
    return out;
};

/** Share of key presses, error rate and average delay per finger. */
export function fingerLoadFromTotals(totals: FingerTotalsMap): FingerLoad[] {
    const total = FINGER_ORDER.reduce((a, f) => a + (totals[f]?.presses ?? 0), 0);
    return FINGER_ORDER.filter((f) => totals[f]).map((finger) => {
        const s = totals[finger]!;
        return {
            finger,
            presses: s.presses,
            share: total ? s.presses / total : 0,
            errors: s.errors,
            errorRate: s.expected ? (s.errors / s.expected) * 100 : 0,
            avgLatencyMs: s.presses ? Math.round(s.latencyMs / s.presses) : 0,
        };
    });
}

export const fingerLoad = (events: KeypressEvent[], layout: "qwerty" | "qwertz" = "qwerty"): FingerLoad[] =>
    fingerLoadFromTotals(fingerTotals(events, layout));

/** Compact per-session summary stored with each history entry. */
export type SessionAdvanced = {
    rhythm?: number;
    medianGapMs?: number;
    burstWpm?: number;
    sustainedWpm?: number;
    errorKinds: Record<ErrorKind, number>;
    fingers?: FingerTotalsMap;
    bigrams?: BigramTotals;
};

export function summarizeSession(events: KeypressEvent[], layout: "qwerty" | "qwertz" | null, bigrams?: BigramTotals): SessionAdvanced {
    const rhythm = consistencyScore(events);
    const pace = burstSustained(events);
    return {
        ...(rhythm && { rhythm: rhythm.score, medianGapMs: rhythm.medianMs }),
        ...(pace && { burstWpm: pace.burstWpm, sustainedWpm: pace.sustainedWpm }),
        errorKinds: errorBreakdown(events).counts,
        ...(layout && { fingers: fingerTotals(events, layout) }),
        ...(bigrams && { bigrams: mergeBigramTotals([bigrams]) }),
    };
}

export type AdvancedView = {
    rhythm: Consistency | null;
    pace: BurstSustained | null;
    errors: ErrorBreakdown;
    fingers: FingerLoad[];
    bigrams: BigramTotals;
    sessions: number;
};

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/** Combine stored per-session summaries (sessions saved before this feature are skipped). */
export function aggregateAdvanced(list: Array<SessionAdvanced | undefined>): AdvancedView {
    const items = list.filter((a): a is SessionAdvanced => !!a?.errorKinds);
    const counts: Record<ErrorKind, number> = { substitution: 0, omission: 0, transposition: 0, extra: 0 };
    for (const a of items) for (const k of Object.keys(counts) as ErrorKind[]) counts[k] += a.errorKinds[k] ?? 0;
    const r = items.filter((a) => a.rhythm != null);
    const p = items.filter((a) => a.burstWpm != null && a.sustainedWpm != null);
    return {
        sessions: items.length,
        rhythm: r.length ? { score: Math.round(avg(r.map((a) => a.rhythm!))), medianMs: Math.round(avg(r.map((a) => a.medianGapMs ?? 0))), cv: 0 } : null,
        pace: p.length ? { burstWpm: Math.round(avg(p.map((a) => a.burstWpm!))), sustainedWpm: Math.round(avg(p.map((a) => a.sustainedWpm!))) } : null,
        errors: { total: Object.values(counts).reduce((a, b) => a + b, 0), counts },
        fingers: fingerLoadFromTotals(mergeFingerTotals(items.map((a) => a.fingers ?? {}))),
        bigrams: mergeBigramTotals(items.map((a) => a.bigrams)),
    };
}
