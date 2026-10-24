import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_MAX_PLAYERS, MULTIPLAYER_PATH, PROGRESS_MS, SOCKET_PROTOCOL, encodeHeader, type ClientCommand, type Entry, type MultiplayerConfig, type RoomListing, type ServerMessage, type Snapshot, type LiveStandings } from '@/lib/multiplayer/protocol';
import { localMetrics, newLocalRun, typeLocalRun, type LocalRun } from '@/lib/multiplayer/localRun';
import { $history, addSession } from '@/store/history';

type Status = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'closed';
const maintenance = 'Multiplayer is temporarily unavailable. You can keep practicing.';
const savedKey = 'ninjatype-multiplayer-entry';
const disabledConfig: MultiplayerConfig = { enabled: false, siteKey: '', maxPlayers: DEFAULT_MAX_PLAYERS };
function readSaved(): { entry: Entry; run: LocalRun | null } | null {
    try { return JSON.parse(sessionStorage.getItem(savedKey) || 'null'); } catch { return null; }
}
export function useMultiplayer() {
    const [config, setConfig] = useState<MultiplayerConfig | null>(null);
    const [status, setStatus] = useState<Status>('idle');
    const [error, setError] = useState('');
    const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
    const [standings, setStandings] = useState<LiveStandings | null>(null);
    const [run, setRun] = useState<LocalRun | null>(null);
    const [now, setNow] = useState(Date.now());
    const [rooms, setRooms] = useState<RoomListing[]>([]);
    const [nextOffset, setNextOffset] = useState<number | null>(null);
    const [directoryError, setDirectoryError] = useState('');
    const [directoryLoading, setDirectoryLoading] = useState(false);
    const directoryRequest = useRef(0);
    const [browserId, setBrowserId] = useState('');
    const [reconnectUntil, setReconnectUntil] = useState<number | null>(null);
    const ws = useRef<WebSocket | null>(null);
    const runRef = useRef<LocalRun | null>(null);
    const snapshotRef = useRef<Snapshot | null>(null);
    const entryRef = useRef<Entry | null>(null);
    const offset = useRef(0);
    const reported = useRef(new Set<string>());
    const retries = useRef(0);
    const generation = useRef(0);
    const handshake = useRef<ReturnType<typeof setTimeout> | null>(null);
    const acknowledgement = useRef<ReturnType<typeof setTimeout> | null>(null);
    const syncRound = useRef('');
    const progressReport = useRef({ roundId: '', correctChars: 0, updatedAt: 0 });
    const mounted = useRef(false);
    const reconnectDeadline = useRef<number | null>(null);

    const save = useCallback(() => {
        try { if (entryRef.current) sessionStorage.setItem(savedKey, JSON.stringify({ entry: entryRef.current, run: runRef.current })); } catch { /* Memory-only reconnect still works. */ }
    }, []);
    const send = useCallback((command: ClientCommand) => {
        if (ws.current?.readyState !== WebSocket.OPEN) return false;
        ws.current.send(JSON.stringify(command)); return true;
    }, []);
    const updateRun = useCallback((next: LocalRun | null) => { runRef.current = next; setRun(next); save(); }, [save]);
    const post = useCallback(async (path: string, body: object) => {
        try {
            const response = await fetch(`${MULTIPLAYER_PATH}/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body), signal: AbortSignal.timeout(12_000), cache: 'no-store' });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || maintenance);
            return data;
        } catch (e) {
            if (e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError'))
                throw new Error('The room request timed out. Complete a fresh security check and try again.');
            throw e;
        }
    }, []);
    const refreshRooms = useCallback(async (id = browserId, page = 0, fresh = true) => {
        const request = ++directoryRequest.current;
        setDirectoryLoading(true);
        try {
            const data = await post('directory', { browserId: id, offset: page, fresh });
            if (mounted.current && request === directoryRequest.current) { setRooms(data.rooms); setNextOffset(data.nextOffset); setDirectoryError(''); }
        } catch { if (mounted.current && request === directoryRequest.current) setDirectoryError('Room discovery is unavailable. You can still try joining by exact name.'); }
        finally { if (mounted.current && request === directoryRequest.current) setDirectoryLoading(false); }
    }, [browserId, post]);

    useEffect(() => {
        mounted.current = true;
        let id: string;
        try { id = localStorage.getItem('ninjatype-multiplayer-browser') || crypto.randomUUID(); localStorage.setItem('ninjatype-multiplayer-browser', id); }
        catch { id = crypto.randomUUID(); }
        setBrowserId(id);
        const saved = readSaved();
        if (saved?.entry) { entryRef.current = { ...saved.entry, browserId: id }; updateRun(saved.run); setStatus('disconnected');
            reconnectDeadline.current = Date.now() + 120_000; setReconnectUntil(reconnectDeadline.current); }
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8_000);
        if (import.meta.env.PUBLIC_MULTIPLAYER_ENABLED === 'false') { setConfig(disabledConfig); clearTimeout(timer); }
        else void fetch(`${MULTIPLAYER_PATH}/config`, { signal: controller.signal, cache: 'no-store' })
            .then(async r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(c => { if (mounted.current) { setConfig(c); if (c.enabled) void refreshRooms(id, 0, false); } })
            .catch(() => { if (mounted.current && !controller.signal.aborted) { setConfig(disabledConfig); setError(maintenance); }
                else if (mounted.current) setConfig(disabledConfig); })
            .finally(() => clearTimeout(timer));
        return () => {
            mounted.current = false; controller.abort(); clearTimeout(timer); generation.current++;
            if (handshake.current) clearTimeout(handshake.current);
            if (acknowledgement.current) clearTimeout(acknowledgement.current);
            ws.current?.close(); ws.current = null;
        };
        // One config/discovery fetch per multiplayer entry, not a polling loop.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!snapshot && !reconnectUntil) return;
        const timer = setInterval(() => {
            const time = Date.now() + offset.current; setNow(time);
            const current = snapshotRef.current;
            const round = current?.room.round, local = runRef.current;
            if (config?.liveProgress && ws.current?.readyState === WebSocket.OPEN && current?.room.phase === 'racing'
                && round && local?.roundId === round.id && !local.stopped && time < round.deadline
                && round.players.some(p => p.id === current.selfId)) {
                if (progressReport.current.roundId !== round.id)
                    progressReport.current = { roundId: round.id, correctChars: 0, updatedAt: round.startAt };
                const last = progressReport.current;
                if (time - last.updatedAt >= PROGRESS_MS) {
                    const correctChars = localMetrics(local, round.startAt, time).correctChars;
                    last.updatedAt = time;
                    if (correctChars !== last.correctChars && send({ type: 'progress', roundId: round.id, correctChars }))
                        last.correctChars = correctChars;
                }
            }
            if (current?.room.phase === 'racing' && current.room.round && time >= current.room.round.deadline && syncRound.current !== current.room.round.id) {
                syncRound.current = current.room.round.id; send({ type: 'sync' });
            }
        }, 200);
        return () => clearInterval(timer);
    }, [!!snapshot, reconnectUntil, send, config?.liveProgress]);

    const join = useCallback((entry: Entry, token: string, reconnect = false) => {
        if (reconnect && (retries.current >= 3 || (reconnectDeadline.current !== null && Date.now() >= reconnectDeadline.current))) {
            setError('The reconnect window ended. Join again or keep practicing.'); return;
        }
        if (reconnect) retries.current++;
        else { retries.current = 0; reconnectDeadline.current = null; setReconnectUntil(null); updateRun(null); }
        reported.current.clear(); // A new, challenged connection may retry an unacknowledged final report.
        setStandings(null);
        progressReport.current = { roundId: '', correctChars: 0, updatedAt: 0 };
        generation.current++;
        const currentGeneration = generation.current;
        ws.current?.close();
        entryRef.current = entry; save();
        setError(''); setStatus('connecting');
        const url = new URL(`${MULTIPLAYER_PATH}/socket`, window.location.origin); url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
        const socket = new WebSocket(url, [SOCKET_PROTOCOL, `entry.${encodeHeader(JSON.stringify(entry))}`, `turnstile.${encodeHeader(token)}`]);
        ws.current = socket;
        const active = () => mounted.current && currentGeneration === generation.current;
        handshake.current = setTimeout(() => { if (active()) { setError(maintenance); socket.close(); } }, 12_000);
        socket.onmessage = event => {
            if (!active()) return;
            let message: ServerMessage;
            try { message = JSON.parse(event.data); } catch { setError(maintenance); socket.close(); return; }
            if (message.type === 'closed') {
                setStatus('closed'); setError(message.reason); entryRef.current = null;
                try { sessionStorage.removeItem(savedKey); } catch {}
                socket.close(); return;
            }
            if (message.type === 'error') {
                setError(message.message);
                if (message.code === 'invalid_finish' && runRef.current) {
                    if (acknowledgement.current) { clearTimeout(acknowledgement.current); acknowledgement.current = null; }
                    updateRun({ ...runRef.current, stopped: false });
                }
                return;
            }
            if (message.type === 'standings') {
                if (message.roundId === snapshotRef.current?.room.round?.id && snapshotRef.current.room.phase === 'racing')
                    setStandings(previous => previous?.roundId === message.roundId && previous.serverTime > message.serverTime ? previous : message);
                return;
            }
            if (message.type !== 'snapshot') return;
            if (handshake.current) { clearTimeout(handshake.current); handshake.current = null; }
            const previous = snapshotRef.current;
            if (previous?.room.epoch === message.room.epoch && previous.room.sequence > message.room.sequence) return;
            offset.current = message.serverTime - Date.now(); setNow(message.serverTime);
            snapshotRef.current = message; setSnapshot(message); setStatus('connected');
            if (message.standings) setStandings(message.standings);
            else setStandings(null);
            reconnectDeadline.current = null; setReconnectUntil(null); retries.current = 0;
            const self = message.room.members.find(m => m.id === message.selfId);
            entryRef.current = { ...entry, participantId: message.selfId, epoch: message.room.epoch, nickname: self?.nickname || entry.nickname };
            const round = message.room.round;
            if (round && runRef.current?.roundId !== round.id) updateRun(newLocalRun(round.id, round.text));
            if (message.room.phase === 'results' && round && runRef.current) {
                const currentRun = runRef.current;
                updateRun({ ...currentRun, stopped: true });
                const result = round.players.find(p => p.id === message.selfId);
                if (result && !result.metrics && !reported.current.has(round.id)) {
                    reported.current.add(round.id);
                    send({ type: 'metrics', roundId: round.id, typedText: currentRun.typedText, attempts: currentRun.attempts, errors: currentRun.errors });
                }
                if (result?.metrics) {
                    if (acknowledgement.current) { clearTimeout(acknowledgement.current); acknowledgement.current = null; }
                    const metrics = result.metrics;
                    const historyId = `multiplayer-${message.room.epoch}-${round.id}`;
                    if (metrics.duration >= 1 && metrics.correctChars > 0 && !$history.get().sessions.some(s => s.id === historyId))
                        addSession({ id: historyId, timestamp: round.endedAt!, wpm: metrics.wpm, cpm: metrics.wpm * 5,
                            accuracy: metrics.accuracy, errors: metrics.errors, duration: metrics.duration, mode: 'multiplayer' });
                }
            }
            save();
        };
        socket.onerror = () => { if (active()) setError('Could not enter the room. Complete a fresh security check and retry; the room may be full or expired.'); };
        socket.onclose = () => {
            if (!active()) return;
            if (handshake.current) { clearTimeout(handshake.current); handshake.current = null; }
            if (!entryRef.current) return;
            setStatus('disconnected');
            if (reconnectDeadline.current === null) reconnectDeadline.current = Date.now() + 120_000;
            setReconnectUntil(reconnectDeadline.current);
            save();
        };
    }, [save, send, updateRun]);
    const create = useCallback(async (name: string, wordCount: number, token: string) => {
        setError('');
        try { return await post('rooms', { name, wordCount, token, browserId }); }
        catch (e) { setError(e instanceof Error ? e.message : maintenance); throw e; }
    }, [browserId, post]);
    const type = useCallback((input: string) => {
        const s = snapshotRef.current, current = runRef.current;
        if (!s?.room.round || !current || s.room.phase !== 'racing' || !s.room.round.players.some(p => p.id === s.selfId) || ws.current?.readyState !== WebSocket.OPEN || current.stopped) return;
        if (Date.now() + offset.current >= s.room.round.deadline) return;
        const next = typeLocalRun(current, input, Date.now()); updateRun(next);
        if (next.stopped) {
            const command: ClientCommand = { type: 'finish', roundId: next.roundId, typedText: next.typedText, attempts: next.attempts, errors: next.errors };
            send(command);
            if (acknowledgement.current) clearTimeout(acknowledgement.current);
            acknowledgement.current = setTimeout(() => {
                if (!mounted.current || snapshotRef.current?.room.round?.id !== next.roundId || snapshotRef.current.room.phase !== 'racing') return;
                send(command); setError('Waiting for the room to confirm your finish. Your local run is preserved.');
            }, 5_000);
        }
    }, [send, updateRun]);
    const leave = useCallback(() => {
        generation.current++; ws.current?.close(); ws.current = null;
        if (handshake.current) clearTimeout(handshake.current);
        if (acknowledgement.current) clearTimeout(acknowledgement.current);
        entryRef.current = null; snapshotRef.current = null; reconnectDeadline.current = null;
        setSnapshot(null); setStandings(null); updateRun(null); setReconnectUntil(null); setStatus('idle'); setError('');
        try { sessionStorage.removeItem(savedKey); } catch {}
    }, [updateRun]);
    return { config, status, error, setError, snapshot, standings, run, now, rooms, directoryError, directoryLoading, nextOffset, refreshRooms,
        browserId, reconnectUntil, reconnectEntry: entryRef.current, canReconnect: retries.current < 3 && (reconnectUntil === null || Date.now() < reconnectUntil),
        join, create, type, send, leave };
}
