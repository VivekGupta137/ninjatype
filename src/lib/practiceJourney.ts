import { FINGER_KEYS, FINGER_NAMES, getAllFingers } from "@/constants/fingerKeys";
import { TEST_DURATIONS } from "@/constants/testDurations";
import { QUOTE_TYPES, WORD_TYPES } from "@/constants/wordTypes";
import type { Config } from "@/store/config";
import type { TypingSession } from "@/store/history";
import type { KeyMetric } from "./keypressStats";

/** Only test settings are restored; appearance and chart preferences stay untouched. */
export type PracticeSettings =
    | { mode: "time"; countdownTime: string; dictionary: Config["dictionary"] }
    | { mode: "words"; maxWordCount: string; dictionary: Config["dictionary"] }
    | { mode: "quotes"; quotes: Config["quotes"] };

export function capturePracticeSettings(config: Config): PracticeSettings {
    if (config.mode === "quotes") return { mode: "quotes", quotes: config.quotes };
    if (config.mode === "words") return { mode: "words", maxWordCount: config.maxWordCount, dictionary: config.dictionary };
    return { mode: "time", countdownTime: config.countdownTime, dictionary: config.dictionary };
}

/** Browser history may be old or malformed. Never infer word counts from WPM/duration. */
export function readPracticeSettings(value: unknown): PracticeSettings | null {
    if (!value || typeof value !== "object") return null;
    const item = value as Record<string, unknown>;
    if (item.mode === "quotes" && typeof item.quotes === "string" && Object.hasOwn(QUOTE_TYPES, item.quotes)) {
        return { mode: "quotes", quotes: item.quotes as Config["quotes"] };
    }
    if (typeof item.dictionary !== "string" || !Object.hasOwn(WORD_TYPES, item.dictionary)) return null;
    const dictionary = item.dictionary as Config["dictionary"];
    if (item.mode === "time" && TEST_DURATIONS.some(option => option.label === item.countdownTime)) {
        return { mode: "time", countdownTime: item.countdownTime as string, dictionary };
    }
    if (item.mode === "words" && ["10", "25", "50", "100", "150"].includes(String(item.maxWordCount)) && typeof item.maxWordCount === "string") {
        return { mode: "words", maxWordCount: item.maxWordCount, dictionary };
    }
    return null;
}

export function settingsLabel(settings: PracticeSettings): string {
    if (settings.mode === "quotes") return `${QUOTE_TYPES[settings.quotes].label} quotes`;
    const length = settings.mode === "time" ? settings.countdownTime : `${settings.maxWordCount} words`;
    return `${length} · ${WORD_TYPES[settings.dictionary].label}`;
}

export function samePracticeSettings(a: unknown, b: unknown): boolean {
    const left = readPracticeSettings(a);
    const right = readPracticeSettings(b);
    return !!left && !!right && JSON.stringify(left) === JSON.stringify(right);
}

export function isUsableSession(session: TypingSession): boolean {
    return !!session && Number.isFinite(session.timestamp) && session.timestamp > 0 &&
        Number.isFinite(session.wpm) && session.wpm > 0 &&
        Number.isFinite(session.accuracy) && session.accuracy >= 0 && session.accuracy <= 100 &&
        Number.isFinite(session.duration) && session.duration > 0;
}

export function latestPracticeSession(sessions: TypingSession[]): TypingSession | null {
    return sessions.filter(session => isUsableSession(session) &&
        ["time", "words", "quotes"].includes(session.mode))
        .sort((a, b) => b.timestamp - a.timestamp)[0] ?? null;
}

/** Compare only captured, matching settings, never unknown legacy test lengths. */
export function practiceComparison(current: TypingSession, sessions: TypingSession[]) {
    const previous = sessions.filter(session => isUsableSession(session) && session.timestamp < current.timestamp &&
        (!current.id || session.id !== current.id) && samePracticeSettings(current.practiceSettings, session.practiceSettings))
        .sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);
    if (!previous.length) return null;
    const averageWpm = Math.round(previous.reduce((sum, session) => sum + session.wpm, 0) / previous.length);
    const averageAccuracy = Math.round(previous.reduce((sum, session) => sum + session.accuracy, 0) / previous.length);
    return { count: previous.length, averageWpm, averageAccuracy };
}

