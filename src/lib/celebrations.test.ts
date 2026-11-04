import { describe, expect, test } from "bun:test";
import type { TypingSession } from "@/store/history";
import { confettiParticles, personalBestSession, sessionCelebration } from "./celebrations";

const now = new Date(2026, 10, 4, 12);
const day = "2026-11-04";
const session = (overrides: Partial<TypingSession> = {}): TypingSession => ({
    id: "new", timestamp: now.getTime(), wpm: 65, cpm: 325, correctWpm: 64,
    accuracy: 98, errors: 2, duration: 60, mode: "time", ...overrides,
});

describe("celebration rules", () => {
    test("first daily practice adds one day, including after a broken streak", () => {
        expect(sessionCelebration(session(), undefined, [], [day], now)).toMatchObject({ streak: 1 });
        expect(sessionCelebration(session(), undefined, ["2026-11-01"], ["2026-11-01", day], now)).toMatchObject({ streak: 1 });
        expect(sessionCelebration(session(), undefined, ["2026-11-03"], ["2026-11-03", day], now)).toMatchObject({ streak: 2 });
    });
    test("repeat practice, old dates, invalid output and record ties do not celebrate", () => {
        expect(sessionCelebration(session(), session({ wpm: 65 }), [day], [day], now)).toBeNull();
        expect(sessionCelebration(session(), undefined, [], ["2026-11-03"], now)).toBeNull();
        expect(sessionCelebration(session({ accuracy: 0 }), undefined, [], [day], now)).toBeNull();
        expect(sessionCelebration(session({ wpm: Infinity }), undefined, [], [day], now)).toBeNull();
    });
    test("a first-ever result establishes a baseline instead of claiming a broken record", () => {
        expect(sessionCelebration(session(), undefined, [], [day], now)?.record).toBeUndefined();
    });
    test("daily and personal-best achievements combine into one event", () => {
        expect(sessionCelebration(session(), session({ wpm: 60 }), [], [day], now)).toMatchObject({
            id: "new", streak: 1, record: { previousWpm: 60, wpm: 65 },
        });
    });
    test("record improvement still celebrates after today's practice was already counted", () => {
        expect(sessionCelebration(session(), session({ wpm: 60 }), [day], [day], now)).toMatchObject({
            record: { previousWpm: 60, wpm: 65 }, streak: undefined,
        });
    });
    test("the same rules apply to ordinary tests, Ghost Race's words mode and multiplayer", () => {
        for (const mode of ["time", "words", "quotes", "multiplayer"]) {
            expect(sessionCelebration(session({ mode }), session({ wpm: 60 }), [], [day], now)?.record?.wpm).toBe(65);
        }
    });
    test("sub-second attempts cannot become record-breaking celebrations", () => {
        expect(sessionCelebration(session({ duration: .2 }), session({ wpm: 60 }), [day], [day], now)).toBeNull();
    });
});

describe("durable personal best", () => {
    test("keeps the all-time best even if detailed history was trimmed", () => {
        const best = session({ id: "older-best", wpm: 90 });
        expect(personalBestSession([session()], best)).toBe(best);
        expect(personalBestSession([session({ wpm: 95 })], best)?.wpm).toBe(95);
    });
    test("matches Ghost Race tie-breaking and rejects invalid saved records", () => {
        const best = session({ id: "accurate", accuracy: 100 });
        expect(personalBestSession([session(), best])).toBe(best);
        expect(personalBestSession([session({ wpm: NaN }), session({ duration: 0 }), session({ timestamp: 1e100 })])).toBeUndefined();
        expect(personalBestSession([], null as unknown as TypingSession)).toBeUndefined();
    });
});

test("confetti is bounded and deterministic", () => {
    const pieces = confettiParticles();
    expect(pieces).toHaveLength(44);
    expect(confettiParticles()).toEqual(pieces);
    expect(pieces.every(p => p.x >= 0 && p.x < 100 && p.duration + p.delay < 3300)).toBe(true);
});
