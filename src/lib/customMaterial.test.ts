import { describe, expect, test } from "bun:test";
import {
    MAX_MATERIALS, MAX_MATERIAL_CHARS, buildRun, checkDraft, cleanMaterialText, countWords,
    defaultTitle, initialWindowCount, nextSectionIndex, nextWindowCount, parseActiveRun, parseMaterials, splitSections, windowedSentence,
} from "./customMaterial";

const words = (n: number) => Array.from({ length: n }, (_, i) => `w${i + 1}`).join(" ");

describe("cleanMaterialText", () => {
    test("converts typographic characters to ASCII and counts replacements", () => {
        const result = cleanMaterialText("\u201CHe said\u201D \u2013 it\u2019s fine\u2026");
        expect(result.text).toBe('"He said" - it\'s fine...');
        expect(result.replaced).toBe(5);
        expect(result.removed).toBe(0);
    });
    test("keeps base letters of accents and medical symbols", () => {
        expect(cleanMaterialText("caf\u00E9 na\u00EFve \u00B5g \u2265 5\u00B0").text).toBe("cafe naive ug >= 5 deg");
    });
    test("drops characters without an ASCII equivalent and counts them", () => {
        const result = cleanMaterialText("take \u4E2D\u6587 now");
        expect(result.text).toBe("take now");
        expect(result.removed).toBe(2);
    });
    test("collapses whitespace, line breaks and invisible characters", () => {
        expect(cleanMaterialText("  a\n\n b\t\tc\u200B \u00A0 d\r\n").text).toBe("a b c d");
    });
    test("output is printable ASCII only", () => {
        const out = cleanMaterialText("\u00C5ngstr\u00F6m \u2122 \u20AC5 \uD83D\uDE00 \u0394").text;
        expect(/^[\x20-\x7e]*$/.test(out)).toBe(true);
    });
});

describe("sections", () => {
    test("splits into 25-word sections and merges a tiny tail", () => {
        expect(splitSections(words(60)).map(s => countWords(s))).toEqual([25, 35]);
        expect(splitSections(words(75)).map(s => countWords(s))).toEqual([25, 25, 25]);
        expect(splitSections(words(10)).length).toBe(1);
        expect(splitSections("")).toEqual([]);
    });
    test("buildRun clamps the section and supports whole text from a section", () => {
        const m = { id: "a", title: "T", text: words(75) };
        expect(buildRun(m, "sections", 1)).toMatchObject({ mode: "sections", section: 1, totalSections: 3 });
        expect(buildRun(m, "sections", 99).section).toBe(2);
        expect(buildRun(m, "sections", -5).sentence).toBe(splitSections(m.text)[0]);
        const whole = buildRun(m, "whole", 1);
        expect(whole.mode).toBe("whole");
        expect(countWords(whole.sentence)).toBe(50);
        expect(buildRun({ ...m, text: words(5) }, "sections").mode).toBe("whole");
    });
    test("nextSectionIndex advances and wraps", () => {
        expect(nextSectionIndex({ mode: "sections", section: 0, totalSections: 3 })).toBe(1);
        expect(nextSectionIndex({ mode: "sections", section: 2, totalSections: 3 })).toBe(0);
        expect(nextSectionIndex({ mode: "whole", section: 1, totalSections: 3 })).toBe(0);
    });
});

describe("drafts and storage", () => {
    test("rejects empty and over-limit text", () => {
        expect(checkDraft(" \n ")).toMatchObject({ ok: false, error: "empty" });
        expect(checkDraft("a".repeat(MAX_MATERIAL_CHARS + 1))).toMatchObject({ ok: false, error: "too-long" });
        expect(checkDraft("a".repeat(MAX_MATERIAL_CHARS)).ok).toBe(true);
    });
    test("default title uses the first words", () => {
        expect(defaultTitle("The patient presented with acute pain in the chest")).toBe("The patient presented with acute pain...");
        expect(defaultTitle("Short")).toBe("Short");
    });
    test("parseMaterials drops malformed items, clamps progress, caps count", () => {
        const good = { id: "1", title: "A", text: words(100), createdAt: 1, updatedAt: 2, nextSection: 99, bestWpm: 50, bestAccuracy: 120 };
        const parsed = parseMaterials([good, { id: "1", text: "dupe" }, null, { id: "2" }, { id: "3", text: "" }, "x"]);
        expect(parsed.length).toBe(1);
        expect(parsed[0].nextSection).toBe(3);
        expect(parsed[0].bestWpm).toBe(50);
        expect(parsed[0].bestAccuracy).toBeUndefined();
        expect(parseMaterials({})).toEqual([]);
        const many = Array.from({ length: MAX_MATERIALS + 5 }, (_, i) => ({ id: String(i), text: "hello" }));
        expect(parseMaterials(many).length).toBe(MAX_MATERIALS);
    });
    test("parseMaterials re-cleans stored text", () => {
        expect(parseMaterials([{ id: "x", title: "", text: "caf\u00E9   au lait" }])[0].text).toBe("cafe au lait");
    });
});

describe("windowed rendering and continue state", () => {
    test("long passages render a window that grows only near the cursor", () => {
        const total = 2000;
        expect(initialWindowCount(total)).toBe(100);
        expect(initialWindowCount(30)).toBe(30);
        expect(nextWindowCount(total, 100, 10)).toBe(100); // plenty ahead
        expect(nextWindowCount(total, 100, 70)).toBe(170); // within 40 words of the end
        expect(nextWindowCount(150, 100, 70)).toBe(150); // never past the full text
        expect(nextWindowCount(100, 100, 99)).toBe(100);
        const text = words(300);
        expect(windowedSentence(text, 100).split(" ")).toHaveLength(100);
        expect(windowedSentence(text, 100)).toBe(text.split(" ").slice(0, 100).join(" "));
    });
    test("buildRun records the word count of the full passage", () => {
        expect(buildRun({ id: "a", title: "T", text: words(500) }, "whole", 0).words).toBe(500);
        expect(buildRun({ id: "a", title: "T", text: words(500) }, "sections", 1).words).toBe(25);
    });
    test("parseActiveRun validates stored state", () => {
        expect(parseActiveRun({ materialId: "a", mode: "whole", section: 3.7 })).toEqual({ materialId: "a", mode: "whole", section: 3 });
        for (const bad of [null, {}, { materialId: "a", mode: "x", section: 1 }, { materialId: "", mode: "whole", section: 1 }, { materialId: "a", mode: "whole", section: -1 }, "s"]) {
            expect(parseActiveRun(bad)).toBeNull();
        }
    });
});

describe("lowercase only", () => {
    test("buildRun lowercases the passage without changing counts", () => {
        const m = { id: "a", title: "T", text: "The Patient Was Seen. " + words(60) };
        const upper = buildRun(m, "whole", 0);
        const lower = buildRun(m, "whole", 0, true);
        expect(upper.sentence).toContain("The Patient");
        expect(lower.sentence).toBe(upper.sentence.toLowerCase());
        expect(lower.words).toBe(upper.words);
        expect(lower.lowercase).toBe(true);
        expect(buildRun(m, "sections", 1, true).sentence).toBe(buildRun(m, "sections", 1).sentence.toLowerCase());
    });
});
