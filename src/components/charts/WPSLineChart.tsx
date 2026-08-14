import { $errorCPS, $rawCPS } from "@/store/analytics";
import { $config } from "@/store/config";
import { echarts, type ECOption } from "@/lib/echarts";
import { useStore } from "@nanostores/react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import { useEffect, useMemo, useState } from "react";

type WPMPoint = {
    time: number;
    raw: number;
    burst: number;
    errors: number;
};

type ChartColors = {
    primary: string;
    secondary: string;
    muted: string;
    error: string;
    text: string;
    bg: string;
    altBg: string;
};

const FALLBACK: ChartColors = {
    primary: "#e0e0e0",
    secondary: "#808080",
    muted: "#404040",
    error: "#ff6b6b",
    text: "#ffffff",
    bg: "#000000",
    altBg: "#121212",
};

const CHART_HEIGHT = 280;
/** Max rendered x-points — keeps trends readable on the compact chart width. */
const MAX_CHART_POINTS = 24;

const readVar = (name: string, fallback: string) => {
    if (typeof window === "undefined") return fallback;
    return (
        getComputedStyle(document.documentElement)
            .getPropertyValue(name)
            .trim() || fallback
    );
};

const readColors = (): ChartColors => ({
    primary: readVar("--main-color", FALLBACK.primary),
    secondary: readVar("--sub-text-color", FALLBACK.secondary),
    muted: readVar("--sub-alt-text-color", FALLBACK.muted),
    error: readVar("--error-color", FALLBACK.error),
    text: readVar("--text-color", FALLBACK.text),
    bg: readVar("--bg-color", FALLBACK.bg),
    altBg: readVar("--alt-bg-color", FALLBACK.altBg),
});

const alpha = (color: string, a: number) => {
    if (color.startsWith("#")) {
        const hex =
            color.length === 4
                ? [...color.slice(1)].map((c) => c + c).join("")
                : color.slice(1, 7);
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    if (color.startsWith("rgba(")) {
        return color.replace(/,\s*[\d.]+\)$/, `, ${a})`);
    }
    if (color.startsWith("rgb(")) {
        return color.replace("rgb(", "rgba(").replace(")", `, ${a})`);
    }
    return color;
};

/**
 * Collapse dense 0.2s samples into a fixed number of equal time bins.
 * Averages WPM in each bin so the line shows trend instead of per-tick noise.
 */
const downsampleToTrend = (
    points: WPMPoint[],
    maxPoints: number,
): WPMPoint[] => {
    if (points.length <= maxPoints) return points;

    const tStart = points[0].time;
    const tEnd = points[points.length - 1].time;
    if (tEnd <= tStart) return points.slice(0, maxPoints);

    const result: WPMPoint[] = [];
    let cursor = 0;

    for (let i = 0; i < maxPoints; i++) {
        const binStart = tStart + ((tEnd - tStart) * i) / maxPoints;
        const binEnd =
            i === maxPoints - 1
                ? tEnd
                : tStart + ((tEnd - tStart) * (i + 1)) / maxPoints;

        while (cursor < points.length && points[cursor].time < binStart) {
            cursor += 1;
        }

        const bucket: WPMPoint[] = [];
        let j = cursor;
        while (j < points.length && points[j].time <= binEnd) {
            if (points[j].time >= binStart) bucket.push(points[j]);
            j += 1;
        }

        if (bucket.length === 0) {
            // Interpolate between nearest neighbors when a bin is empty
            const prev = points[Math.max(0, cursor - 1)];
            const next = points[Math.min(points.length - 1, cursor)];
            const span = next.time - prev.time || 1;
            const t = Number((((binStart + binEnd) / 2)).toFixed(1));
            const u = Math.min(1, Math.max(0, (t - prev.time) / span));
            result.push({
                time: t,
                raw: Math.round(prev.raw + (next.raw - prev.raw) * u),
                burst: Math.round(prev.burst + (next.burst - prev.burst) * u),
                errors: 0,
            });
            continue;
        }

        const n = bucket.length;
        result.push({
            time: Number(bucket[n - 1].time.toFixed(1)),
            raw: Math.round(bucket.reduce((s, p) => s + p.raw, 0) / n),
            burst: Math.round(bucket.reduce((s, p) => s + p.burst, 0) / n),
            errors: bucket.reduce((s, p) => s + p.errors, 0),
        });
    }

    return result;
};

