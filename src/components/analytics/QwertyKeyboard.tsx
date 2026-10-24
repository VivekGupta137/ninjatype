import { useEffect, useId, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { QWERTY_ROWS } from "@/constants/qwertyLayout";
import {
    avgLatencyMs,
    errorRate,
    errorHeat,
    hasKeyData,
    keyDisplayLabel,
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
    const tooltipId = useId();
    const [tooltip, setTooltip] = useState<{
        key: string;
        label: string;
        reading: string;
        left: number;
        top: number;
        below: boolean;
    } | null>(null);
    const showTooltip = (key: string, element: HTMLElement) => {
        const data = keys[key];
        const rect = element.getBoundingClientRect();
        const below = rect.top < 64;
        setTooltip({
            key,
            label: keyDisplayLabel(key),
            reading:
                metric === "latency"
                    ? data?.presses
                        ? `${Math.round(avgLatencyMs(data))} ms`
                        : "No delay recorded"
                    : data?.expected
                      ? `${Math.round(errorRate(data))}%`
                      : "No error-rate data",
            left: Math.max(
                100,
                Math.min(window.innerWidth - 100, rect.left + rect.width / 2),
            ),
            top: below ? rect.bottom + 8 : rect.top - 8,
            below,
        });
    };
    useEffect(() => {
        setTooltip(null);
    }, [keys, metric]);
    useEffect(() => {
        if (!tooltip) return;
        const dismiss = () => setTooltip(null);
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") dismiss();
        };
        window.addEventListener("scroll", dismiss, true);
        window.addEventListener("resize", dismiss);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            window.removeEventListener("scroll", dismiss, true);
            window.removeEventListener("resize", dismiss);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [tooltip]);
    const latencyHeats = metric === "latency" ? latencyHeatMap(keys) : null;
    const rows = [...QWERTY_ROWS, [" "]];
    return (
        <>
            <div className="key-map-scroll">
                <div
                    className="qwerty-keyboard"
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
                                return (
                                    <span
                                        key={key}
                                        className="analytics-key-hit"
                                        data-used={used}
                                        data-letter={
                                            /^[a-z]$/.test(key) || key === " "
                                        }
                                        onPointerEnter={(event) => {
                                            if (event.pointerType !== "touch")
                                                showTooltip(
                                                    key,
                                                    event.currentTarget,
                                                );
                                        }}
                                        onPointerLeave={(event) => {
                                            if (
                                                !event.currentTarget.contains(
                                                    document.activeElement,
                                                )
                                            )
                                                setTooltip(null);
                                        }}
                                    >
                                        <button
                                            type="button"
                                            className={`analytics-key${used ? " analytics-key--used" : " analytics-key--unused"}${key === " " ? " analytics-key--space" : ""}`}
                                            disabled={!hasKeyData(data)}
                                            aria-label={`Inspect ${keyDisplayLabel(key)} key`}
                                            aria-pressed={selectedKey === key}
                                            aria-describedby={
                                                tooltip?.key === key
                                                    ? tooltipId
                                                    : undefined
                                            }
                                            onFocus={(event) => {
                                                if (
                                                    event.currentTarget.matches(
                                                        ":focus-visible",
                                                    )
                                                )
                                                    showTooltip(
                                                        key,
                                                        event.currentTarget,
                                                    );
                                            }}
                                            onBlur={() => setTooltip(null)}
                                            onClick={() => onSelect(key)}
                                            data-used={used}
                                            data-letter={
                                                /^[a-z]$/.test(key) ||
                                                key === " "
                                            }
                                            style={
                                                used
                                                    ? ({
                                                          "--key-accent":
                                                              metric ===
                                                              "latency"
                                                                  ? `color-mix(in srgb, var(--success-color) ${Math.round(100 - heat * 85)}%, var(--text-color))`
                                                                  : "var(--main-color)",
                                                          "--key-meter":
                                                              metric ===
                                                              "latency"
                                                                  ? "var(--success-color)"
                                                                  : heat >= 0.8
                                                                    ? "var(--error-color)"
                                                                    : "var(--main-color)",
                                                          "--key-tint": `${Math.round(metric === "latency" ? 70 - heat * 8 : 4 + heat * 8)}%`,
                                                          "--key-border-tint": `${Math.round(metric === "latency" ? 76 - heat * 8 : 18 + heat * 14)}%`,
                                                      } as CSSProperties)
                                                    : undefined
                                            }
                                        >
                                            <span className="analytics-key-label">
                                                {key === " "
                                                    ? "space"
                                                    : keyDisplayLabel(key)}
                                            </span>
                                            {used && metric === "error" && (
                                                <span className="analytics-key-reading">
                                                    {Math.round(
                                                        errorRate(data),
                                                    )}
                                                    %
                                                </span>
                                            )}
                                            {used &&
                                                metric === "error" &&
                                                heat > 0 && (
                                                    <span
                                                        className="analytics-key-meter"
                                                        aria-hidden="true"
                                                        style={{
                                                            width: `${Math.max(8, Math.round(heat * 100))}%`,
                                                        }}
                                                    />
                                                )}
                                        </button>
                                    </span>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
            {tooltip &&
                createPortal(
                    <div
                        id={tooltipId}
                        role="tooltip"
                        className="key-delay-tooltip"
                        data-below={tooltip.below}
                        style={{ left: tooltip.left, top: tooltip.top }}
                    >
                        <span>
                            {metric === "latency"
                                ? "Average delay"
                                : "Error rate"}
                        </span>
                        <strong>
                            <kbd>{tooltip.label}</kbd> · {tooltip.reading}
                        </strong>
                    </div>,
                    document.body,
                )}
        </>
    );
};
export default QwertyKeyboard;
