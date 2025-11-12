import { useState } from "react";
import { useHistory, type TimeRange } from "@/hooks/useHistory";
import LifetimeStats from "./LifetimeStats";
import HistoryFilters from "./HistoryFilters";
import FilteredStats from "./FilteredStats";
import HistoryTable from "./HistoryTable";

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
