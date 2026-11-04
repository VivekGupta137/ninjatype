import { atom, computed, onMount, onSet } from "nanostores";
import { MAX_HISTORY_SESSIONS, HISTORY_STORAGE_KEY } from "@/constants/history";
import { clearKeypressAnalytics } from "./keypressAnalytics";
import { collectPracticeDays, dailyStreak, isCalendarDay, localDayKey, type PracticeSettings } from "@/lib/practiceJourney";
import { personalBestSession, sessionCelebration } from "@/lib/celebrations";
import { celebrate, dismissCelebration } from "./celebrations";

/**
 * Represents a single typing session with performance metrics
 */
export type TypingSession = {
    /** Unique identifier for the session (auto-generated if not provided) */
    id?: string;
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
    /** Dictionary or quote set, when captured by newer sessions. */
    source?: string;
    /** Speed after subtracting remaining incorrect characters. */
    correctWpm?: number;
    /** Pace stability across 2-second windows (unavailable for short tests). */
    rhythm?: number;
    /** Exact solo test settings; older history remains readable without them. */
    practiceSettings?: PracticeSettings;
    /** Legacy challenge credit, retained only to preserve previously earned streak dates. */
    dailyChallengeDay?: string;
};

/**
 * Available time range filters for history view
 */
export type TimeRange = "1day" | "7days" | "2weeks" | "1month" | "all";

/**
 * Mapping of time ranges to number of days
 * Used for filtering sessions by time period
 */
export const TIME_RANGE_DAYS: Record<TimeRange, number | null> = {
    "1day": 1,
    "7days": 7,
    "2weeks": 14,
    "1month": 30,
    "all": null
};

/**
 * Structure for storing all typing history data
 */
export type HistoryData = {
    sessions: TypingSession[];
    /** Practice dates retained when detailed sessions are trimmed. Legacy storage key preserved. */
    dailyCompletionDays?: string[];
    /** Preserve the all-time record and its provenance when detailed history is trimmed. */
    personalBest?: TypingSession;
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
        
        return {
            sessions: parsed.sessions,
            dailyCompletionDays: collectPracticeDays(parsed.sessions, parsed.dailyCompletionDays),
            personalBest: personalBestSession(parsed.sessions, parsed.personalBest),
        };
    } catch (error) {
        console.error("Failed to load history:", error);
        return defaultHistory;
    }
};

/**
 * Main history store
 */
export const $history = atom<HistoryData>(loadHistory());
let receivingHistory = false;
onMount($history, () => {
    if (typeof window === "undefined" || !window.addEventListener) return;
    const sync = (event: StorageEvent) => {
        if (event.key !== HISTORY_STORAGE_KEY && event.key !== null) return;
        receivingHistory = true;
        try { $history.set(loadHistory()); } finally { receivingHistory = false; }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
});

/**
 * Automatically save history to localStorage whenever it changes
 */
onSet($history, ({ newValue }) => {
    if (typeof window === "undefined" || receivingHistory) return;
    
    try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newValue));
    } catch (error) {
        console.error("Failed to save history:", error);
        // If localStorage is full, remove oldest sessions and try again
        if (error instanceof Error && error.name === "QuotaExceededError") {
            const trimmedSessions = newValue.sessions.slice(0, MAX_HISTORY_SESSIONS / 2);
            try {
                localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify({ ...newValue, sessions: trimmedSessions }));
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
/**
 * Adds a new typing session to history
 * Automatically generates a unique ID for the session
 * @param session - The typing session to add (id will be auto-generated if not provided)
 */
export const addSession = (session: TypingSession): void => {
    const current = $history.get();
    // Server snapshots, remounts and repeated final input can report the same result.
    if (session.id && current.sessions.some(saved => saved?.id === session.id)) return;
    const previousBest = personalBestSession(current.sessions, current.personalBest);
    const previousDays = collectPracticeDays(current.sessions, current.dailyCompletionDays);
    
    // Ensure session has a unique ID
    const sessionWithId: TypingSession = {
        ...session,
        id: session.id || `${session.timestamp}-${Math.random().toString(36).substring(2, 11)}`
    };
    
    const sessions = [sessionWithId, ...current.sessions];
    
    // Limit total sessions to prevent storage issues
    const limitedSessions = sessions.slice(0, MAX_HISTORY_SESSIONS);
    
    const nextDays = collectPracticeDays(sessions, previousDays);
    $history.set({
        sessions: limitedSessions,
        dailyCompletionDays: nextDays,
        personalBest: personalBestSession([sessionWithId], previousBest),
    });
    celebrate(sessionCelebration(sessionWithId, previousBest, previousDays, nextDays));
};

/** Credit a completed lesson without mixing its scores into solo/race history. */
export const recordPracticeDay = (date = new Date()): void => {
    const day = localDayKey(date);
    if (!isCalendarDay(day)) return;
    const current = $history.get();
    const days = collectPracticeDays(current.sessions, current.dailyCompletionDays);
    if (days.includes(day)) return;
    const nextDays = [...days, day].sort();
    $history.set({ ...current, dailyCompletionDays: nextDays });
    // Historical imports may supply a date; only live practice today earns a popup.
    const now = new Date();
    if (day === localDayKey(now)) celebrate({
        id: `practice-day:${day}`, createdAt: now.getTime(), streak: dailyStreak([], now, nextDays),
    });
};

/**
 * Clears all typing history and the practice streak
 */
export const clearHistory = (): void => {
    $history.set(defaultHistory);
    clearKeypressAnalytics();
    dismissCelebration();
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

/**
 * Computed store for lifetime statistics
 * Optimized to calculate today's boundary once per computation
 */
export const $lifetimeStats = computed($history, ({ sessions, personalBest }) => {
    // Calculate today's boundary once
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    
    // Filter today's sessions inline to avoid extra function call
    const todaySessions = sessions.filter(s => s.timestamp >= todayTimestamp);
    
    return {
        bestWpm: personalBestSession(sessions, personalBest)?.wpm ?? 0,
        todaysBest: getBestWpm(todaySessions)
    };
});
