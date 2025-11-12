import { atom, computed, onSet } from "nanostores";

export type TypingSession = {
    timestamp: number;
    wpm: number;
    cpm: number;
    accuracy: number;
    errors: number;
    duration: number;
    mode: string;
};

export type HistoryData = {
    sessions: TypingSession[];
};

const defaultHistory: HistoryData = {
    sessions: []
};

const STORAGE_KEY = "history:sessions";

// Load from localStorage
const loadHistory = (): HistoryData => {
    if (typeof window === "undefined") return defaultHistory;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return { sessions: parsed.sessions || [] };
        }
    } catch (e) {
        console.error("Failed to load history:", e);
    }
    return defaultHistory;
};

export const $history = atom<HistoryData>(loadHistory());

// Save to localStorage on change
onSet($history, ({ newValue }) => {
    if (typeof window !== "undefined") {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newValue));
        } catch (e) {
            console.error("Failed to save history:", e);
        }
    }
});

// Add a new session
export const addSession = (session: TypingSession) => {
    const current = $history.get();
    $history.set({
        sessions: [session, ...current.sessions]
    });
};

// Clear all history
export const clearHistory = () => {
    $history.set(defaultHistory);
};

// Get sessions within a date range
export const getSessionsByDateRange = (sessions: TypingSession[], days: number | null): TypingSession[] => {
    if (days === null) return sessions; // All time
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    return sessions.filter(s => s.timestamp >= cutoffTime);
};

// Get today's sessions
export const getTodaySessions = (sessions: TypingSession[]): TypingSession[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sessions.filter(s => s.timestamp >= today.getTime());
};

// Calculate average WPM
export const calculateAvgWpm = (sessions: TypingSession[]): number => {
    if (sessions.length === 0) return 0;
    const sum = sessions.reduce((acc, s) => acc + s.wpm, 0);
    return Math.round(sum / sessions.length);
};

// Calculate average accuracy
export const calculateAvgAccuracy = (sessions: TypingSession[]): number => {
    if (sessions.length === 0) return 0;
    const sum = sessions.reduce((acc, s) => acc + s.accuracy, 0);
    return Math.round(sum / sessions.length);
};

// Calculate total time spent
export const calculateTotalTime = (sessions: TypingSession[]): number => {
    return sessions.reduce((acc, s) => acc + s.duration, 0);
};

// Get best WPM
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
