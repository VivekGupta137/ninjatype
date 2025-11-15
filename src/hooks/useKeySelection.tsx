/**
 * Custom Hook for Key Management in Learn Practice
 * 
 * Manages the enabled/disabled state of keyboard keys for practice customization.
 * Provides utilities for toggling keys and generating practice text with selected keys.
 * 
 * @module useKeySelection
 */

import { useState, useCallback, useMemo } from "react";
import { generateFingerSentence } from "@/util/sentence";
import type { FingerType } from "@/constants/fingerKeys";

interface UseKeySelectionProps {
    /** The finger type being practiced */
    finger: FingerType;
    /** All available keys for this finger */
    fingerKeys: string[];
    /** Number of words to generate in practice sentences */
    wordCount: number;
}

interface UseKeySelectionReturn {
    /** Set of keys that are currently disabled */
    disabledKeys: Set<string>;
    /** Array of keys that are currently enabled (not disabled) */
    enabledKeys: string[];
    /** Toggle a key's enabled/disabled state */
    toggleKey: (key: string) => void;
    /** Check if a specific key is disabled */
    isKeyDisabled: (key: string) => boolean;
    /** Generate a practice sentence using only enabled keys */
    generatePracticeSentence: () => string;
}

/**
 * Hook for managing key selection and practice text generation
 * 
 * @param props - Hook configuration
 * @returns Key management utilities and state
 * 
 * @example
 * const { enabledKeys, toggleKey, generatePracticeSentence } = useKeySelection({
 *   finger: 'index',
 *   fingerKeys: ['f', 'g', 'h', 'j'],
 *   wordCount: 10
 * });
 */
export const useKeySelection = ({
    finger,
    fingerKeys,
    wordCount
}: UseKeySelectionProps): UseKeySelectionReturn => {
    // ========== State ==========
    const [disabledKeys, setDisabledKeys] = useState<Set<string>>(new Set());

    // ========== Computed Values ==========
    
    /**
     * Keys that are currently enabled (not disabled by user)
     * These keys will be used in practice text generation
     */
    const enabledKeys = useMemo(() => {
        return fingerKeys.filter(key => !disabledKeys.has(key));
    }, [fingerKeys, disabledKeys]);

    // ========== Actions ==========
    
    /**
     * Toggle a key's enabled/disabled state
     * Disabled keys are excluded from practice text generation
     * 
     * @param key - The keyboard key to toggle
     */
    const toggleKey = useCallback((key: string) => {
        setDisabledKeys(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    }, []);

    /**
     * Check if a specific key is currently disabled
     * 
     * @param key - The keyboard key to check
     * @returns true if disabled, false if enabled
     */
    const isKeyDisabled = useCallback((key: string) => {
        return disabledKeys.has(key);
    }, [disabledKeys]);

    /**
     * Generate a practice sentence using only enabled keys
     * Falls back to all keys if no keys are enabled (prevents empty practice)
     * 
     * @returns A random sentence for typing practice
     */
    const generatePracticeSentence = useCallback(() => {
        // Fallback: Use all keys if none are enabled
        if (enabledKeys.length === 0) {
            console.warn('No keys enabled, using all keys as fallback');
            return generateFingerSentence(finger, wordCount);
        }
        
        // Generate sentence with only enabled keys
        return generateFingerSentence(finger, wordCount, enabledKeys);
    }, [finger, wordCount, enabledKeys]);

    return {
        disabledKeys,
        enabledKeys,
        toggleKey,
        isKeyDisabled,
        generatePracticeSentence
    };
};