export type PracticeRecommendation = { title: string; reason: string; label: string; href?: string };

export function recommendPractice(session: TypingSession, keys: Record<string, KeyMetric>): PracticeRecommendation {
    if (session.duration < 10) return {
        title: "Build a longer baseline",
        reason: "This short attempt is a starting point. Try a full minute at a comfortable pace before drawing conclusions.",
        label: "Try a one-minute test",
    };
    const key = Object.entries(keys)
        .filter(([key, metric]) => metric.expected >= 5 && metric.errors >= 2 && metric.errors <= metric.expected &&
            getAllFingers().some(finger => FINGER_KEYS[finger].includes(key)))
        .sort((a, b) => b[1].errors / b[1].expected - a[1].errors / a[1].expected || b[1].errors - a[1].errors)[0];
    if (key) {
        const [letter, metric] = key;
        const finger = getAllFingers().find(finger => FINGER_KEYS[finger].includes(letter))!;
        return {
            title: `Give ${letter.toUpperCase()} a little practice`,
            reason: `${metric.errors} of ${metric.expected} recorded attempts at ${letter.toUpperCase()} were errors. Try the ${FINGER_NAMES[finger].toLowerCase()} lessons and work toward that reach as levels unlock. One test is a clue, not a diagnosis.`,
            label: `Practise ${FINGER_NAMES[finger].toLowerCase()} keys`,
            href: `/learn/fingers/${finger}/`,
        };
    }
    if (session.accuracy < 97) return {
        title: "Choose accuracy over a faster score",
        reason: `You finished at ${session.accuracy}% accuracy. Repeat these settings a little slower and aim for 97%—a practice target, not a pass mark.`,
        label: "Practise with these settings",
    };
    return {
        title: "Take your control into a pace challenge",
        reason: "You finished at 97% accuracy or better. Try Ghost Race against your saved pace, keeping accuracy ahead of finishing position.",
        label: "Try Ghost Race",
        href: "/ghost-race/",
    };
}

/** Local calendar days, not UTC dates or rolling 24-hour windows. */
export function localDayKey(date = new Date()): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Only completed, scored practice from history counts, not a page visit or simulator. */
export function qualifiesForPractice(session: TypingSession): boolean {
    return isUsableSession(session) && ["time", "words", "quotes", "multiplayer"].includes(session.mode) &&
        session.accuracy > 0 && (session.correctWpm === undefined ||
            (Number.isFinite(session.correctWpm) && session.correctWpm > 0));
}

/** Validate dates from browser storage without accepting rollover dates such as Feb 30. */
export function isCalendarDay(value: unknown): value is string {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T12:00:00`);
    return Number.isFinite(date.getTime()) && localDayKey(date) === value;
}

/** Keep a tiny date ledger so trimming detailed sessions cannot break a streak. */
export function collectPracticeDays(sessions: TypingSession[], saved: unknown = []): string[] {
    const days = new Set<string>(Array.isArray(saved) ? saved.filter(isCalendarDay) : []);
    for (const session of sessions) {
        if (!qualifiesForPractice(session)) continue;
        // Preserve dates already credited by the retired challenge; new sessions use completion date.
        const day = isCalendarDay(session.dailyChallengeDay)
            ? session.dailyChallengeDay : localDayKey(new Date(session.timestamp));
        if (isCalendarDay(day)) days.add(day);
    }
    return [...days].sort();
}

/** Today is still available to extend yesterday's streak. Replays count once. */
export function dailyStreak(sessions: TypingSession[], date = new Date(), savedDays?: unknown): number {
    const days = new Set(collectPracticeDays(sessions, savedDays));
    const cursor = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
    if (!days.has(localDayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    let streak = 0;
    while (days.has(localDayKey(cursor))) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
}

