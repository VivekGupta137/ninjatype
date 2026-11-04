import type { TypingSession } from "@/store/history";
import { dailyStreak, isUsableSession, localDayKey, qualifiesForPractice } from "./practiceJourney";

export type Celebration = {
    id: string;
    createdAt: number;
    streak?: number;
    record?: { previousWpm: number; wpm: number };
};

/** Same valid saved-pace criteria used by Ghost Race, with the full provenance retained. */
export function personalBestSession(sessions: TypingSession[], saved?: TypingSession): TypingSession | undefined {
    return [...sessions, ...(saved ? [saved] : [])]
        .filter(session => isUsableSession(session) && session.duration >= 1 && Number.isFinite(new Date(session.timestamp).getTime()))
        .sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy || b.timestamp - a.timestamp)
        .at(0);
}

export function sessionCelebration(
    session: TypingSession,
    previousBest: TypingSession | undefined,
    previousDays: string[],
    nextDays: string[],
    now = new Date(),
): Celebration | null {
    if (!qualifiesForPractice(session)) return null;
    const today = localDayKey(now);
    const streak = !previousDays.includes(today) && nextDays.includes(today)
        ? dailyStreak([], now, nextDays) : undefined;
    // The first result establishes a baseline; ties do not break a record.
    const record = session.duration >= 1 && previousBest && session.wpm > previousBest.wpm
        ? { previousWpm: previousBest.wpm, wpm: session.wpm } : undefined;
    if (streak === undefined && !record) return null;
    return { id: session.id ?? `${session.timestamp}:${session.wpm}`, createdAt: now.getTime(), streak, record };
}

/** Bounded, deterministic particles; all movement is transform/opacity only. */
export function confettiParticles() {
    return Array.from({ length: 44 }, (_, index) => ({
        x: (index * 37 + 11) % 100,
        drift: (index * 17 % 31) - 15,
        rotation: (index % 2 ? 1 : -1) * (360 + index * 29),
        delay: (index % 8) * 35,
        duration: 2100 + (index * 71 % 800),
        color: index % 4,
    }));
}
