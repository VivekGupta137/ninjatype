import { $errorCPS, $rawCPS } from "@/store/analytics";
import { $config } from "@/store/config";
import { resolveChartMaxPoints } from "@/constants/chartBins";
import { echarts, type ECOption } from "@/lib/echarts";
import { buildPacePoints, downsamplePace } from "@/lib/sessionInsights";
import { useChartColors } from "@/hooks/useChartColors";
import { useStore } from "@nanostores/react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import { useMemo, useState } from "react";
import type { LineSeriesOption } from "echarts/charts";

const fade = (color: string, opacity: number) => {
    const parsed = echarts.color.parse(color);
    return parsed
        ? `rgba(${parsed[0]}, ${parsed[1]}, ${parsed[2]}, ${opacity})`
        : color;
};

const WPSLineChart = () => {
    const raw = useStore($rawCPS);
    const errors = useStore($errorCPS);
    const { chartBins } = useStore($config);
    const colors = useChartColors();
    const [showBurst, setShowBurst] = useState(true);
    const points = useMemo(() => {
        const all = buildPacePoints(raw, errors);
        return downsamplePace(
            all,
            resolveChartMaxPoints(all.at(-1)?.time ?? 0, chartBins, all.length),
        );
    }, [raw, errors, chartBins]);
    const option = useMemo<ECOption>(() => {
        const series: LineSeriesOption[] = [
            {
                name: "Raw speed",
                type: "line",
                smooth: 0.4,
                smoothMonotone: "x",
                data: points.map((p) => [p.time, p.raw]),
                showSymbol: points.length === 1,
                lineStyle: {
                    color: colors.primary,
                    width: 3,
                    cap: "round",
                    join: "round",
                },
                itemStyle: { color: colors.primary },
                areaStyle: {
                    color: {
                        type: "linear",
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: fade(colors.primary, 0.24) },
                            { offset: 0.55, color: fade(colors.primary, 0.06) },
                            { offset: 1, color: fade(colors.primary, 0) },
                        ],
                    },
                },
            },
        ];
        if (showBurst)
            series.push({
                name: "Momentary pace",
                type: "line",
                smooth: 0.4,
                smoothMonotone: "x",
                data: points.map((p) => [p.time, p.burst]),
                showSymbol: false,
                lineStyle: { color: colors.muted, width: 1.5, type: "dashed" },
                itemStyle: { color: colors.muted },
            });
        return {
            animation: false,
            grid: { top: 24, right: 28, bottom: 36, left: 44 },
            textStyle: { fontFamily: "system-ui, sans-serif" },
            xAxis: {
                type: "value",
                min: 0,
                max: points.at(-1)?.time || 1,
                splitNumber: 5,
                axisLine: { lineStyle: { color: colors.border } },
                axisTick: { show: false },
                axisLabel: {
                    color: colors.muted,
                    fontSize: 11,
                    formatter: (value: number) =>
                        `${Number(value.toFixed(1))}s`,
                },
                splitLine: { show: false },
            },
            yAxis: {
                type: "value",
                min: 0,
                name: "WPM",
                nameTextStyle: {
                    color: colors.muted,
                    fontSize: 11,
                    align: "right",
                },
                splitNumber: 4,
                axisLabel: { color: colors.muted, fontSize: 10 },
                splitLine: {
                    lineStyle: {
                        color: colors.border,
                        opacity: 0.55,
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
                axisPointer: {
                    type: "line",
                    lineStyle: { color: colors.muted, type: "dashed" },
                },
                formatter: (params) => {
                    const list = Array.isArray(params) ? params : [params];
                    const index = list[0]?.dataIndex ?? 0;
                    const point = points[index];
                    if (!point) return "";
                    return `<strong>${point.time.toFixed(1)} seconds</strong><br/>Raw speed: ${point.raw} wpm${showBurst ? `<br/>Momentary pace: ${point.burst} wpm` : ""}<br/>New remaining errors: ${point.errors}`;
                },
            },
            series: [
                ...series,
                {
                    name: "Finish",
                    type: "scatter",
                    data: points.length
                        ? [[points.at(-1)!.time, points.at(-1)!.raw]]
                        : [],
                    symbolSize: 7,
                    itemStyle: {
                        color: colors.primary,
                        borderColor: colors.bg,
                        borderWidth: 2,
                    },
                    tooltip: { show: false },
                },
                {
                    name: "Errors",
                    type: "scatter",
                    data: points
                        .filter((p) => p.errors > 0)
                        .map((p) => [p.time, p.raw]),
                    symbolSize: 9,
                    itemStyle: {
                        color: colors.error,
                        borderColor: colors.error,
                        borderWidth: 2,
                    },
                    tooltip: { show: false },
                },
            ],
        };
    }, [points, colors, showBurst]);
    if (points.length === 0)
        return (
            <p className="analytics-empty">
                This attempt was too short to plot a pace trace.
            </p>
        );
    return (
        <div className="wps-chart-shell">
            <div className="pace-controls">
                <div
                    className="pace-legend"
                    role="group"
                    aria-label="Chart series"
                >
                    <span>
                        <i
                            style={{ background: colors.primary }}
                            aria-hidden="true"
                        />
                        Raw speed
                    </span>
                    <button
                        type="button"
                        aria-pressed={showBurst}
                        onClick={() => setShowBurst(!showBurst)}
                    >
                        <i
                            className="legend-dash"
                            style={{ color: colors.muted }}
                            aria-hidden="true"
                        />
                        Momentary pace
                    </button>
                    <span>
                        <i
                            className="legend-dot"
                            style={{ background: colors.error }}
                            aria-hidden="true"
                        />
                        Errors
                    </span>
                </div>
            </div>
            <div
                className="pace-canvas"
                role="img"
                aria-label={`Speed over ${points.at(-1)!.time} seconds. Final raw speed ${points.at(-1)!.raw} wpm, correct speed ${points.at(-1)!.correct} wpm. Error markers show increases in remaining mistakes.`}
            >
                <ReactEChartsCore
                    echarts={echarts}
                    option={option}
                    notMerge
                    opts={{ renderer: "svg" }}
                    style={{ width: "100%", height: "100%" }}
                />
            </div>
        </div>
    );
};
export default WPSLineChart;