const buildPoints = (
    rawCPS: { count: number; time: number }[],
    errorCPS: { count: number; time: number }[],
): WPMPoint[] => {
    const finePoints: WPMPoint[] = rawCPS.map((sample, i) => {
        const t = sample.time || 1;
        const raw = Math.ceil((sample.count / t / 5) * 60);

        let burst = 0;
        if (i > 0) {
            const prev = rawCPS[i - 1];
            const dt = sample.time - prev.time;
            const dc = sample.count - prev.count;
            burst = dt > 0 ? Math.max(Math.ceil((dc / (dt * 5)) * 60), 0) : 0;
        } else if (sample.time > 0) {
            burst = Math.ceil((sample.count * 60) / (sample.time * 5 || 1));
        }

        const errNow = errorCPS[i]?.count ?? 0;
        const errPrev = i > 0 ? (errorCPS[i - 1]?.count ?? 0) : 0;

        return {
            time: sample.time,
            raw,
            burst,
            errors: errNow - errPrev,
        };
    });

    return downsampleToTrend(finePoints, MAX_CHART_POINTS);
};

const formatSecondsLabel = (seconds: number) => {
    const t = Number(Number(seconds).toFixed(1));
    return t === 1 ? "1 second" : `${t} seconds`;
};

const tooltipHtml = (point: WPMPoint, colors: ChartColors) => {
    const metric = (
        color: string,
        label: string,
        value: number,
        style: "solid" | "dashed" | "dot" = "solid",
    ) => {
        const swatch =
            style === "dashed"
                ? `<span style="width:12px;height:0;border-top:2px dashed ${color};display:inline-block"></span>`
                : style === "dot"
                  ? `<span style="width:8px;height:8px;border-radius:50%;background:${color};box-shadow:0 0 6px ${alpha(color, 0.6)};display:inline-block"></span>`
                  : `<span style="width:12px;height:3px;border-radius:2px;background:${color};display:inline-block"></span>`;

        return `
            <div style="display:flex;justify-content:space-between;align-items:center;gap:24px">
                <div style="display:flex;align-items:center;gap:8px">
                    ${swatch}
                    <span style="color:${colors.secondary};font-size:12px">${label}</span>
                </div>
                <span style="font-variant-numeric:tabular-nums;font-weight:650;color:${colors.text};font-size:13px">
                    ${value} <span style="color:${colors.secondary};font-weight:500;font-size:11px">WPM</span>
                </span>
            </div>
        `;
    };

    const errors =
        point.errors > 0
            ? `
        <div style="margin-top:8px;padding-top:8px;border-top:1px solid ${alpha(colors.muted, 0.7)};display:flex;justify-content:space-between;align-items:center;gap:24px">
            <div style="display:flex;align-items:center;gap:8px">
                <span style="width:8px;height:8px;border-radius:50%;background:${colors.error};display:inline-block"></span>
                <span style="color:${colors.error};font-size:12px">Errors</span>
            </div>
            <span style="font-variant-numeric:tabular-nums;font-weight:650;color:${colors.error};font-size:13px">${point.errors}</span>
        </div>
    `
            : "";

    return `
        <div style="min-width:168px">
            <div style="margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid ${alpha(colors.muted, 0.7)}">
                <div style="font-size:13px;color:${colors.text};font-weight:650;font-variant-numeric:tabular-nums">
                    ${formatSecondsLabel(point.time)}
                </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:7px">
                ${metric(colors.primary, "Raw", point.raw, "dot")}
                ${metric(alpha(colors.secondary, 0.85), "Burst", point.burst, "dashed")}
                ${errors}
            </div>
        </div>
    `;
};

