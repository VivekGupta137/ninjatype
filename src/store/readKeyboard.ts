/**
 * Keyboard Store for Read/Speech Practice Feature
 * 
 * Manages sentence generation and state for the read feature where users
 * practice reading text aloud and get scored on accuracy and clarity.
 * 
 * @module readKeyboard
 */

import { effect } from "nanostores";
import { KBTYPINGSTATE } from "@/constants/keyboardState";
import { createSentenceFromWords } from "@/util/sentence";
import { resetReadAnalytics } from "./readAnalytics";
import {
    $readKbTypingState,
    $readKbSentence,
    $readKbTranscribedText,
    $readStopwatch,
} from "./readKeyboardState";

// Re-export for convenience
export {
    $readKbTypingState,
    $readKbSentence,
    $readKbTranscribedText,
    $readStopwatch,
};

/**
 * Maximum recording time in seconds (5 minutes)
 */
const MAX_RECORDING_TIME_SECONDS = 300;

/**
 * Number of words in each practice sentence
 */
const PRACTICE_WORD_COUNT = 15;

/**
 * Effect to increment stopwatch every second while recording
 * Stops at MAX_RECORDING_TIME_SECONDS or when recording is completed
 */
effect([$readStopwatch, $readKbTypingState], (stopwatch, typingState) => {
    if (typeof window === "undefined") return;
    
    if (typingState === KBTYPINGSTATE.TYPING) {
        if (stopwatch >= MAX_RECORDING_TIME_SECONDS) {
            return;
        }
        const timer = setTimeout(() => {
            $readStopwatch.set(stopwatch + 1);
        }, 1000);
        
        return () => clearTimeout(timer);
    }
});

/**
 * Generate a new practice sentence from word list
 * Fetches words and creates a sentence for reading practice
 */
export const generateReadSentence = async () => {
    try {
        // Fetch words from the API
        const response = await fetch('/api/words/1000');
        const wordData = await response.json();
        
        // Create sentence from words
        const sentence = createSentenceFromWords(wordData, PRACTICE_WORD_COUNT);
        
        // Reset state and set new sentence
        $readKbTranscribedText.set("");
        $readKbTypingState.set(KBTYPINGSTATE.IDLE);
        $readStopwatch.set(0);
        $readKbSentence.set(sentence);
        resetReadAnalytics();
    } catch (error) {
        console.error("Failed to generate read sentence:", error);
        // Fallback to a simple sentence
        $readKbSentence.set("The quick brown fox jumps over the lazy dog");
    }
};

/**
 * Reset the read practice session
 * Regenerates sentence and resets all state
 */
export const resetReadPractice = () => {
    generateReadSentence();
};
