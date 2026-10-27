import type { AvatarSettings, LiveStandings, Metrics, Round } from './protocol';
import { botCorrectChars } from './bots';

export interface Standing { id: string; nickname: string; avatar?: AvatarSettings; bot?: boolean; wpm: number | null; completion: number | null; correctChars: number }
export function raceStandings(round: Round, live: LiveStandings | null, selfId: string | undefined, selfMetrics: Metrics | null, now?: number): Standing[] {
    const reports = live?.roundId === round.id ? live.players : [];
    return round.players.map(player => {
        // Collected final metrics take precedence over every live estimate.
        const metrics = player.metrics ?? (round.endedAt === null && player.id === selfId ? selfMetrics : null);
        const report = round.endedAt === null ? player.bot && now !== undefined
            ? { correctChars: botCorrectChars(round, player, Math.min(now, round.deadline)), updatedAt: Math.min(now, round.deadline) }
            : reports.find(p => p.id === player.id) : undefined;
        const correctChars = Math.max(0, Math.min(round.text.length, metrics?.correctChars ?? report?.correctChars ?? 0));
        const duration = report ? (report.updatedAt - round.startAt) / 1000 : 0;
        return { id: player.id, nickname: player.nickname, avatar: player.avatar, bot: player.bot, correctChars,
            completion: round.endedAt !== null && !metrics ? null : round.text.length ? Math.min(100, Math.round(correctChars / round.text.length * 100)) : 0,
            wpm: metrics?.wpm ?? (duration > 0 ? Math.round(correctChars / 5 / (duration / 60)) : null) };
    }).sort((a, b) => Number(b.id === round.winnerId) - Number(a.id === round.winnerId)
        || b.correctChars - a.correctChars || (b.wpm ?? 0) - (a.wpm ?? 0) || a.nickname.localeCompare(b.nickname) || a.id.localeCompare(b.id));
}
