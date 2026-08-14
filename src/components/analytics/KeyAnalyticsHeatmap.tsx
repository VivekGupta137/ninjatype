import { useState } from "react";
import type { KeyAnalyticsMetric, KeyMetric } from "@/lib/keypressStats";
import QwertyKeyboard from "./QwertyKeyboard";

type KeyAnalyticsHeatmapProps = {
    keys: Record<string, KeyMetric>;
    emptyMessage?: string;
};

const METRIC_LABELS: Record<KeyAnalyticsMetric, string> = {
    error: "Error rate",
    latency: "Avg delay",
};

const KeyAnalyticsHeatmap = ({
    keys,
    emptyMessage = "Complete a typing test to see key analytics.",
}: KeyAnalyticsHeatmapProps) => {
    const [metric, setMetric] = useState<KeyAnalyticsMetric>("error");
    const hasData = Object.keys(keys).length > 0;

    return (
        <div className="key-analytics-heatmap">
            <div
                className="key-metric-toggle"
                role="group"
                aria-label="Key heatmap metric"
            >
                {(Object.keys(METRIC_LABELS) as KeyAnalyticsMetric[]).map((value) => (
                    <button
                        key={value}
                        type="button"
                        className={`time-filter-btn ${metric === value ? "active" : ""}`}
                        onClick={() => setMetric(value)}
                        aria-pressed={metric === value}
                    >
                        {METRIC_LABELS[value]}
                    </button>
                ))}
            </div>

            {hasData ? (
                <QwertyKeyboard keys={keys} metric={metric} />
            ) : (
                <p className="key-analytics-empty">{emptyMessage}</p>
            )}
        </div>
    );
};

export default KeyAnalyticsHeatmap;
