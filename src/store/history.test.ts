import { afterEach, expect, test } from "bun:test";
import { $history, addSession, clearHistory, recordPracticeDay, type TypingSession } from "./history";
import { $keypressAnalytics } from "./keypressAnalytics";
import { collectPracticeDays, dailyStreak } from "@/lib/practiceJourney";
import { MAX_HISTORY_SESSIONS } from "@/constants/history";

const original = $history.get();
const originalKeys = $keypressAnalytics.get();
afterEach(() => { $history.set(original); $keypressAnalytics.set(originalKeys); });
const practice: TypingSession = {
    id: "practice", timestamp: new Date(2026, 10, 3, 12).getTime(), wpm: 30,
    cpm: 150, accuracy: 98, errors: 3, correctWpm: 29, duration: 25,
    mode: "time", source: "5k",
};

test("ordinary completion automatically updates the streak, once per day", () => {
    $history.set({ sessions: [] });
    addSession(practice);
    addSession({ ...practice, id: "retry", mode: "words" });
    expect($history.get().dailyCompletionDays).toEqual(["2026-11-03"]);
});

test("practice dates survive detailed-history trimming and round-trip browser storage", () => {
    $history.set({ sessions: [] });
    addSession({ ...practice, timestamp: new Date(2026, 10, 2, 12).getTime() });
    for (let i = 0; i < MAX_HISTORY_SESSIONS; i++) addSession({ ...practice, id: `new-${i}` });
    expect($history.get().sessions).toHaveLength(MAX_HISTORY_SESSIONS);
    const reloaded = JSON.parse(JSON.stringify($history.get()));
    expect(dailyStreak(reloaded.sessions, new Date(2026, 10, 4), reloaded.dailyCompletionDays)).toBe(2);
});

test("clearing history also clears the streak, including its compact date ledger", () => {
    $history.set({ sessions: [practice], dailyCompletionDays: ["2026-11-02", "2026-11-03"] });
    clearHistory();
    expect(collectPracticeDays($history.get().sessions, $history.get().dailyCompletionDays)).toEqual([]);
});

test("new completions retain legacy challenge credit and backfill older ordinary sessions", () => {
    $history.set({ sessions: [
        { ...practice, id: "legacy-challenge", dailyChallengeDay: "2026-11-01" },
        { ...practice, id: "older-practice", timestamp: new Date(2026, 10, 2, 12).getTime() },
    ] });
    addSession(practice);
    expect($history.get().dailyCompletionDays).toEqual(["2026-11-01", "2026-11-02", "2026-11-03"]);
});

test("completed lessons credit the practice ledger without mixing scores into history", () => {
    $history.set({ sessions: [practice] });
    recordPracticeDay(new Date(2026, 10, 4));
    recordPracticeDay(new Date(2026, 10, 4));
    recordPracticeDay(new Date(NaN));
    expect($history.get().sessions).toEqual([practice]);
    expect($history.get().dailyCompletionDays).toEqual(["2026-11-03", "2026-11-04"]);
});
