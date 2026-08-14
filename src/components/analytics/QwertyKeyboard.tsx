import type { CSSProperties, ReactNode } from "react";
import { QWERTY_NUMBER_ROW_INDEX, QWERTY_ROWS } from "@/constants/qwertyLayout";
import {
    avgLatencyMs,
    errorHeat,
    errorRate,
    hasKeyData,
    heatBackground,
    keyDisplayLabel,
    latencyHeatMap,
    type KeyAnalyticsMetric,
    type KeyMetric,
} from "@/lib/keypressStats";
import { Tooltip } from "@heroui/react";

type QwertyKeyboardProps = {
    keys: Record<string, KeyMetric>;
    metric: KeyAnalyticsMetric;
};

const formatRate = (value: number): string =>
    `${value >= 10 ? value.toFixed(0) : value.toFixed(1)}%`;

const formatMs = (value: number): string => `${Math.round(value)}ms`;

const KeyTooltip = ({
    keyId,
    metric,
    children,
}: {
    keyId: string;
    metric: KeyMetric | undefined;
    children: ReactNode;
}) => {
    const used = hasKeyData(metric);
    const label = keyDisplayLabel(keyId);

    return (
        <Tooltip delay={150}>
            <Tooltip.Trigger>
                <div className="analytics-key-hit">{children}</div>
            </Tooltip.Trigger>
            <Tooltip.Content className="analytics-key-tooltip">
                <p className="analytics-key-tooltip-title">{label}</p>
                {used && metric ? (
                    <ul className="analytics-key-tooltip-stats">
                        <li>
                            <span>Presses</span>
                            <strong>{metric.presses}</strong>
                        </li>
                        <li>
                            <span>Expected</span>
                            <strong>{metric.expected}</strong>
                        </li>
                        <li>
                            <span>Errors</span>
                            <strong>{metric.errors}</strong>
                        </li>
                        <li>
                            <span>Error rate</span>
                            <strong>{formatRate(errorRate(metric))}</strong>
                        </li>
                        <li>
                            <span>Avg delay</span>
                            <strong>{formatMs(avgLatencyMs(metric))}</strong>
                        </li>
                    </ul>
                ) : (
                    <p className="analytics-key-tooltip-empty">No data for this key</p>
                )}
            </Tooltip.Content>
        </Tooltip>
    );
};

const QwertyKeyboard = ({ keys, metric }: QwertyKeyboardProps) => {
    const latencyHeats = metric === "latency" ? latencyHeatMap(keys) : null;

    return (
        <div className="qwerty-keyboard" role="img" aria-label="Key performance keyboard">
            {QWERTY_ROWS.map((row, rowIndex) => (
                <div
                    key={rowIndex}
                    className={`qwerty-row${rowIndex === QWERTY_NUMBER_ROW_INDEX ? " qwerty-row--numbers" : ""}`}
                >
                    {row.map((keyId) => {
                        const keyMetric = keys[keyId];
                        const used = hasKeyData(keyMetric);
                        const heat = !used
                            ? 0
                            : metric === "error"
                              ? errorHeat(keyMetric)
                              : (latencyHeats?.[keyId] ?? 0);

                        return (
                            <KeyTooltip key={keyId} keyId={keyId} metric={keyMetric}>
                                <kbd
                                    className={`analytics-key${used ? " analytics-key--used" : " analytics-key--unused"}`}
                                    style={
                                        used
                                            ? {
                                                  "--key-heat-bg": heatBackground(heat),
                                              } as CSSProperties
                                            : undefined
                                    }
                                    aria-label={`${keyDisplayLabel(keyId)} key`}
                                >
                                    {keyDisplayLabel(keyId)}
                                </kbd>
                            </KeyTooltip>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default QwertyKeyboard;
