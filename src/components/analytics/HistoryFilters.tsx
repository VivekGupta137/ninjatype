import type { TimeRange } from "@/store/history";

type HistoryFiltersProps = {
    currentFilter: TimeRange;
    onFilterChange: (filter: TimeRange) => void;
};

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
    "1day": "1 Day",
    "7days": "7 Days",
    "2weeks": "2 Weeks",
    "1month": "1 Month",
    all: "All Time",
};

const HistoryFilters = ({
    currentFilter,
    onFilterChange,
}: HistoryFiltersProps) => {
    const displayLabels: Record<TimeRange, string> = {
        "1day": "24h",
        "7days": "7 days",
        "2weeks": "14 days",
        "1month": "30 days",
        all: "All time",
    };
    const filters: TimeRange[] = ["1day", "7days", "2weeks", "1month", "all"];

    return (
        <div
            className="history-filters"
            role="group"
            aria-label="Filter history by time range"
        >
            {filters.map((filter) => (
                <button
                    key={filter}
                    type="button"
                    className={`time-filter-btn ${currentFilter === filter ? "active" : ""}`}
                    onClick={() => onFilterChange(filter)}
                    aria-pressed={currentFilter === filter}
                    aria-label={`Filter by ${displayLabels[filter]}`}
                >
                    {displayLabels[filter]}
                </button>
            ))}
        </div>
    );
};

export default HistoryFilters;
