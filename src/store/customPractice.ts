import { KBSTATE, KBTYPINGSTATE } from "@/constants/keyboardState";
import { initialWindowCount, windowedSentence, type CustomRun } from "@/lib/customMaterial";
import { $config } from "./config";
import { $customRun } from "./customRun";
import { $kbSentence, $kbState, $kbTypedText, $kbTypingState } from "./keyboard";

/** Start (or restart) typing a passage of the user's own material. */
export function startCustomRun(run: CustomRun) {
    $customRun.set(run);
    $kbTypingState.set(KBTYPINGSTATE.IDLE);
    $kbTypedText.set("");
    $kbSentence.set(windowedSentence(run.sentence, initialWindowCount(run.words)));
    // The dictionary download is irrelevant here, so don't wait for it.
    if ($kbState.get() === KBSTATE.LOADING) $kbState.set(KBSTATE.FOCUSSED);
    // Re-run the keyboard/analytics resets exactly like "Practice again".
    $config.set({ ...$config.get() });
    requestAnimationFrame(() => {
        document.getElementById("kb-hidden-input")?.focus({ preventScroll: true });
    });
}

/** Return the shared keyboard to normal practice (leaving the page). */
export function endCustomRun() {
    if (!$customRun.get()) return;
    $customRun.set(null);
    $kbTypingState.set(KBTYPINGSTATE.IDLE);
    $kbTypedText.set("");
    $config.set({ ...$config.get() });
}
