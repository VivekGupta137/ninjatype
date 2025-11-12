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

export type TimeRange = "1day" | "7days" | "2weeks" | "1month" | "all";

const TIME_RANGE_DAYS: Record<TimeRange, number | null> = {
    "1day": 1,
    "7days": 7,
    "2weeks": 14,
    "1month": 30,
    "all": null
};

export const useHistory = (timeRange: TimeRange = "all") => {
    const history = useStore($history);
    const allSessions = useStore($allSessions);
    const lifetimeStats = useStore($lifetimeStats);

    // Get filtered sessions based on time range
    const filteredSessions = useMemo(() => {
        const days = TIME_RANGE_DAYS[timeRange];
        return getSessionsByDateRange(allSessions, days);
    }, [allSessions, timeRange]);

    // Calculate stats for filtered sessions
    const filteredStats = useMemo(() => {
        const sessions = filteredSessions;
        return {
            sessionsCount: sessions.length,
            avgWpm: calculateAvgWpm(sessions),
            avgAccuracy: calculateAvgAccuracy(sessions),
            totalTime: calculateTotalTime(sessions)
        };
    }, [filteredSessions]);

    // Format total time for display
    const formattedTotalTime = useMemo(() => {
        const totalSeconds = filteredStats.totalTime;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }, [filteredStats.totalTime]);

    return {
        // Data
        allSessions,
        filteredSessions,
        lifetimeStats,
        filteredStats,
        formattedTotalTime,
        
        // Actions
        addSession: (session: TypingSession) => addSession(session),
        clearAllHistory: () => {
            if (typeof window !== "undefined") {
                const confirmed = window.confirm(
                    "Are you sure you want to delete all typing history? This action cannot be undone."
                );
                if (confirmed) {
                    clearHistory();
                }
            }
        }
    };
};
