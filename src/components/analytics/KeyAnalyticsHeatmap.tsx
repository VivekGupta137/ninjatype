import { useMemo, useState } from "react";
import {
    avgLatencyMs,
    errorRate,
    keyDisplayLabel,
    type KeyAnalyticsMetric,
    type KeyMetric,
} from "@/lib/keypressStats";
import { getKeyFocus } from "@/lib/sessionInsights";
import QwertyKeyboard from "./QwertyKeyboard";

type Props = {
    keys: Record<string, KeyMetric>;
    emptyMessage?: string;
    compact?: boolean;
    showMetricToggle?: boolean;
};
const KeyAnalyticsHeatmap = ({
    keys,
    compact = false,
    showMetricToggle = false,
    emptyMessage = "Complete a typing test to see key analytics.",
}: Props) => {
    const [metric, setMetric] = useState<KeyAnalyticsMetric>(
        compact ? "latency" : "error",
    );
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    const focus = useMemo(() => getKeyFocus(keys), [keys]);
    const defaultKey =
        focus.errors[0]?.[0] ??
        Object.entries(keys).sort(
            (a, b) => b[1].presses - a[1].presses,
        )[0]?.[0] ??
        null;
    const selected =
        selectedKey && keys[selectedKey]
            ? selectedKey
            : compact
              ? null
              : defaultKey;
    const data = selected ? keys[selected] : null;
    const hasData = Object.keys(keys).length > 0;
    const ranked = metric === "error" ? focus.errors : focus.delayed;
    return (
        <div
            className={`key-analytics-heatmap${compact ? " key-analytics-heatmap--compact" : ""}`}
        >
            <div className="key-map-toolbar">
                {compact && !showMetricToggle ? (
                    <h2 className="key-map-title">Average key delay</h2>
                ) : (
                    <div
                        className="key-metric-toggle"
                        role="group"
                        aria-label="Key heatmap metric"
                    >
                        {(compact
                            ? (["latency", "error"] as const)
                            : (["error", "latency"] as const)
                        ).map((value) => (
                            <button
                                key={value}
                                type="button"
                                className={`time-filter-btn ${metric === value ? "active" : ""}`}
                                onClick={() => setMetric(value)}
                                aria-pressed={metric === value}
                            >
                                {value === "error"
                                    ? "Error rate"
                                    : "Average key delay"}
                            </button>
                        ))}
                    </div>
                )}
                {!compact && (
                    <div className="key-map-legend">
                        <span>
                            {metric === "error"
                                ? "Fewer errors"
                                : "Shorter delay"}
                        </span>
                        <i aria-hidden="true" />
                        <span>
                            {metric === "error"
                                ? "More errors"
                                : "Longer delay"}
                        </span>
                    </div>
                )}
            </div>
            {hasData ? (
                <>
                    <QwertyKeyboard
                        keys={keys}
                        metric={metric}
                        selectedKey={selected}
                        onSelect={setSelectedKey}
                    />
                    <p className={`key-map-help${compact ? " sr-only" : ""}`}>
                        {compact
                            ? "Select a key for details."
                            : "Select a key to inspect it. Dimmed keys have no measurements for this metric."}
                    </p>
                    {data && selected && (
                        <div className="key-inspect" aria-live="polite">
                            <kbd>{keyDisplayLabel(selected)}</kbd>
                            <dl>
                                {!compact && (
                                    <div>
                                        <dt>Expected</dt>
                                        <dd>{data.expected}</dd>
                                    </div>
                                )}
                                {!compact && (
                                    <div>
                                        <dt>Errors</dt>
                                        <dd>{data.errors}</dd>
                                    </div>
                                )}
                                <div>
                                    <dt>Error rate</dt>
                                    <dd>
                                        {data.expected
                                            ? `${Math.round(errorRate(data))}%`
                                            : "—"}
                                    </dd>
                                </div>
                                <div>
                                    <dt>Avg delay</dt>
                                    <dd>
                                        {data.presses
                                            ? `${Math.round(avgLatencyMs(data))}ms`
                                            : "—"}
                                    </dd>
                                </div>
                                <div>
                                    <dt>Presses</dt>
                                    <dd>{data.presses}</dd>
                                </div>
                            </dl>
                        </div>
                    )}
                    {!compact && (
                        <>
                            <div className="key-focus-list">
                                <span className="result-eyebrow">
                                    {metric === "error"
                                        ? "KEYS TO PRACTICE"
                                        : "LONGEST AVERAGE DELAYS"}
                                </span>
                                {ranked.length ? (
                                    <div>
                                        {ranked.map(([key, info]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() =>
                                                    setSelectedKey(key)
                                                }
                                            >
                                                <kbd>
                                                    {keyDisplayLabel(key)}
                                                </kbd>
                                                <span>
                                                    {metric === "error"
                                                        ? `${info.errors} / ${info.expected} errors`
                                                        : `${Math.round(avgLatencyMs(info))}ms · ${info.presses} presses`}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p>
                                        {metric === "error"
                                            ? "No repeated problem keys yet. Keep practicing to build a clearer picture."
                                            : "Not enough repeated key presses to compare delays yet."}
                                    </p>
                                )}
                            </div>
                            <p className="chart-caption">
                                Suggestions need at least 3 observations per
                                key.{" "}
                                {metric === "latency"
                                    ? "Delay includes pauses before each press and can reflect reading or corrections. Colors are relative to the measured keys."
                                    : "Error rate counts mistakes against the expected key, including skipped letters and mistakes you later corrected."}
                            </p>
                        </>
                    )}
                </>
            ) : (
                <p className="key-analytics-empty">{emptyMessage}</p>
            )}
        </div>
    );
};
export default KeyAnalyticsHeatmap;
