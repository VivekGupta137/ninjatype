import { afterEach, expect, test } from "bun:test";
import { $bigramTotals, recordBigramInput, resetBigramCapture } from "./bigramAnalytics";
import { $kbTypingState } from "./keyboard";
import { KBTYPINGSTATE } from "@/constants/keyboardState";

const original = $kbTypingState.get();
afterEach(() => { resetBigramCapture(); $kbTypingState.set(original); });

test("captures all native inputs before a text flush and retains final pair on completion", () => {
    $kbTypingState.set(KBTYPINGSTATE.IDLE);
    resetBigramCapture();
    recordBigramInput("", "t", "the", 100, "insertText");
    recordBigramInput("t", "th", "the", 200, "insertText");
    recordBigramInput("th", "the", "the", 300, "insertText");
    $kbTypingState.set(KBTYPINGSTATE.COMPLETED);
    expect($bigramTotals.get().he.attempts).toBe(1);
    recordBigramInput("the", "thex", "thex", 400, "insertText");
    expect($bigramTotals.get().ex).toBeUndefined();
    $kbTypingState.set(KBTYPINGSTATE.IDLE);
    expect($bigramTotals.get()).toEqual({});
    recordBigramInput("th", "the", "the", 500, "insertText");
    expect($bigramTotals.get()).toEqual({});
});
