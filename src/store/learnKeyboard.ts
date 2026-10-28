import { effect } from 'nanostores';
import { KBTYPINGSTATE } from '@/constants/keyboardState';
import type { FingerType } from '@/constants/fingerKeys';
import { generateLevelSentence, getFingerLevel } from '@/constants/fingerLessons';
import { getFingerProgress, updateFingerProgress } from './learn';
import { getLearnSessionMetrics, resetLearnAnalytics } from './learnAnalytics';
import { captureLearnKeys, emptyLearnKeyCapture } from '@/lib/learnKeyFeedback';
import {
    $learnKbTypingState, $learnKbSentence, $learnKbTypedText,
    $learnStopwatch, $learnKeys, $learnCurrentFinger, $learnCurrentLevel,
    $learnStartedAt, $learnSessionResult, $learnKeyCapture,
} from './learnKeyboardState';

export {
    $learnKbState, $learnKbTypingState, $learnKbSentence, $learnKbTypedText,
    $learnStopwatch, $learnKeys, $learnCurrentFinger, $learnCurrentLevel,
    $learnStartedAt, $learnSessionResult,
    type LearnKeyState,
} from './learnKeyboardState';

const MAX_TYPING_TIME_SECONDS = 600;
effect([$learnStopwatch, $learnKbTypingState], (stopwatch, typingState) => {
    if (typeof window === 'undefined' || typingState !== KBTYPINGSTATE.TYPING || stopwatch >= MAX_TYPING_TIME_SECONDS) return;
    const timer = setTimeout(() => $learnStopwatch.set(stopwatch + 1), 1000);
    return () => clearTimeout(timer);
});

let previousCapturedText = '';
// Capture before completion saves the drill, including its final keystroke.
effect([$learnKbTypedText], typedText => {
    if (typeof window === 'undefined') return;
    if (!typedText && !$learnKbSentence.get()) {
        previousCapturedText = '';
        $learnKeyCapture.set(emptyLearnKeyCapture());
        return;
    }
    if ($learnKbTypingState.get() === KBTYPINGSTATE.COMPLETED) return;
    $learnKeyCapture.set(captureLearnKeys($learnKeyCapture.get(), previousCapturedText, typedText, $learnKbSentence.get(), performance.now()));
    previousCapturedText = typedText;
});

// Finish exactly once, using the final text rather than the last timer sample.
// A finger change cannot re-award the previous finger's completed attempt.
effect([$learnKbSentence, $learnKbTypedText], (sentence, typedText) => {
    if (typeof window === 'undefined' || !sentence || !typedText || $learnKbTypingState.get() === KBTYPINGSTATE.COMPLETED) return;
    if ($learnStartedAt.get() === null) $learnStartedAt.set(performance.now());
    if (typedText.length >= sentence.length) {
        const elapsed = (performance.now() - $learnStartedAt.get()!) / 1000;
        const metrics = getLearnSessionMetrics(sentence, typedText, elapsed);
        const finger = $learnCurrentFinger.get();
        const outcome = updateFingerProgress(finger, metrics.wpm, metrics.accuracy, $learnCurrentLevel.get(), $learnKeyCapture.get().keys);
        $learnSessionResult.set({ ...outcome, finger, ...metrics });
        $learnKbTypingState.set(KBTYPINGSTATE.COMPLETED);
    } else if ($learnKbTypingState.get() === KBTYPINGSTATE.IDLE) {
        $learnKbTypingState.set(KBTYPINGSTATE.TYPING);
    }
});

export const startLearnPractice = (finger: FingerType, requestedLevel?: number) => {
    const savedLevel = getFingerProgress(finger).currentLevel;
    if (requestedLevel !== undefined && (!Number.isInteger(requestedLevel) || requestedLevel < 1 || requestedLevel > savedLevel)) return;
    // Clear the old attempt before changing its finger or level.
    $learnKbSentence.set('');
    $learnKbTypedText.set('');
    $learnKbTypingState.set(KBTYPINGSTATE.IDLE);
    $learnStartedAt.set(null);
    $learnSessionResult.set(null);
    previousCapturedText = '';
    $learnKeyCapture.set(emptyLearnKeyCapture());
    $learnStopwatch.set(0);
    resetLearnAnalytics();
    const level = requestedLevel ?? savedLevel;
    $learnCurrentFinger.set(finger);
    $learnCurrentLevel.set(level);
    $learnKeys.set(getFingerLevel(finger, level).keys.map(key => ({ key, active: true })));
    $learnKbSentence.set(generateLevelSentence(finger, level));
};

export const regenerateLearnSentence = () => startLearnPractice($learnCurrentFinger.get(), $learnCurrentLevel.get());