const buildOption = (points: WPMPoint[], colors: ChartColors): ECOption => {
    const times = points.map((p) => p.time);
    const raw = points.map((p) => p.raw);
    const burst = points.map((p) => p.burst);
    const errorPoints = points
        .filter((p) => p.errors > 0)
        .map((p) => [p.time, p.raw] as [number, number]);

    const peak = Math.max(1, ...raw, ...burst);

    return {
        backgroundColor: "transparent",
        animation: true,
        animationDuration: 700,
        animationEasing: "cubicOut",
        color: [colors.primary, alpha(colors.secondary, 0.75)],
        legend: {
            bottom: 0,
            left: "center",
            itemWidth: 18,
            itemHeight: 8,
            itemGap: 24,
            icon: "roundRect",
            textStyle: {
                color: colors.secondary,
                fontSize: 12,
                fontWeight: 500,
            },
            data: [
                {
                    name: "Raw",
                    itemStyle: { color: colors.primary },
                },
                {
                    name: "Burst",
                    itemStyle: { color: alpha(colors.secondary, 0.75) },
                    lineStyle: { type: "dashed" },
                },
            ],
        },
        grid: {
            top: 28,
            right: 18,
            bottom: 44,
            left: 8,
            containLabel: true,
        },
        tooltip: {
            trigger: "axis",
            backgroundColor: alpha(colors.altBg, 0.92),
            borderColor: alpha(colors.muted, 0.9),
            borderWidth: 1,
            borderRadius: 10,
            padding: [12, 14],
            extraCssText: `
                backdrop-filter: blur(12px);
                box-shadow: 0 12px 28px ${alpha(colors.bg, 0.55)};
            `,
            textStyle: {
                color: colors.text,
                fontSize: 13,
            },
            axisPointer: {
                type: "cross",
                snap: true,
                label: {
                    show: true,
                    backgroundColor: colors.muted,
                    color: colors.text,
                    borderRadius: 4,
                    padding: [3, 6],
                    fontSize: 11,
                    formatter: (params) => {
                        const value = Number(
                            typeof params === "object" &&
                                params !== null &&
                                "value" in params
                                ? (params as { value: number | string }).value
                                : params,
                        );
                        if (!Number.isFinite(value)) return "";

                        const dimension =
                            typeof params === "object" &&
                            params !== null &&
                            "axisDimension" in params
                                ? (params as { axisDimension?: string })
                                      .axisDimension
                                : undefined;

                        if (dimension === "x") {
                            return formatSecondsLabel(value);
                        }
                        if (dimension === "y") {
                            return `${Math.round(value)} WPM`;
                        }
                        return String(value);
                    },
                },
                crossStyle: {
                    color: alpha(colors.text, 0.22),
                    width: 1,
                    type: "dashed",
                },
                lineStyle: {
                    color: alpha(colors.primary, 0.35),
                    width: 1,
                    type: "solid",
                },
            },
            formatter: (params) => {
                const items = Array.isArray(params) ? params : [params];
                const line =
                    items.find((p) => p.seriesName === "Raw") ?? items[0];
                const point = points[line?.dataIndex ?? -1];
                if (!point) return "";
                return tooltipHtml(point, colors);
            },
        },
        xAxis: {
            type: "value",
            min: times[0] ?? 0,
            max: times[times.length - 1] ?? 1,
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: {
                color: colors.secondary,
                fontSize: 11,
                formatter: (v: number) =>
                    `${Number.isInteger(v) ? v : Number(v.toFixed(1))}s`,
                hideOverlap: true,
            },
        },
        yAxis: {
            type: "value",
            min: 0,
            max: Math.ceil(peak * 1.12),
            splitNumber: 4,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
                color: colors.secondary,
                fontSize: 11,
                formatter: (v: number) => `${Math.round(v)}`,
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: alpha(colors.muted, 0.55),
                    type: "dashed",
                    width: 1,
                },
            },
            name: "WPM",
            nameLocation: "end",
            nameGap: 8,
            nameTextStyle: {
                color: colors.secondary,
                fontSize: 11,
                fontWeight: 600,
                align: "left",
            },
        },
        series: [
            {
                name: "Raw",
                type: "line",
                smooth: 0.5,
                sampling: "average",
                symbol: "circle",
                symbolSize: 7,
                showSymbol: false,
                data: points.map((p) => [p.time, p.raw]),
                lineStyle: {
                    width: 3,
                    color: colors.primary,
                    shadowColor: alpha(colors.primary, 0.45),
                    shadowBlur: 10,
                    shadowOffsetY: 2,
                },
                itemStyle: {
                    color: colors.primary,
                    borderColor: colors.bg,
                    borderWidth: 2,
                },
                areaStyle: {
                    color: {
                        type: "linear",
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: alpha(colors.primary, 0.32) },
                            { offset: 0.55, color: alpha(colors.primary, 0.08) },
                            { offset: 1, color: alpha(colors.primary, 0) },
                        ],
                    },
                },
                emphasis: {
                    focus: "series",
                    scale: true,
                    lineStyle: { width: 3.5 },
                },
                z: 3,
            },
            {
                name: "Burst",
                type: "line",
                smooth: 0.5,
                sampling: "average",
                symbol: "circle",
                symbolSize: 6,
                showSymbol: false,
                data: points.map((p) => [p.time, p.burst]),
                lineStyle: {
                    width: 1.75,
                    type: [5, 5],
                    color: alpha(colors.secondary, 0.75),
                },
                itemStyle: {
                    color: alpha(colors.secondary, 0.9),
                    borderColor: colors.bg,
                    borderWidth: 2,
                },
                emphasis: {
                    focus: "series",
                    lineStyle: { width: 2.25 },
                },
                z: 2,
            },
            {
                name: "Errors",
                type: "scatter",
                symbol: "circle",
                symbolSize: 10,
                data: errorPoints,
                itemStyle: {
                    color: colors.error,
                    borderColor: colors.bg,
                    borderWidth: 2,
                    shadowBlur: 8,
                    shadowColor: alpha(colors.error, 0.55),
                },
                emphasis: {
                    scale: 1.25,
                    itemStyle: {
                        shadowBlur: 12,
                        shadowColor: alpha(colors.error, 0.7),
                    },
                },
                tooltip: { show: false },
                z: 4,
                legendHoverLink: false,
            },
        ],
    };
};

