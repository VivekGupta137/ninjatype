import { expect, test } from "bun:test";
import { chunk, mergeDays, mergeSessions, stableId, unsent } from "./historySync";
import type { TypingSession } from "@/store/history";

const s = (id: string | undefined, timestamp: number): TypingSession => ({ id, timestamp, wpm: 50, cpm: 250, accuracy: 97, errors: 1, duration: 30, mode: "time" });

test("merge unions by id, newest first, local wins, and caps", () => {
    const merged = mergeSessions([s("a", 3), s("b", 1)], [s("b", 99), s("c", 2)], 10);
    expect(merged.map(x => x.id)).toEqual(["a", "c", "b"]);
    expect(merged.find(x => x.id === "b")!.timestamp).toBe(1);
    expect(mergeSessions([s("a", 3), s("b", 1)], [s("c", 2)], 2).map(x => x.id)).toEqual(["a", "c"]);
});

test("legacy sessions without ids get the same stable id on every device", () => {
    const merged = mergeSessions([s(undefined, 5)], [s(stableId(s(undefined, 5)), 5)], 10);
    expect(merged).toHaveLength(1);
});

test("unsent skips already-sent ids; days union", () => {
    expect(unsent([s("a", 1), s("b", 2)], new Set(["a"])).map(x => x.id)).toEqual(["b"]);
    expect(mergeDays(["2026-01-02"], ["2026-01-01", "2026-01-02"], [])).toEqual(["2026-01-01", "2026-01-02"]);
    expect(chunk([1, 2, 3], 2)).toEqual([[1, 2], [3]]);
});
