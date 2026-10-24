import { useEffect, useRef, useState } from 'react';
import { Description, Label, ListBox } from '@heroui/react';
import { ArrowRight, Check, Clock3, Copy, Flag, Gauge, LogOut, MousePointer2, Plus, Radio, RefreshCw, Trophy, Users } from 'lucide-react';
import Paragraph from '@/components/keyboard/Paragraph';
import { DEFAULT_MAX_PLAYERS, WORD_COUNTS, nickname as validateNickname, roomName, type Entry } from '@/lib/multiplayer/protocol';
import { localMetrics } from '@/lib/multiplayer/localRun';
import { raceStandings } from '@/lib/multiplayer/standings';
import RaceLeaderboard from './RaceLeaderboard';
import Avatar from './Avatar';
import Turnstile from './Turnstile';
import { useMultiplayer } from './useMultiplayer';

const remaining = (deadline: number, now: number) => {
    const seconds = Math.max(0, Math.ceil((deadline - now) / 1000));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};
export default function MultiplayerContainer() {
    const game = useMultiplayer();
    const [mode, setMode] = useState<'join' | 'create'>('create');
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
    const selfResult = round?.players.find(p => p.id === game.snapshot?.selfId);
    const metrics = isParticipant && round && game.run ? selfResult?.metrics ?? localMetrics(game.run, round.startAt, round.endedAt ?? Math.min(game.now, round.deadline)) : null;
    const progress = round && metrics ? Math.min(100, Math.round(metrics.correctChars / round.text.length * 100)) : 0;
    const standings = round ? raceStandings(round, game.standings, game.snapshot?.selfId, metrics) : [];
    const canRematch = room?.phase === 'results' && (!!selfResult?.metrics || game.now >= round!.collectionUntil!);
    const listedRooms = game.rooms.filter(r => r.expiresAt > game.now);

    useEffect(() => {
        const url = new URL(window.location.href);
        if (url.searchParams.has('room')) setMode('join');
        setName(url.searchParams.get('room') || ''); setInviteEpoch(url.searchParams.get('epoch') || undefined);
        let savedName: string | null = null;
        try { savedName = localStorage.getItem('ninjatype-multiplayer-nickname'); } catch {}
        const saved = game.reconnectEntry;
        setUsername(saved?.nickname || savedName || `Ninja-${crypto.randomUUID().slice(0, 6)}`);
    }, []);
    useEffect(() => { if (racing) input.current?.focus({ preventScroll: true }); }, [racing]);
    const resetChallenge = () => { setToken(''); setAttempt(n => n + 1); };
    const previousStatus = useRef(game.status);
    useEffect(() => {
        // Failed room entry needs another check. Successful entry removes the widget.
        if (previousStatus.current === 'connecting' && (game.status === 'disconnected' || game.status === 'closed'))
            resetChallenge();
        previousStatus.current = game.status;
    }, [game.status]);
    const switchMode = (next: 'join' | 'create') => { setMode(next); setNotice(''); };
    const enter = async (reconnect = false) => {
        if (!token || busy) return;
        let entry: Entry;
        try {
            entry = reconnect && game.reconnectEntry ? game.reconnectEntry : {
                name: roomName(name), nickname: validateNickname(username), browserId: game.browserId, ...(inviteEpoch ? { epoch: inviteEpoch } : {}),
            };
        } catch (e) { game.setError(e instanceof Error ? e.message : 'Check the room name and nickname.'); return; }
        const challenge = token; setToken('');
        const creating = mode === 'create' && !reconnect;
        try { localStorage.setItem('ninjatype-multiplayer-nickname', entry.nickname); } catch {}
        setBusy(true);
        try {
            if (creating) {
                const created = await game.create(entry.name, wordCount, challenge);
                setName(created.name); setInviteEpoch(created.epoch); setMode('join');
                setNotice('Room created. Complete the security check to enter it.');
            } else { setNotice(''); game.join(entry, challenge, reconnect); }
        } catch { /* The coordinator supplies a user-facing error. */ }
        finally {
            if (creating) resetChallenge();
            setBusy(false);
        }
    };
    const copyInvite = async () => {
        if (!room) return;
        const link = new URL('/multiplayer-typing-race/', window.location.origin);
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
        <header className="multiplayer-heading" data-in-room={!!room}>
            <div><span className="online-eyebrow"><Users size={14} />PLAY TOGETHER</span><h1>Multiplayer typing race<span className="multiplayer-title-dot">.</span></h1><p>A friendly race. The same words. A little motivation to get better.</p></div>
            <a href="#how-to-race">How to play<ArrowRight size={14} /></a>
        </header>
        {(!game.config || !game.config.enabled) && <section className="multiplayer-message" role="status">
            <p>{!game.config ? 'Checking multiplayer availability…' : 'Multiplayer is under maintenance. You can keep practicing.'}</p><a href="/">Practice <ArrowRight size={14} /></a>
        </section>}
        {!!game.error && <div className="multiplayer-message" role="status"><p>{game.error}</p><a href="/">Keep practicing</a></div>}
        {!!notice && <p className="multiplayer-notice" role="status">{notice}</p>}

        <div className="multiplayer-entry-layout" data-in-room={!!room}>
        {game.status !== 'connected' && <section className="multiplayer-entry" aria-labelledby="room-entry-title">
            <h2 id="room-entry-title" className="sr-only">{game.status === 'disconnected' && game.reconnectEntry?.participantId ? 'Reconnect to your typing race' : mode === 'create' ? 'Create a typing race room' : 'Join a typing race'}</h2>
            {game.status === 'disconnected' && game.reconnectEntry?.participantId && <div className="multiplayer-reconnect">
                <p>Your local run is preserved. Reconnect to <strong>{game.reconnectEntry.name}</strong> after a fresh security check.</p>
                {game.reconnectUntil && <p>Reconnect window: {remaining(game.reconnectUntil, Date.now())}. The room clock keeps running.</p>}
                {game.config?.enabled && <Turnstile siteKey={game.config.siteKey} action="room_entry" attempt={attempt} onToken={setToken} />}
                <button className="online-primary-action" type="button" disabled={!game.config?.enabled || !token || !game.canReconnect || busy} onClick={() => void enter(true)}>Reconnect</button>
                <button type="button" onClick={() => { game.leave(); resetChallenge(); }}>Join as a new player</button>
            </div>}
            {!game.reconnectEntry?.participantId && <>
                <div className="multiplayer-entry-heading"><span className="online-eyebrow">YOUR NEXT RACE</span><p>{mode === 'create' ? 'Make room for a little competition.' : 'Your friends are one room away.'}</p></div>
                <ListBox className="multiplayer-entry-tabs" aria-label="Room action" selectionMode="single" disallowEmptySelection selectedKeys={new Set([mode])} onSelectionChange={keys => {
                    const next = Array.from(keys)[0];
                    if (next === 'create' || next === 'join') switchMode(next);
                }}>
                    <ListBox.Item id="create" textValue="Create room" className="multiplayer-choice" isDisabled={busy || game.status === 'connecting'}>
                        <span className="multiplayer-choice-icon"><Plus size={17} /></span><div><Label>Create room</Label><Description>Invite your friends</Description></div><ListBox.ItemIndicator />
                    </ListBox.Item>
                    <ListBox.Item id="join" textValue="Join room" className="multiplayer-choice" isDisabled={busy || game.status === 'connecting'}>
                        <span className="multiplayer-choice-icon"><Users size={17} /></span><div><Label>Join room</Label><Description>Enter a room</Description></div><ListBox.ItemIndicator />
                    </ListBox.Item>
                </ListBox>
                <form onSubmit={e => { e.preventDefault(); void enter(); }}>
                    <div className="multiplayer-fields"><label>Your nickname<input placeholder="What should we call you?" value={username} maxLength={24} required onChange={e => setUsername(e.target.value)} autoComplete="off" /></label>
                        <label>Room name<input value={name} placeholder={mode === 'create' ? 'Name your room' : 'Enter the exact room name'} maxLength={48} minLength={3} pattern="[A-Za-z0-9_-]+" required aria-describedby="room-name-help" onChange={e => { setName(e.target.value); setInviteEpoch(undefined); }} autoComplete="off" autoCapitalize="none" spellCheck={false} /></label></div>
                    <p id="room-name-help" className="multiplayer-hint">Case-sensitive · letters, numbers, hyphens or underscores</p>
                    {mode === 'create' && <div className="multiplayer-length-setting"><span>Race length</span><ListBox className="multiplayer-length-picker" aria-label="Room race length" selectionMode="single" disallowEmptySelection selectedKeys={new Set([String(wordCount)])} onSelectionChange={keys => {
                        const next = Number(Array.from(keys)[0]);
                        if (WORD_COUNTS.includes(next as typeof WORD_COUNTS[number])) setWordCount(next);
                    }}>{WORD_COUNTS.map(n => <ListBox.Item key={n} id={String(n)} textValue={`${n} words`} className="multiplayer-word-choice"><Label>{n} words</Label><ListBox.ItemIndicator /></ListBox.Item>)}</ListBox></div>}

                    <div className="multiplayer-entry-footer">
                        {game.config?.enabled && <Turnstile siteKey={game.config.siteKey} action="room_entry" attempt={attempt} onToken={setToken} />}
                        <button className="online-primary-action" type="submit" disabled={!game.config?.enabled || !token || busy || game.status === 'connecting' || !game.browserId}>{busy || game.status === 'connecting' ? 'Please wait…' : mode === 'create' ? 'Create room' : 'Join room'}<ArrowRight size={14} /></button>
                    </div>
                    <p className="multiplayer-entry-note">{mode === 'create' ? 'Public room · 20-minute lifetime · verify again to enter' : `Up to ${capacity} players · ready up together to start`}</p>
                </form>
            </>}
        </section>}

        {!room && <section className="online-track multiplayer-discovery" aria-labelledby="public-rooms-title"><div className="online-track-heading"><div><span className="online-eyebrow"><Radio size={13} />FIND YOUR PEOPLE</span><h2 id="public-rooms-title">Open rooms</h2></div><button aria-label={game.directoryLoading ? 'Refreshing public rooms' : 'Refresh public rooms'} aria-busy={game.directoryLoading} disabled={!game.config?.enabled || !game.browserId || game.directoryLoading} type="button" onClick={() => void game.refreshRooms()}><RefreshCw size={14} className={game.directoryLoading ? 'multiplayer-refreshing' : undefined} /></button></div>
            {!game.config?.enabled ? <div className="multiplayer-empty-rooms"><Users size={24} aria-hidden="true" /><h3>{game.config ? 'Taking a short break' : 'Finding your next race…'}</h3><p>{game.config ? 'Rooms will appear here when multiplayer is available again.' : 'Checking for open rooms. Get your nickname ready.'}</p></div> : game.directoryError ? <div className="multiplayer-empty-rooms" role="status"><Radio size={24} aria-hidden="true" /><h3>Room discovery is taking a break.</h3><p>{game.directoryError}</p></div> : listedRooms.length ? <ul className="multiplayer-public-rooms">{listedRooms.map(r => <li key={`${r.name}:${r.epoch}`}><span>{r.name}<small>Up to {r.maxPlayers ?? DEFAULT_MAX_PLAYERS} players</small></span><button type="button" onClick={() => { setMode('join'); setName(r.name); setInviteEpoch(r.epoch); document.querySelector('.multiplayer-entry')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>Choose room<ArrowRight size={13} /></button></li>)}</ul> : <div className="multiplayer-empty-rooms"><Users size={24} aria-hidden="true" /><h3>Be the first on the starting line.</h3><p>Create a room and invite a friend. New rooms may take a few minutes to appear.</p><button type="button" onClick={() => { switchMode('create'); document.querySelector<HTMLInputElement>('.multiplayer-fields input')?.focus(); }}>Create a room<ArrowRight size={13} /></button></div>}
            <div className="multiplayer-room-note"><span><Users size={13} />Up to {capacity} players</span><span>No sign-up needed</span></div>
            {game.nextOffset !== null && <button type="button" onClick={() => void game.refreshRooms(game.browserId, game.nextOffset!)}>Next rooms</button>}
        </section>}
        </div>

        {room && <>
            <section className="multiplayer-room-header"><div><span className="online-eyebrow"><Users size={13} />Typing race room</span><h2>{room.name}</h2><p>{room.members.length} / {capacity} players · {room.wordCount} words · room closes in {remaining(room.expiresAt, game.now)}</p></div>
                <div className="multiplayer-actions"><button type="button" onClick={() => void copyInvite()}><Copy size={14} />Invite friends</button><button type="button" onClick={() => { game.leave(); resetChallenge(); }}><LogOut size={14} />Leave room</button></div>
            </section>
            {room.phase === 'lobby' && <div className="multiplayer-lobby-actions"><button className="online-primary-action" type="button" disabled={game.status !== 'connected'} onClick={() => game.send({ type: 'ready', value: !self?.ready })}>{self?.ready ? 'Not ready' : 'Ready up'}</button>
                <button type="button" disabled={!self?.ready || room.members.filter(m => m.connected && m.ready).length < 2 || game.status !== 'connected'} onClick={() => game.send({ type: 'start' })}>Start race</button><p>At least two connected players must be ready.</p></div>}
            {round && <section className="online-race-panel" aria-label="Multiplayer typing race">
                <div className="online-race-toolbar"><span className="online-status"><i data-active={racing} />{room.phase === 'countdown' ? `Starting in ${Math.max(0, Math.ceil((round.startAt - game.now) / 1000))}…` : room.phase === 'results' ? 'Round complete' : !isParticipant ? 'Watch this round, then join the next' : game.status !== 'connected' ? 'Disconnected — local run preserved' : game.run?.stopped ? 'Waiting for finish confirmation' : 'Race in progress'}</span>
                    <span className="multiplayer-race-length">{room.wordCount}-word typing test</span></div>
                <dl className="multiplayer-live-metrics" aria-label={room.phase === 'results' ? 'Your typing race results' : 'Your live typing metrics'}>
                    <div data-metric="wpm"><dt><Gauge size={14} />Your WPM</dt><dd>{metrics?.wpm ?? '—'}<span>words / min</span></dd></div>
                    <div data-metric="accuracy"><dt><Check size={14} />Accuracy</dt><dd>{metrics ? `${metrics.accuracy}%` : '—'}<span>correct presses</span></dd></div>
                    <div data-metric="progress"><dt><Flag size={14} />Progress</dt><dd>{metrics?.completedWords ?? '—'}<span>of {room.wordCount} words</span></dd></div>
                    <div data-metric="time"><dt><Clock3 size={14} />{room.phase === 'results' ? 'Race time' : 'Time left'}</dt><dd>{room.phase === 'results' ? `${Math.max(0, Math.round((round.endedAt! - round.startAt) / 1000))}s` : remaining(round.deadline, Math.max(game.now, round.startAt))}<span>{room.phase === 'countdown' ? 'starts after countdown' : room.phase === 'results' ? 'round complete' : '2-minute limit'}</span></dd></div>
                </dl>
                {!isParticipant && <p className="multiplayer-spectator-note">You’re watching this round. Your live scores will appear when you join the next race.</p>}
                <div className="multiplayer-race-layout"><div className="multiplayer-race-keyboard">
                <div className="online-you-progress" role="progressbar" aria-label="Your race progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-valuetext={`${progress}% of the passage typed correctly`}><span style={{ width: `${progress}%` }} /></div>
                <div className="online-writing-area"><div id="keyboard-container" data-kb-loaded={1}><div id="keyboard-wrapper">
                    {racing && <input ref={input} id="kb-hidden-input" type="text" value={game.run?.typedText ?? ''} onChange={e => game.type(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} aria-label="Multiplayer typing input" aria-describedby="multiplayer-typing-help" />}
                    <div id="keyboard" data-kb-focused={!racing || focused ? 1 : 0} data-preview={room.phase === 'countdown'}><Paragraph paragraphText={round.text} typedText={game.run?.typedText ?? ''} isActive={racing} /></div>
                </div></div>
                    {room.phase === 'countdown' && <div className="online-start-overlay online-countdown" role="status"><kbd className="analytics-key">{Math.max(0, Math.ceil((round.startAt - game.now) / 1000)) || 'go'}</kbd><p>Same passage. Same start.</p></div>}
                    {racing && !focused && <button className="online-focus-button" type="button" onClick={() => input.current?.focus()}><MousePointer2 size={16} />Click to keep racing</button>}
                </div><div className="online-panel-footer"><p id="multiplayer-typing-help">Correct mistakes before moving to the next word. First finisher ends the race.</p><span>{progress}% complete</span></div>
                </div><RaceLeaderboard players={standings} selfId={game.snapshot?.selfId} finished={room.phase === 'results'} /></div>
            </section>}
            <section className="online-track" aria-labelledby="multiplayer-players-title"><div className="online-track-heading"><h2 id="multiplayer-players-title">Your typing opponents</h2><span>Your speed updates live · opponents refresh about every 10s</span></div>
                <ul className="multiplayer-members">{room.members.map(m => {
                    const you = m.id === game.snapshot?.selfId;
                    const score = you ? metrics : round?.players.find(p => p.id === m.id)?.metrics;
                    const standing = standings.find(p => p.id === m.id);
                    const playing = round?.players.some(p => p.id === m.id);
                    return <li key={m.id} data-you={you}><Avatar username={m.nickname} /><div className="multiplayer-member-name"><span>{m.nickname}{you && <small> you</small>}</span>{standing?.completion != null && <div className="multiplayer-member-progress" aria-hidden="true"><span style={{ width: `${standing.completion}%` }} /></div>}</div><div className="multiplayer-member-score">{(score || standing?.wpm !== null && standing?.wpm !== undefined) && <strong>{score?.wpm ?? standing?.wpm}<small> WPM</small></strong>}<span>{!m.connected ? 'Reconnecting' : m.rematch ? 'Rematch ready' : room.phase === 'results' && playing ? 'Finished' : room.phase === 'racing' && playing ? game.run?.stopped && you ? 'Finishing' : 'Typing' : round && !playing ? 'Watching' : m.ready ? 'Ready' : 'In room'}</span></div></li>;
                })}</ul>
            </section>
            {room.phase === 'results' && round && <section className="multiplayer-results" aria-labelledby="multiplayer-results-title">
                <div className="multiplayer-result-heading"><div><span className="online-eyebrow"><Trophy size={15} />Typing race results</span><h2 id="multiplayer-results-title">{round.winnerId ? `${round.players.find(p => p.id === round.winnerId)?.nickname} wins!` : 'Time’s up. Every word counts.'}</h2><p>{round.winnerId ? 'Compare your typing speed and accuracy. Ready for another race?' : 'No player completed the passage before the time limit. Compare your progress below.'}</p></div><span>Rematch available for {remaining(round.resultsUntil!, game.now)}</span></div>
                <div className="multiplayer-table-wrap"><table><caption className="sr-only">Final typing metrics</caption><thead><tr><th scope="col">Player</th><th scope="col">Words</th><th scope="col">WPM</th><th scope="col">Accuracy</th></tr></thead><tbody>{sortedResults.map(p => <tr key={p.id}><th scope="row">{p.nickname}{p.id === round.winnerId ? ' · winner' : ''}</th><td>{p.metrics ? `${p.metrics.completedWords} / ${room.wordCount}` : '—'}</td><td>{p.metrics?.wpm ?? '—'}</td><td>{p.metrics ? `${p.metrics.accuracy}%` : game.now < round.collectionUntil! ? 'Collecting…' : 'Unavailable'}</td></tr>)}</tbody></table></div>
                <div className="multiplayer-lobby-actions"><button className="online-primary-action" type="button" disabled={!canRematch || game.status !== 'connected'} onClick={() => game.send({ type: 'rematch', roundId: round.id, value: !self?.rematch })}>{self?.rematch ? 'Cancel rematch' : 'Race again'}<RefreshCw size={14} /></button><p>Two players choosing a rematch start the next race. Results stay here for up to two minutes.</p></div>
            </section>}
        </>}

        <nav className="multiplayer-practice-links" aria-label="More typing practice"><a href="/">Solo practice<ArrowRight size={13} /></a><a href="/online/">Race past attempts<ArrowRight size={13} /></a></nav>
    </div>;
}
