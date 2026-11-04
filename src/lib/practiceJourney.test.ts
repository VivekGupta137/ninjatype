import { describe, expect, test } from "bun:test";
import type { TypingSession } from "@/store/history";
import type { KeyMetric } from "./keypressStats";
import {
    capturePracticeSettings, collectPracticeDays, dailyStreak, isCalendarDay,
    latestPracticeSession, localDayKey, practiceComparison, qualifiesForPractice,
    readPracticeSettings, recommendPractice, samePracticeSettings, settingsLabel,
    type PracticeSettings,
} from "./practiceJourney";

const now = new Date(2026, 10, 3, 12);
const settings: PracticeSettings = { mode: "time", countdownTime: "1m", dictionary: "1k" };
function session(overrides: Partial<TypingSession> = {}): TypingSession {
    return { id: "current", timestamp: now.getTime(), wpm: 50, correctWpm: 48, cpm: 250,
        accuracy: 96, errors: 10, duration: 60, mode: "time", source: "1k",
        practiceSettings: settings, ...overrides };
}
function key(expected: number, errors: number): KeyMetric {
    return { expected, errors, presses: expected, totalLatencyMs: 500 };
}

describe("exact practice continuation", () => {
    test("captures only relevant settings without copying appearance", () => {
        expect(capturePracticeSettings({ mode: "words", maxWordCount: "25", dictionary: "5k", theme: "nord", countdownTime: "1m", quotes: "funny-quotes", chartBins: "auto" }))
            .toEqual({ mode: "words", maxWordCount: "25", dictionary: "5k" });
        expect(settingsLabel({ mode: "quotes", quotes: "funny-quotes" })).toBe("Funny quotes");
        expect(settingsLabel(settings)).toBe("1m · 1K Common");
    });
    test("validates unknown persisted metadata and strips unrelated fields", () => {
        for (const invalid of [undefined, null, [], "time", {}, { mode: "time", countdownTime: "999m", dictionary: "1k" },
            { mode: "time", countdownTime: "1m", dictionary: "__proto__" }, { mode: "words", maxWordCount: 25, dictionary: "1k" },
            { mode: "quotes", quotes: "missing" }]) expect(readPracticeSettings(invalid)).toBeNull();
        expect(readPracticeSettings({ ...settings, theme: "nord" })).toEqual(settings);
    });
    test("shows the latest solo speed, including legacy sessions without settings", () => {
        const recent = session({ dailyChallengeDay: localDayKey(now) });
        expect(latestPracticeSession([session({ timestamp: now.getTime() - 5 }), recent,
            session({ practiceSettings: undefined }), session({ mode: "multiplayer" })])).toBe(recent);
        const legacy = session({ practiceSettings: undefined });
        expect(latestPracticeSession([legacy])).toBe(legacy);
        const inaccurate = session({ accuracy: 0, correctWpm: 0, timestamp: now.getTime() + 1 });
        expect(latestPracticeSession([legacy, inaccurate])).toBe(inaccurate); // Previous speed is not a streak eligibility filter.
        expect(latestPracticeSession([session({ mode: "multiplayer" })])).toBeNull();
        expect(latestPracticeSession([null, {}, session({ wpm: NaN })] as TypingSession[])).toBeNull();
    });
    test("does not compare differing or unknown test lengths/sources", () => {
        const words = { mode: "words" as const, maxWordCount: "25", dictionary: "1k" as const };
        expect(samePracticeSettings(words, { ...words, maxWordCount: "50" })).toBe(false);
        expect(samePracticeSettings(settings, { ...settings, dictionary: "5k" })).toBe(false);
        expect(samePracticeSettings(undefined, undefined)).toBe(false);
        expect(samePracticeSettings({ dictionary: "1k", countdownTime: "1m", mode: "time" }, settings)).toBe(true);
        expect(practiceComparison(session(), [session({ id: "old", timestamp: now.getTime() - 1, practiceSettings: undefined })])).toBeNull();
    });
    test("compares the previous five matching attempts, excluding current and future results", () => {
        const previous = Array.from({ length: 7 }, (_, i) => session({ id: `old-${i}`, timestamp: now.getTime() - i - 1, wpm: 40, accuracy: 98 }));
        expect(practiceComparison(session(), [...previous, session(), session({ id: "future", timestamp: now.getTime() + 1, wpm: 1000 })]))
            .toEqual({ count: 5, averageWpm: 40, averageAccuracy: 98 });
    });
});