const WPSLineChart: React.FC = () => {
    const rawCPS = useStore($rawCPS);
    const errorCPS = useStore($errorCPS);
    const { theme } = useStore($config);
    const [colors, setColors] = useState<ChartColors>(FALLBACK);

    useEffect(() => {
        const apply = () => setColors(readColors());
        apply();

        const themeLink = document.getElementById("currentTheme");
        themeLink?.addEventListener("load", apply);
        const timeoutId = window.setTimeout(apply, 50);

        return () => {
            themeLink?.removeEventListener("load", apply);
            window.clearTimeout(timeoutId);
        };
    }, [theme]);

    const points = useMemo(
        () => buildPoints(rawCPS, errorCPS),
        [rawCPS, errorCPS],
    );

    const option = useMemo(() => buildOption(points, colors), [points, colors]);

    if (points.length === 0) {
        return (
            <div
                className="wps-chart-shell"
                style={{
                    width: "100%",
                    maxWidth: 860,
                    height: CHART_HEIGHT,
                    display: "grid",
                    placeItems: "center",
                    color: "var(--sub-text-color)",
                    fontSize: 13,
                }}
            >
                No performance data yet
            </div>
        );
    }

    return (
        <div
            className="wps-chart-shell"
            style={{
                width: "100%",
                maxWidth: 860,
                height: CHART_HEIGHT,
            }}
        >
            <ReactEChartsCore
                echarts={echarts}
                option={option}
                notMerge
                lazyUpdate
                opts={{ renderer: "canvas" }}
                style={{ width: "100%", height: "100%" }}
            />
        </div>
    );
};

export default WPSLineChart;
