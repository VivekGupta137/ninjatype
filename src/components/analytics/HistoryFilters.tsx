import type { TimeRange } from "@/hooks/useHistory";

type HistoryFiltersProps = {
    currentFilter: TimeRange;
    onFilterChange: (filter: TimeRange) => void;
};

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
    "1day": "1 Day",
    "7days": "7 Days",
    "2weeks": "2 Weeks",
    "1month": "1 Month",
    "all": "All Time"
};

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
