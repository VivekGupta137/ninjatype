import { persistentAtom } from "@nanostores/persistent";
import type { FingerType } from "@/constants/fingerKeys";

/**
 * LocalStorage key for persisting learn progress
 */
const LEARN_PROGRESS_KEY = "learn-progress";

/**
 * Minimum accuracy threshold to mark a lesson as completed
 */
const COMPLETION_ACCURACY_THRESHOLD = 70;

/**
 * Progress data for a single finger lesson
 */
export interface FingerProgress {
    /** Highest WPM (Words Per Minute) achieved for this finger */
    bestWPM: number;
    /** Highest accuracy percentage achieved for this finger */
    bestAccuracy: number;
    /** Whether the lesson has been completed (accuracy >= 70%) */
    completed: boolean;
}

/**
 * Overall learn progress state tracking all four finger lessons
 */
export interface LearnProgress {
    pointer: FingerProgress;
    middle: FingerProgress;
    ring: FingerProgress;
    pinky: FingerProgress;
}

/**
 * Default state for a new finger lesson
 */
const defaultFingerProgress: FingerProgress = {
    bestWPM: 0,
    bestAccuracy: 0,
    completed: false
};

/**
 * Default learn progress for all fingers
 */
export const defaultLearnProgress: LearnProgress = {
    pointer: { ...defaultFingerProgress },
    middle: { ...defaultFingerProgress },
    ring: { ...defaultFingerProgress },
    pinky: { ...defaultFingerProgress }
};

/**
 * Persistent store for learn progress
 * Automatically syncs with localStorage using @nanostores/persistent
 * 
 * The store will:
 * - Load from localStorage on initialization
 * - Save to localStorage automatically on every change
 * - Handle serialization/deserialization
 * - Gracefully handle errors and invalid data
 */
export const $learnProgress = persistentAtom<LearnProgress>(
    LEARN_PROGRESS_KEY,
    defaultLearnProgress,
    {
        encode: JSON.stringify,
        decode: (value: string) => {
            try {
                const parsed = JSON.parse(value);
                
                // Validate the data structure
                if (!parsed || typeof parsed !== 'object') {
                    console.warn("Invalid learn progress data, resetting to default");
                    return defaultLearnProgress;
                }
                
                // Migration: Handle old "index" key and convert to "pointer"
                if ('index' in parsed && !('pointer' in parsed)) {
                    parsed.pointer = parsed.index;
                    delete parsed.index;
                    console.log("Migrated learn progress from 'index' to 'pointer'");
                }
                
                // Merge with defaults to handle schema changes
                return { ...defaultLearnProgress, ...parsed };
            } catch (error) {
                console.error("Failed to decode learn progress:", error);
                return defaultLearnProgress;
            }
        }
    }
);

/**
 * Update progress for a specific finger lesson
 * Automatically saves the best WPM and accuracy achieved
 * Marks lesson as completed when accuracy threshold is met
 * 
 * @param finger - The finger type to update (index, middle, ring, or pinky)
 * @param wpm - Current typing speed in words per minute
 * @param accuracy - Current accuracy percentage (0-100)
 * 
 * @example
 * updateFingerProgress('index', 35, 85);
 * // Updates index finger: best WPM to 35, accuracy to 85%, marks as completed
 */
export const updateFingerProgress = (
    finger: FingerType,
    wpm: number,
    accuracy: number
) => {
    const currentProgress = $learnProgress.get();
    const fingerProgress = currentProgress[finger];
    
    // Keep the best WPM across all attempts
    const bestWPM = Math.max(fingerProgress.bestWPM, wpm);
    
    // Keep the best accuracy across all attempts
    const bestAccuracy = Math.max(fingerProgress.bestAccuracy, accuracy);
    
    // Mark as completed if accuracy threshold is met
    const completed = fingerProgress.completed || accuracy >= COMPLETION_ACCURACY_THRESHOLD;
    
    $learnProgress.set({
        ...currentProgress,
        [finger]: {
            bestWPM,
            bestAccuracy,
            completed
        }
    });
};

/**
 * Get progress data for a specific finger
 * 
 * @param finger - The finger type to retrieve progress for
 * @returns The progress data for the specified finger
 * 
 * @example
 * const indexProgress = getFingerProgress('index');
 * console.log(indexProgress.bestWPM); // 35
 */
export const getFingerProgress = (finger: FingerType): FingerProgress => {
    return $learnProgress.get()[finger];
};

/**
 * Reset progress for a specific finger to initial state
 * Useful for allowing users to restart a lesson
 * 
 * @param finger - The finger type to reset
 * 
 * @example
 * resetFingerProgress('index');
 * // Resets index finger progress to: bestWPM: 0, bestAccuracy: 0, completed: false
 */
export const resetFingerProgress = (finger: FingerType) => {
    const currentProgress = $learnProgress.get();
    $learnProgress.set({
        ...currentProgress,
        [finger]: { ...defaultFingerProgress }
    });
};

/**
 * Reset all learn progress to initial state
 * Clears all finger lesson data
 * 
 * @example
 * resetAllLearnProgress();
 * // All fingers reset to default state
 */
export const resetAllLearnProgress = () => {
    $learnProgress.set(defaultLearnProgress);
};

/**
 * Check if all four finger lessons have been completed
 * Used to determine when to show the TypeNinja achievement
 * 
 * @returns true if all fingers are completed, false otherwise
 * 
 * @example
 * if (areAllFingersCompleted()) {
 *   console.log("TypeNinja badge unlocked!");
 * }
 */
export const areAllFingersCompleted = (): boolean => {
    const progress = $learnProgress.get();
    const fingers: FingerType[] = ['pointer', 'middle', 'ring', 'pinky'];
    return fingers.every(finger => progress[finger].completed);
};
