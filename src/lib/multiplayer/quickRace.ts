import { words1k } from '../../constants/words1k';
import { RoomEngine } from './engine';
import { botCorrectChars } from './bots';
import { localMetrics, newLocalRun, typeLocalRun, type LocalRun } from './localRun';
import { recordRaceTrends, type RaceTrends } from './trends';
import type { AvatarSettings, ClientCommand, LiveStandings, Snapshot } from './protocol';

/** Entirely in memory: no room allocation, transport, CAPTCHA, or persistence. */
export class QuickRace {
    readonly engine: RoomEngine;
    readonly selfId: string;
    run: LocalRun | null = null;
    trends: RaceTrends | null = null;
    error = '';
    constructor(nickname: string, avatar: AvatarSettings, now: number, random = Math.random, uuid: () => string = () => crypto.randomUUID()) {
        this.engine = new RoomEngine(RoomEngine.create('Quick race', 30, now, uuid(), 5, { quickMatch: true }),
            count => Array.from({ length: count }, () => words1k[Math.floor(random() * words1k.length)]).join(' '), uuid, random);
        this.engine.state.allowSpectators = false;
        this.selfId = this.engine.join({ name: 'Quick race', nickname, avatar, browserId: 'local' }, now);
        this.engine.command(this.selfId, { type: 'ready', value: false }, now);
    }
    command(command: ClientCommand, now: number): boolean {
        if (!['ready', 'start', 'room_controls', 'rematch', 'sync'].includes(command.type)) return false;
        try { this.engine.command(this.selfId, command, now); this.error = ''; return true; }
        catch (e) { this.error = e instanceof Error ? e.message : 'Try again.'; return false; }
    }
    type(input: string, now: number) {
        const round = this.engine.state.round;
        if (!round || this.engine.state.phase !== 'racing' || !this.run || this.run.stopped || now >= round.deadline) return;
        this.run = typeLocalRun(this.run, input, now);
        this.error = '';
        if (this.run.stopped) {
            try { this.engine.command(this.selfId, { type: 'finish', roundId: round.id, typedText: this.run.typedText, attempts: this.run.attempts, errors: this.run.errors }, now); }
            catch (e) { this.run.stopped = false; this.error = e instanceof Error ? e.message : 'Correct the passage and retry.'; }
        }
    }
    tick(now: number) {
        const closed = this.engine.advance(now);
        const room = this.engine.state, round = room.round;
        if (round && this.run?.roundId !== round.id) { this.run = newLocalRun(round.id, round.text); this.trends = null; }
        if (room.phase === 'results' && round && this.run) {
            if (!round.players.find(p => p.id === this.selfId)?.metrics)
                this.engine.command(this.selfId, { type: 'metrics', roundId: round.id, typedText: this.run.typedText, attempts: this.run.attempts, errors: this.run.errors }, now);
            this.run.stopped = true;
            // All local scores are available immediately; no network collection wait.
            round.collectionUntil = round.endedAt;
        }
        const reports = round?.players.map(p => ({ id: p.id, updatedAt: Math.min(now, round.endedAt ?? round.deadline),
            correctChars: p.metrics?.correctChars ?? (p.bot ? botCorrectChars(round, p, now) : this.run ? localMetrics(this.run, round.startAt, now).correctChars : 0) })) ?? [];
        if (round) this.trends = recordRaceTrends(round, this.trends, reports);
        const snapshot: Snapshot = { type: 'snapshot', selfId: this.selfId, serverTime: now, room: structuredClone(room) };
        const standings: LiveStandings | null = round ? { type: 'standings', roundId: round.id, serverTime: now, players: reports } : null;
        return { snapshot, standings, run: this.run, trends: this.trends, now, error: this.error, closed };
    }
}
