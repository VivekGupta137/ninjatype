/**
 * Badge System for Touch Typing Practice
 * 
 * Defines achievement milestones based on typing speed (WPM)
 * and special badges for completing all lessons.
 * 
 * @module badges
 */

import type { LucideIcon } from 'lucide-react';
import { Zap, Award, Trophy, Crown } from 'lucide-react';

/**
 * Badge difficulty levels
 */
export type BadgeLevel = 'beginner' | 'intermediate' | 'advanced' | 'master';

/**
 * Badge definition with level, name, requirement, and icon
 */
export interface Badge {
    /** The difficulty level of this badge */
    level: BadgeLevel;
    /** Display name for the badge */
    name: string;
    /** Minimum WPM required to earn this badge */
    minWPM: number;
    /** Lucide React icon component */
    icon: LucideIcon;
}

/**
 * Badge milestone definitions
 * Badges are earned at specific WPM thresholds
 * Users progress through levels as typing speed increases
 * 
 * Progression:
 * - 20 WPM: Speed Learner (Beginner)
 * - 30 WPM: Quick Fingers (Intermediate)
 * - 40 WPM: Cheetah Typist (Advanced)
 * - 50 WPM: TypeMaster (Master)
 * 
 * @example
 * BADGES.find(b => b.level === 'master') // { name: 'TypeMaster', minWPM: 50, ... }
 */
export const BADGES: Badge[] = [
    {
        level: 'beginner',
        name: 'Speed Learner',
        minWPM: 20,
        icon: Zap
    },
    {
        level: 'intermediate',
        name: 'Quick Fingers',
        minWPM: 30,
        icon: Award
    },
    {
        level: 'advanced',
        name: 'Cheetah Typist',
        minWPM: 40,
        icon: Trophy
    },
    {
        level: 'master',
        name: 'TypeMaster',
        minWPM: 50,
        icon: Crown
    }
];

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
 * Get the highest badge earned for a given WPM
 * Returns the badge with the highest requirement that the user has met
 * 
 * @param wpm - Current words per minute typing speed
 * @returns The highest badge earned, or null if no badges earned yet
 * 
 * @example
 * getBadgeForWPM(35) // Returns 'Quick Fingers' badge (30 WPM)
 * getBadgeForWPM(15) // Returns null (below 20 WPM minimum)
 * getBadgeForWPM(60) // Returns 'TypeMaster' badge (50+ WPM)
 */
export const getBadgeForWPM = (wpm: number): Badge | null => {
    const earnedBadges = BADGES.filter(badge => wpm >= badge.minWPM);
    return earnedBadges.length > 0 ? earnedBadges[earnedBadges.length - 1] : null;
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
    const fingers = ['index', 'middle', 'ring', 'pinky'];
    return fingers.every(finger => fingerProgress[finger]?.completed);
};
