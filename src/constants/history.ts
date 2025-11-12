/**
 * Constants for typing history feature
 */

/**
 * Maximum number of sessions to store before auto-trimming
 * Prevents localStorage from filling up
 */
export const MAX_HISTORY_SESSIONS = 1000;

/**
 * localStorage key for storing typing session history
 */
export const HISTORY_STORAGE_KEY = "history:sessions";

/**
 * Time range options with their corresponding day values
 */
export const TIME_RANGES = {
    ONE_DAY: 1,
    SEVEN_DAYS: 7,
    TWO_WEEKS: 14,
    ONE_MONTH: 30,
} as const;

/**
 * Minimum valid values for session data
 */
export const SESSION_VALIDATION = {
    MIN_WPM: 0,
    MIN_DURATION: 0,
    MIN_ACCURACY: 0,
    MAX_ACCURACY: 100,
} as const;
