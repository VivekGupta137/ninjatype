import { useMemo, useState } from "react";
import { useStore } from "@nanostores/react";
import {
    $keypressAnalytics,
    getAttemptCountForRange,
    getKeyStatsForRange,
    type KeyAnalyticsRange,
} from "@/store/keypressAnalytics";
import KeyAnalyticsHeatmap from "./KeyAnalyticsHeatmap";

const RANGE_LABELS: Record<KeyAnalyticsRange, string> = {
    latest: "Latest",
    last5: "Last 5",
    last10: "Last 10",
    overTime: "Over time",
};

const RANGE_ORDER: KeyAnalyticsRange[] = ["latest", "last5", "last10", "overTime"];

const rangeDescription = (range: KeyAnalyticsRange, count: number): string => {
    if (count === 0) return "Complete a typing test to see key analytics.";
    if (range === "latest") return "Keys from your most recent attempt.";
    if (range === "overTime") {
        return `Per-key performance over the last ${count} month${count === 1 ? "" : "s"} (up to 6).`;
    }
    return `Merged from your ${count} most recent attempt${count === 1 ? "" : "s"}.`;
};

const KeyAnalyticsSection = () => {
    const data = useStore($keypressAnalytics);
    const [range, setRange] = useState<KeyAnalyticsRange>("latest");
    const keys = useMemo(() => getKeyStatsForRange(range, data), [range, data]);
    const count = getAttemptCountForRange(range, data);

    return (
        <section className="key-analytics-section" aria-labelledby="key-analytics-heading">
            <div className="history-period-header">
                <div className="history-period-intro">
                    <h2 id="key-analytics-heading" className="history-section-title">
                        Key analytics
                    </h2>
                    <p className="history-section-desc">{rangeDescription(range, count)}</p>
                </div>
                <div
                    className="history-filters key-analytics-range"
                    role="group"
                    aria-label="Key analytics range"
                >
                    {RANGE_ORDER.map((value) => (
                        <button
                            key={value}
                            type="button"
                            className={`time-filter-btn ${range === value ? "active" : ""}`}
                            onClick={() => setRange(value)}
                            aria-pressed={range === value}
                        >
                            {RANGE_LABELS[value]}
                        </button>
                    ))}
                </div>
            </div>

            <KeyAnalyticsHeatmap
                keys={keys}
                emptyMessage="Complete a typing test to see key analytics."
            />
        </section>
    );
};

export default KeyAnalyticsSection;
