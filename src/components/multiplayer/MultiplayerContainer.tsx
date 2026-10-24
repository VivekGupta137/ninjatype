import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Copy, LogOut, MousePointer2, RefreshCw, Users } from 'lucide-react';
import Paragraph from '@/components/keyboard/Paragraph';
import { DEFAULT_MAX_PLAYERS, WORD_COUNTS, nickname as validateNickname, roomName, type Entry } from '@/lib/multiplayer/protocol';
import { localMetrics } from '@/lib/multiplayer/localRun';
import Avatar from './Avatar';
import Turnstile from './Turnstile';
import { useMultiplayer } from './useMultiplayer';

const remaining = (deadline: number, now: number) => {
    const seconds = Math.max(0, Math.ceil((deadline - now) / 1000));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};
export default function MultiplayerContainer() {
    const game = useMultiplayer();
    const [mode, setMode] = useState<'join' | 'create'>('join');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [wordCount, setWordCount] = useState(30);
    const [token, setToken] = useState('');
    const [attempt, setAttempt] = useState(0);
    const [busy, setBusy] = useState(false);
    const [inviteEpoch, setInviteEpoch] = useState<string | undefined>();
    const [notice, setNotice] = useState('');
    const input = useRef<HTMLInputElement>(null);
    const [focused, setFocused] = useState(false);
    const room = game.snapshot?.room;
    const capacity = room?.maxPlayers ?? game.config?.maxPlayers ?? DEFAULT_MAX_PLAYERS;
    const round = room?.round;
    const self = room?.members.find(m => m.id === game.snapshot?.selfId);
    const isParticipant = round?.players.some(p => p.id === game.snapshot?.selfId) ?? false;
    const racing = game.status === 'connected' && room?.phase === 'racing' && isParticipant && !game.run?.stopped && game.now < round!.deadline;
    const metrics = round && game.run ? localMetrics(game.run, round.startAt, round.endedAt ?? Math.min(game.now, round.deadline)) : null;
    const selfResult = round?.players.find(p => p.id === game.snapshot?.selfId);
    const canRematch = room?.phase === 'results' && (!!selfResult?.metrics || game.now >= round!.collectionUntil!);

    useEffect(() => {
        const url = new URL(window.location.href);
        setName(url.searchParams.get('room') || ''); setInviteEpoch(url.searchParams.get('epoch') || undefined);
        let savedName: string | null = null;
        try { savedName = localStorage.getItem('ninjatype-multiplayer-nickname'); } catch {}
        const saved = game.reconnectEntry;
        setUsername(saved?.nickname || savedName || `Ninja-${crypto.randomUUID().slice(0, 6)}`);
    }, []);
    useEffect(() => { if (racing) input.current?.focus({ preventScroll: true }); }, [racing]);
    const resetChallenge = () => { setToken(''); setAttempt(n => n + 1); };
    const switchMode = (next: 'join' | 'create') => { setMode(next); resetChallenge(); setNotice(''); };
    const enter = async (reconnect = false) => {
        if (!token || busy) return;
        let entry: Entry;
        try {
            entry = reconnect && game.reconnectEntry ? game.reconnectEntry : {
                name: roomName(name), nickname: validateNickname(username), browserId: game.browserId, ...(inviteEpoch ? { epoch: inviteEpoch } : {}),
            };
        } catch (e) { game.setError(e instanceof Error ? e.message : 'Check the room name and nickname.'); return; }
        const challenge = token; resetChallenge();
        try { localStorage.setItem('ninjatype-multiplayer-nickname', entry.nickname); } catch {}
        setBusy(true);
        try {
            if (mode === 'create' && !reconnect) {
                const created = await game.create(entry.name, wordCount, challenge);
                setName(created.name); setInviteEpoch(created.epoch); setMode('join');
                setNotice('Room created. Complete the security check to enter it.');
            } else { setNotice(''); game.join(entry, challenge, reconnect); }
        } catch { /* The coordinator supplies a user-facing error. */ }
        finally { setBusy(false); }
    };
    const copyInvite = async () => {
        if (!room) return;
        const link = new URL('/multiplayer/', window.location.origin);
        link.searchParams.set('room', room.name); link.searchParams.set('epoch', room.epoch);
        try { await navigator.clipboard.writeText(link.href); setNotice('Invite link copied.'); }
        catch { setNotice(`Invite: ${link.href}`); }
    };
    const sortedResults = [...(round?.players ?? [])].sort((a, b) => {
        if (a.id === round?.winnerId) return -1;
        if (b.id === round?.winnerId) return 1;
        return Number(!!b.metrics) - Number(!!a.metrics) || (b.metrics?.correctChars ?? 0) - (a.metrics?.correctChars ?? 0) || a.nickname.localeCompare(b.nickname);
    });
    return <div className="online-workspace multiplayer-workspace">
        <header className="online-heading"><div><span className="online-eyebrow">friends or a fresh challenge</span>
            <h1>Meet at the starting line.</h1><p>One room. One passage. Up to {capacity} players typing together.</p></div>
            <div className="online-mode-note"><span><Users size={14} />Multiplayer</span><p>First finisher ends the round.<br />{' '}Ready for another? Rematch.</p></div>
        </header>
        <nav className="multiplayer-mode-links" aria-label="Race modes"><a href="/online/">Race past attempts</a><a href="/multiplayer/" aria-current="page">Multiplayer rooms</a></nav>
        {(!game.config || !game.config.enabled) && <section className="multiplayer-message" role="status">
            <p>{!game.config ? 'Checking multiplayer availability…' : 'Multiplayer is under maintenance. You can keep practicing.'}</p><a href="/">Practice <ArrowRight size={14} /></a>
        </section>}
        {!!game.error && <div className="multiplayer-message" role="status"><p>{game.error}</p><a href="/">Keep practicing</a></div>}
        {!!notice && <p className="multiplayer-notice" role="status">{notice}</p>}

        {game.config?.enabled && game.status !== 'connected' && <section className="multiplayer-entry" aria-labelledby="room-entry-title">
            <h2 id="room-entry-title">{game.status === 'disconnected' && game.reconnectEntry?.participantId ? 'Get back to your room' : 'Find your room'}</h2>
            {game.status === 'disconnected' && game.reconnectEntry?.participantId && <div className="multiplayer-reconnect">
                <p>Your local run is preserved. Reconnect to <strong>{game.reconnectEntry.name}</strong> after a fresh security check.</p>
                {game.reconnectUntil && <p>Reconnect window: {remaining(game.reconnectUntil, Date.now())}. The room clock keeps running.</p>}
                <button className="online-primary-action" type="button" disabled={!token || !game.canReconnect || busy} onClick={() => void enter(true)}>Reconnect</button>
                <button type="button" onClick={() => { game.leave(); resetChallenge(); }}>Join as a new player</button>
            </div>}
            {!game.reconnectEntry?.participantId && <>
                <div className="online-length-picker" role="group" aria-label="Room action">
                    <button type="button" aria-pressed={mode === 'join'} disabled={busy} onClick={() => switchMode('join')}>Join a room</button>
                    <button type="button" aria-pressed={mode === 'create'} disabled={busy} onClick={() => switchMode('create')}>Create a room</button>
                </div>
                <form onSubmit={e => { e.preventDefault(); void enter(); }}>
                    <div className="multiplayer-fields"><label>Nickname<input value={username} maxLength={24} required onChange={e => setUsername(e.target.value)} autoComplete="off" /></label>
                        <label>Exact room name<input value={name} maxLength={48} minLength={3} pattern="[A-Za-z0-9_-]+" required onChange={e => { setName(e.target.value); setInviteEpoch(undefined); }} autoComplete="off" autoCapitalize="none" spellCheck={false} /></label></div>
                    <p className="multiplayer-hint">Room names are case-sensitive. Use letters, numbers, hyphens or underscores.</p>
                    {mode === 'create' && <div className="online-length-picker" role="group" aria-label="Room race length"><span>Race length</span>{WORD_COUNTS.map(n => <button key={n} type="button" aria-pressed={wordCount === n} onClick={() => setWordCount(n)}>{n} words</button>)}</div>}
                    <button className="online-primary-action" type="submit" disabled={!token || busy || game.status === 'connecting' || !game.browserId}>{busy || game.status === 'connecting' ? 'Please wait…' : mode === 'create' ? 'Create room' : 'Join room'}<ArrowRight size={14} /></button>
                </form>
            </>}
            <Turnstile siteKey={game.config.siteKey} action={mode === 'create' ? 'create_room' : 'join_room'} attempt={attempt} onToken={setToken} />
            {mode === 'create' && <p className="multiplayer-hint">Rooms are public and last up to 20 minutes. Entry requires a separate security check.</p>}
        </section>}

        {room && <>
            <section className="multiplayer-room-header"><div><span className="online-eyebrow">your room</span><h2>{room.name}</h2><p>{room.members.length} / {capacity} seats · closes in {remaining(room.expiresAt, game.now)}</p></div>
                <div className="multiplayer-actions"><button type="button" onClick={() => void copyInvite()}><Copy size={14} />Invite</button><button type="button" onClick={() => { game.leave(); resetChallenge(); }}><LogOut size={14} />Leave</button></div>
            </section>
            {room.phase === 'lobby' && <div className="multiplayer-lobby-actions"><button className="online-primary-action" type="button" disabled={game.status !== 'connected'} onClick={() => game.send({ type: 'ready', value: !self?.ready })}>{self?.ready ? 'Not ready' : 'Ready up'}</button>
                <button type="button" disabled={!self?.ready || room.members.filter(m => m.connected && m.ready).length < 2 || game.status !== 'connected'} onClick={() => game.send({ type: 'start' })}>Start race</button><p>At least two connected players must be ready.</p></div>}
            {round && <section className="online-race-panel" aria-label="Multiplayer typing race">
                <div className="online-race-toolbar"><span className="online-status"><i data-active={racing} />{room.phase === 'countdown' ? `Starting in ${Math.max(0, Math.ceil((round.startAt - game.now) / 1000))}…` : room.phase === 'results' ? 'Round complete' : !isParticipant ? 'Watch this round, then join the next' : game.status !== 'connected' ? 'Disconnected — local run preserved' : game.run?.stopped ? 'Waiting for finish confirmation' : 'Race in progress'}</span>
                    <div className="online-live-stats"><span><strong>{metrics?.wpm ?? '—'}</strong> wpm</span><span><strong>{metrics?.accuracy ?? '—'}%</strong> accuracy</span><span>{remaining(round.deadline, game.now)}</span></div></div>
                <div className="online-you-progress" role="progressbar" aria-label="Your race progress" aria-valuemin={0} aria-valuemax={room.wordCount} aria-valuenow={metrics?.completedWords ?? 0}><span style={{ width: `${(metrics?.completedWords ?? 0) / room.wordCount * 100}%` }} /></div>
                <div className="online-writing-area"><div id="keyboard-container" data-kb-loaded={1}><div id="keyboard-wrapper">
                    {racing && <input ref={input} id="kb-hidden-input" type="text" value={game.run?.typedText ?? ''} onChange={e => game.type(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} aria-label="Multiplayer typing input" aria-describedby="multiplayer-typing-help" />}
                    <div id="keyboard" data-kb-focused={!racing || focused ? 1 : 0} data-preview={room.phase === 'countdown'}><Paragraph paragraphText={round.text} typedText={game.run?.typedText ?? ''} isActive={racing} /></div>
                </div></div>
                    {room.phase === 'countdown' && <div className="online-start-overlay online-countdown" role="status"><kbd className="analytics-key">{Math.max(0, Math.ceil((round.startAt - game.now) / 1000)) || 'go'}</kbd><p>Same passage. Same start.</p></div>}
                    {racing && !focused && <button className="online-focus-button" type="button" onClick={() => input.current?.focus()}><MousePointer2 size={16} />Click to keep racing</button>}
                </div><div className="online-panel-footer"><p id="multiplayer-typing-help">Correct mistakes to advance. First accepted finish or the two-minute race limit stops everyone.</p></div>
            </section>}
            <section className="online-track" aria-labelledby="multiplayer-players-title"><div className="online-track-heading"><h2 id="multiplayer-players-title">Players in the room</h2><span>Joined and ready states</span></div>
                <ul className="multiplayer-members">{room.members.map(m => <li key={m.id} data-you={m.id === game.snapshot?.selfId}><Avatar username={m.nickname} /><span>{m.nickname}{m.id === game.snapshot?.selfId && <small> you</small>}</span><span>{!m.connected ? 'Reconnecting' : m.rematch ? 'Rematch ready' : m.ready ? 'Ready' : room.phase === 'racing' && round?.players.some(p => p.id === m.id) ? 'Playing' : 'In room'}</span></li>)}</ul>
            </section>
            {room.phase === 'results' && round && <section className="multiplayer-results" aria-labelledby="multiplayer-results-title">
                <div className="online-track-heading"><h2 id="multiplayer-results-title">{round.winnerId ? `${round.players.find(p => p.id === round.winnerId)?.nickname} wins` : 'Time expired — no completed winner'}</h2><span>Rematch window {remaining(round.resultsUntil!, game.now)}</span></div>
                <div className="multiplayer-table-wrap"><table><caption className="sr-only">Final typing metrics</caption><thead><tr><th scope="col">Player</th><th scope="col">Words</th><th scope="col">WPM</th><th scope="col">Accuracy</th></tr></thead><tbody>{sortedResults.map(p => <tr key={p.id}><th scope="row">{p.nickname}{p.id === round.winnerId ? ' · winner' : ''}</th><td>{p.metrics ? `${p.metrics.completedWords} / ${room.wordCount}` : '—'}</td><td>{p.metrics?.wpm ?? '—'}</td><td>{p.metrics ? `${p.metrics.accuracy}%` : game.now < round.collectionUntil! ? 'Collecting…' : 'Unavailable'}</td></tr>)}</tbody></table></div>
                <div className="multiplayer-lobby-actions"><button className="online-primary-action" type="button" disabled={!canRematch || game.status !== 'connected'} onClick={() => game.send({ type: 'rematch', roundId: round.id, value: !self?.rematch })}>{self?.rematch ? 'Cancel rematch' : 'Rematch'}<RefreshCw size={14} /></button><p>Two ready rematch votes start a new countdown. The room’s 20-minute clock stays the same.</p></div>
            </section>}
        </>}

        {game.config?.enabled && !room && <section className="online-track" aria-labelledby="public-rooms-title"><div className="online-track-heading"><h2 id="public-rooms-title">Play with someone new</h2><button type="button" onClick={() => void game.refreshRooms()}><RefreshCw size={13} />Refresh rooms</button></div>
            {game.directoryError ? <p className="multiplayer-hint" role="status">{game.directoryError}</p> : game.rooms.length ? <ul className="multiplayer-public-rooms">{game.rooms.filter(r => r.expiresAt > game.now).map(r => <li key={`${r.name}:${r.epoch}`}><span>{r.name}<small>Up to {r.maxPlayers ?? DEFAULT_MAX_PLAYERS} players</small></span><button type="button" onClick={() => { setMode('join'); setName(r.name); setInviteEpoch(r.epoch); resetChallenge(); document.getElementById('room-entry-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>Choose room<ArrowRight size={13} /></button></li>)}</ul> : <p className="multiplayer-hint">No rooms listed yet. Create one or enter a friend’s exact room name. New rooms can take a few minutes to appear.</p>}
            {game.nextOffset !== null && <button type="button" onClick={() => void game.refreshRooms(game.browserId, game.nextOffset!)}>Next rooms</button>}
        </section>}
        <div className="online-bottom-note"><p>Casual scores · no live typing uploads</p><a href="/">Prefer your own pace?<span>Solo practice<ArrowRight size={13} /></span></a></div>
    </div>;
}
