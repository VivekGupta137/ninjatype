import { readPracticeSettings, settingsLabel, isUsableSession, localDayKey } from "@/lib/practiceJourney";
import type { TypingSession } from "@/store/history";

const DAY = 86_400_000;
export const MIN_PER_WEEK = 2;
/** WPM change treated as real movement rather than noise. */
export const MEANINGFUL_WPM = 2;

export interface GroupReview { label: string; sessionsThis: number; sessionsPrev: number; wpmThis: number; wpmPrev: number; deltaWpm: number; accThis: number; accPrev: number; deltaAcc: number }
export type Verdict = "improving" | "steady" | "declining";
export interface WeeklyReview {
    status: "ready" | "insufficient";
    sessionsThisWeek: number;
    practiceDays: number;
    groups: GroupReview[];
    verdict: Verdict | null;
    plateau: boolean;
    /** What is missing when the evidence is too thin. */
    missing: string | null;
}

const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const round1 = (n: number) => Math.round(n * 10) / 10;

/** Comparable = same mode, duration/word count, and dictionary (via practiceSettings). Sessions without settings are ignored. */
export function weeklyReview(sessions: TypingSession[], now = Date.now()): WeeklyReview {
    const usable = sessions.filter(isUsableSession).map(s => ({ s, settings: readPracticeSettings(s.practiceSettings) })).filter((x): x is { s: TypingSession; settings: NonNullable<ReturnType<typeof readPracticeSettings>> } => !!x.settings);
    const week = (n: number) => usable.filter(x => x.s.timestamp > now - (n + 1) * 7 * DAY && x.s.timestamp <= now - n * 7 * DAY);
    const thisWeek = week(0), prevWeek = week(1);
    const allThis = sessions.filter(s => isUsableSession(s) && s.timestamp > now - 7 * DAY && s.timestamp <= now);
    const practiceDays = new Set(allThis.map(s => localDayKey(new Date(s.timestamp)))).size;

    const keys = [...new Set(usable.map(x => JSON.stringify(x.settings)))];
    const groups: GroupReview[] = [];
    for (const key of keys) {
        const a = thisWeek.filter(x => JSON.stringify(x.settings) === key), b = prevWeek.filter(x => JSON.stringify(x.settings) === key);
        if (a.length < MIN_PER_WEEK || b.length < MIN_PER_WEEK) continue;
        const wpmThis = avg(a.map(x => x.s.wpm)), wpmPrev = avg(b.map(x => x.s.wpm));
        const accThis = avg(a.map(x => x.s.accuracy)), accPrev = avg(b.map(x => x.s.accuracy));
        groups.push({ label: settingsLabel(a[0].settings), sessionsThis: a.length, sessionsPrev: b.length, wpmThis: round1(wpmThis), wpmPrev: round1(wpmPrev), deltaWpm: round1(wpmThis - wpmPrev), accThis: round1(accThis), accPrev: round1(accPrev), deltaAcc: round1(accThis - accPrev) });
    }
    groups.sort((x, y) => y.sessionsThis + y.sessionsPrev - (x.sessionsThis + x.sessionsPrev));

    if (!groups.length) {
        return { status: "insufficient", sessionsThisWeek: allThis.length, practiceDays, groups, verdict: null, plateau: false, missing: `Take at least ${MIN_PER_WEEK} tests with the same settings in each of two consecutive weeks to see a fair comparison.` };
    }
    const weight = groups.reduce((n, g) => n + g.sessionsThis + g.sessionsPrev, 0);
    const delta = groups.reduce((n, g) => n + g.deltaWpm * (g.sessionsThis + g.sessionsPrev), 0) / weight;
    const verdict: Verdict = delta >= MEANINGFUL_WPM ? "improving" : delta <= -MEANINGFUL_WPM ? "declining" : "steady";
    return { status: "ready", sessionsThisWeek: allThis.length, practiceDays, groups, verdict, plateau: detectPlateau(usable, now), missing: null };
}

/** A plateau needs three straight weeks of comparable data on the most-practised settings, with under 2 WPM spread and no upward trend. */
export function detectPlateau(usable: { s: TypingSession; settings: unknown }[], now = Date.now()): boolean {
    const counts = new Map<string, number>();
    for (const x of usable) if (x.s.timestamp > now - 21 * DAY) counts.set(JSON.stringify(x.settings), (counts.get(JSON.stringify(x.settings)) ?? 0) + 1);
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    if (!top) return false;
    const weekly: number[] = [];
    for (let n = 2; n >= 0; n--) {
        const w = usable.filter(x => JSON.stringify(x.settings) === top && x.s.timestamp > now - (n + 1) * 7 * DAY && x.s.timestamp <= now - n * 7 * DAY);
        if (w.length < MIN_PER_WEEK) return false;
        weekly.push(avg(w.map(x => x.s.wpm)));
    }
    return Math.max(...weekly) - Math.min(...weekly) < MEANINGFUL_WPM && weekly[2] - weekly[0] < MEANINGFUL_WPM;
}
