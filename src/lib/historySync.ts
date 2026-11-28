import type { TypingSession } from "@/store/history";
import { collectPracticeDays } from "@/lib/practiceJourney";

/** Pure merge rules for history sync (no I/O): sessions append-only by id, days are a set. */

/** Legacy sessions may have no id; derive a stable one so every device agrees on it. */
export const stableId = (s: TypingSession): string => s.id || `legacy-${s.timestamp}-${s.wpm}-${s.duration}-${s.mode}`;

export const withIds = (sessions: TypingSession[]): TypingSession[] => sessions.map(s => (s.id ? s : { ...s, id: stableId(s) }));

/** Union by id, newest first, capped. Local copies win on conflict (ids are unique per result). */
export function mergeSessions(local: TypingSession[], remote: TypingSession[], max: number): TypingSession[] {
    const byId = new Map<string, TypingSession>();
    for (const s of withIds(remote)) byId.set(s.id!, s);
    for (const s of withIds(local)) byId.set(s.id!, s);
    return [...byId.values()].sort((a, b) => b.timestamp - a.timestamp).slice(0, max);
}

export const mergeDays = (local: string[] | undefined, remote: string[], sessions: TypingSession[]): string[] =>
    collectPracticeDays(sessions, [...(local ?? []), ...remote]);

/** Sessions the server has not been sent yet. */
export const unsent = (sessions: TypingSession[], sent: ReadonlySet<string>): TypingSession[] => withIds(sessions).filter(s => !sent.has(s.id!));

export const chunk = <T,>(items: T[], size: number): T[][] => {
    const out: T[][] = [];
    for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
    return out;
};
