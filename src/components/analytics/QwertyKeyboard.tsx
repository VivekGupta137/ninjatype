import type { CSSProperties } from "react";
import { Chip, Tooltip } from "@heroui/react";
import { QWERTY_ROWS } from "@/constants/qwertyLayout";
import {
    avgLatencyMs,
    errorRate,
    errorHeat,
    hasKeyData,
    keyDisplayLabel,
    keyStatus,
    latencyHeatMap,
    type KeyAnalyticsMetric,
    type KeyMetric,
} from "@/lib/keypressStats";

type Props = {
    keys: Record<string, KeyMetric>;
    metric: KeyAnalyticsMetric;
    selectedKey: string | null;
    onSelect: (key: string) => void;
};
const QwertyKeyboard = ({ keys, metric, selectedKey, onSelect }: Props) => {
    const latencyHeats = metric === "latency" ? latencyHeatMap(keys) : null;
    const rows = [...QWERTY_ROWS, [" "]];
    return (
        <>
            <div className="key-map-scroll">
                <div
                    className="qwerty-keyboard performance-keyboard"
                    role="group"
                    aria-label="Inspect key performance"
                    data-metric={metric}
                >
                    {rows.map((row, index) => (
                        <div
                            key={index}
                            className={`qwerty-row${row.every((key) => !hasKeyData(keys[key])) ? " qwerty-row--unmeasured" : ""}`}
                        >
                            {row.map((key) => {
                                const data = keys[key];
                                const used =
                                    hasKeyData(data) &&
                                    (metric === "error"
                                        ? data.expected > 0
                                        : data.presses > 0);
                                const heat = !used
                                    ? 0
                                    : metric === "error"
                                      ? errorHeat(data)
                                      : (latencyHeats?.[key] ?? 0);
                                const status = used ? keyStatus(metric, data, latencyHeats?.[key] ?? 0) : null;
                                const reading = metric === "latency"
                                    ? (data?.presses ? `${Math.round(avgLatencyMs(data))} ms` : "No delay recorded")
                                    : (data?.expected ? `${Math.round(errorRate(data))}%` : "No error-rate data");
                                const button = (props: Record<string, unknown>) => (
                                    <button
                                        {...props}
                                        type="button"
                                        className={`analytics-key${used ? " analytics-key--used" : " analytics-key--unused"}${key === " " ? " analytics-key--space" : ""}`}
                                        disabled={!hasKeyData(data)}
                                        aria-label={`Inspect ${keyDisplayLabel(key)} key${status ? `, ${status.label}` : ""}`}
                                        aria-pressed={selectedKey === key}
                                        onClick={() => onSelect(key)}
                                        data-used={used}
                                        data-home={key === "f" || key === "j"}
                                        data-letter={/^[a-z]$/.test(key) || key === " "}
                                        style={
                                            used
                                                ? ({
                                                      "--key-accent":
                                                          metric === "latency"
                                                              ? `color-mix(in srgb, var(--success-color) ${Math.round(100 - heat * 85)}%, var(--text-color))`
                                                              : `color-mix(in srgb, var(--error-color) ${Math.round(heat * 100)}%, var(--success-color))`,
                                                  } as CSSProperties)
                                                : undefined
                                        }
                                    >
                                        <span className="analytics-key-label">
                                            {key === " " ? "space" : keyDisplayLabel(key).toLowerCase()}
                                        </span>
                                    </button>
                                );
                                return (
                                    <span key={key} className="analytics-key-hit" data-used={used} data-letter={/^[a-z]$/.test(key) || key === " "}>
                                        {used ? (
                                            <Tooltip delay={0} closeDelay={0}>
                                                <Tooltip.Trigger<"button"> render={props => button(props as Record<string, unknown>)} />
                                                <Tooltip.Content className="key-tip">
                                                    <span className="key-tip-metric">{metric === "latency" ? "Average delay" : "Error rate"}</span>
                                                    <span className="key-tip-row">
                                                        <kbd>{keyDisplayLabel(key)}</kbd>
                                                        <strong>{reading}</strong>
                                                        {status && <Chip size="sm" variant="soft" color={status.color}><Chip.Label>{status.label}</Chip.Label></Chip>}
                                                    </span>
                                                </Tooltip.Content>
                                            </Tooltip>
                                        ) : button({})}
                                    </span>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};
export default QwertyKeyboard;
