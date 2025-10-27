import { words1k } from "@/constants/words";
import { atom, effect, onMount, onSet } from "nanostores";
import { $config } from "./config";
import { createSentenceFromWords, genOneWord } from "@/util/sentence";
import { KBSTATE, KBTYPINGSTATE } from "@/constants/keyboardState";
import { toMillis } from "@/util/utilities";

export const $kbSentence = atom<string>("");
export const $kbTypedText = atom<string>("");
export const $kbState = atom<KBSTATE>(KBSTATE.LOADING);
export const $countdownTimer = atom<number>(0);
export const $kbTypingState = atom<KBTYPINGSTATE>(KBTYPINGSTATE.IDLE);

export const $wordList = atom<string[]>(words1k);

onSet($kbTypedText, ({ newValue }) => {
    if (newValue.length > 0) {
        $kbTypingState.set(KBTYPINGSTATE.TYPING);
    }
});

effect([$kbTypedText, $config], (typedText, config) => {
    if (config.mode === "time") {
        const typedWordsCount = typedText
            .trim()
            .split(" ")
            .filter((word) => word.length > 0).length;
        const currentSentenceWordsCount = $kbSentence
            .get()
            .trim()
            .split(" ").length;

        // keep a gap of 20 words
        if (currentSentenceWordsCount - typedWordsCount < 10) {
            const newWord = genOneWord($wordList.get());
            $kbSentence.set($kbSentence.get().trim() + " " + newWord.trim());
        }
    }
});

effect([$wordList, $config], (wordList, config) => {
    if (typeof window === "undefined") return;
    $kbState.set(KBSTATE.LOADING);
    const sentence = createSentenceFromWords(
        wordList,
        parseInt(config.maxWordCount)
    );
    $kbSentence.set(sentence);
    $kbState.set(KBSTATE.FOCUSSED);
    $kbTypingState.set(KBTYPINGSTATE.IDLE);
    $kbTypedText.set("");
});

effect([$countdownTimer, $kbTypingState], (newValue, kbTypingState) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    // console.log("countdown timer set to", newValue);
    if (newValue > 0 && kbTypingState === KBTYPINGSTATE.TYPING) {
        timeoutId = setTimeout(() => {
            $countdownTimer.set(newValue - 1);
            if (newValue - 1 === 0) {
                $kbTypingState.set(KBTYPINGSTATE.COMPLETED);
            }
        }, 1000);
    }
    return () => {
        // cleanup if needed
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
    };
});

effect([$config], (config) => {
    if (typeof window === "undefined") return;
    if (config.mode === "time") {
        const timeInMillis = toMillis(config.countdownTime);
        const timeInSeconds = parseInt((timeInMillis / 1000).toFixed(0));
        $countdownTimer.set(timeInSeconds);
    } else {
        $countdownTimer.set(0);
    }
});
