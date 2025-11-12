import { atom, computed, onSet } from "nanostores";
import { MAX_HISTORY_SESSIONS, HISTORY_STORAGE_KEY } from "@/constants/history";

/**
 * Represents a single typing session with performance metrics
 */
export type TypingSession = {
    /** Unix timestamp in milliseconds when the session was completed */
    timestamp: number;
    /** Words per minute */
    wpm: number;
    /** Characters per minute */
    cpm: number;
    /** Accuracy percentage (0-100) */
    accuracy: number;
    /** Number of errors made during the session */
    errors: number;
    /** Duration of the session in seconds */
    duration: number;
    /** Typing mode used (e.g., "time", "words", "quotes") */
    mode: string;
};

/**
 * Structure for storing all typing history data
 */
export type HistoryData = {
    sessions: TypingSession[];
};

const defaultHistory: HistoryData = {
    sessions: []
};

/**
 * Loads typing history from localStorage
 * @returns HistoryData object with sessions array
 */
const loadHistory = (): HistoryData => {
    if (typeof window === "undefined") return defaultHistory;
    
    try {
        const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (!stored) return defaultHistory;
        
        const parsed = JSON.parse(stored);
        
        // Validate the data structure
        if (!parsed || !Array.isArray(parsed.sessions)) {
            console.warn("Invalid history data structure, resetting to default");
            return defaultHistory;
        }
        
        return { sessions: parsed.sessions };
    } catch (error) {
        console.error("Failed to load history:", error);
        return defaultHistory;
    }
};

/**
 * Main history store
 */
export const $history = atom<HistoryData>(loadHistory());

/**
 * Automatically save history to localStorage whenever it changes
 */
onSet($history, ({ newValue }) => {
    if (typeof window === "undefined") return;
    
    try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newValue));
    } catch (error) {
        console.error("Failed to save history:", error);
        // If localStorage is full, remove oldest sessions and try again
        if (error instanceof Error && error.name === "QuotaExceededError") {
            const trimmedSessions = newValue.sessions.slice(0, MAX_HISTORY_SESSIONS / 2);
            try {
                localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify({ sessions: trimmedSessions }));
                console.warn(`History trimmed to ${trimmedSessions.length} sessions due to storage limit`);
            } catch (retryError) {
                console.error("Failed to save even after trimming:", retryError);
            }
        }
    }
});

/**
 * Adds a new typing session to history
 * @param session - The typing session to add
 */
export const addSession = (session: TypingSession): void => {
    const current = $history.get();
    const sessions = [session, ...current.sessions];
    
    // Limit total sessions to prevent storage issues
    const limitedSessions = sessions.slice(0, MAX_HISTORY_SESSIONS);
    
    $history.set({ sessions: limitedSessions });
};

/**
 * Clears all typing history
 */
export const clearHistory = (): void => {
    $history.set(defaultHistory);
};

/**
 * Filters sessions within a specific date range
 * @param sessions - Array of typing sessions
 * @param days - Number of days to look back (null for all time)
 * @returns Filtered array of sessions
 */
export const getSessionsByDateRange = (
    sessions: TypingSession[], 
    days: number | null
): TypingSession[] => {
    if (days === null) return sessions;
    
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    return sessions.filter(s => s.timestamp >= cutoffTime);
};

/**
 * Gets all sessions from today (since midnight)
 * @param sessions - Array of typing sessions
 * @returns Sessions from today
 */
export const getTodaySessions = (sessions: TypingSession[]): TypingSession[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sessions.filter(s => s.timestamp >= today.getTime());
};

/**
 * Calculates average words per minute across sessions
 * @param sessions - Array of typing sessions
 * @returns Average WPM (rounded)
 */
export const calculateAvgWpm = (sessions: TypingSession[]): number => {
    if (sessions.length === 0) return 0;
    const sum = sessions.reduce((acc, s) => acc + s.wpm, 0);
    return Math.round(sum / sessions.length);
};

/**
 * Calculates average accuracy across sessions
 * @param sessions - Array of typing sessions
 * @returns Average accuracy percentage (rounded)
 */
export const calculateAvgAccuracy = (sessions: TypingSession[]): number => {
    if (sessions.length === 0) return 0;
    const sum = sessions.reduce((acc, s) => acc + s.accuracy, 0);
    return Math.round(sum / sessions.length);
};

/**
 * Calculates total time spent typing across sessions
 * @param sessions - Array of typing sessions
 * @returns Total duration in seconds
 */
export const calculateTotalTime = (sessions: TypingSession[]): number => {
    return sessions.reduce((acc, s) => acc + s.duration, 0);
};

/**
 * Finds the best (highest) WPM across sessions
 * @param sessions - Array of typing sessions
 * @returns Highest WPM value
 */
export const getBestWpm = (sessions: TypingSession[]): number => {
    if (sessions.length === 0) return 0;
    return Math.max(...sessions.map(s => s.wpm));
};

// Computed stores for commonly used data
export const $allSessions = computed($history, (history) => history.sessions);

export const $lifetimeStats = computed($allSessions, (sessions) => ({
    bestWpm: getBestWpm(sessions),
    todaysBest: getBestWpm(getTodaySessions(sessions))
}));
