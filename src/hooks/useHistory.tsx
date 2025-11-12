import { useStore } from "@nanostores/react";
import { 
    $history, 
    $allSessions, 
    $lifetimeStats,
    addSession, 
    clearHistory, 
    getSessionsByDateRange,
    calculateAvgWpm,
    calculateAvgAccuracy,
    calculateTotalTime,
    type TypingSession 
} from "@/store/history";
import { useMemo } from "react";

/**
 * Available time range filters for history view
 */
export type TimeRange = "1day" | "7days" | "2weeks" | "1month" | "all";

/**
 * Mapping of time ranges to number of days
 */
const TIME_RANGE_DAYS: Record<TimeRange, number | null> = {
    "1day": 1,
    "7days": 7,
    "2weeks": 14,
    "1month": 30,
    "all": null
};

/**
 * Custom hook for managing typing history with filtering and statistics
 * 
 * @param timeRange - The time range filter to apply (default: "all")
 * @returns Object containing filtered sessions, stats, and action methods
 * 
 * @example
 * ```tsx
 * const { filteredSessions, lifetimeStats, clearAllHistory } = useHistory("7days");
 * ```
 */
export const useHistory = (timeRange: TimeRange = "all") => {
    const history = useStore($history);
    const allSessions = useStore($allSessions);
    const lifetimeStats = useStore($lifetimeStats);

    /**
     * Memoized filtered sessions based on selected time range
     */
    const filteredSessions = useMemo(() => {
        const days = TIME_RANGE_DAYS[timeRange];
        return getSessionsByDateRange(allSessions, days);
    }, [allSessions, timeRange]);

    /**
     * Memoized statistics for filtered sessions
     */
    const filteredStats = useMemo(() => {
        const sessions = filteredSessions;
        return {
            sessionsCount: sessions.length,
            avgWpm: calculateAvgWpm(sessions),
            avgAccuracy: calculateAvgAccuracy(sessions),
            totalTime: calculateTotalTime(sessions)
        };
    }, [filteredSessions]);

    /**
     * Formatted total time for display (e.g., "2h 30m" or "45m")
     */
    const formattedTotalTime = useMemo(() => {
        const totalSeconds = filteredStats.totalTime;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }, [filteredStats.totalTime]);

    /**
     * Clears all history with user confirmation
     */
    const clearAllHistory = () => {
        if (typeof window === "undefined") return;
        
        const confirmed = window.confirm(
            "Are you sure you want to delete all typing history? This action cannot be undone."
        );
        
        if (confirmed) {
            clearHistory();
        }
    };

    return {
        // Data
        allSessions,
        filteredSessions,
        lifetimeStats,
        filteredStats,
        formattedTotalTime,
        
        // Actions
        addSession: (session: TypingSession) => addSession(session),
        clearAllHistory
    };
};
