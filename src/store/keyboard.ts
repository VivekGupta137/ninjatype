import { words1k } from "@/constants/words1k";
import { atom, computed, effect } from "nanostores";
import { $config } from "./config";
import { createSentenceFromQuotes, createSentenceFromWords, genOneWord } from "@/util/sentence";
import { KBSTATE, KBTYPINGSTATE } from "@/constants/keyboardState";
import { toMillis } from "@/util/utilities";
import { createFetcherStore, type FetchWordListType } from "./fetcher";

export const $kbSentence = atom<string>("");
export const $kbTypedText = atom<string>("");

export const $kbState = atom<KBSTATE>(KBSTATE.LOADING);
export const $kbTypingState = atom<KBTYPINGSTATE>(KBTYPINGSTATE.IDLE);

export const $countdownTimer = atom<number>(0);
export const $stopwatch = atom<number>(0); // seconds elapsed

const $fetchDictionaryKey = atom<string>('1k');
export const $wordListFetched = createFetcherStore<FetchWordListType>(['/api/words/', $fetchDictionaryKey]);
export const $wordList = atom<FetchWordListType | null>(null);

export const MAX_TYPING_TIME_SECONDS = 300; // 5 minutes

export const $kbTypedWords = computed($kbTypedText, (typedText) => {
    const words = typedText.trim().split(" ");
    return words.filter(Boolean);
});

export const $kbSentenceWords = computed($kbSentence, (sentence) => {
    const words = sentence.trim().split(" ");
    return words.filter(Boolean);
});

effect([$wordListFetched], ({data, loading}) => {
    if (data && data.length > 0) {
        $wordList.set(data);
    }
    if (loading) {
        $kbState.set(KBSTATE.LOADING);
    } else {
        $kbState.set(KBSTATE.NOT_FOCUSSED);
    }
});


effect([$kbSentence, $kbTypedText, $config], (kbSentence, kbTypedText, config) => {
    if($kbState.get() === KBSTATE.LOADING) return;
    // check for completion for word count mode
    if (config.mode === "words" || config.mode === "quotes") {
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
        if (currentSentenceWordsCount - typedWordsCount < 30) {
            const wordList = $wordList.get();
            const newWord = wordList ? genOneWord(wordList): "none";
            $kbSentence.set(sentenceWords.join(" ") + " " + newWord.trim());
        }
    }
});

effect([$wordList, $config], (wordList, config) => {
    if (typeof window === "undefined" || $kbState.get() === KBSTATE.LOADING) return;
    $kbState.set(KBSTATE.LOADING);
    const mode = config.mode;
    const sentence = mode != "quotes" ? createSentenceFromWords(
        wordList,
        mode == "words" ? parseInt(config.maxWordCount): 50
    ) : createSentenceFromQuotes(wordList);
    $kbSentence.set(sentence);
    $kbState.set(KBSTATE.FOCUSSED);
    $kbTypingState.set(KBTYPINGSTATE.IDLE);
    $kbTypedText.set("");
});

effect([$stopwatch, $kbTypingState], (stopwatch, kbTypingState) => {
    if (!( kbTypingState === KBTYPINGSTATE.TYPING)) {
        return;
    }
    // stop if max time reached, no matter which mode
    if( stopwatch >= MAX_TYPING_TIME_SECONDS ) {
        $kbTypingState.set(KBTYPINGSTATE.COMPLETED);
        return;
    }
    const timeoutId = setTimeout(() => {
        $stopwatch.set(stopwatch + 1);
    }, 1000);

    return () => clearTimeout(timeoutId);    
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
    // reset the dictionary fetch key
    const source = config.mode === "quotes" ? config.quotes : config.dictionary;
    if( source !== $fetchDictionaryKey.get()) {
        $fetchDictionaryKey.set( source );
        $kbState.set(KBSTATE.LOADING);
    }
    // reset the stopwatch
    $stopwatch.set(0);
    // reset the timer based on mode
    if (config.mode === "time") {
        const timeInMillis = toMillis(config.countdownTime);
        const timeInSeconds = parseInt((timeInMillis / 1000).toFixed(0));
        $countdownTimer.set(timeInSeconds);
    } else {
        $countdownTimer.set(0);
    }
});
