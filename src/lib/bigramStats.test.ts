import { describe, expect, test } from "bun:test";
import { createBigramCapture, mergeBigramTotals, rankBigrams, type BigramTotal } from "./bigramStats";
import { aggregateAdvanced, summarizeSession } from "./advancedStats";

const total = (attempts: number, errors = 0, ms = 100): BigramTotal => ({ attempts, errors, timed: attempts - errors, totalMs: (attempts - errors) * ms });

describe("native bigram capture", () => {
    test("measures two accepted inputs even when a frame has not flushed", () => {
        const c = createBigramCapture();
        expect(c.record("", "t", "the", 100, "insertText")).toBeNull();
        expect(c.record("t", "th", "the", 225, "insertText")).toEqual({ pair: "th", total: total(1, 0, 125) });
        expect(c.record("th", "the", "the", 300, "insertText")).toEqual({ pair: "he", total: total(1, 0, 75) });
    });
    test("attributes either wrong letter to the intended pair, not the mistyped pair", () => {
        const c = createBigramCapture();
        c.record("", "x", "the", 100, "insertText");
        expect(c.record("x", "xh", "the", 200, "insertText")).toEqual({ pair: "th", total: total(1, 1) });
        expect(c.record("xh", "xhx", "the", 300, "insertText")).toEqual({ pair: "he", total: total(1, 1) });
    });
    test("deletion and correction break adjacency; following clean pairs are measured", () => {
        const c = createBigramCapture();
        c.record("", "t", "the", 100, "insertText");
        c.record("t", "tx", "the", 200, "insertText");
        expect(c.record("tx", "t", "the", 300, "deleteContentBackward")).toBeNull();
        expect(c.record("t", "th", "the", 400, "insertText")).toBeNull();
        expect(c.record("th", "the", "the", 500, "insertText")?.pair).toBe("he");
    });
    test.each(["insertFromPaste", "insertReplacementText", "insertCompositionText", ""])("%s breaks the chain", (inputType) => {
        const c = createBigramCapture();
        c.record("", "t", "the", 100, "insertText");
        expect(c.record("t", "th", "the", 200, inputType)).toBeNull();
        expect(c.record("th", "the", "the", 300, "insertText")).toBeNull();
    });
    test("batch input, composition, cursor replacement and mismatched buffers do not invent pairs", () => {
        const c = createBigramCapture();
        expect(c.record("", "th", "the", 100, "insertText")).toBeNull();
        expect(c.record("th", "the", "the", 200, "insertText", true)).toBeNull();
        c.record("", "t", "the", 300, "insertText");
        expect(c.record("x", "xh", "the", 400, "insertText")).toBeNull();
        expect(c.record("xh", "th", "the", 500, "insertText")).toBeNull();
    });
    test("spaces, omissions, extra letters and punctuation break pairs, but later words align", () => {
        const c = createBigramCapture();
        let before = "";
        const pairs: string[] = [];
        for (const [i, letter] of [..."ta ed. ed"].entries()) {
            const after = before + letter;
            const result = c.record(before, after, "tall ed. ed", i * 100, "insertText");
            if (result) pairs.push(result.pair);
            before = after;
        }
        expect(pairs).toEqual(["ta", "ed", "ed"]);
        c.reset();
        c.record("", "e", "ed", 1000, "insertText");
        c.record("e", "ed", "ed", 1100, "insertText");
        expect(c.record("ed", "edx", "ed", 1200, "insertText")).toBeNull();
    });
    test("long and non-positive gaps count accuracy but not speed; reset removes adjacency", () => {
        for (const gap of [0, -10, 2001]) {
            const c = createBigramCapture();
            c.record("", "t", "th", 100, "insertText");
            expect(c.record("t", "th", "th", 100 + gap, "insertText")?.total).toEqual({ attempts: 1, errors: 0, timed: 0, totalMs: 0 });
            c.reset();
            expect(c.record("th", "the", "the", 3000, "insertText")).toBeNull();
        }
    });
    test("preserves letter case errors and supports German letters", () => {
        const c = createBigramCapture();
        c.record("", "Ü", "üb", 100, "insertText");
        expect(c.record("Ü", "Üb", "üb", 200, "insertText")).toEqual({ pair: "üb", total: total(1, 1) });
    });
});

describe("bigram summaries", () => {
    test("pools counts and timing weights across sessions and survives JSON/old records", () => {
        const a = summarizeSession([], null, { th: total(5, 0, 100) });
        const b = summarizeSession([], null, { th: total(15, 5, 200) });
        const merged = aggregateAdvanced(JSON.parse(JSON.stringify([a, b, undefined, { errorKinds: {} }])));
        expect(merged.bigrams.th).toEqual({ attempts: 20, errors: 5, timed: 15, totalMs: 2500 });
        expect(rankBigrams(merged.bigrams).errors[0].errorRate).toBe(25);
        expect(rankBigrams(merged.bigrams).slow[0].avgMs).toBeCloseTo(166.6667, 3);
        expect(aggregateAdvanced([undefined]).bigrams).toEqual({});
    });
    test("requires five observations separately for speed and errors, limits to five, sorts deterministically", () => {
        const ranked = rankBigrams({ th: total(4, 1, 500), ed: total(5, 1, 400), he: total(5, 0, 100), aa: total(5, 0, 100) });
        expect(ranked.slow.map(s => s.pair)).toEqual(["aa", "he"]);
        expect(ranked.errors.map(s => s.pair)).toEqual(["ed"]);
        expect(rankBigrams(Object.fromEntries(["aa", "ab", "ac", "ad", "ae", "af"].map(p => [p, total(5, 0)]))).slow).toHaveLength(5);
    });
    test("ignores malformed imported metrics and never produces NaN", () => {
        const invalid = { th: total(5, 6), ed: { ...total(5), totalMs: Infinity }, he: { ...total(5), timed: 9 }, "t ": total(5), aa: { ...total(5), attempts: NaN } };
        expect(mergeBigramTotals([undefined, invalid])).toEqual({});
        expect(rankBigrams({})).toEqual({ slow: [], errors: [], observed: 0 });
    });
});
