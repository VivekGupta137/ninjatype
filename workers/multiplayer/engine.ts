import { completedRaceWords, normalizeRaceInput } from '../../src/lib/onlineRace';
import {
    COUNTDOWN_MS, DEFAULT_MAX_PLAYERS, GRACE_MS, METRICS_MS, RESULTS_MS, ROOM_LIFETIME_MS, ROUND_MS,
    MultiplayerError, nickname, roomPlayerLimit, raceSettings, type ClientCommand, type Entry, type Metrics, type RoomState, type RaceSettings, type DictionaryKey,
} from '../../src/lib/multiplayer/protocol';

/** Pure room transitions. The DO serializes, persists and broadcasts these changes. */
export class RoomEngine {
    constructor(public state: RoomState, private makeText: (words: number, dictionary: DictionaryKey, duration?: number) => string, private uuid = () => crypto.randomUUID()) {
        state.maxPlayers = roomPlayerLimit(state.maxPlayers); // Older persisted rooms retain their original ten-seat capacity.
        Object.assign(state, raceSettings(state));
    }
    static create(name: string, wordCount: number, now: number, epoch: string, maxPlayers = DEFAULT_MAX_PLAYERS, settings: Partial<RaceSettings> = {}): RoomState {
        return { name, epoch, createdAt: now, expiresAt: now + ROOM_LIFETIME_MS, emptyUntil: now + GRACE_MS,
            ...raceSettings(settings), wordCount, maxPlayers: roomPlayerLimit(maxPlayers), sequence: 0, phase: 'lobby', members: [], round: null, lastCountdownAt: 0 };
    }
    private change() { this.state.sequence++; }
    /** Returns a closure reason; transitions use scheduled timestamps even if alarms arrive late. */
    advance(now: number): string | null {
        const s = this.state;
        if (now >= s.expiresAt) return 'Room reached its 20-minute lifetime.';
        if (s.emptyUntil !== null && now >= s.emptyUntil) return 'Room closed after two minutes without players.';
        if (s.phase === 'results' && s.round?.resultsUntil !== null && now >= s.round!.resultsUntil!)
            return 'The two-minute rematch window ended.';
        const retained = s.members.filter(m => m.connected || m.disconnectedUntil === null || now < m.disconnectedUntil);
        if (retained.length !== s.members.length) { s.members = retained; this.change(); }
        if (s.phase === 'countdown' && s.round && now >= s.round.startAt) {
            const r = s.round;
            r.players = s.members.filter(m => m.connected && r.candidates.includes(m.id))
                .map(m => ({ id: m.id, nickname: m.nickname, metrics: null }));
            if (r.players.length < 2) {
                // A cancelled rematch retains the original results window and scoreboard.
                if (this.previousResults) { s.round = this.previousResults; s.phase = 'results'; this.previousResults = null; }
                else { s.phase = 'lobby'; s.round = null; }
            } else { s.phase = 'racing'; this.previousResults = null; }
            this.change();
        }
        if (s.phase === 'racing' && s.round && now >= s.round.deadline) this.end(s.round.deadline, 'timeout');
        if (s.phase === 'results' && s.round && now >= s.round.resultsUntil!) return 'The two-minute rematch window ended.';
        if (s.phase === 'results' && s.round && now >= s.round.collectionUntil!) { this.finalizeTimedWinner(); this.tryRematch(now); }
        return null;
    }
    // Persisted by the adapter as part of its bounded snapshot, for cancelled countdown recovery.
    previousResults: RoomState['round'] = null;
    join(entry: Entry, now: number): string {
        const s = this.state;
        if (entry.epoch && entry.epoch !== s.epoch) throw new MultiplayerError('room_replaced', 'This room has expired or been replaced.', 410);
        let member = entry.participantId ? s.members.find(m => m.id === entry.participantId) : undefined;
        if (entry.participantId && !member) throw new MultiplayerError('seat_expired', 'Your reconnect window ended. Join again as a new player.', 410);
        if (member?.connected) throw new MultiplayerError('already_connected', 'That player is already connected.', 409);
        if (member) {
            if (member.disconnectedUntil === null || now >= member.disconnectedUntil)
                throw new MultiplayerError('seat_expired', 'Your reconnect window ended.', 410);
            member.connected = true; member.disconnectedUntil = null;
        } else {
            if (s.members.length >= s.maxPlayers) throw new MultiplayerError('room_full', 'This room is full. Try another room.', 409);
            const requested = nickname(entry.nickname);
            let accepted = requested;
            for (let suffix = 2; s.members.some(m => m.nickname === accepted); suffix++) accepted = `${requested.slice(0, 20)} ${suffix}`;
            member = { id: this.uuid(), nickname: accepted, connected: true, disconnectedUntil: null, ready: false, rematch: false };
            s.members.push(member);
        }
        s.emptyUntil = null;
        this.change();
        return member.id;
    }
    disconnect(id: string, now: number) {
        const m = this.state.members.find(m => m.id === id);
        if (!m?.connected) return;
        m.connected = false; m.ready = false; m.rematch = false;
        m.disconnectedUntil = Math.min(now + GRACE_MS, this.state.expiresAt);
        if (!this.state.members.some(m => m.connected)) this.state.emptyUntil = Math.min(now + GRACE_MS, this.state.expiresAt);
        this.change();
    }
    command(id: string, command: ClientCommand, now: number) {
        const s = this.state;
        const member = s.members.find(m => m.id === id && m.connected);
        if (!member) throw new MultiplayerError('not_member', 'You are no longer connected to this room.', 403);
        if (command.type === 'sync') return;
        if (command.type === 'ready') {
            if (s.phase !== 'lobby' || typeof command.value !== 'boolean') throw new MultiplayerError('wrong_phase', 'Readiness can change in the lobby.');
            if (member.ready !== command.value) { member.ready = command.value; this.change(); }
            return;
        }
        if (command.type === 'start') {
            if (s.phase === 'countdown') return;
            if (s.phase !== 'lobby' || !member.ready) throw new MultiplayerError('not_ready', 'Ready up before starting.');
            const candidates = s.members.filter(m => m.connected && m.ready).map(m => m.id);
            if (candidates.length < 2) throw new MultiplayerError('need_players', 'At least two connected players must be ready.');
            this.countdown(candidates, now); return;
        }
        const round = s.round;
        if (!round || command.roundId !== round.id) throw new MultiplayerError('stale_round', 'That round is no longer current.');
        if (command.type === 'rematch') {
            if (s.phase !== 'results' || typeof command.value !== 'boolean') throw new MultiplayerError('wrong_phase', 'Rematch is available after the round.');
            const self = round.players.find(p => p.id === id);
            if (!self?.metrics && now < round.collectionUntil!) throw new MultiplayerError('collecting_metrics', 'Wait while results are collected.');
            if (member.rematch !== command.value) { member.rematch = command.value; this.change(); }
            if (now >= round.collectionUntil!) this.tryRematch(now);
            return;
        }
        if (command.type !== 'finish' && command.type !== 'metrics') throw new MultiplayerError('invalid_command', 'Unknown room command.');
        const player = round.players.find(p => p.id === id);
        if (!player) throw new MultiplayerError('not_in_round', 'You were not connected and ready at this round’s start.', 403);
        if (player.metrics) return; // Idempotent retries never rewrite a result.
        if (command.type === 'finish' && s.phase !== 'racing') throw new MultiplayerError('round_ended', 'This round has already ended.');
        if (command.type === 'finish' && s.mode === 'time') throw new MultiplayerError('wrong_phase', 'A timed race ends when the timer expires.');
        if (command.type === 'metrics' && s.phase !== 'results') throw new MultiplayerError('wrong_phase', 'Final metrics are collected after the round.');
        if (s.mode === 'time' && round.winnerFinalized) throw new MultiplayerError('metrics_closed', 'The timed race scores have been finalized.');
        const metrics = this.metrics(command, command.type === 'finish' ? now : round.endedAt!);
        player.metrics = metrics;
        if (command.type === 'finish') this.end(now, 'finish', id);
        else { this.change(); if (round.players.every(p => p.metrics)) this.finalizeTimedWinner(); }
    }
    private metrics(command: Extract<ClientCommand, { typedText: string }>, endedAt: number): Metrics {
        const r = this.state.round!;
        if (typeof command.typedText !== 'string' || command.typedText.length > r.text.length + 10 ||
            !Number.isInteger(command.attempts) || !Number.isInteger(command.errors) ||
            command.attempts < command.typedText.length || command.attempts > 100_000 || command.errors < 0 || command.errors > command.attempts)
            throw new MultiplayerError('invalid_metrics', 'Invalid typing metrics.');
        const text = normalizeRaceInput(r.text, command.typedText);
        if (text !== command.typedText || (command.type === 'finish' && text !== r.text))
            throw new MultiplayerError('invalid_finish', 'Correct the entire passage before finishing.');
        const duration = Math.max(.001, (endedAt - r.startAt) / 1000);
        const correctChars = [...text].filter((c, i) => c === r.text[i]).length;
        const wpm = Math.round(correctChars / 5 / (duration / 60));
        if (command.type === 'finish' && (duration < 1 || wpm > 1000)) throw new MultiplayerError('invalid_finish', 'Completion arrived too early.');
        if (this.state.mode === 'time' && wpm > 1000) throw new MultiplayerError('invalid_metrics', 'Typing speed exceeds the race limit.');
        return { correctChars, completedWords: completedRaceWords(r.text, text), attempts: command.attempts, errors: command.errors,
            accuracy: command.attempts ? Math.round((command.attempts - command.errors) / command.attempts * 100) : 100, wpm, duration };
    }
    private end(now: number, reason: 'finish' | 'timeout', winnerId: string | null = null) {
        const s = this.state, r = s.round!;
        s.phase = 'results'; r.endedAt = now; r.reason = reason; r.winnerId = winnerId;
        r.winnerFinalized = s.mode !== 'time';
        r.collectionUntil = Math.min(now + METRICS_MS, s.expiresAt);
        r.resultsUntil = Math.min(now + RESULTS_MS, s.expiresAt);
        s.members.forEach(m => { m.ready = false; m.rematch = false; });
        this.change();
    }
    private finalizeTimedWinner() {
        const s = this.state, r = s.round;
        if (s.mode !== 'time' || s.phase !== 'results' || !r || r.winnerFinalized) return;
        const ranked = r.players.filter(p => p.metrics && p.metrics.correctChars > 0).sort((a, b) =>
            b.metrics!.correctChars - a.metrics!.correctChars || b.metrics!.accuracy - a.metrics!.accuracy || a.id.localeCompare(b.id));
        r.winnerId = ranked[0]?.id ?? null; r.winnerFinalized = true; this.change();
    }
    private countdown(candidates: string[], now: number) {
        const s = this.state;
        if (now + COUNTDOWN_MS + 1000 >= s.expiresAt) throw new MultiplayerError('room_expiring', 'This room is expiring. Create a new room for another race.');
        if (s.lastCountdownAt && now - s.lastCountdownAt < 10_000) throw new MultiplayerError('rate_limited', 'Wait a moment before starting another race.', 429);
        this.previousResults = s.phase === 'results' ? s.round : null;
        s.round = { id: this.uuid(), text: this.makeText(s.wordCount, s.dictionary, s.mode === 'time' ? s.duration : undefined), candidates, players: [], startAt: now + COUNTDOWN_MS,
            deadline: Math.min(now + COUNTDOWN_MS + s.duration * 1000, s.expiresAt), endedAt: null, reason: null, winnerId: null, winnerFinalized: false, collectionUntil: null, resultsUntil: null };
        s.lastCountdownAt = now; s.phase = 'countdown'; this.change();
    }
    private tryRematch(now: number) {
        const candidates = this.state.members.filter(m => m.connected && m.rematch).map(m => m.id);
        if (candidates.length >= 2 && now + COUNTDOWN_MS + 1000 < this.state.expiresAt && now - this.state.lastCountdownAt >= 10_000) this.countdown(candidates, now);
    }
    nextDeadline(now: number): number {
        const s = this.state, r = s.round;
        const dates = [s.expiresAt, s.emptyUntil, ...s.members.filter(m => !m.connected).map(m => m.disconnectedUntil)];
        if (s.phase === 'countdown') dates.push(r!.startAt);
        if (s.phase === 'racing') dates.push(r!.deadline);
        if (s.phase === 'results') {
            dates.push(r!.resultsUntil);
            if (r!.collectionUntil! > now) dates.push(r!.collectionUntil);
        }
        return Math.min(...dates.filter((d): d is number => d !== null));
    }
}
