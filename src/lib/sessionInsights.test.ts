import { describe, expect, test } from "bun:test";
import {
    buildPacePoints,
    downsamplePace,
    getKeyFocus,
    getRhythm,
    getSessionComparison,
    measureSessionText,
    speedFromCount,
    upsertSample,
} from "./sessionInsights";
import { aggregateKeyStats, diffTypedText } from "./keypressStats";
import type { TypingSession } from "@/store/history";

const session = (changes: Partial<TypingSession> = {}): TypingSession => ({
    id: "current",
    timestamp: 1000,
    wpm: 60,
    cpm: 300,
    accuracy: 98,
    errors: 2,
    duration: 15,
    mode: "time",
    source: "1k",
    ...changes,
});

describe("final session measurement", () => {
    test("counts skipped letters in finished words without penalizing an unfinished word", () => {
        expect(measureSessionText("ca dog", "cat dog")).toEqual({
            characters: 6,
            errors: 1,
            correct: 5,
        });
        expect(measureSessionText("ca", "cat dog").errors).toBe(0);
    });
    test("replaces a final tick with the completed text, preserving one timestamp", () => {
        const samples = upsertSample(
            [
                { time: 0.2, count: 1 },
                { time: 0.4, count: 2 },
            ],
            { time: 0.4, count: 3 },
        );
        expect(samples).toEqual([
            { time: 0.2, count: 1 },
            { time: 0.4, count: 3 },
        ]);
        expect(
            buildPacePoints(samples, [{ time: 0.4, count: 1 }]).at(-1)?.correct,
        ).toBe(speedFromCount(2, 0.4));
    });
    test("never returns negative output or infinite speed", () => {
        expect(speedFromCount(-5, 10)).toBe(0);
        expect(speedFromCount(5, 0)).toBe(0);
        expect(
            measureSessionText("a b", "long longer").correct,
        ).toBeGreaterThanOrEqual(0);
    });
});

describe("pace charts", () => {
    test("aligns error samples by time and treats corrections as a reduction, not negative events", () => {
        const points = buildPacePoints(
            [
                { time: 0, count: 0 },
                { time: 1, count: 5 },
                { time: 2, count: 10 },
                { time: 3, count: 15 },
            ],
            [
                { time: 1, count: 2 },
                { time: 3, count: 1 },
            ],
        );
        expect(points.map((point) => point.errors)).toEqual([2, 0, 0]);
        expect(points.at(-1)?.correct).toBe(56);
    });
    test("does not duplicate errors at bin boundaries and preserves the final speed", () => {
        const points = Array.from({ length: 10 }, (_, i) => ({
            time: i + 1,
            raw: i * 7,
            correct: i * 6,
            burst: 40,
            errors: i === 4 ? 3 : 0,
        }));
        const result = downsamplePace(points, 2);
        expect(result.length).toBe(2);
        expect(result.reduce((sum, point) => sum + point.errors, 0)).toBe(3);
        expect(result.at(-1)?.raw).toBe(63);
        expect(result.at(-1)?.correct).toBe(54);
    });
    test("rhythm needs enough duration and distinguishes a pause from steady output", () => {
        expect(getRhythm([{ time: 3, count: 10 }])).toBeNull();
        expect(
            getRhythm([
                { time: 2, count: 10 },
                { time: 4, count: 20 },
                { time: 6, count: 30 },
            ]),
        ).toBe(100);
        expect(
            getRhythm([
                { time: 2, count: 10 },
                { time: 4, count: 10 },
                { time: 6, count: 30 },
            ])!,
        ).toBeLessThan(50);
        expect(getRhythm([{ time: 6, count: 0 }])).toBeNull();
    });
});

describe("evidence-based insights", () => {
    test("compares only prior sessions with similar mode, duration and known source", () => {
        const current = session();
        const history = [
            current,
            session({ id: "good", timestamp: 900, wpm: 50, accuracy: 96 }),
            session({ id: "long", timestamp: 800, duration: 60 }),
            session({ id: "words", timestamp: 700, mode: "words" }),
            session({ id: "source", timestamp: 600, source: "5k" }),
        ];
        expect(getSessionComparison(current, history)).toEqual({
            count: 1,
            avgWpm: 50,
            avgAccuracy: 96,
            wpmDelta: 10,
            accuracyDelta: 2,
        });
    });
    test("supports old records and limits the baseline to five recent attempts", () => {
        const history = Array.from({ length: 7 }, (_, i) =>
            session({
                id: String(i),
                timestamp: 900 - i * 10,
                source: undefined,
                wpm: 40 + i,
            }),
        );
        expect(getSessionComparison(session(), history)?.count).toBe(5);
        expect(getSessionComparison(session(), [])).toBeNull();
    });
    test("does not recommend a rarely seen key as a firm problem area", () => {
        const focus = getKeyFocus({
            a: { expected: 1, errors: 1, presses: 1, totalLatencyMs: 1000 },
            b: { expected: 5, errors: 2, presses: 5, totalLatencyMs: 1500 },
            c: { expected: 10, errors: 1, presses: 10, totalLatencyMs: 2000 },
        });
        expect(focus.errors.map(([key]) => key)).toEqual(["b", "c"]);
        expect(focus.delayed[0][0]).toBe("b");
    });
});

describe("word-aligned key tracking", () => {
    test("extra letters do not shift the expected keys in later words", () => {
        const events = diffTypedText("", "cats dog", "cat dog", 0, 1000);
        expect(events.slice(-3).map((event) => event.correct)).toEqual([
            true,
            true,
            true,
        ]);
        expect(events.slice(-3).map((event) => event.expected)).toEqual([
            "d",
            "o",
            "g",
        ]);
    });
    test("skipped letters are counted without invented key presses", () => {
        const events = diffTypedText("", "ca dog", "cats dog", 0, 1000);
        const keys = aggregateKeyStats(events);
        expect(keys.t).toEqual({
            expected: 1,
            errors: 1,
            presses: 0,
            totalLatencyMs: 0,
        });
        expect(keys.s.errors).toBe(1);
        expect(keys[" "].errors).toBe(0);
        expect(events.slice(-3).every((event) => event.correct)).toBe(true);
    });
    test("corrected errors remain visible as attempts without corrupting the next key", () => {
        const first = diffTypedText("", "cax", "cat dog", 0, 1000);
        const deletion = diffTypedText("cax", "ca", "cat dog", 1000, 1100);
        const correction = diffTypedText("ca", "cat", "cat dog", 1000, 1200);
        expect(deletion).toEqual([]);
        const keys = aggregateKeyStats([...first, ...correction]);
        expect(keys.t.expected).toBe(2);
        expect(keys.t.errors).toBe(1);
        expect(correction[0].correct).toBe(true);
    });
});
