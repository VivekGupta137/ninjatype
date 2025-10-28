import { atom, computed, effect, onSet } from "nanostores";
import { $kbSentence, $kbTypedText, $kbTypingState } from "./keyboard";
import { KEYBOARD } from "@/constants/keyboard";
import { KBTYPINGSTATE } from "@/constants/keyboardState";
import { $config } from "./config";

export const $typingTrace = atom<{ char: string; time: number }[]>([]); // [typedChar, timestampMillis, isCorrect]
export const $rawCPM = computed($typingTrace, (trace) => {
    // characters per minute
    // exclude the artificial end marker added on completion
    const filtered = trace.filter((t) => t.char !== "$$END$$");

    // Need at least 2 characters typed to calculate a meaningful rate
    if (filtered.length < 3) return 0;

    const firstTime = filtered[0].time;
    const lastTime = filtered[filtered.length - 1].time;
    const duration = lastTime - firstTime; // milliseconds

    // Ensure we have a reasonable duration (at least 100ms) to avoid spurious high speeds
    if (duration < 100) return 0;

    const chars = filtered.length - 1; // subtract first character since we start timing from it
    // CPM = characters per minute. Use Math.round and return a number (not a string).
    const cpm = Math.round((chars * 60000) / duration);

    return Math.min(cpm, 1800); // Cap at reasonable human maximum CPM
});

export const $rawWPM = computed([$rawCPM], (rawCPM) => {
    // words per minute
    if (!rawCPM) return 0;
    // treat 5 characters as a word, round to nearest whole word per minute
    return Math.ceil(rawCPM / 5);
});

effect($config, () => {
    $typingTrace.set([]);
});

effect([$kbTypedText, $kbTypingState], (kbTypedText, kbTypingState) => {
    const currentTrace = $typingTrace.get();
    const typedChar = kbTypedText.length > 0 ? kbTypedText[kbTypedText.length - 1] : "";
    const lastTrace = currentTrace[currentTrace.length - 1];

    // avoid logging repeated spaces
    if (!(typedChar === lastTrace?.char && typedChar === KEYBOARD.Space)) {
        $typingTrace.set([...currentTrace, { char: typedChar, time: Date.now() }]);
    }
    if (kbTypingState === KBTYPINGSTATE.COMPLETED) {
        $typingTrace.set([...currentTrace, { char: "$$END$$", time: Date.now() }]);
    }
});
