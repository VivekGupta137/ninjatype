/**
 * Keyboard Store for Learn Touch Typing Feature
 * 
 * Separate keyboard state management for the learn feature to avoid
 * conflicts with the main typing interface on the homepage.
 * 
 * This mirrors the structure of the main keyboard store but operates
 * independently for the /learn routes.
 * 
 * @module learnKeyboard
 */

import { effect } from "nanostores";
import { KBTYPINGSTATE } from "@/constants/keyboardState";
import type { FingerType } from "@/constants/fingerKeys";
import { generateFingerSentence } from "@/util/sentence";
import { updateFingerProgress } from "./learn";
import { $learnRawWPM, $learnAccuracy, resetLearnAnalytics } from "./learnAnalytics";
import {
    $learnKbState,
    $learnKbTypingState,
    $learnKbSentence,
    $learnKbTypedText,
    $learnStopwatch,
    $learnKeys,
    $learnCurrentFinger,
    type LearnKeyState
} from "./learnKeyboardState";

// Re-export for convenience
export {
    $learnKbState,
    $learnKbTypingState,
    $learnKbSentence,
    $learnKbTypedText,
    $learnStopwatch,
    $learnKeys,
    $learnCurrentFinger,
    type LearnKeyState
};

/**
 * Maximum typing time in seconds (10 minutes)
 */
const MAX_TYPING_TIME_SECONDS = 600;

/**
 * Number of words in each practice sentence
 */
const PRACTICE_WORD_COUNT = 10;

/**
 * Effect to increment stopwatch every second while typing
 * Stops at MAX_TYPING_TIME_SECONDS or when typing is completed
 */
effect([$learnStopwatch, $learnKbTypingState], (stopwatch, typingState) => {
    if (typeof window === "undefined") return;
    
    if (typingState === KBTYPINGSTATE.TYPING) {
        if (stopwatch >= MAX_TYPING_TIME_SECONDS) {
            return;
        }
        const timer = setTimeout(() => {
            $learnStopwatch.set(stopwatch + 1);
        }, 1000);
        
        return () => clearTimeout(timer);
    }
});

/**
 * Effect to check for typing completion and state transitions
 * Monitors typed text against target sentence
 */
effect([$learnKbSentence, $learnKbTypedText], (sentence, typedText) => {
    // Check for completion based on word count and last word length
    const targetWords = sentence.trim().split(" ");
    const typedWords = typedText.trim().split(" ");
    
    if (typedWords.length === targetWords.length && 
        typedWords[typedWords.length - 1].length === targetWords[targetWords.length - 1].length &&
        typedText.length > 0) {
        $learnKbTypingState.set(KBTYPINGSTATE.COMPLETED);
    }
    // Start typing state on first character
    else if (typedText.length > 0 && $learnKbTypingState.get() === KBTYPINGSTATE.IDLE) {
        $learnKbTypingState.set(KBTYPINGSTATE.TYPING);
    }
});

/**
 * Effect to monitor key list changes and regenerate practice sentence
 * Automatically resets keyboard state and generates new sentence when keys are toggled
 */
effect([$learnKeys, $learnCurrentFinger], (keys, finger) => {
    if (typeof window === "undefined") return;
    if (keys.length === 0) return;
    
    // Reset analytics for fresh stats
    resetLearnAnalytics();
    
    // Get active keys for sentence generation
    const activeKeys = keys.filter((k: LearnKeyState) => k.active).map((k: LearnKeyState) => k.key);
    const allowedKeys = activeKeys.length > 0 ? activeKeys : undefined;
    
    // Generate new sentence with active keys
    const newSentence = generateFingerSentence(finger, PRACTICE_WORD_COUNT, allowedKeys);
    
    // Reset keyboard state and set new sentence
    $learnKbTypedText.set("");
    $learnKbTypingState.set(KBTYPINGSTATE.IDLE);
    $learnStopwatch.set(0);
    $learnKbSentence.set(newSentence);
});

/**
 * Effect to handle practice completion and update progress
 * Automatically saves progress when user completes a practice session
 */
effect([$learnKbTypingState, $learnCurrentFinger], (typingState, finger) => {
    if (typeof window === "undefined") return;
    if (typingState !== KBTYPINGSTATE.COMPLETED) return;
    
    // Get current WPM and accuracy
    const wpm = $learnRawWPM.get();
    const accuracy = $learnAccuracy.get();
    
    // Update progress
    updateFingerProgress(finger, wpm, accuracy);
});

/**
 * Toggle a key's active status
 * Updates the key's active state and triggers sentence regeneration
 * 
 * @param key - The key character to toggle
 */
export const toggleLearnKey = (key: string) => {
    const currentKeys = $learnKeys.get();
    const updatedKeys = currentKeys.map(k => 
        k.key === key ? { ...k, active: !k.active } : k
    );
    $learnKeys.set(updatedKeys);
};

/**
 * Initialize keys for a finger
 * Sets up the initial key list with all keys active and sets the current finger
 * 
 * @param keys - Array of key characters for the finger
 * @param finger - The finger type these keys belong to
 */
export const initializeLearnKeys = (keys: string[], finger: FingerType) => {
    const keyStates: LearnKeyState[] = keys.map(key => ({
        key,
        active: true
    }));
    $learnCurrentFinger.set(finger);
    $learnKeys.set(keyStates);
};

/**
 * Regenerate practice sentence with current key selection
 * Triggers the effect to generate a new sentence while maintaining key states
 */
export const regenerateLearnSentence = () => {
    // Toggle keys to trigger the effect (set to same value)
    const currentKeys = $learnKeys.get();
    $learnKeys.set([...currentKeys]);
};
