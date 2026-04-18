import { Badge, Chip } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";

type CounterConfig = {
    baseDailyVisitors: number;
    scale: number;
    concurrencyRatio: number;
};

const DEFAULT_CONFIG: CounterConfig = {
    // Preconfigured inputs for shaping the curve.
    baseDailyVisitors: 1800,
    scale: 1,
    concurrencyRatio: 0.022,
};

const START_DATE_LOCAL = new Date(2026, 0, 1);
START_DATE_LOCAL.setHours(0, 0, 0, 0);

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const toLocalMidnight = (date: Date) => {
    const atMidnight = new Date(date);
    atMidnight.setHours(0, 0, 0, 0);
    return atMidnight;
};

const hashString = (value: string) => {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
};

const getMonthsElapsedSinceStart = (date: Date) => {
    const yearDiff = date.getFullYear() - START_DATE_LOCAL.getFullYear();
    const monthDiff = date.getMonth() - START_DATE_LOCAL.getMonth();
    return Math.max(0, yearDiff * 12 + monthDiff);
};

const getDaysElapsedSinceStart = (date: Date) => {
    const todayLocalMidnight = toLocalMidnight(date);
    const diff = todayLocalMidnight.getTime() - START_DATE_LOCAL.getTime();
    return Math.max(0, Math.floor(diff / ONE_DAY_MS));
};

export const getLiveUserCount = (
    now: Date,
    config: CounterConfig = DEFAULT_CONFIG,
) => {
    const monthsElapsed = getMonthsElapsedSinceStart(now);
    const daysElapsed = getDaysElapsedSinceStart(now);

    const monthlyGrowthFactor = Math.pow(1.1, monthsElapsed);
    const dailyTrendFactor = 1 + daysElapsed * 0.0015;

    const baseDailyVisitors =
        config.baseDailyVisitors * monthlyGrowthFactor * dailyTrendFactor;

    const minuteOfDay = now.getHours() * 60 + now.getMinutes();
    const dayFraction = minuteOfDay / 1440;

    // Smooth traffic curve with morning and evening peaks.
    const primaryWave = Math.sin(dayFraction * Math.PI * 2 - Math.PI / 2);
    const secondaryWave = Math.sin(dayFraction * Math.PI * 4 - Math.PI / 3);
    const timeOfDayFactor = Math.max(
        0.25,
        0.62 + primaryWave * 0.23 + secondaryWave * 0.12,
    );

    // Slight weekend dip.
    const day = now.getDay();
    const weekdayFactor = day === 0 || day === 6 ? 0.9 : 1;

    // Deterministic minute-level jitter, same for users with same local minute/date/timezone.
    const seed = [
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getTimezoneOffset(),
    ].join("-");
    const noiseUnit = hashString(seed) / 0xffffffff;
    const noiseFactor = 0.94 + noiseUnit * 0.12;

    const estimatedConcurrentUsers =
        baseDailyVisitors *
        config.concurrencyRatio *
        timeOfDayFactor *
        weekdayFactor *
        noiseFactor *
        config.scale;

    return Math.max(1, Math.round(estimatedConcurrentUsers));
};

const LiveUserCounter = () => {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const updateNow = () => setNow(new Date());

        const current = new Date();
        const secondsUntilNextMinute = 60 - current.getSeconds();
        const initialDelayMs =
            secondsUntilNextMinute * 1000 - current.getMilliseconds();

        let intervalId: number | null = null;
        const initialTimeout = window.setTimeout(
            () => {
                updateNow();
                intervalId = window.setInterval(updateNow, 60_000);
            },
            Math.max(0, initialDelayMs),
        );

        return () => {
            window.clearTimeout(initialTimeout);
            if (intervalId) {
                window.clearInterval(intervalId);
            }
        };
    }, []);

    const liveUsers = useMemo(() => getLiveUserCount(now), [now]);

    return (
        <div>
            <Badge.Anchor>
                <Chip color="success">
                    <span className="live-user-dot" aria-hidden="true" />
                    <Chip.Label>{liveUsers.toLocaleString()} Online</Chip.Label>
                </Chip>
            </Badge.Anchor>
        </div>
    );
};

export default LiveUserCounter;
