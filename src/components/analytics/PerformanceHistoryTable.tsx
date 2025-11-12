import { useState } from "react";
import { useHistory } from "@/hooks/useHistory";
import type { TimeRange } from "@/store/history";
import LifetimeStats from "./LifetimeStats";
import HistoryFilters from "./HistoryFilters";
import FilteredStats from "./FilteredStats";
import HistoryTable from "./HistoryTable";

/**
 * Main container component for the typing history page
 * Orchestrates all sub-components and manages filter state
 * 
 * Layout structure:
 * 1. Page title
 * 2. Lifetime stats (all-time best, today's best)
 * 3. Filtered stats (sessions, avg WPM, total time, accuracy)
 * 4. Time range filters
 * 5. Session history table
 */
const PerformanceHistoryTable = () => {
    const [timeRange, setTimeRange] = useState<TimeRange>("all");
    const {
        filteredSessions,
        lifetimeStats,
        filteredStats,
        formattedTotalTime
    } = useHistory(timeRange);

    return (
        <div id="history-container">
            <h1 className="history-title">Typing History</h1>
            
            <LifetimeStats 
                bestWpm={lifetimeStats.bestWpm}
                todaysBest={lifetimeStats.todaysBest}
            />
            
            <FilteredStats 
                sessionsCount={filteredStats.sessionsCount}
                avgWpm={filteredStats.avgWpm}
                totalTime={formattedTotalTime}
                avgAccuracy={filteredStats.avgAccuracy}
            />
            
            <HistoryFilters 
                currentFilter={timeRange}
                onFilterChange={setTimeRange}
            />
            
            <HistoryTable sessions={filteredSessions} />
        </div>
    );
};

export default PerformanceHistoryTable;
