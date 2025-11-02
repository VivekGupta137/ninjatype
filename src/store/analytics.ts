import { atom, computed, effect, onSet } from "nanostores";
import { $kbSentence, $kbSentenceWords, $kbTypedText, $kbTypedWords, $kbTypingState, $stopwatch } from "./keyboard";
import { KEYBOARD } from "@/constants/keyboard";
import { KBTYPINGSTATE } from "@/constants/keyboardState";
import { $config } from "./config";

export const $typingTrace = atom<{ char: string; time: number }[]>([]); // [typedChar, timestampMillis, isCorrect]

export const $rawCPS = atom<{count: number; time: number}[]>([]); // characters per second samples

export const $errorCPS = atom<{time: number; count: number}[]>([]); // error count samples

export const $correctCPS = atom<{time: number; count: number}[]>([]); // characters per second samples including only correct characters

export const $accuracy = computed( [$errorCPS], ( errorCPS) => {
    // accuracy percentage based on error count and total typed characters
    const latestErrors = errorCPS[errorCPS.length -1];
    const typedText = $kbTypedText.get();
    const typedTextLength = typedText.length;
    if (!latestErrors || typedTextLength === 0) return 100;
    const errorCount = latestErrors.count;
    const accuracy = ((typedTextLength - errorCount) / typedTextLength) * 100;
    return Math.max(0, Math.min(100, Math.round(accuracy)));
})


effect([$stopwatch], (stopwatch) => {
    // update CPS & error samples samples every second including spaces
    const typedText = $kbTypedText.get();
    const typedTextLength = typedText.length;
        
    const latestCPS = $rawCPS.get();
    if(latestCPS.length === 0 || latestCPS[latestCPS.length -1].time !== stopwatch) {
        $rawCPS.set([...latestCPS, {count: typedTextLength, time: stopwatch}]);
    }

    const sentenceWords = $kbSentenceWords.get();
    const typedWords = $kbTypedWords.get();

    // count errors
    let errorCount = 0;

    for (let i = 0; i < typedWords.length; i++) {
        const typedWord = typedWords[i];
        const targetWord = sentenceWords[i] || "";
        for (let j = 0; j < Math.max(typedWord.length, i < typedWords.length - 1 ? targetWord.length : 0); j++) {
            if (typedWord[j] !== targetWord[j]) {
                errorCount += 1;
            }
        }
    }

    const eps = $errorCPS.get();
    if(eps.length === 0 || eps[eps.length -1].time !== stopwatch) {
        $errorCPS.set([...eps, {count: errorCount, time: stopwatch}]);
    }

    const correcCount = typedTextLength - errorCount;
    const cps = $correctCPS.get();
    if(cps.length === 0 || cps[cps.length -1].time !== stopwatch) {
        $correctCPS.set([...cps, {count: correcCount, time: stopwatch}]);
    }
})

export const $rawCPM = computed($rawCPS, (cps) => {
    // characters per minute
    if (cps.length === 0) return 0;
    const latestSample = cps[cps.length -1];
    const cpm = latestSample.count * (60 / (latestSample.time || 1));
    return Math.ceil(cpm);
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

effect([$config], (config) => {
    if (typeof window === "undefined") return;
    // reset the analytics trace
    $typingTrace.set([]);
    // reset the raw cps
    $rawCPS.set([]);
    // reset the error cps
    $errorCPS.set([]);
});
