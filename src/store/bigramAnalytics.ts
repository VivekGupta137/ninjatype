import { atom, onSet } from "nanostores";
import { createBigramCapture, type BigramTotals } from "@/lib/bigramStats";
import { KBTYPINGSTATE } from "@/constants/keyboardState";
import { $kbTypingState } from "./keyboard";

export const $bigramTotals = atom<BigramTotals>({});
const capture = createBigramCapture();

export function resetBigramCapture() {
    capture.reset();
    $bigramTotals.set({});
}

onSet($kbTypingState, ({ newValue }) => {
    if (newValue === KBTYPINGSTATE.IDLE) resetBigramCapture();
});

/** Called synchronously for every accepted input, before the text store's rAF flush. */
export function recordBigramInput(before: string, after: string, sentence: string, time: number, inputType: string, composing = false) {
    if ($kbTypingState.get() === KBTYPINGSTATE.COMPLETED) return;
    const observation = capture.record(before, after, sentence, time, inputType, composing);
    if (!observation) return;
    const { pair, total } = observation;
    const current = $bigramTotals.get();
    const prior = current[pair] ?? { attempts: 0, errors: 0, timed: 0, totalMs: 0 };
    $bigramTotals.set({ ...current, [pair]: {
        attempts: prior.attempts + total.attempts,
        errors: prior.errors + total.errors,
        timed: prior.timed + total.timed,
        totalMs: prior.totalMs + total.totalMs,
    } });
}
