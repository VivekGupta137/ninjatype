import { describe, expect, test } from "bun:test";
import { burstSustained, consistencyScore, errorBreakdown, fingerLoad } from "./advancedStats";
import type { KeypressEvent } from "./keypressStats";

const ev = (typed: string, expected: string, time: number, latencyMs = 100): KeypressEvent =>
    ({ typed, expected, correct: typed === expected, time, latencyMs });
const steady = (n: number, gap: number) => Array.from({ length: n }, (_, i) => ev("a", "a", i * gap, i ? gap : 0));

describe("advanced stats", () => {
    test("metronome typing scores 100, erratic scores low, tiny samples are null", () => {
        expect(consistencyScore(steady(20, 120))?.score).toBe(100);
        const erratic = Array.from({ length: 20 }, (_, i) => ev("a", "a", i, i % 2 ? 40 : 600));
        expect(consistencyScore(erratic)!.score).toBeLessThan(40);
        expect(consistencyScore(steady(4, 100))).toBeNull();
    });
    test("burst is faster than sustained when there are pauses", () => {
        const events = [...steady(15, 100)];
        events.push(ev("a", "a", 1400 + 5000, 5000), ...steady(5, 100).map((e, i) => ({ ...e, time: 6400 + i * 100 })));
        const r = burstSustained(events)!;
        expect(r.burstWpm).toBe(120);
        expect(r.sustainedWpm).toBeLessThan(r.burstWpm);
    });
    test("classifies error types", () => {
        const events = [
            ev("x", "a", 1), // substitution
            ev("", "b", 2), // omission
            ev("d", "c", 3), ev("c", "d", 4), // transposition
            ev("q", "", 5), // extra
            ev("e", "e", 6),
        ];
        expect(errorBreakdown(events).counts).toEqual({ substitution: 1, omission: 1, transposition: 1, extra: 1 });
    });
    test("finger load shares sum to 1 and attribute errors to the expected finger", () => {
        const load = fingerLoad([ev("f", "f", 1), ev("j", "j", 2), ev("k", "j", 3), ev(" ", " ", 4)]);
        expect(load.reduce((a, l) => a + l.share, 0)).toBeCloseTo(1);
        expect(load.find((l) => l.finger === "R2")!.errors).toBe(1);
        expect(load.find((l) => l.finger === "thumb")!.presses).toBe(1);
    });
});

import { aggregateAdvanced, summarizeSession } from "./advancedStats";
describe("history aggregation", () => {
    test("sums errors and fingers, averages pace, skips old sessions", () => {
        const a = summarizeSession([ev("x", "a", 1), ev("j", "j", 2)], "qwerty");
        const view = aggregateAdvanced([a, a, undefined]);
        expect(view.sessions).toBe(2);
        expect(view.errors.counts.substitution).toBe(2);
        expect(view.fingers.find((f) => f.finger === "R2")!.presses).toBe(2);
        expect(aggregateAdvanced([undefined]).sessions).toBe(0);
    });
    test("omits finger data when layout is unknown", () => {
        expect(summarizeSession([ev("a", "a", 1)], null).fingers).toBeUndefined();
    });
});
