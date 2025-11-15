/**
 * Star Badge System for Touch Typing Practice
 * 
 * Defines achievement system based on typing speed (WPM) with color-coded star tiers
 * and accuracy penalties.
 * 
 * Star Calculation:
 * - 1 star earned for every 2 WPM increase (e.g., 1-10 WPM = 5 stars)
 * - Accuracy penalties reduce star count
 * - Minimum 40% accuracy required to earn any stars
 * 
 * Color Tiers:
 * - White: 1-5 stars
 * - Green: 6-10 stars
 * - Yellow: 11-15 stars
 * - Orange: 16-20 stars
 * - Red: 21+ stars
 * 
 * @module badges
 */

import { Crown } from 'lucide-react';

/**
 * Star color tiers based on star count
 */
export type StarTier = 'white' | 'green' | 'yellow' | 'orange' | 'red';

/**
 * Star rating information with count and color tier
 */
export interface StarRating {
    /** Total number of stars earned (after accuracy penalty) */
    stars: number;
    /** Color tier based on star count */
    tier: StarTier;
    /** Base stars before accuracy penalty */
    baseStars: number;
    /** Number of stars deducted due to accuracy */
    penaltyStars: number;
}

/**
 * Special achievement badge for completing all four finger lessons
 * This is the ultimate goal of the learning system
 * 
 * @example
 * <TYPE_NINJA_BADGE.icon size={24} />
 * <span>{TYPE_NINJA_BADGE.name}</span>
 */
export const TYPE_NINJA_BADGE = {
    name: 'TypeNinja',
    icon: Crown
};

/**
 * Calculate accuracy penalty in stars
 * 
 * Penalty Scale:
 * - 96-100%: 0 stars penalty
 * - 86-95%: -1 star
 * - 76-85%: -2 stars
 * - 66-75%: -3 stars
 * - 56-65%: -4 stars
 * - 46-55%: -5 stars
 * - 40-45%: -6 stars
 * - Below 40%: No stars earned (returns null)
 * 
 * @param accuracy - Accuracy percentage (0-100)
 * @returns Number of stars to deduct, or null if below minimum threshold
 * 
 * @example
 * getAccuracyPenalty(92) // Returns 1
 * getAccuracyPenalty(78) // Returns 2
 * getAccuracyPenalty(35) // Returns null (below 40%)
 */
export const getAccuracyPenalty = (accuracy: number): number | null => {
    if (accuracy < 40) return null; // Below minimum threshold
    if (accuracy >= 96) return 0;
    if (accuracy >= 86) return 1;
    if (accuracy >= 76) return 2;
    if (accuracy >= 66) return 3;
    if (accuracy >= 56) return 4;
    if (accuracy >= 46) return 5;
    return 6; // 40-45%
};

/**
 * Determine star color tier based on star count
 * 
 * @param stars - Number of stars earned
 * @returns The color tier for the star count
 * 
 * @example
 * getStarTier(3) // Returns 'white'
 * getStarTier(8) // Returns 'green'
 * getStarTier(25) // Returns 'red'
 */
export const getStarTier = (stars: number): StarTier => {
    if (stars >= 21) return 'red';
    if (stars >= 16) return 'orange';
    if (stars >= 11) return 'yellow';
    if (stars >= 6) return 'green';
    return 'white';
};

/**
 * Calculate star rating based on WPM and accuracy
 * 
 * Formula:
 * - Base stars = floor(WPM / 2)
 * - Final stars = max(0, base stars - accuracy penalty)
 * 
 * @param wpm - Words per minute typing speed
 * @param accuracy - Accuracy percentage (0-100)
 * @returns Star rating object with stars, tier, and penalty info, or null if below accuracy threshold
 * 
 * @example
 * getStarRating(14, 95) // Returns { stars: 6, tier: 'green', baseStars: 7, penaltyStars: 1 }
 * getStarRating(20, 100) // Returns { stars: 10, tier: 'green', baseStars: 10, penaltyStars: 0 }
 * getStarRating(10, 35) // Returns null (below 40% accuracy)
 */
export const getStarRating = (wpm: number, accuracy: number): StarRating | null => {
    const penalty = getAccuracyPenalty(accuracy);
    
    // Below minimum accuracy threshold
    if (penalty === null) {
        return null;
    }
    
    // Calculate base stars: 1 star per 2 WPM
    const baseStars = Math.floor(wpm / 2);
    
    // Apply accuracy penalty
    const finalStars = Math.max(0, baseStars - penalty);
    
    // Determine color tier
    const tier = getStarTier(finalStars);
    
    return {
        stars: finalStars,
        tier,
        baseStars,
        penaltyStars: penalty
    };
};

/**
 * Check if user has earned the TypeNinja badge
 * Requires completion of all four finger lessons
 * 
 * @param fingerProgress - Record of finger completion status
 * @returns true if all fingers are completed, false otherwise
 * 
 * @example
 * const progress = {
 *   index: { completed: true },
 *   middle: { completed: true },
 *   ring: { completed: true },
 *   pinky: { completed: true }
 * };
 * hasEarnedTypeNinjaBadge(progress) // true
 */
export const hasEarnedTypeNinjaBadge = (fingerProgress: Record<string, { completed: boolean }>): boolean => {
    const fingers = ['pointer', 'middle', 'ring', 'pinky'];
    return fingers.every(finger => fingerProgress[finger]?.completed);
};
