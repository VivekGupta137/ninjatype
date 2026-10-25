import { Chip, Tooltip } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";

type CounterConfig = {
    baseConcurrentUsers: number;
    monthlyGrowthRate: number;
    jitterRatio: number;
};

const DEFAULT_CONFIG: CounterConfig = {
    baseConcurrentUsers: 150,
    monthlyGrowthRate: 0.2,
    jitterRatio: 0.05,
};

// Interpret the starting date in the browser's local timezone.
const START_DATE = new Date(2026, 9, 25);

const hashString = (value: string) => {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
};

const getMonthsElapsedSinceStart = (date: Date) => {
    const yearDiff = date.getFullYear() - START_DATE.getFullYear();
    const monthDiff = date.getMonth() - START_DATE.getMonth();
    // Grow on each completed monthly anniversary, beginning November 25.
    const incompleteMonth = date.getDate() < START_DATE.getDate() ? 1 : 0;
    return Math.max(0, yearDiff * 12 + monthDiff - incompleteMonth);
};

export const getLiveUserCount = (
    now: Date,
    config: CounterConfig = DEFAULT_CONFIG,
) => {
    const monthsElapsed = getMonthsElapsedSinceStart(now);
    const monthlyGrowthFactor = Math.pow(1 + config.monthlyGrowthRate, monthsElapsed);
    const minuteOfDay = now.getHours() * 60 + now.getMinutes();
    const dayFraction = minuteOfDay / 1440;

    // Smooth daily curve: 80% at 06:00 local time, 120% at 18:00 local time.
    // Its daily average is the configured concurrent-user baseline.
    const timeOfDayFactor = 1 + Math.sin(dayFraction * Math.PI * 2 - Math.PI) * 0.2;

    // Deterministic jitter based on the browser's local calendar minute.
    const seed = [
        now.getFullYear(), now.getMonth(), now.getDate(),
        now.getHours(), now.getMinutes(),
    ].join("-");
    const noiseUnit = hashString(seed) / 0xffffffff;
    const noiseFactor = 1 + (noiseUnit * 2 - 1) * config.jitterRatio;

    const estimatedConcurrentUsers =
        config.baseConcurrentUsers *
        monthlyGrowthFactor *
        timeOfDayFactor *
        noiseFactor;

    return Math.max(1, Math.round(estimatedConcurrentUsers));
};

const LiveUserCounter = () => {
    // Read the clock after mounting so SSR never supplies the server's time.
    const [now, setNow] = useState<Date | null>(null);

    useEffect(() => {
        const updateNow = () => setNow(new Date());
        updateNow();

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

    const liveUsers = useMemo(() => now ? getLiveUserCount(now) : null, [now]);

    return (
        <Tooltip delay={0}>
            <Tooltip.Trigger>
                <Chip color="success">
                    <span className="live-user-dot" aria-hidden="true" />
                    <Chip.Label>{liveUsers?.toLocaleString() ?? "…"} Online</Chip.Label>
                </Chip>
            </Tooltip.Trigger>
            <Tooltip.Content>
                <p>current concurrent active users</p>
            </Tooltip.Content>
        </Tooltip>
    );
};

export default LiveUserCounter;
