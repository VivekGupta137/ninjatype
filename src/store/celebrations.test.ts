import { afterEach, beforeEach, expect, test } from "bun:test";
import { $history, addSession, clearHistory, recordPracticeDay, type TypingSession } from "./history";
import { $celebration, celebrate, dismissCelebration } from "./celebrations";
import { $keypressAnalytics } from "./keypressAnalytics";
import { localDayKey } from "@/lib/practiceJourney";

const original = $history.get();
const originalKeys = $keypressAnalytics.get();
const now = new Date();
const day = localDayKey(now);
const result = (id: string, wpm: number, mode = "time"): TypingSession => ({
    id, timestamp: now.getTime(), wpm, cpm: wpm * 5, correctWpm: wpm,
    accuracy: 100, errors: 0, duration: 25, mode,
});
beforeEach(() => { $history.set({ sessions: [] }); dismissCelebration(); });
afterEach(() => { $history.set(original); $keypressAnalytics.set(originalKeys); dismissCelebration(); });

test("one celebration for the first completion, not repeated snapshots or same-day practice", () => {
    addSession(result("first", 50));
    expect($celebration.get()).toMatchObject({ streak: 1 });
    dismissCelebration();
    addSession(result("first", 100)); // Duplicate identity cannot change a finished score.
    addSession(result("second", 45));
    expect($celebration.get()).toBeNull();
    expect($history.get().sessions).toHaveLength(2);
});

test("records celebrate in multiplayer and Ghost Race's completion path", () => {
    addSession(result("solo", 50));
    dismissCelebration();
    addSession(result("multiplayer-round-1", 60, "multiplayer"));
    expect($celebration.get()?.record).toEqual({ previousWpm: 50, wpm: 60 });
    dismissCelebration();
    addSession(result("ghost", 70, "words"));
    expect($celebration.get()?.record).toEqual({ previousWpm: 60, wpm: 70 });
    expect($celebration.get()?.streak).toBeUndefined();
});

test("loading/restoring history never publishes celebrations", () => {
    $history.set({ sessions: [result("saved", 80)], dailyCompletionDays: [day], personalBest: result("saved", 80) });
    expect($celebration.get()).toBeNull();
    addSession(result("lower", 70));
    expect($celebration.get()).toBeNull();
});

test("retained bests prevent false records when older sessions have been trimmed", () => {
    $history.set({ sessions: [], dailyCompletionDays: [day], personalBest: result("old-best", 90) });
    addSession(result("lower", 80));
    expect($celebration.get()).toBeNull();
    expect($history.get().personalBest?.wpm).toBe(90);
    addSession(result("new-best", 95));
    expect($celebration.get()?.record).toEqual({ previousWpm: 90, wpm: 95 });
});

test("a first completed lesson celebrates once and shares the day with races", () => {
    recordPracticeDay(now);
    expect($celebration.get()).toMatchObject({ streak: 1 });
    dismissCelebration();
    recordPracticeDay(now);
    addSession(result("race", 50, "multiplayer"));
    expect($celebration.get()).toBeNull();
});

test("clearing history clears achievements and old timers cannot dismiss a newer event", () => {
    celebrate({ id: "old", createdAt: Date.now(), streak: 1 });
    celebrate({ id: "new", createdAt: Date.now(), record: { previousWpm: 50, wpm: 60 } });
    dismissCelebration("old");
    expect($celebration.get()?.id).toBe("new");
    clearHistory();
    expect($celebration.get()).toBeNull();
    expect($history.get().personalBest).toBeUndefined();
});
