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

import { atom, effect } from "nanostores";
import { KBSTATE, KBTYPINGSTATE } from "@/constants/keyboardState";

/**
 * Maximum typing time in seconds (10 minutes)
 */
const MAX_TYPING_TIME_SECONDS = 600;

/**
 * Current keyboard focus state for learn practice
 * Controls whether the typing area is active
 */
export const $learnKbState = atom<KBSTATE>(KBSTATE.NOT_FOCUSSED);

/**
 * Current typing state for learn practice
 * Tracks whether user is idle, typing, or has completed
 */
export const $learnKbTypingState = atom<KBTYPINGSTATE>(KBTYPINGSTATE.IDLE);

/**
 * The sentence being typed in learn practice
 * Contains the finger-specific practice text
 */
export const $learnKbSentence = atom<string>("");

/**
 * The text the user has typed so far in learn practice
 * Used for real-time comparison with the target sentence
 */
export const $learnKbTypedText = atom<string>("");

/**
 * Stopwatch tracking elapsed time in seconds
 * Updates every second while typing is in progress
 */
export const $learnStopwatch = atom<number>(0);

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
 * Reset all learn keyboard stores to initial state
 * Useful when switching between fingers or starting new practice
 */
export const resetLearnKeyboardStores = () => {
    $learnKbTypingState.set(KBTYPINGSTATE.IDLE);
    $learnKbSentence.set("");
    $learnKbTypedText.set("");
    $learnStopwatch.set(0);
};
