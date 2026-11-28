import { describe, expect, test } from "bun:test";
import wordData from "@/data/words-5k.json";
import longData from "@/data/words-2k-long.json";
import { buildLibraryDrill, LIBRARY } from "./library";

const pools = { words: wordData.words, long: longData.words };

describe("drill library", () => {
    test("each drill builds deterministically from the shipped word lists", () => {
        for (const drill of LIBRARY) {
            const text = buildLibraryDrill(drill.id, pools, "2026-11-28");
            expect(text).toBeTruthy();
            expect(text).toBe(buildLibraryDrill(drill.id, pools, "2026-11-28"));
            expect(text!.split(/\s+/).length).toBeGreaterThanOrEqual(8);
        }
    });

    test("word drills avoid adjacent repeats", () => {
        for (const id of ["home-row", "top-row", "bottom-row", "short-words", "long-words", "bigrams"]) {
            const words = buildLibraryDrill(id, pools, "2026-11-28")!.split(" ");
            for (let i = 1; i < words.length; i++) expect(words[i]).not.toBe(words[i - 1]);
        }
    });

    test("missing or insufficient words fail safely instead of hanging or generating empty content", () => {
        const sparse = { words: ["a", "sad", "sad"], long: ["wonderful", "wonderful"] };
        for (const id of ["home-row", "top-row", "bottom-row", "short-words", "long-words", "capitals", "punctuation"]) {
            expect(buildLibraryDrill(id, sparse, "day")).toBeNull();
        }
        expect(buildLibraryDrill("missing", pools, "day")).toBeNull();
    });
});
