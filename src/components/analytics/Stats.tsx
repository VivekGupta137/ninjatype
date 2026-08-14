import { $accuracy, $errorCPS, $rawCPM, $rawWPM } from "@/store/analytics";
import { $stopwatch } from "@/store/keyboard";
import { Tooltip } from "@heroui/react";
import { useStore } from "@nanostores/react";
import type { ReactNode } from "react";

const formatElapsed = (seconds: number) => `${Number(seconds.toFixed(1))}s`;

const accuracyTone = (accuracy: number) => {
    if (accuracy >= 96) return "high";
    if (accuracy >= 80) return "mid";
    return "low";
};

const StatTooltip = ({
    label,
    description,
    children,
}: {
    label: string;
    description: string;
    children: ReactNode;
}) => (
    <Tooltip delay={200}>
        <Tooltip.Trigger>
            <div className="stat-tooltip-trigger">{children}</div>
        </Tooltip.Trigger>
        <Tooltip.Content className="stat-tooltip-content">
            <p className="stat-tooltip-title">{label}</p>
            <p className="stat-tooltip-desc">{description}</p>
        </Tooltip.Content>
    </Tooltip>
);

const Stats = () => {
    const rawCPM = useStore($rawCPM);
    const rawWPM = useStore($rawWPM);
    const stopwatch = useStore($stopwatch);
    const errorPS = useStore($errorCPS);
    const accuracy = useStore($accuracy);
    const errors = errorPS[errorPS.length - 1]?.count || 0;
    const accTone = accuracyTone(accuracy);
    const elapsed = Number(stopwatch.toFixed(1));

    return (
        <section
            id="stats-toolbar"
            className="session-stats"
            aria-label="Session results"
        >
            <div className="stats-primary">
                <StatTooltip
                    label="Words Per Minute (WPM)"
                    description="Average typing speed for this session. One word equals 5 characters, including spaces."
                >
                    <div className="stat-item stat-item--hero">
                        <span
                            className="stat-value"
                            aria-label={`${rawWPM} words per minute`}
                        >
                            {rawWPM}
                        </span>
                        <span className="stat-label">wpm</span>
                    </div>
                </StatTooltip>

                <StatTooltip
                    label="Accuracy (ACC)"
                    description="Percentage of characters typed correctly compared to the target text."
                >
                    <div
                        className={`stat-item stat-item--hero stat-item--acc stat-item--acc-${accTone}`}
                    >
                        <span
                            className="stat-value"
                            aria-label={`${accuracy} percent accuracy`}
                        >
                            {accuracy}
                            <span className="stat-suffix">%</span>
                        </span>
                        <span className="stat-label">acc</span>
                    </div>
                </StatTooltip>
            </div>

            <div className="stats-secondary" role="list">
                <StatTooltip
                    label="Characters Per Minute (CPM)"
                    description="Total characters typed per minute, including spaces and punctuation."
                >
                    <div className="stat-item stat-item--meta" role="listitem">
                        <span
                            className="stat-value"
                            aria-label={`${rawCPM} characters per minute`}
                        >
                            {rawCPM}
                        </span>
                        <span className="stat-label">cpm</span>
                    </div>
                </StatTooltip>

                <span className="stat-dot" aria-hidden="true" />

                <StatTooltip
                    label="Elapsed Time"
                    description={`How long this session lasted — ${elapsed === 1 ? "1 second" : `${elapsed} seconds`}.`}
                >
                    <div className="stat-item stat-item--meta" role="listitem">
                        <span
                            className="stat-value"
                            aria-label={`${elapsed} seconds elapsed`}
                        >
                            {formatElapsed(stopwatch)}
                        </span>
                        <span className="stat-label">time</span>
                    </div>
                </StatTooltip>

                <span className="stat-dot" aria-hidden="true" />

                <StatTooltip
                    label="Errors"
                    description="Number of incorrect characters typed during this session."
                >
                    <div
                        className={`stat-item stat-item--meta${errors > 0 ? " stat-item--errors" : ""}`}
                        role="listitem"
                    >
                        <span
                            className="stat-value"
                            aria-label={`${errors} errors`}
                        >
                            {errors}
                        </span>
                        <span className="stat-label">errors</span>
                    </div>
                </StatTooltip>
            </div>
        </section>
    );
};

export default Stats;
