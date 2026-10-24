export const MULTIPLAYER_PATH = '/api/multiplayer';
export const SOCKET_PROTOCOL = 'ninjatype-v1';
export const ROOM_LIFETIME_MS = 20 * 60_000;
export const GRACE_MS = 2 * 60_000;
export const RESULTS_MS = 2 * 60_000;
export const METRICS_MS = 10_000;
export const PROGRESS_MS = 3_000;
export const COUNTDOWN_MS = 3_000;
export const ROUND_MS = 120_000;
export const DEFAULT_MAX_PLAYERS = 10;
/** Worker configuration is trusted; missing or invalid values retain the default. */
export function roomPlayerLimit(value: unknown): number {
    const parsed = typeof value === 'string' && /^\d+$/.test(value.trim()) ? Number(value.trim()) : value;
    return typeof parsed === 'number' && Number.isSafeInteger(parsed) && parsed >= 2 ? parsed : DEFAULT_MAX_PLAYERS;
}
export interface MultiplayerConfig { enabled: boolean; siteKey: string; maxPlayers: number; liveProgress?: boolean; progressIntervalMs?: number }
export const WORD_COUNTS = [15, 30, 50] as const;
export const RACE_DURATIONS = [15, 30, 60, 120] as const;
export const DICTIONARIES = [
    { id: '1k', label: 'English 1k' }, { id: '5k', label: 'English 5k' },
    { id: '2k-short', label: 'English 2k · short' }, { id: '2k-long', label: 'English 2k · long' },
    { id: '5k-medium', label: 'English 5k · medium' }, { id: 'brainrot', label: 'Brainrot' },
] as const;
export type DictionaryKey = typeof DICTIONARIES[number]['id'];
export interface RaceSettings { mode: 'words' | 'time'; duration: number; dictionary: DictionaryKey }
export function raceSettings(input: { mode?: unknown; duration?: unknown; dictionary?: unknown }): RaceSettings {
    const mode = input.mode ?? 'words', dictionary = input.dictionary ?? '1k';
    if (mode !== 'words' && mode !== 'time') throw new MultiplayerError('invalid_request', 'Choose Words or Time mode.');
    if (!DICTIONARIES.some(d => d.id === dictionary)) throw new MultiplayerError('invalid_request', 'Choose an available dictionary.');
    const duration = mode === 'words' ? ROUND_MS / 1000 : input.duration ?? 60;
    if (!(RACE_DURATIONS as readonly unknown[]).includes(duration)) throw new MultiplayerError('invalid_request', 'Choose a 15, 30, 60 or 120-second race.');
    return { mode, duration: duration as number, dictionary: dictionary as DictionaryKey };
}

export type Phase = 'lobby' | 'countdown' | 'racing' | 'results';
export interface Metrics {
    correctChars: number;
    completedWords: number;
    attempts: number;
    errors: number;
    accuracy: number;
    wpm: number;
    duration: number;
}
export interface Member {
    id: string;
    nickname: string;
    connected: boolean;
    disconnectedUntil: number | null;
    ready: boolean;
    rematch: boolean;
}
export interface RoundPlayer { id: string; nickname: string; metrics: Metrics | null }
export interface Round {
    id: string;
    text: string;
    candidates: string[];
    players: RoundPlayer[];
    startAt: number;
    deadline: number;
    endedAt: number | null;
    reason: 'finish' | 'timeout' | null;
    winnerId: string | null;
    winnerFinalized?: boolean;
    collectionUntil: number | null;
    resultsUntil: number | null;
}
export interface RoomState extends RaceSettings {
    name: string;
    epoch: string;
    createdAt: number;
    expiresAt: number;
    emptyUntil: number | null;
    wordCount: number;
    maxPlayers: number;
    sequence: number;
    phase: Phase;
    members: Member[];
    round: Round | null;
    lastCountdownAt: number;
}
export interface Snapshot {
    type: 'snapshot';
    serverTime: number;
    selfId: string;
    room: RoomState;
    standings?: LiveStandings;
}
export interface LiveProgress { id: string; correctChars: number; updatedAt: number }
export interface LiveStandings { type: 'standings'; roundId: string; serverTime: number; players: LiveProgress[] }
export type ServerMessage = Snapshot | { type: 'error'; code: string; message: string } |
    { type: 'closed'; reason: string } | LiveStandings;
export type ClientCommand = { type: 'ready'; value: boolean } | { type: 'start' } |
    { type: 'rematch'; value: boolean; roundId: string } | { type: 'sync' } |
    { type: 'finish' | 'metrics'; roundId: string; typedText: string; attempts: number; errors: number } |
    { type: 'progress'; roundId: string; correctChars: number };
export interface Entry {
    name: string;
    nickname: string;
    browserId: string;
    epoch?: string;
    participantId?: string;
}
export interface RoomListing { name: string; epoch: string; createdAt: number; expiresAt: number; maxPlayers: number }

export class MultiplayerError extends Error {
    constructor(public code: string, message: string, public status = 400) { super(message); }
}
export function roomName(value: unknown): string {
    if (typeof value !== 'string') throw new MultiplayerError('invalid_room', 'Enter a room name.');
    const name = value.trim();
    if (!/^[A-Za-z0-9_-]{3,48}$/.test(name))
        throw new MultiplayerError('invalid_room', 'Use 3–48 letters, numbers, underscores or hyphens. Room names are case-sensitive.');
    return name;
}
export function nickname(value: unknown): string {
    if (typeof value !== 'string') throw new MultiplayerError('invalid_nickname', 'Enter a nickname.');
    const name = value.normalize('NFC').trim().replace(/\s+/g, ' ');
    if (!name || name.length > 24 || /[\p{Cc}\p{Cf}]/u.test(name))
        throw new MultiplayerError('invalid_nickname', 'Use a nickname of 1–24 visible characters.');
    return name;
}
export function identifier(value: unknown): string {
    if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{8,64}$/.test(value))
        throw new MultiplayerError('invalid_request', 'Invalid request identifier.');
    return value;
}
export function encodeHeader(value: string): string {
    return btoa(String.fromCharCode(...new TextEncoder().encode(value))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function decodeHeader(value: string): string {
    if (!/^[A-Za-z0-9_-]+$/.test(value) || value.length > 6_000)
        throw new MultiplayerError('invalid_request', 'Invalid connection request.');
    try {
        return new TextDecoder('utf-8', { fatal: true, ignoreBOM: false }).decode(Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)));
    } catch { throw new MultiplayerError('invalid_request', 'Invalid connection request.'); }
}
