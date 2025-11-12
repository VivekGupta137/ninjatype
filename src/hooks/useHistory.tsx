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
    TIME_RANGE_DAYS,
    type TypingSession,
    type TimeRange
} from "@/store/history";
import { useMemo } from "react";

/**
 * Custom hook for managing typing history with filtering and statistics
 * 
 * Provides business logic layer for the typing history feature, handling:
 * - Filtering sessions by time range
 * - Calculating aggregate statistics (avg WPM, accuracy, total time)
 * - Managing history lifecycle (clear all sessions)
 * 
 * @param timeRange - The time range filter to apply. Valid values:
 *   - "1day": Last 24 hours
 *   - "7days": Last 7 days
 *   - "2weeks": Last 14 days
 *   - "1month": Last 30 days
 *   - "all": All sessions (default)
 * 
 * @returns Object containing:
 *   - filteredSessions: Array of typing sessions within the selected time range
 *   - filteredStats: Aggregate statistics for filtered sessions (avg WPM, avg accuracy, session count)
 *   - formattedTotalTime: Human-readable total typing time (e.g., "2h 34m")
 *   - lifetimeStats: All-time and today's best WPM statistics
 *   - clearAllHistory: Function to clear all typing history (with confirmation)
 * 
 * @example
 * ```tsx
 * // Filter by last 7 days
 * const { filteredSessions, filteredStats, clearAllHistory } = useHistory("7days");
 * 
 * // Display stats
 * console.log(`Avg WPM: ${filteredStats.avgWpm}`);
 * console.log(`Sessions: ${filteredStats.sessionCount}`);
 * 
 * // Clear history
 * clearAllHistory();
 * ```
 */
export const useHistory = (timeRange: TimeRange = "all") => {
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
