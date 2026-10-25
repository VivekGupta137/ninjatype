import { useEffect, useRef, useState } from 'react';
import { Description, Label, ListBox } from '@heroui/react';
import { ArrowRight, Check, CircleCheck, Clock3, Copy, Flag, Gauge, LogOut, MousePointer2, ShieldCheck, Settings2, Shuffle, Plus, Radio, RefreshCw, Trophy, Users } from 'lucide-react';
import RaceParagraph from './RaceParagraph';
import { DEFAULT_AVATAR, avatarSettings, type AvatarSettings, DEFAULT_MAX_PLAYERS, DICTIONARIES, RACE_DURATIONS, WORD_COUNTS, nickname as validateNickname, roomName, type Entry, type RaceSettings, type DictionaryKey } from '@/lib/multiplayer/protocol';
import { localMetrics } from '@/lib/multiplayer/localRun';
import { raceStandings } from '@/lib/multiplayer/standings';
import RaceLeaderboard from './RaceLeaderboard';
import RematchPrompt from './RematchPrompt';
import RaceTrendChart from './RaceTrendChart';
import Avatar from './Avatar';
import AvatarCustomizer from './AvatarCustomizer';
import { defaultNickname, defaultRoomName } from '@/lib/multiplayer/identity';
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
    const [avatar, setAvatar] = useState<AvatarSettings>(DEFAULT_AVATAR);
    const [avatarOpen, setAvatarOpen] = useState(false);
    const generatedRoom = useRef('');
    const [wordCount, setWordCount] = useState(30);
    const [raceMode, setRaceMode] = useState<RaceSettings['mode']>('words');
    const [duration, setDuration] = useState(60);
    const [dictionary, setDictionary] = useState<DictionaryKey>('1k');
    const [token, setToken] = useState('');
    const [attempt, setAttempt] = useState(0);
    const [busy, setBusy] = useState(false);
    const [pendingEntry, setPendingEntry] = useState<Entry | null>(null);
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
    const canRematch = room?.phase === 'results' && game.now < round!.resultsUntil! && game.now < room.expiresAt && (!!selfResult?.metrics || game.now >= round!.collectionUntil!);
    const finished = room?.phase === 'results';
    const timed = room?.mode === 'time';
    const decidingWinner = finished && timed && round?.winnerFinalized === false;
    const dictionaryLabel = DICTIONARIES.find(d => d.id === room?.dictionary)?.label ?? 'English 1k';
    const winner = round?.players.find(p => p.id === round.winnerId);
    const won = !!winner && winner.id === game.snapshot?.selfId;
    const rematchPlayers = room?.members.filter(m => m.connected && m.rematch) ?? [];
    const toggleReady = () => game.send({ type: 'ready', value: !self?.ready });
    const readyPlayers = room?.members.filter(m => m.connected && m.ready).length ?? 0;
    const accuracyTone = !metrics?.attempts ? 'neutral' : metrics.accuracy >= 95 ? 'success' : metrics.accuracy >= 90 ? 'primary' : metrics.accuracy >= 80 ? 'warning' : 'danger';
    const secondsLeft = round ? Math.max(0, Math.ceil((round.deadline - Math.max(game.now, round.startAt)) / 1000)) : 120;
    const timeTone = finished ? 'neutral' : secondsLeft <= 15 ? 'danger' : secondsLeft <= 30 ? 'warning' : 'neutral';
    const listedRooms = game.rooms.filter(r => r.expiresAt > game.now);

    useEffect(() => {
        const url = new URL(window.location.href);
        if (url.searchParams.has('room')) setMode('join');
        generatedRoom.current = defaultRoomName();
        setName(url.searchParams.get('room') || game.reconnectEntry?.name || generatedRoom.current); setInviteEpoch(url.searchParams.get('epoch') || undefined);
        let savedName: string | null = null;
        try { savedName = localStorage.getItem('ninjatype-multiplayer-nickname'); } catch {}
        const saved = game.reconnectEntry;
        setUsername(saved?.nickname || (savedName && !/^Ninja-[a-f0-9]{6}$/i.test(savedName) ? savedName : defaultNickname()));
        try { setAvatar(avatarSettings(saved?.avatar ?? JSON.parse(localStorage.getItem('ninjatype-multiplayer-avatar') || 'null'))); } catch { setAvatar(DEFAULT_AVATAR); }
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
    useEffect(() => {
        if (!pendingEntry || !token) return;
        // Creation consumes its challenge. Enter automatically when the widget
        // supplies a fresh token, without asking for another form submission.
        const entry = pendingEntry;
        setPendingEntry(null); setToken(''); setNotice('');
        game.join(entry, token); setBusy(false);
    }, [pendingEntry, token, game.join]);
    const updateAvatar = (next: AvatarSettings) => {
        setAvatar(next);
        try { localStorage.setItem('ninjatype-multiplayer-avatar', JSON.stringify(next)); } catch {}
    };
    const randomizeRoom = () => { generatedRoom.current = defaultRoomName(name); setName(generatedRoom.current); setInviteEpoch(undefined); };
    const switchMode = (next: 'join' | 'create') => {
        if (next === 'join' && name === generatedRoom.current) setName('');
        if (next === 'create' && (!name || mode === 'join')) randomizeRoom();
        setMode(next); setNotice('');
    };
    const enter = async (reconnect = false) => {
        if (!token || busy) return;
        let entry: Entry;
        try {
            entry = reconnect && game.reconnectEntry ? game.reconnectEntry : {
                name: roomName(name), nickname: validateNickname(username), avatar, browserId: game.browserId, ...(inviteEpoch ? { epoch: inviteEpoch } : {}),
            };
        } catch (e) { game.setError(e instanceof Error ? e.message : 'Check the room name and nickname.'); return; }
        const challenge = token; setToken('');
        const creating = mode === 'create' && !reconnect;
        try { localStorage.setItem('ninjatype-multiplayer-nickname', entry.nickname); } catch {}
        setBusy(true);
        try {
            if (creating) {
                const created = await game.create(entry.name, wordCount, challenge, { mode: raceMode, duration, dictionary });
                setName(created.name); setInviteEpoch(created.epoch); setMode('join');
                setPendingEntry({ ...entry, name: created.name, epoch: created.epoch });
                setNotice('Room created. Joining you to the lobby…');
                resetChallenge();
            } else { setNotice(''); game.join(entry, challenge, reconnect); setBusy(false); }
        } catch {
            // The coordinator supplies a user-facing error; retry creation with
            // a fresh challenge, leaving no pending automatic room entry.
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
    return <div className="online-workspace multiplayer-workspace" data-in-room={!!room}>
        <header className="multiplayer-heading" data-in-room={!!room}>
            <div><span className="online-eyebrow"><Users size={14} />PLAY TOGETHER</span><h1>Multiplayer typing race<span className="multiplayer-title-dot">.</span></h1><p>A friendly race. The same words. A little motivation to get better.</p></div>
            <a href="#how-to-race">How to play<ArrowRight size={14} /></a>
        </header>
        {(!game.config || !game.config.enabled) && <section className="multiplayer-message" data-tone="warning" role="status">
            <p>{!game.config ? 'Checking multiplayer availability…' : 'Multiplayer is under maintenance. You can keep practicing.'}</p><a href="/">Practice <ArrowRight size={14} /></a>
        </section>}
        {!!game.error && <div className="multiplayer-message" data-tone="danger" role="alert"><p>{game.error}</p><a href="/">Keep practicing</a></div>}
        {!!notice && <p className="multiplayer-notice" data-tone="success" role="status"><CircleCheck size={14} />{notice}</p>}

        <AvatarCustomizer open={avatarOpen} username={username} settings={avatar} onChange={updateAvatar} onClose={() => setAvatarOpen(false)} />
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
                    <fieldset className="multiplayer-entry-fields" disabled={busy || game.status === 'connecting'}>
                    <div className="multiplayer-fields"><div className="multiplayer-nickname-field"><label htmlFor="multiplayer-nickname">Your nickname</label><div className="multiplayer-nickname-control"><Avatar username={username} settings={avatar} /><input id="multiplayer-nickname" placeholder="What should we call you?" value={username} maxLength={24} required onChange={e => setUsername(e.target.value)} autoComplete="off" /><button type="button" className="multiplayer-input-action" aria-label="Customize your avatar" title="Customize your avatar" onClick={() => setAvatarOpen(true)}><Settings2 size={15} /></button></div></div>
                        <div className="multiplayer-nickname-field"><label htmlFor="multiplayer-room-name">Room name</label><div className="multiplayer-room-name-control"><input id="multiplayer-room-name" value={name} placeholder={mode === 'create' ? 'Name your room' : 'Enter the exact room name'} maxLength={48} minLength={3} pattern="[A-Za-z0-9_-]+" required aria-describedby="room-name-help" onChange={e => { setName(e.target.value); setInviteEpoch(undefined); }} autoComplete="off" autoCapitalize="none" spellCheck={false} />{mode === 'create' && <button type="button" className="multiplayer-input-action" aria-label="Generate a room name" title="Generate a room name" onClick={randomizeRoom}><Shuffle size={15} /></button>}</div></div></div>
                    <p id="room-name-help" className="multiplayer-hint">Case-sensitive · letters, numbers, hyphens or underscores</p>
                    {mode === 'create' && <div className="multiplayer-race-settings"><label>Race mode<select value={raceMode} onChange={e => setRaceMode(e.target.value as RaceSettings['mode'])}><option value="words">Words · first finisher wins</option><option value="time">Time · race to the timer</option></select></label><label>Dictionary<select value={dictionary} onChange={e => setDictionary(e.target.value as DictionaryKey)}>{DICTIONARIES.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}</select></label></div>}
                    {mode === 'create' && raceMode === 'time' && <div className="multiplayer-length-setting"><span>Time limit</span><ListBox className="multiplayer-length-picker" aria-label="Room race duration" selectionMode="single" disallowEmptySelection selectedKeys={new Set([String(duration)])} onSelectionChange={keys => setDuration(Number(Array.from(keys)[0]))}>{RACE_DURATIONS.map(n => <ListBox.Item key={n} id={String(n)} textValue={`${n} seconds`} isDisabled={busy || game.status === 'connecting'} className="multiplayer-word-choice"><Label>{n}s</Label><ListBox.ItemIndicator /></ListBox.Item>)}</ListBox></div>}
                    {mode === 'create' && raceMode === 'words' && <div className="multiplayer-length-setting"><span>Race length</span><ListBox className="multiplayer-length-picker" aria-label="Room race length" selectionMode="single" disallowEmptySelection selectedKeys={new Set([String(wordCount)])} onSelectionChange={keys => {
                        const next = Number(Array.from(keys)[0]);
                        if (WORD_COUNTS.includes(next as typeof WORD_COUNTS[number])) setWordCount(next);
                    }}>{WORD_COUNTS.map(n => <ListBox.Item key={n} id={String(n)} textValue={`${n} words`} isDisabled={busy || game.status === 'connecting'} className="multiplayer-word-choice"><Label>{n} words</Label><ListBox.ItemIndicator /></ListBox.Item>)}</ListBox></div>}

                    </fieldset>
                    <div className="multiplayer-entry-footer">
                        {game.config?.enabled && <Turnstile siteKey={game.config.siteKey} action="room_entry" attempt={attempt} onToken={setToken} />}
                        <button className="online-primary-action" type="submit" disabled={!game.config?.enabled || !token || busy || game.status === 'connecting' || !game.browserId}>{pendingEntry || game.status === 'connecting' ? 'Joining room…' : busy ? 'Creating room…' : mode === 'create' ? 'Create & join room' : 'Join room'}<ArrowRight size={14} /></button>
                    </div>
                    <p className="multiplayer-entry-note">{mode === 'create' ? 'Public room · 20-minute lifetime · you’ll join automatically' : `Up to ${capacity} players · ready up together to start`}</p>
                </form>
            </>}
        </section>}

        {!room && <section className="online-track multiplayer-discovery" aria-labelledby="public-rooms-title"><div className="online-track-heading"><div><span className="online-eyebrow"><Radio size={13} />FIND YOUR PEOPLE</span><h2 id="public-rooms-title">Open rooms</h2></div><button aria-label={game.directoryLoading ? 'Refreshing public rooms' : 'Refresh public rooms'} aria-busy={game.directoryLoading} disabled={!game.config?.enabled || !game.browserId || game.directoryLoading} type="button" onClick={() => void game.refreshRooms()}><RefreshCw size={14} className={game.directoryLoading ? 'multiplayer-refreshing' : undefined} /></button></div>
            {!game.config?.enabled ? <div className="multiplayer-empty-rooms"><Users size={24} aria-hidden="true" /><h3>{game.config ? 'Taking a short break' : 'Finding your next race…'}</h3><p>{game.config ? 'Rooms will appear here when multiplayer is available again.' : 'Checking for open rooms. Get your nickname ready.'}</p></div> : game.directoryError ? <div className="multiplayer-empty-rooms" role="status"><Radio size={24} aria-hidden="true" /><h3>Room discovery is taking a break.</h3><p>{game.directoryError}</p></div> : listedRooms.length ? <ul className="multiplayer-public-rooms">{listedRooms.map(r => <li key={`${r.name}:${r.epoch}`}><span>{r.name}<small>Up to {r.maxPlayers ?? DEFAULT_MAX_PLAYERS} players</small></span><button type="button" onClick={() => { setMode('join'); setName(r.name); setInviteEpoch(r.epoch); document.querySelector('.multiplayer-entry')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>Choose room<ArrowRight size={13} /></button></li>)}</ul> : <div className="multiplayer-empty-rooms"><Users size={24} aria-hidden="true" /><h3>Be the first on the starting line.</h3><p>Create a room and invite a friend. New rooms may take a few minutes to appear.</p></div>}
            {game.config?.enabled && <div className="multiplayer-discovery-actions"><button type="button" disabled={busy || game.status === 'connecting'} onClick={() => { switchMode('create'); document.querySelector<HTMLInputElement>('#multiplayer-room-name')?.focus(); }}>Create a room<ArrowRight size={13} /></button><button type="button" disabled={!game.browserId || game.directoryLoading} aria-busy={game.directoryLoading} onClick={() => void game.refreshRooms()}><RefreshCw size={13} className={game.directoryLoading ? 'multiplayer-refreshing' : undefined} />{game.directoryLoading ? 'Refreshing…' : 'Refresh rooms'}</button></div>}
            <div className="multiplayer-room-note"><span><Users size={13} />Up to {capacity} players</span><span>No sign-up needed</span></div>
            {game.nextOffset !== null && <button type="button" onClick={() => void game.refreshRooms(game.browserId, game.nextOffset!)}>Next rooms</button>}
        </section>}
        </div>

        {room && <>
            <section className="multiplayer-room-header" aria-label="Your room"><div className="multiplayer-room-identity"><span className="multiplayer-room-icon"><Users size={20} /></span><div><span className="online-eyebrow">YOUR ROOM</span><h2>{room.name}</h2></div></div>
                <div className="multiplayer-room-meta"><span><Users size={13} />{room.members.length}/{capacity} players</span><span>{timed ? `${room.duration}s timed race` : `${room.wordCount} words`}</span><span>{dictionaryLabel}</span><span data-tone={room.expiresAt - game.now < 120_000 ? 'warning' : 'neutral'}><Clock3 size={13} />{remaining(room.expiresAt, game.now)} left</span></div>
                <div className="multiplayer-actions"><button type="button" data-tone="primary" onClick={() => void copyInvite()}><Copy size={14} />Invite friends</button><button type="button" data-tone="danger" onClick={() => { game.leave(); resetChallenge(); }}><LogOut size={14} />Leave</button></div>
            </section>
            {room.phase === 'lobby' && <div className="multiplayer-lobby-actions multiplayer-ready-bar"><div><span className="multiplayer-status-pill" data-tone={readyPlayers >= 2 ? 'success' : 'warning'}><span className="multiplayer-status-dot" />{readyPlayers} ready</span><p id="multiplayer-ready-hint" role="status">{!self?.ready ? 'Press Ready to start when you’re set. Two ready players are needed.' : readyPlayers >= 2 ? 'You’re ready. Start when everyone is set.' : 'You’re ready. Waiting for another player.'}</p></div><div className="multiplayer-actions"><button className="multiplayer-ready-action" type="button" data-tone="success" data-ready={!!self?.ready} aria-pressed={!!self?.ready} aria-describedby="multiplayer-ready-hint" disabled={game.status !== 'connected'} onClick={toggleReady}>{self?.ready ? <CircleCheck size={14} /> : <Check size={14} />}{self?.ready ? 'Ready · undo' : 'Ready to start'}</button>
                <button className="online-primary-action" type="button" disabled={!self?.ready || readyPlayers < 2 || game.status !== 'connected'} onClick={() => game.send({ type: 'start' })}><Flag size={14} />Start race</button></div></div>}
            {round && <section className="online-race-panel" data-phase={room.phase} aria-label={finished ? "Typing race results" : "Multiplayer typing race"}>
                {finished ? <div className="multiplayer-finish-heading" data-tone={winner ? 'success' : 'warning'}>
                    <div className="multiplayer-finish-copy"><span className="multiplayer-outcome-icon">{winner ? <Trophy size={24} /> : <Clock3 size={24} />}</span><div><span className="multiplayer-status-pill" role="status" data-tone={winner ? 'success' : 'warning'}>{decidingWinner ? 'Race over · deciding winner' : 'Race over'}</span><h2 id="multiplayer-results-title">{decidingWinner ? 'Comparing final scores…' : won ? 'You won this round.' : winner ? `${winner.nickname} takes first.` : timed ? 'Time’s up.' : 'Every word counts.'}</h2><p>{won ? 'Nicely done. Keep the momentum going.' : winner ? 'A little competition. A little progress.' : timed ? 'The timer has ended. Final scores decide this round.' : 'No one finished before the time limit. Try another round.'}</p></div></div>
                    <div className="multiplayer-rematch"><button className="online-primary-action" type="button" disabled={!canRematch || game.status !== 'connected'} onClick={() => game.send({ type: 'rematch', roundId: round.id, value: !self?.rematch })}><RefreshCw size={14} />{self?.rematch ? 'Cancel rematch' : 'Race again'}</button><p>{game.now >= round.resultsUntil! ? 'Rematch window closed' : self?.rematch ? 'Waiting for another player' : !canRematch ? 'Collecting final scores…' : `Rematch · ${remaining(Math.min(round.resultsUntil!, room.expiresAt), game.now)} left`}</p></div>
                </div> : <div className="online-race-toolbar"><span className="multiplayer-status-pill" data-tone={game.status !== 'connected' ? 'danger' : room.phase === 'countdown' || game.run?.stopped ? 'warning' : 'primary'}><span className="multiplayer-status-dot" />{room.phase === 'countdown' ? `Starting in ${Math.max(0, Math.ceil((round.startAt - game.now) / 1000))}…` : !isParticipant ? 'Spectating' : game.status !== 'connected' ? 'Reconnecting' : game.run?.stopped ? timed ? 'Passage complete · waiting for timer' : 'Confirming your finish' : 'Race in progress'}</span><span className="multiplayer-race-length">{timed ? `${room.duration}s` : `${room.wordCount} words`} · {dictionaryLabel}</span></div>}
                {finished ? <dl className="multiplayer-live-metrics" aria-label={room.phase === 'results' ? 'Your typing race results' : 'Your live typing metrics'}>
                    <div data-metric="wpm" data-tone="primary"><dt><Gauge size={14} />Your WPM</dt><dd>{metrics?.wpm ?? '—'}<span>words / min</span></dd></div>
                    <div data-metric="accuracy" data-tone={accuracyTone}><dt><ShieldCheck size={14} />Accuracy</dt><dd>{metrics ? `${metrics.accuracy}%` : '—'}<span>correct presses</span></dd></div>
                    <div data-metric="progress" data-tone={progress === 100 ? 'success' : 'primary'}><dt><Flag size={14} />Progress</dt><dd>{metrics?.completedWords ?? '—'}<span>{timed ? 'words typed' : `of ${room.wordCount} words`}</span></dd></div>
                    <div data-metric="time" data-tone={timeTone}><dt><Clock3 size={14} />{room.phase === 'results' ? 'Race time' : 'Time left'}</dt><dd>{room.phase === 'results' ? `${Math.max(0, Math.round((round.endedAt! - round.startAt) / 1000))}s` : remaining(round.deadline, Math.max(game.now, round.startAt))}<span>{room.phase === 'countdown' ? 'starts after countdown' : room.phase === 'results' ? 'round complete' : `${room.duration}s limit`}</span></dd></div>
                </dl> : <div className="multiplayer-race-summary" aria-label="Live race overview">
                    <dl className="multiplayer-summary-stat">
                        <div className="multiplayer-summary-primary" data-tone="primary"><dt><Gauge size={14} />Your WPM</dt><dd>{metrics?.wpm ?? '—'}</dd><small>words / min</small></div>
                        <div className="multiplayer-summary-detail" data-tone={accuracyTone}><dt><ShieldCheck size={13} />Accuracy</dt><dd>{metrics ? `${metrics.accuracy}%` : '—'}</dd></div>
                    </dl>
                    <RaceLeaderboard players={standings} selfId={game.snapshot?.selfId} finished={false} />
                    <dl className="multiplayer-summary-stat">
                        <div className="multiplayer-summary-primary" data-tone={timeTone}><dt><Clock3 size={14} />Time left</dt><dd>{remaining(round.deadline, Math.max(game.now, round.startAt))}</dd><small>{room.phase === 'countdown' ? 'starts after countdown' : `${room.duration}s limit`}</small></div>
                        <div className="multiplayer-summary-detail" data-tone={progress === 100 ? 'success' : 'primary'}><dt><Flag size={13} />Progress</dt><dd>{metrics?.completedWords ?? '—'}<small>{timed ? ' words' : ` / ${room.wordCount}`}</small></dd></div>
                    </dl>
                </div>}
                {!isParticipant && <p className="multiplayer-spectator-note">You’re watching this round. Your live scores will appear when you join the next race.</p>}
                {!finished && <div className="multiplayer-race-layout"><div className="multiplayer-race-keyboard">
                <div className="online-you-progress" data-tone={progress === 100 ? 'success' : 'primary'} role="progressbar" aria-label="Your race progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-valuetext={`${progress}% of the passage typed correctly`}><span style={{ width: `${progress}%` }} /></div>
                <div className="online-writing-area"><div id="keyboard-container" data-kb-loaded={1}><div id="keyboard-wrapper">
                    {racing && <input ref={input} id="kb-hidden-input" type="text" value={game.run?.typedText ?? ''} onChange={e => game.type(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} aria-label="Multiplayer typing input" aria-describedby="multiplayer-typing-help" />}
                    <div id="keyboard" data-kb-focused={!racing || focused ? 1 : 0} data-preview={room.phase === 'countdown'}><RaceParagraph text={round.text} typedText={game.run?.typedText ?? ''} active={racing} timed={timed} /></div>
                </div></div>
                    {room.phase === 'countdown' && <div className="online-start-overlay online-countdown" role="status"><kbd className="analytics-key">{Math.max(0, Math.ceil((round.startAt - game.now) / 1000)) || 'go'}</kbd><p>Same passage. Same start.</p></div>}
                    {racing && !focused && <button className="online-focus-button" type="button" onClick={() => input.current?.focus()}><MousePointer2 size={16} />Click to keep racing</button>}
                </div><div className="online-panel-footer"><p id="multiplayer-typing-help">{timed ? 'Correct mistakes as you type. The timer ends the race.' : 'Correct mistakes before moving to the next word. First finisher ends the race.'}</p><span>{progress}% complete</span></div>
                </div></div>}
                {finished && rematchPlayers.length > 0 && <div className="multiplayer-rematch-notice" role="status"><RefreshCw size={14} /><span><strong>{rematchPlayers.length}</strong> {rematchPlayers.length === 1 ? 'player has' : 'players have'} opted to race again.{self?.rematch ? ' You’re in.' : ' Choose Race again to join.'}</span></div>}
                {finished && <div className="multiplayer-final-standings">
                    <RaceTrendChart key={round.id} round={round} trends={game.trends} collecting={game.now < round.collectionUntil! && round.players.some(p => !p.metrics)} />
                    <div className="multiplayer-standings-heading"><h3>Final standings</h3><span>{round.players.length} racers · {timed ? `${room.duration}s` : `${room.wordCount} words`}</span></div>
                    <div className="multiplayer-table-wrap"><table><caption className="sr-only">Final typing metrics</caption><thead><tr><th scope="col">Place</th><th scope="col">Player</th><th scope="col">WPM</th><th scope="col">Accuracy</th><th scope="col">Words</th></tr></thead><tbody>{sortedResults.map((p, index) => <tr key={p.id} data-you={p.id === game.snapshot?.selfId} data-winner={p.id === round.winnerId}><td><span className="multiplayer-result-rank" data-tone={p.id === round.winnerId ? 'warning' : 'neutral'}>{p.id === round.winnerId ? <Trophy size={15} aria-label="Winner" /> : p.metrics ? index + 1 : '—'}</span></td><th scope="row"><span className="multiplayer-result-player"><Avatar username={p.nickname} settings={p.avatar} /><span>{p.nickname}{p.id === game.snapshot?.selfId && <small>you</small>}{p.id === round.winnerId && <small data-tone="warning">winner</small>}</span></span></th><td className="multiplayer-result-wpm">{p.metrics?.wpm ?? '—'}</td><td><span data-tone={!p.metrics ? 'neutral' : p.metrics.accuracy >= 95 ? 'success' : p.metrics.accuracy >= 80 ? 'warning' : 'danger'}>{p.metrics ? `${p.metrics.accuracy}%` : game.now < round.collectionUntil! ? 'Collecting…' : 'Unavailable'}</span></td><td>{p.metrics ? timed ? p.metrics.completedWords : `${p.metrics.completedWords}/${room.wordCount}` : '—'}</td></tr>)}</tbody></table></div>
                    <div className="multiplayer-results-footer"><p><Users size={13} />Two players choosing a rematch start the next race.</p><details className="multiplayer-passage"><summary>View passage<span aria-hidden="true">+</span></summary><p>{round.text}</p></details></div>
                </div>}
            </section>}
            {finished && round && <RematchPrompt key={round.id} requestedBy={rematchPlayers.map(m => m.nickname)} optedIn={!!self?.rematch} active={game.status === 'connected' && game.now < Math.min(round.resultsUntil!, room.expiresAt)} canJoin={canRematch} onJoin={() => game.send({ type: 'rematch', roundId: round.id, value: true })} />}
            {!finished && <details className="online-track multiplayer-roster" open={!round}><summary><span><Users size={14} />Players in this room <small>{room.members.length}</small></span><span aria-hidden="true">+</span></summary><p className="multiplayer-roster-note">{room.phase === 'lobby' ? 'Press Ready to start when you’re set. You’ll all start together.' : 'Your speed updates live. Other players’ progress is estimated.'}</p>
                <ul className="multiplayer-members">{room.members.map(m => {
                    const you = m.id === game.snapshot?.selfId;
                    const score = you ? metrics : round?.players.find(p => p.id === m.id)?.metrics;
                    const standing = standings.find(p => p.id === m.id);
                    const playing = round?.players.some(p => p.id === m.id);
                    const memberTone = !m.connected ? 'danger' : m.rematch ? 'success' : room.phase === 'racing' && playing ? 'primary' : room.phase === 'lobby' && m.ready ? 'success' : 'neutral';
                    return <li key={m.id} data-you={you}><Avatar username={m.nickname} settings={m.avatar} /><div className="multiplayer-member-name"><span>{m.nickname}{you && <small> you</small>}</span>{standing?.completion != null && <div className="multiplayer-member-progress" aria-hidden="true"><span style={{ width: `${standing.completion}%` }} /></div>}</div><div className="multiplayer-member-score">{(score || standing?.wpm !== null && standing?.wpm !== undefined) && <strong>{score?.wpm ?? standing?.wpm}<small> WPM</small></strong>}{you && room.phase === 'lobby' ? <button className="multiplayer-ready-action multiplayer-roster-ready" type="button" data-tone="success" data-ready={m.ready} aria-pressed={m.ready} aria-describedby="multiplayer-ready-hint" disabled={game.status !== 'connected' || !m.connected} onClick={toggleReady}>{m.ready ? <CircleCheck size={14} /> : <Check size={14} />}{m.ready ? 'Ready · undo' : 'Ready to start'}</button> : <span className="multiplayer-status-pill" data-tone={memberTone}><span className="multiplayer-status-dot" />{!m.connected ? 'Reconnecting' : m.rematch ? 'Rematch ready' : room.phase === 'results' && playing ? 'Finished' : room.phase === 'racing' && playing ? game.run?.stopped && you ? 'Finishing' : 'Typing' : round && !playing ? 'Watching' : m.ready ? 'Ready' : 'Not ready'}</span>}</div></li>;
                })}</ul>
            </details>}

        </>}

        <nav className="multiplayer-practice-links" aria-label="More typing practice"><a href="/">Solo practice<ArrowRight size={13} /></a><a href="/ghost-race/">Race your shadow<ArrowRight size={13} /></a></nav>
    </div>;
}
