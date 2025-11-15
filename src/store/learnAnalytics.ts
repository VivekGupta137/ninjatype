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
import { $learnKbSentence, $learnKbTypedText, $learnKbTypingState, $learnStopwatch } from "./learnKeyboard";

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
export const $learnAccuracy = computed([$learnErrorCPS], (errorCPS) => {
    const latestErrors = errorCPS[errorCPS.length - 1];
    const typedText = $learnKbTypedText.get();
    const typedTextLength = typedText.length;
    if (!latestErrors || typedTextLength === 0) return 100;
    const errorCount = latestErrors.count;
    const accuracy = ((typedTextLength - errorCount) / typedTextLength) * 100;
    return Math.max(0, Math.min(100, Math.round(accuracy)));
});

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
export const $learnRawWPM = computed([$learnRawCPM], (rawCPM) => {
    if (!rawCPM) return 0;
    return Math.ceil(rawCPM / 5);
});

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
