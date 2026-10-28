/**
 * Analytics Store for Learn Touch Typing Feature
 * 
 * Separate analytics state management for the learn feature to avoid
 * conflicts with the main typing interface analytics.
 * 
 * Tracks WPM and accuracy independently for finger practice sessions.
 * Uses effect-based calculations similar to the main analytics store.
 * 
 * @module learnAnalytics
 */

import { atom, computed, effect } from "nanostores";
import { $learnKbSentence, $learnKbTypedText, $learnStopwatch, $learnStartedAt, $learnSessionResult } from "./learnKeyboardState";

export const getLearnSessionMetrics = (sentence: string, typedText: string, elapsed: number) => {
    let correct = 0;
    for (let i = 0; i < typedText.length; i++) if (typedText[i] === sentence[i]) correct++;
    return {
        wpm: typedText.length ? Math.floor(typedText.length * 12 / Math.max(1, elapsed)) : 0,
        // Round down so 94.9% cannot pass a 95% mastery requirement.
        accuracy: typedText.length ? Math.floor(correct / typedText.length * 1000) / 10 : 100,
    };
};

/**
 * Raw characters per second samples
 * Tracks character count at each second interval
 */
export const $learnRawCPS = atom<{count: number; time: number}[]>([]);

/**
 * Error count samples
 * Tracks number of errors at each second interval
 */
export const $learnErrorCPS = atom<{time: number; count: number}[]>([]);

/**
 * Correct characters per second samples
 * Tracks correct character count at each second interval
 */
export const $learnCorrectCPS = atom<{time: number; count: number}[]>([]);

/**
 * Accuracy percentage for current learn practice session
 * Calculated as (correct characters / total characters) * 100
 */
export const $learnAccuracy = computed([$learnKbSentence, $learnKbTypedText], (sentence, typedText) =>
    getLearnSessionMetrics(sentence, typedText, 1).accuracy);

/**
 * Raw characters per minute
 * Calculated from the latest CPS sample
 */
export const $learnRawCPM = computed($learnRawCPS, (cps) => {
    if (cps.length === 0) return 0;
    const latestSample = cps[cps.length - 1];
    const cpm = latestSample.count * (60 / (latestSample.time || 1));
    return Math.ceil(cpm);
});

/**
 * Raw WPM (Words Per Minute) for current learn practice session
 * Calculated as CPM / 5 (standard: 5 characters = 1 word)
 */
export const $learnRawWPM = computed([$learnKbSentence, $learnKbTypedText, $learnStopwatch, $learnStartedAt, $learnSessionResult], (sentence, typedText, _stopwatch, startedAt, result) =>
    result?.wpm ?? (startedAt === null ? 0 : getLearnSessionMetrics(sentence, typedText, (performance.now() - startedAt) / 1000).wpm));

/**
 * Effect to update CPS and error samples every second
 * Calculates errors by comparing typed text with target sentence
 */
effect([$learnStopwatch], (stopwatch) => {
    const typedText = $learnKbTypedText.get();
    const typedTextLength = typedText.length;
    
    // Update raw CPS
    const latestCPS = $learnRawCPS.get();
    if (latestCPS.length === 0 || latestCPS[latestCPS.length - 1].time !== stopwatch) {
        $learnRawCPS.set([...latestCPS, {count: typedTextLength, time: stopwatch}]);
    }

    // Count errors by comparing with target sentence
    const sentence = $learnKbSentence.get();
    let errorCount = 0;
    for (let i = 0; i < typedTextLength; i++) {
        if (typedText[i] !== sentence[i]) {
            errorCount += 1;
        }
    }

    // Update error CPS
    const eps = $learnErrorCPS.get();
    if (eps.length === 0 || eps[eps.length - 1].time !== stopwatch) {
        $learnErrorCPS.set([...eps, {count: errorCount, time: stopwatch}]);
    }

    // Update correct CPS
    const correctCount = typedTextLength - errorCount;
    const cps = $learnCorrectCPS.get();
    if (cps.length === 0 || cps[cps.length - 1].time !== stopwatch) {
        $learnCorrectCPS.set([...cps, {count: correctCount, time: stopwatch}]);
    }
});

/**
 * Reset all learn analytics stores to initial state
 * Called when starting a new practice session
 */
export const resetLearnAnalytics = () => {
    $learnRawCPS.set([]);
    $learnErrorCPS.set([]);
    $learnCorrectCPS.set([]);
};
