import type { TimeRange } from "@/hooks/useHistory";

type HistoryFiltersProps = {
    /** Currently selected time range filter */
    currentFilter: TimeRange;
    /** Callback when filter selection changes */
    onFilterChange: (filter: TimeRange) => void;
};

/**
 * Human-readable labels for time range filters
 */
const TIME_RANGE_LABELS: Record<TimeRange, string> = {
    "1day": "1 Day",
    "7days": "7 Days",
    "2weeks": "2 Weeks",
    "1month": "1 Month",
    "all": "All Time"
};

/**
 * Filter button group for selecting time ranges
 * Allows users to filter history by 1 day, 7 days, 2 weeks, 1 month, or all time
 */
const HistoryFilters = ({ currentFilter, onFilterChange }: HistoryFiltersProps) => {
    const filters: TimeRange[] = ["1day", "7days", "2weeks", "1month", "all"];

    return (
        <div className="history-filters">
            {filters.map((filter) => (
                <button
                    key={filter}
                    className={`time-filter-btn ${currentFilter === filter ? "active" : ""}`}
                    onClick={() => onFilterChange(filter)}
                >
                    {TIME_RANGE_LABELS[filter]}
                </button>
            ))}
        </div>
    );
};

export default HistoryFilters;
