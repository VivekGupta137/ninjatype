import { ToggleButton, ToggleButtonGroup } from "@heroui/react";
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
        <ToggleButtonGroup
            className="key-group history-filters"
            aria-label="Filter history by time range"
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={new Set([currentFilter])}
            onSelectionChange={keys => { const v = Array.from(keys)[0] as TimeRange | undefined; if (v) onFilterChange(v); }}
        >
            {filters.map(filter => (
                <ToggleButton key={filter} id={filter} className="key-btn key-btn--ghost" aria-label={`Filter by ${displayLabels[filter]}`}>
                    {displayLabels[filter]}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
};

export default HistoryFilters;
