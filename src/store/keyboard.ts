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

effect([$kbSentence, $kbTypedText, $config], (kbSentence, kbTypedText, config) => {
    // check for completion for word count mode
    if (config.mode === "words") {
        const targetWords = kbSentence.trim().split(" ");
        const typedWords = kbTypedText.trim().split(" ");
        if (typedWords.length == targetWords.length && typedWords[typedWords.length -1].length === targetWords[targetWords.length -1].length) {
            $kbTypingState.set(KBTYPINGSTATE.COMPLETED);
        }
        else if (kbTypedText.length > 0 && $kbTypingState.get() === KBTYPINGSTATE.IDLE) {
            $kbTypingState.set(KBTYPINGSTATE.TYPING);
        }
    }
    else if (config.mode === "time") {
        // in time mode, completion is handled by timer
        // check the typing state
        if (kbTypedText.length > 0 && $kbTypingState.get() === KBTYPINGSTATE.IDLE) {
            $kbTypingState.set(KBTYPINGSTATE.TYPING);
        }
    }
})

effect([$kbTypedText, $config], (typedText, config) => {
    if (config.mode === "time") {
        const words = typedText.trim().split(" ");
        const typedWordsCount = words.filter(Boolean).length;
        const sentenceWords = $kbSentence.get().trim().split(" ");
        const currentSentenceWordsCount = sentenceWords.length;

        // keep a gap of 10 words
        if (currentSentenceWordsCount - typedWordsCount < 10) {
            const newWord = genOneWord($wordList.get());
            $kbSentence.set(sentenceWords.join(" ") + " " + newWord.trim());
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
    if (!(newValue > 0 && kbTypingState === KBTYPINGSTATE.TYPING)) {
        return;
    }

    const timeoutId = setTimeout(() => {
        const nextValue = newValue - 1;
        $countdownTimer.set(nextValue);
        if (nextValue === 0) {
            $kbTypingState.set(KBTYPINGSTATE.COMPLETED);
        }
    }, 1000);

    return () => clearTimeout(timeoutId);
});

effect([$config], (config) => {
    if (typeof window === "undefined") return;
    // reset the timer based on mode
    if (config.mode === "time") {
        const timeInMillis = toMillis(config.countdownTime);
        const timeInSeconds = parseInt((timeInMillis / 1000).toFixed(0));
        $countdownTimer.set(timeInSeconds);
    } else {
        $countdownTimer.set(0);
    }
});
