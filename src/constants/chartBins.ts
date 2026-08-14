export type ChartBinsSetting = "auto" | "24" | "48" | "96" | "120" | "full";

export const CHART_BINS_MIN = 24;
export const CHART_BINS_MAX = 150;

export const CHART_BINS_OPTIONS: {
    value: ChartBinsSetting;
    label: string;
    hint?: string;
}[] = [
    {
        value: "auto",
        label: "Auto",
        hint: "Scales with test length (~1 point per second)",
    },
    { value: "24", label: "24 bins" },
    { value: "48", label: "48 bins" },
    { value: "96", label: "96 bins" },
    { value: "120", label: "120 bins" },
    {
        value: "full",
        label: "Full detail",
        hint: "All 0.2s samples — can look noisy on long tests",
    },
];

/**
 * Resolve how many time bins to render on the performance chart.
 * Auto mode uses ~1 bin per second of elapsed time (clamped).
 */
export const resolveChartMaxPoints = (
    durationSeconds: number,
    setting: ChartBinsSetting,
    sampleCount = 0,
): number => {
    if (setting === "full") {
        return sampleCount > 0 ? sampleCount : Number.MAX_SAFE_INTEGER;
    }

    const fixed = Number.parseInt(setting, 10);
    if (Number.isFinite(fixed) && fixed > 0) {
        return fixed;
    }

    const duration = Math.max(durationSeconds, 1);
    return Math.min(
        CHART_BINS_MAX,
        Math.max(CHART_BINS_MIN, Math.ceil(duration)),
    );
};
