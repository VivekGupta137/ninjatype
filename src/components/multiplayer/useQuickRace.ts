import { useCallback, useEffect, useRef, useState } from 'react';
import { QuickRace } from '@/lib/multiplayer/quickRace';
import type { AvatarSettings, ClientCommand } from '@/lib/multiplayer/protocol';
import { $history, addSession } from '@/store/history';

export function useQuickRace() {
    const model = useRef<QuickRace | null>(null);
    const [state, setState] = useState<ReturnType<QuickRace['tick']> | null>(null);
    const [error, setError] = useState('');
    const publish = useCallback(() => {
        if (!model.current) return;
        const next = model.current.tick(Date.now());
        setState(next); setError(next.closed ?? next.error);
        const round = next.snapshot.room.round, metrics = round?.players.find(p => p.id === next.snapshot.selfId)?.metrics;
        if (round?.endedAt && metrics && metrics.duration >= 1 && metrics.correctChars > 0) {
            const id = `quick-race-${round.id}`;
            if (!$history.get().sessions.some(s => s.id === id)) addSession({ id, timestamp: round.endedAt,
                wpm: metrics.wpm, cpm: metrics.wpm * 5, accuracy: metrics.accuracy, errors: metrics.errors, duration: metrics.duration, mode: 'multiplayer' });
        }
    }, []);
    const active = !!state;
    const running = active && !state?.closed;
    useEffect(() => {
        if (!running) return;
        const timer = setInterval(publish, 200);
        return () => clearInterval(timer);
    }, [running, publish]);
    const startQuick = useCallback((nickname: string, avatar: AvatarSettings) => {
        model.current = new QuickRace(nickname, avatar, Date.now()); setError(''); publish();
    }, [publish]);
    const send = useCallback((command: ClientCommand) => {
        const accepted = model.current?.command(command, Date.now()) ?? false;
        publish(); return accepted;
    }, [publish]);
    const type = useCallback((input: string) => { model.current?.type(input, Date.now()); publish(); }, [publish]);
    const leave = useCallback(() => { model.current = null; setState(null); setError(''); }, []);
    return { active, startQuick, snapshot: state?.snapshot ?? null, standings: state?.standings ?? null,
        run: state?.run ?? null, trends: state?.trends ?? null, now: state?.now ?? Date.now(),
        status: state?.closed ? 'closed' as const : active ? 'connected' as const : 'idle' as const,
        error, setError, send, type, leave, reconnectEntry: null, reconnectUntil: null, canReconnect: false };
}
