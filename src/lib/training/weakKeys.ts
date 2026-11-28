import { avgLatencyMs, errorRate, mergeKeyMaps, type KeyMetric, type KeypressAttempt } from "@/lib/keypressStats";

/** A letter needs this many observations before it can be called weak (one slip is not a pattern). */
export const MIN_SAMPLES = 12;
/** Minimum letter presses across recent attempts before any plan is built. */
export const MIN_TOTAL_PRESSES = 150;
export const MIN_ATTEMPTS = 3;
export const RECENT_ATTEMPTS = 20;
export const MAX_FOCUS = 3;
const MIN_SCORE = 1;

export interface WeakKey {
    key: string;
    score: number;
    errors: number;
    expected: number;
    errorRate: number;
    avgLatencyMs: number;
    /** Typical (median) letter latency, for the "slower than usual" evidence. */
    medianLatencyMs: number;
    reasons: ("errors" | "slow")[];
}

export type KeyAnalysis =
    | { status: "insufficient"; attempts: number; presses: number; needAttempts: number; needPresses: number }
    | { status: "ready"; attempts: number; presses: number; focus: WeakKey[] };

const isLetter = (key: string) => /^[a-z]$/.test(key);

const median = (values: number[]): number => {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = sorted.length >> 1;
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/** Scores letters by error rate and by how much slower than the typist's own median they are. Sparse data never produces a recommendation. */
export function analyzeKeys(attempts: KeypressAttempt[]): KeyAnalysis {
    const recent = [...attempts].sort((a, b) => b.timestamp - a.timestamp).slice(0, RECENT_ATTEMPTS);
    const merged = mergeKeyMaps(recent.map(a => a.keys));
    const letters = Object.entries(merged).filter(([key]) => isLetter(key)) as [string, KeyMetric][];
    const presses = letters.reduce((sum, [, m]) => sum + m.presses, 0);
    if (recent.length < MIN_ATTEMPTS || presses < MIN_TOTAL_PRESSES) {
        return { status: "insufficient", attempts: recent.length, presses, needAttempts: MIN_ATTEMPTS, needPresses: MIN_TOTAL_PRESSES };
    }
    const typical = median(letters.filter(([, m]) => m.presses >= MIN_SAMPLES).map(([, m]) => avgLatencyMs(m)));
    const scored: WeakKey[] = [];
    for (const [key, m] of letters) {
        const reasons: WeakKey["reasons"] = [];
        let score = 0;
        if (m.expected >= MIN_SAMPLES && m.errors >= 2) {
            const part = errorRate(m) / 10;
            if (part >= MIN_SCORE / 2) { score += part; reasons.push("errors"); }
        }
        if (typical > 0 && m.presses >= MIN_SAMPLES) {
            const ratio = avgLatencyMs(m) / typical;
            if (ratio > 1.3) { score += (ratio - 1.3) * 3; reasons.push("slow"); }
        }
        if (score >= MIN_SCORE) {
            scored.push({ key, score, errors: m.errors, expected: m.expected, errorRate: errorRate(m), avgLatencyMs: avgLatencyMs(m), medianLatencyMs: typical, reasons });
        }
    }
    scored.sort((a, b) => b.score - a.score || a.key.localeCompare(b.key));
    return { status: "ready", attempts: recent.length, presses, focus: scored.slice(0, MAX_FOCUS) };
}

/** One plain sentence of evidence for a weak key. */
export function evidenceText(k: WeakKey): string {
    const parts: string[] = [];
    if (k.reasons.includes("errors")) parts.push(`${k.errors} misses in ${k.expected} (${Math.round(k.errorRate)}%)`);
    if (k.reasons.includes("slow")) parts.push(`${Math.round(k.avgLatencyMs)} ms per press vs ${Math.round(k.medianLatencyMs)} ms typical`);
    return `${k.key.toUpperCase()}: ${parts.join(", ")}`;
}
