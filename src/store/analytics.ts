import { atom, computed, effect, onSet } from "nanostores";
import { $kbSentence, $kbSentenceWords, $kbTypedText, $kbTypedWords, $kbTypingState, $stopwatch } from "./keyboard";
import { KBTYPINGSTATE } from "@/constants/keyboardState";
import { $config } from "./config";
import { addSession } from "./history";
import { saveKeypressAttempt } from "./keypressAnalytics";
import {
    aggregateKeyStats,
    diffTypedText,
    type KeypressEvent,
} from "@/lib/keypressStats";

export const $keypressEvents = atom<KeypressEvent[]>([]);

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
    // update CPS & error samples every ANALYTICS_SAMPLE_INTERVAL_S (0.2s)
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

let previousTypedText = "";

const resetKeypressCapture = () => {
    previousTypedText = "";
    $keypressEvents.set([]);
};

onSet($kbTypedText, ({ newValue }) => {
    if (typeof window === "undefined") return;
    if ($kbTypingState.get() === KBTYPINGSTATE.COMPLETED) {
        previousTypedText = newValue;
        return;
    }

    const current = $keypressEvents.get();
    const lastEventTime = current[current.length - 1]?.time ?? 0;
    const events = diffTypedText(
        previousTypedText,
        newValue,
        $kbSentence.get(),
        lastEventTime,
        Date.now(),
    );
    previousTypedText = newValue;

    if (events.length > 0) {
        $keypressEvents.set([...current, ...events]);
    }
});

effect([$config], () => {
    if (typeof window === "undefined") return;
    resetKeypressCapture();
    $rawCPS.set([]);
    $errorCPS.set([]);
});

/**
 * Automatically saves typing session to history when completed
 * Only saves sessions with valid data (WPM > 0, duration > 0)
 */
effect([$kbTypingState], (typingState) => {
    if (typeof window === "undefined") return;
    
    if (typingState === KBTYPINGSTATE.COMPLETED) {
        try {
            const wpm = $rawWPM.get();
            const cpm = $rawCPM.get();
            const accuracy = $accuracy.get();
            const errorCPS = $errorCPS.get();
            const errors = errorCPS[errorCPS.length - 1]?.count || 0;
            const duration = $stopwatch.get();
            const mode = $config.get().mode;
            const timestamp = Date.now();
            const sessionId = `${timestamp}-${Math.random().toString(36).substring(2, 11)}`;

            // Validate data before saving
            if (wpm > 0 && duration > 0 && accuracy >= 0 && accuracy <= 100) {
                addSession({
                    id: sessionId,
                    timestamp,
                    wpm,
                    cpm,
                    accuracy,
                    errors,
                    duration,
                    mode
                });
                saveKeypressAttempt({
                    sessionId,
                    timestamp,
                    keys: aggregateKeyStats($keypressEvents.get()),
                });
            } else {
                console.warn("Invalid session data, skipping history save", {
                    wpm, duration, accuracy
                });
            }
        } catch (error) {
            console.error("Failed to save typing session to history:", error);
        }
    }
});