describe("post-test recommendations", () => {
    test("uses repeated errors for a matching QWERTY finger lesson", () => {
        const result = recommendPractice(session(), { f: key(10, 4), e: key(20, 2) });
        expect(result.href).toBe("/learn/fingers/pointer/");
        expect(result.reason).toContain("4 of 10");
    });
    test("does not make a finger diagnosis from one slip or unsupported keys", () => {
        expect(recommendPractice(session(), { f: key(1, 1), " ": key(20, 5) }).href).toBeUndefined();
        expect(recommendPractice(session(), { f: key(10, 1) }).title).toContain("accuracy");
    });
    test("asks for a longer baseline for short attempts and otherwise offers a pace challenge", () => {
        expect(recommendPractice(session({ duration: 2 }), { f: key(10, 5) }).title).toContain("longer baseline");
        expect(recommendPractice(session({ accuracy: 97 }), {}).href).toBe("/ghost-race/");
        expect(recommendPractice(session({ accuracy: 96 }), {}).href).toBeUndefined();
    });
});

describe("automatic daily practice streaks", () => {
    test("any scored typing mode counts without opt-in, a specific dictionary, or a one-minute timer", () => {
        for (const mode of ["time", "words", "quotes", "multiplayer"]) {
            const attempt = session({ mode, source: "5k", duration: 15, practiceSettings: undefined, correctWpm: undefined });
            expect(qualifiesForPractice(attempt)).toBe(true);
            expect(collectPracticeDays([attempt])).toEqual(["2026-11-03"]);
        }
    });
    test("empty or invalid output and simulator modes do not count", () => {
        for (const change of [{ duration: 0 }, { wpm: 0 }, { timestamp: NaN }, { accuracy: NaN }, { wpm: Infinity },
            { correctWpm: 0 }, { correctWpm: NaN }, { accuracy: 0 }, { mode: "hacker-typer" }]) {
            expect(qualifiesForPractice(session(change))).toBe(false);
        }
        expect(collectPracticeDays([])).toEqual([]);
    });
    test("counts consecutive practice dates, not repeated sessions", () => {
        const dates = [1, 2, 3, 3].map(day => session({ timestamp: new Date(2026, 10, day, 12).getTime() }));
        expect(dailyStreak(dates, now)).toBe(3);
        expect(collectPracticeDays(dates)).toHaveLength(3);
    });
    test("gives today to continue yesterday's streak, then resets after a missed day", () => {
        expect(dailyStreak([], now, ["2026-11-01", "2026-11-02"])).toBe(2);
        expect(dailyStreak([], new Date(2026, 10, 4), ["2026-11-01", "2026-11-02"])).toBe(0);
        expect(dailyStreak([], new Date(2026, 10, 4), ["2026-11-01", "2026-11-02", "2026-11-04"])).toBe(1);
    });
    test("crosses month, year and daylight-saving boundaries using calendar days", () => {
        expect(dailyStreak([], new Date(2027, 0, 1), ["2026-12-30", "2026-12-31", "2027-01-01"])).toBe(3);
        expect(dailyStreak([], new Date(2026, 10, 2), ["2026-10-31", "2026-11-01", "2026-11-02"])).toBe(3);
        expect(dailyStreak([], new Date(2026, 2, 9), ["2026-03-07", "2026-03-08", "2026-03-09"])).toBe(3);
    });
    test("ignores future dates, malformed storage, and impossible rollover dates", () => {
        expect(isCalendarDay("2026-02-30")).toBe(false);
        expect(isCalendarDay("2028-02-29")).toBe(true);
        expect(dailyStreak([], now, ["2026-11-04", "2026-11-02", "wrong", null, 42])).toBe(1);
        expect(dailyStreak([], now, {})).toBe(0);
    });
    test("preserves legacy challenge dates while backfilling ordinary practice", () => {
        const pastChallenge = session({ dailyChallengeDay: "2026-11-02" });
        expect(collectPracticeDays([pastChallenge, session()], ["2026-11-01", "bad", null]))
            .toEqual(["2026-11-01", "2026-11-02", "2026-11-03"]);
    });
    test("new sessions crossing midnight use their completion date", () => {
        const afterMidnight = session({ timestamp: new Date(2026, 10, 3, 0, 0, 30).getTime() });
        expect(collectPracticeDays([afterMidnight])).toEqual(["2026-11-03"]);
    });
});
