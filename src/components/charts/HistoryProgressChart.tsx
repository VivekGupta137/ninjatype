import { useMemo, useState } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import { echarts, type ECOption } from "@/lib/echarts";
import { useChartColors } from "@/hooks/useChartColors";
import type { TypingSession } from "@/store/history";

const fade = (color: string, opacity: number) => {
    const parsed = echarts.color.parse(color);
    return parsed
        ? `rgba(${parsed[0]}, ${parsed[1]}, ${parsed[2]}, ${opacity})`
        : color;
};
type Props = { sessions: TypingSession[]; mode: string };
const HistoryProgressChart = ({ sessions, mode }: Props) => {
    const colors = useChartColors();
    const [metric, setMetric] = useState<"wpm" | "accuracy">("wpm");
    const recent = useMemo(
        () =>
            [...sessions].sort((a, b) => a.timestamp - b.timestamp).slice(-50),
        [sessions],
    );
    const isSpeed = metric === "wpm";
    const color = isSpeed ? colors.success : colors.primary;
    const option = useMemo<ECOption>(
        () => ({
            animation: false,
            grid: { top: 26, right: 16, bottom: 30, left: 44 },
            textStyle: { fontFamily: "system-ui, sans-serif" },
            xAxis: {
                type: "category",
                data: recent.map((_, index) => `${index + 1}`),
                boundaryGap: false,
                axisLabel: { color: colors.muted, fontSize: 10 },
                axisTick: { show: false },
                axisLine: { lineStyle: { color: colors.border } },
            },
            yAxis: {
                type: "value",
                min: 0,
                max: isSpeed ? undefined : 100,
                name: isSpeed ? "WPM" : "Accuracy %",
                nameTextStyle: { color: colors.muted, fontSize: 10 },
                axisLabel: { color: colors.muted, fontSize: 10 },
                splitNumber: 4,
                splitLine: {
                    lineStyle: {
                        color: colors.border,
                        opacity: 0.4,
                        type: "dashed",
                    },
                },
            },
            tooltip: {
                trigger: "axis",
                confine: true,
                backgroundColor: colors.surface,
                borderColor: colors.border,
                textStyle: { color: colors.text, fontSize: 12 },
                formatter: (params) => {
                    const list = Array.isArray(params) ? params : [params];
                    const session = recent[list[0]?.dataIndex ?? 0];
                    return session
                        ? `${new Date(session.timestamp).toLocaleString()}<br/><strong>${session.wpm} wpm · ${session.accuracy}% accuracy</strong><br/>${Number(session.duration.toFixed(1))}s · ${session.errors} errors`
                        : "";
                },
            },
            series: [
                {
                    type: "line",
                    name: isSpeed ? "Speed" : "Accuracy",
                    data: recent.map((session) => session[metric]),
                    smooth: 0.35,
                    smoothMonotone: "x",
                    showSymbol: recent.length <= 12,
                    symbolSize: 5,
                    lineStyle: {
                        width: 2.5,
                        color,
                        cap: "round",
                        join: "round",
                    },
                    itemStyle: { color },
                    areaStyle: {
                        color: {
                            type: "linear",
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                { offset: 0, color: fade(color, 0.22) },
                                { offset: 0.55, color: fade(color, 0.05) },
                                { offset: 1, color: fade(color, 0) },
                            ],
                        },
                    },
                },
            ],
        }),
        [recent, colors, isSpeed, metric, color],
    );
    return (
        <section
            className="history-progress"
            aria-labelledby="history-progress-title"
        >
            <div className="history-progress-heading">
                <div>
                    <h2
                        id="history-progress-title"
                        className="history-section-title"
                    >
                        Progress
                    </h2>
                    <p className="history-section-desc">
                        {recent.length
                            ? `${sessions.length > 50 ? "Latest " : ""}${recent.length} ${recent.length === 1 ? "attempt" : "attempts"} · ${mode === "all" ? "all modes" : mode} · oldest first`
                            : "No matching attempts"}
                    </p>
                </div>
                <div
                    className="history-chart-controls"
                    role="group"
                    aria-label="Progress chart metric"
                >
                    <button
                        type="button"
                        aria-pressed={isSpeed}
                        onClick={() => setMetric("wpm")}
                    >
                        Speed
                    </button>
                    <button
                        type="button"
                        aria-pressed={!isSpeed}
                        onClick={() => setMetric("accuracy")}
                    >
                        Accuracy
                    </button>
                </div>
            </div>
            {recent.length >= 2 ? (
                <div
                    className="pace-canvas"
                    role="img"
                    aria-label={`${isSpeed ? "Speed" : "Accuracy"} across ${recent.length} attempts, oldest to newest. First ${recent[0][metric]}, latest ${recent.at(-1)![metric]}.`}
                >
                    <ReactEChartsCore
                        echarts={echarts}
                        option={option}
                        notMerge
                        opts={{ renderer: "svg" }}
                        style={{ width: "100%", height: "100%" }}
                    />
                </div>
            ) : (
                <p className="analytics-empty">
                    Complete two matching attempts to see your progress.
                </p>
            )}
        </section>
    );
};
export default HistoryProgressChart;
