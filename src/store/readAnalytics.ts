/**
 * Analytics Store for Read/Speech Practice Feature
 * 
 * Tracks accuracy and clarity metrics for speech-to-text practice.
 * 
 * @module readAnalytics
 */

import { atom, computed, effect } from "nanostores";
import { KBTYPINGSTATE } from "@/constants/keyboardState";
import { $readKbSentence, $readKbTranscribedText, $readStopwatch, $readConfidenceScores, $readKbTypingState } from "./readKeyboardState";

/**
 * Accuracy percentage for current read practice session
 * Calculated by comparing transcribed text with target sentence
 */
export const $readAccuracy = computed([$readKbTranscribedText, $readKbSentence], (transcribed, sentence) => {
    if (!transcribed || !sentence || transcribed.length === 0) return 100;
    
    // Normalize both texts for comparison (lowercase, remove extra spaces)
    const normalizedTranscribed = transcribed.toLowerCase().trim().replace(/\s+/g, ' ');
    const normalizedSentence = sentence.toLowerCase().trim().replace(/\s+/g, ' ');
    
    // Calculate Levenshtein distance for accuracy
    const distance = levenshteinDistance(normalizedTranscribed, normalizedSentence);
    const maxLength = Math.max(normalizedTranscribed.length, normalizedSentence.length);
    
    if (maxLength === 0) return 100;
    
    const accuracy = ((maxLength - distance) / maxLength) * 100;
    return Math.max(0, Math.min(100, Math.round(accuracy)));
});

/**
 * Clarity percentage based on speech recognition confidence scores
 * Average of all confidence scores from the speech recognition API
 */
export const $readClarity = computed([$readConfidenceScores], (scores) => {
    if (!scores || scores.length === 0) return 100;
    
    const sum = scores.reduce((acc, score) => acc + score, 0);
    const average = sum / scores.length;
    
    // Convert confidence (0-1) to percentage (0-100)
    return Math.round(average * 100);
});

/**
 * Overall score combining accuracy and clarity
 * Weighted average: 60% accuracy, 40% clarity
 */
export const $readOverallScore = computed([$readAccuracy, $readClarity], (accuracy, clarity) => {
    return Math.round(accuracy * 0.6 + clarity * 0.4);
});

/**
 * Effect to check for completion
 * Monitors transcribed text against target sentence
 */
effect([$readKbSentence, $readKbTranscribedText, $readKbTypingState], (sentence, transcribedText, typingState) => {
    if (!sentence || !transcribedText || typingState !== KBTYPINGSTATE.TYPING) return;
    
    // Normalize for comparison
    const normalizedTranscribed = transcribedText.toLowerCase().trim().replace(/\s+/g, ' ');
    const normalizedSentence = sentence.toLowerCase().trim().replace(/\s+/g, ' ');
    
    // Check if transcribed text matches sentence (allowing for slight differences)
    const targetWords = normalizedSentence.split(' ').filter(w => w.length > 0);
    const transcribedWords = normalizedTranscribed.split(' ').filter(w => w.length > 0);
    
    // Consider complete if we have at least 80% of the words
    if (transcribedWords.length >= Math.ceil(targetWords.length * 0.8)) {
        // Check if the transcribed text is reasonably close to the target
        // Use a simple word overlap check
        const matchingWords = transcribedWords.filter((word, index) => {
            // Check if word matches or is close to target word at similar position
            const targetIndex = Math.min(index, targetWords.length - 1);
            const targetWord = targetWords[targetIndex];
            return word === targetWord || word.includes(targetWord) || targetWord.includes(word);
        });
        
        // If at least 70% of words match, consider it complete
        if (matchingWords.length >= Math.ceil(targetWords.length * 0.7)) {
            $readKbTypingState.set(KBTYPINGSTATE.COMPLETED);
        }
    }
});

/**
 * Calculate Levenshtein distance between two strings
 * Used for accuracy calculation
 */
function levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}

/**
 * Reset all read analytics stores to initial state
 * Called when starting a new practice session
 */
export const resetReadAnalytics = () => {
    $readConfidenceScores.set([]);
};
