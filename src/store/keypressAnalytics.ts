import { atom, onSet } from "nanostores";
import {
    KEYPRESS_ANALYTICS_STORAGE_KEY,
    KEYPRESS_ANALYTICS_VERSION,
    KEYPRESS_RETENTION_MONTHS,
    MAX_KEYPRESS_ATTEMPTS,
} from "@/constants/keypressAnalytics";
import {
    mergeAttempts,
    mergeKeyMaps,
    type KeyMetric,
    type KeypressAttempt,
    type KeyAnalyticsRange,
} from "@/lib/keypressStats";

export type { KeyMetric, KeypressAttempt, KeyAnalyticsRange };

export type KeypressAnalyticsData = {
    version: typeof KEYPRESS_ANALYTICS_VERSION;
    recentAttempts: KeypressAttempt[];
    monthlyBuckets: Record<string, Record<string, KeyMetric>>;
};

const defaultKeypressAnalytics: KeypressAnalyticsData = {
    version: KEYPRESS_ANALYTICS_VERSION,
    recentAttempts: [],
    monthlyBuckets: {},
};

export const toMonthKey = (timestamp: number): string => {
    const date = new Date(timestamp);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${date.getFullYear()}-${month}`;
};

export const isMonthWithinRetention = (
    monthKey: string,
    months: number,
    now: number = Date.now(),
): boolean => {
    const [year, month] = monthKey.split("-").map(Number);
    if (!year || !month) return false;
    const nowDate = new Date(now);
    const cutoff = new Date(nowDate.getFullYear(), nowDate.getMonth() - (months - 1), 1);
    const bucket = new Date(year, month - 1, 1);
    return bucket >= cutoff;
};

const isKeyMetric = (value: unknown): value is KeyMetric => {
    if (!value || typeof value !== "object") return false;
    const metric = value as KeyMetric;
    return (
        typeof metric.expected === "number" &&
        typeof metric.errors === "number" &&
        typeof metric.presses === "number" &&
        typeof metric.totalLatencyMs === "number"
    );
};

const isKeyMap = (value: unknown): value is Record<string, KeyMetric> => {
    if (!value || typeof value !== "object") return false;
    return Object.values(value).every(isKeyMetric);
};

const isAttempt = (value: unknown): value is KeypressAttempt => {
    if (!value || typeof value !== "object") return false;
    const attempt = value as KeypressAttempt;
    return (
        typeof attempt.sessionId === "string" &&
        typeof attempt.timestamp === "number" &&
        isKeyMap(attempt.keys)
    );
};

const loadKeypressAnalytics = (): KeypressAnalyticsData => {
    if (typeof window === "undefined") return defaultKeypressAnalytics;

    try {
        const stored = localStorage.getItem(KEYPRESS_ANALYTICS_STORAGE_KEY);
        if (!stored) return defaultKeypressAnalytics;

        const parsed = JSON.parse(stored);
        if (
            !parsed ||
            !Array.isArray(parsed.recentAttempts) ||
            !parsed.monthlyBuckets ||
            typeof parsed.monthlyBuckets !== "object"
        ) {
            console.warn("Invalid keypress analytics data, resetting");
            return defaultKeypressAnalytics;
        }

        const recentAttempts = parsed.recentAttempts.filter(isAttempt);
        const monthlyBuckets: Record<string, Record<string, KeyMetric>> = {};
        for (const [month, keys] of Object.entries(parsed.monthlyBuckets)) {
            if (isKeyMap(keys)) monthlyBuckets[month] = keys;
        }

        return pruneKeypressData({
            version: KEYPRESS_ANALYTICS_VERSION,
            recentAttempts,
            monthlyBuckets,
        });
    } catch (error) {
        console.error("Failed to load keypress analytics:", error);
        return defaultKeypressAnalytics;
    }
};

export const pruneKeypressData = (
    data: KeypressAnalyticsData,
    now: number = Date.now(),
): KeypressAnalyticsData => {
    const monthlyBuckets: Record<string, Record<string, KeyMetric>> = {};
    for (const [month, keys] of Object.entries(data.monthlyBuckets)) {
        if (isMonthWithinRetention(month, KEYPRESS_RETENTION_MONTHS, now)) {
            monthlyBuckets[month] = keys;
        }
    }

    return {
        version: KEYPRESS_ANALYTICS_VERSION,
        recentAttempts: data.recentAttempts.slice(0, MAX_KEYPRESS_ATTEMPTS),
        monthlyBuckets,
    };
};

const persistKeypressData = (data: KeypressAnalyticsData, retries = 4): void => {
    if (typeof window === "undefined") return;

    try {
        localStorage.setItem(KEYPRESS_ANALYTICS_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error("Failed to save keypress analytics:", error);
        if (
            !(error instanceof Error && error.name === "QuotaExceededError") ||
            retries <= 0
        ) {
            return;
        }

        const monthKeys = Object.keys(data.monthlyBuckets).sort();
        if (monthKeys.length > 0) {
            const { [monthKeys[0]]: _dropped, ...rest } = data.monthlyBuckets;
            persistKeypressData({ ...data, monthlyBuckets: rest }, retries - 1);
            return;
        }

        if (data.recentAttempts.length > 1) {
            persistKeypressData(
                { ...data, recentAttempts: data.recentAttempts.slice(0, -1) },
                retries - 1,
            );
        }
    }
};

export const $keypressAnalytics = atom<KeypressAnalyticsData>(loadKeypressAnalytics());

onSet($keypressAnalytics, ({ newValue }) => {
    persistKeypressData(newValue);
});

export const saveKeypressAttempt = (attempt: KeypressAttempt): void => {
    const current = $keypressAnalytics.get();
    const month = toMonthKey(attempt.timestamp);
    const existingMonth = current.monthlyBuckets[month] ?? {};

    $keypressAnalytics.set(
        pruneKeypressData({
            version: KEYPRESS_ANALYTICS_VERSION,
            recentAttempts: [attempt, ...current.recentAttempts],
            monthlyBuckets: {
                ...current.monthlyBuckets,
                [month]: mergeKeyMaps([existingMonth, attempt.keys]),
            },
        }),
    );
};

export const clearKeypressAnalytics = (): void => {
    $keypressAnalytics.set(defaultKeypressAnalytics);
    if (typeof window === "undefined") return;
    try {
        localStorage.removeItem(KEYPRESS_ANALYTICS_STORAGE_KEY);
    } catch (error) {
        console.error("Failed to clear keypress analytics:", error);
    }
};

export const getKeyStatsForRange = (
    range: KeyAnalyticsRange,
    data: KeypressAnalyticsData = $keypressAnalytics.get(),
): Record<string, KeyMetric> => {
    switch (range) {
        case "latest":
            return data.recentAttempts[0]?.keys ?? {};
        case "last5":
            return mergeAttempts(data.recentAttempts.slice(0, 5));
        case "last10":
            return mergeAttempts(data.recentAttempts.slice(0, 10));
        case "overTime":
            return mergeKeyMaps(Object.values(data.monthlyBuckets));
    }
};

export const getAttemptCountForRange = (
    range: KeyAnalyticsRange,
    data: KeypressAnalyticsData = $keypressAnalytics.get(),
): number => {
    switch (range) {
        case "latest":
            return data.recentAttempts.length > 0 ? 1 : 0;
        case "last5":
            return Math.min(5, data.recentAttempts.length);
        case "last10":
            return Math.min(10, data.recentAttempts.length);
        case "overTime":
            return Object.keys(data.monthlyBuckets).length;
    }
};
