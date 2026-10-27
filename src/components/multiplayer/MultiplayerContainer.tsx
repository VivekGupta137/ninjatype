import { useEffect, useRef, useState } from 'react';
import { Button, Card, Chip, Description, InputGroup, Label, ListBox, Modal, Select, Switch, TextField, ToggleButton, ToggleButtonGroup, ProgressBar, Kbd } from '@heroui/react';
import { ArrowRight, Check, CircleCheck, Clock3, Copy, Flag, Gauge, LogOut, MousePointer2, ShieldCheck, Settings2, Shuffle, RefreshCw, Trophy, Users, Hash, Pencil, Zap } from 'lucide-react';
import RaceParagraph from './RaceParagraph';
import { RunningIcon } from '@/components/common/Navbar';
import { DEFAULT_AVATAR, avatarSettings, type AvatarSettings, DEFAULT_MAX_PLAYERS, DICTIONARIES, RACE_DURATIONS, WORD_COUNTS, nickname as validateNickname, roomName, type Entry, type RaceSettings, type DictionaryKey, MAX_SPECTATORS } from '@/lib/multiplayer/protocol';
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
import { useQuickRace } from './useQuickRace';

const remaining = (deadline: number, now: number) => {
    const seconds = Math.max(0, Math.ceil((deadline - now) / 1000));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};
export default function MultiplayerContainer() {
    const [networkEnabled, setNetworkEnabled] = useState(false);
    const network = useMultiplayer(networkEnabled);
    const quick = useQuickRace();
    const localQuick = quick.active;
    const game = localQuick ? { ...network, ...quick } : network;
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
    const [chatText, setChatText] = useState('');
    const chatTimes = useRef<number[]>([]);
    const chatFeed = useRef<HTMLOListElement>(null);
    const [token, setToken] = useState('');
    const [attempt, setAttempt] = useState(0);
    const [busy, setBusy] = useState(false);
    const [pendingEntry, setPendingEntry] = useState<Entry | null>(null);
    const [inviteEpoch, setInviteEpoch] = useState<string | undefined>();
    const [notice, setNotice] = useState('');
    const [entryOpen, setEntryOpen] = useState(false);
    const input = useRef<HTMLInputElement>(null);
    const [focused, setFocused] = useState(false);
    const room = game.snapshot?.room;
    const capacity = room?.maxPlayers ?? game.config?.maxPlayers ?? DEFAULT_MAX_PLAYERS;
    const round = room?.round;
    const self = room?.members.find(m => m.id === game.snapshot?.selfId);
    const isParticipant = (room?.phase === 'countdown' ? round?.candidates.includes(game.snapshot?.selfId ?? '') : round?.players.some(p => p.id === game.snapshot?.selfId)) ?? false;
    const racing = game.status === 'connected' && room?.phase === 'racing' && isParticipant && !game.run?.stopped && game.now < round!.deadline;
    const selfResult = round?.players.find(p => p.id === game.snapshot?.selfId);
    const metrics = isParticipant && round && game.run ? selfResult?.metrics ?? localMetrics(game.run, round.startAt, round.endedAt ?? Math.min(game.now, round.deadline)) : null;
    const progress = round && metrics ? Math.min(100, Math.round(metrics.correctChars / round.text.length * 100)) : 0;
    const standings = round ? raceStandings(round, game.standings, game.snapshot?.selfId, metrics, game.now) : [];
    const canRematch = isParticipant && !self?.spectator && room?.phase === 'results' && game.now < round!.resultsUntil! && game.now < room.expiresAt && (!!selfResult?.metrics || game.now >= round!.collectionUntil!);
    const finished = room?.phase === 'results';
    const timed = room?.mode === 'time';
    const decidingWinner = finished && timed && round?.winnerFinalized === false;
    const dictionaryLabel = DICTIONARIES.find(d => d.id === room?.dictionary)?.label ?? 'English 1k';
    const winner = round?.players.find(p => p.id === round.winnerId);
    const won = !!winner && winner.id === game.snapshot?.selfId;
    const rematchPlayers = room?.members.filter(m => m.connected && m.rematch) ?? [];
    const toggleReady = () => game.send({ type: 'ready', value: !self?.ready });
    const readyPlayers = room?.members.filter(m => m.connected && m.ready && !m.spectator).length ?? 0;
    const waitingForQuickMatch = !!room?.quickMatch && !room.quickMatchFilled;
    const isHost = !!self && room?.hostId === self.id;
    const playerCount = room?.members.filter(m => !m.spectator).length ?? 0;
    const spectatorCount = room?.members.filter(m => m.spectator).length ?? 0;
    const connectedPlayers = room?.members.filter(m => m.connected && !m.spectator).length ?? 0;
    const canStartNow = !!room && room.phase === 'lobby' && !waitingForQuickMatch && isHost && !!self?.ready && readyPlayers >= 2 && game.status === 'connected' && (room.allowSpectators !== false || readyPlayers === connectedPlayers);
    const countdownSeconds = room?.phase === 'countdown' && round ? Math.max(0, Math.ceil((round.startAt - game.now) / 1000)) : null;
    const accuracyTone = !metrics?.attempts ? 'neutral' : metrics.accuracy >= 95 ? 'success' : metrics.accuracy >= 90 ? 'primary' : metrics.accuracy >= 80 ? 'warning' : 'danger';
    const secondsLeft = round ? Math.max(0, Math.ceil((round.deadline - Math.max(game.now, round.startAt)) / 1000)) : 120;
    const timeTone = finished ? 'neutral' : secondsLeft <= 15 ? 'danger' : secondsLeft <= 30 ? 'warning' : 'neutral';

    useEffect(() => {
        const url = new URL(window.location.href);
        if (url.searchParams.has('room')) { setNetworkEnabled(true); setMode('create'); setEntryOpen(true); }
        generatedRoom.current = defaultRoomName();
        setName(url.searchParams.get('room') || game.reconnectEntry?.name || generatedRoom.current); setInviteEpoch(url.searchParams.get('epoch') || undefined);
        let savedName: string | null = null;
        try { savedName = localStorage.getItem('ninjatype-multiplayer-nickname'); } catch {}
        const saved = game.reconnectEntry;
        setUsername(saved?.nickname || (savedName && !/^Ninja-[a-f0-9]{6}$/i.test(savedName) ? savedName : defaultNickname()));
        let initialAvatar: AvatarSettings;
        try { initialAvatar = avatarSettings(saved?.avatar ?? JSON.parse(localStorage.getItem('ninjatype-multiplayer-avatar') || 'null')); } catch { initialAvatar = { ...DEFAULT_AVATAR }; }
        if (!initialAvatar.seed) initialAvatar = { ...initialAvatar, seed: crypto.randomUUID() };
        setAvatar(initialAvatar);
        try { localStorage.setItem('ninjatype-multiplayer-avatar', JSON.stringify(initialAvatar)); } catch {}
    }, []);
    useEffect(() => { if (racing) input.current?.focus({ preventScroll: true }); }, [racing]);
    useEffect(() => { if (network.reconnectEntry?.participantId) setNetworkEnabled(true); }, [network.reconnectEntry?.participantId]);
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
    const randomizeRoom = () => { generatedRoom.current = defaultRoomName(name); setName(generatedRoom.current); };
    const enter = async (reconnect = false, action: 'join' | 'create' = mode) => {
        if (!token || busy) return;
        let entry: Entry;
        try {
            entry = reconnect && game.reconnectEntry ? game.reconnectEntry : {
                name: roomName(name), nickname: validateNickname(username), avatar, browserId: game.browserId, ...(inviteEpoch ? { epoch: inviteEpoch } : {}),
            };
        } catch (e) { game.setError(e instanceof Error ? e.message : 'Check the room name and nickname.'); return; }
        const challenge = token; setToken('');
        const creating = !reconnect;
        setMode(action);
        try { localStorage.setItem('ninjatype-multiplayer-nickname', entry.nickname); } catch {}
        setBusy(true);
        try {
            if (creating) {
                const created = await game.create(entry.name, 30, challenge, {}, { enterExisting: true, ...(inviteEpoch ? { epoch: inviteEpoch } : {}) });
                setName(created.name); setInviteEpoch(created.epoch); setMode('join');
                setPendingEntry({ ...entry, name: created.name, epoch: created.epoch });
                setNotice('Room is ready. Joining you to the lobby…');
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
    const entryLocked = busy || game.status === 'connecting';
    useEffect(() => { if (game.status === 'connected') setEntryOpen(false); }, [game.status]);
    useEffect(() => {
        if (!room || room.phase !== 'lobby') return;
        setWordCount(room.wordCount); setRaceMode(room.mode); setDuration(room.duration); setDictionary(room.dictionary);
    }, [room?.epoch, room?.wordCount, room?.mode, room?.duration, room?.dictionary]);
    const quickRaceStart = () => quick.startQuick(validateNickname(username), avatar);
    const openEntry = (quick: boolean) => {
        try { validateNickname(username); if (!quick) roomName(name); }
        catch (e) { game.setError(e instanceof Error ? e.message : 'Check your nickname and room name.'); return; }
        if (quick) {
            try { localStorage.setItem('ninjatype-multiplayer-nickname', username); } catch {}
            network.leave(); setEntryOpen(false); setNotice('');
            quickRaceStart(); return;
        }
        setNetworkEnabled(true);
        setMode('create'); setEntryOpen(true); setNotice(''); game.setError('');
    };
    useEffect(() => {
        if (chatFeed.current) chatFeed.current.scrollTop = chatFeed.current.scrollHeight;
    }, [room?.chat?.length, room?.chat?.at(-1)?.id]);
    useEffect(() => {
        if (room?.phase !== 'lobby' || game.status !== 'connected') return;
        const shortcut = (event: KeyboardEvent) => {
            if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || (event.target instanceof Element && event.target.closest('input, textarea, button, select, [contenteditable], [role="switch"], [role="option"]'))) return;
            if (event.code === 'Space' && !self?.spectator) { event.preventDefault(); toggleReady(); }
            if (event.code === 'Enter') { event.preventDefault(); document.getElementById('lobby-chat-message')?.focus(); }
        };
        window.addEventListener('keydown', shortcut);
        return () => window.removeEventListener('keydown', shortcut);
    }, [room?.phase, game.status, self?.ready, self?.spectator]);
    const invitePath = room ? `/multiplayer-typing-race/?room=${encodeURIComponent(room.name)}&epoch=${encodeURIComponent(room.epoch)}` : '';
    const inviteURL = room && typeof window !== 'undefined' ? new URL(invitePath, window.location.origin).href : invitePath;
    const sendChat = () => {
        const now = Date.now();
        chatTimes.current = chatTimes.current.filter(at => now - at < 10_000);
        if (chatTimes.current.length >= 2) { game.setError('Send at most two messages every ten seconds.'); return; }
        if (!chatText.trim()) return;
        if (game.send({ type: 'chat', text: chatText.trim() })) { chatTimes.current.push(now); setChatText(''); }
    };
    const entryName = name;
    const entryEnabled = !!game.config?.enabled && !!token && !entryLocked && !!game.browserId && !!username.trim();
    const entryHelp = !game.config?.enabled ? 'Multiplayer is currently unavailable.' : !token ? 'Complete the security check to enter the room.' : 'Security check complete. Enter your room to continue.';
    return <div className="online-workspace multiplayer-workspace" data-in-room={!!room} data-entry-lobby={!room && !game.reconnectEntry?.participantId}>
        <header className="multiplayer-heading" data-in-room={!!room}>
            <div>{room ? <h1>{localQuick ? 'Quick typing race' : 'Multiplayer typing race'}<span className="multiplayer-title-dot">.</span></h1> : <div className="multiplayer-title-row"><RunningIcon size={32} aria-hidden="true" /><h1>Typing Race</h1><Chip color="success" variant="soft" className="multiplayer-title-badge"><Chip.Label>MULTIPLAYER</Chip.Label></Chip></div>}<p>{room ? 'A friendly race. The same words. A little motivation to get better.' : 'Start a quick match or create or join a room to race with friends.'}</p></div>
            {room ? <div className="multiplayer-active-step-header"><ol className="multiplayer-lobby-steps" aria-label="Race stages"><li><Check size={13} />{localQuick ? 'Choose race' : 'Enter room'}</li><li aria-current={!round ? 'step' : undefined}><span>2</span>Lobby</li><li aria-current={round ? 'step' : undefined}><span>3</span>Race together</li></ol><span className="multiplayer-active-format">{dictionaryLabel} · {timed ? `${room.duration}s` : `${room.wordCount} words`}{room.phase === 'lobby' && <> · Auto-start {room.autoStart ? 'on' : 'off'}</>}</span></div> : <a href="#how-to-race">How to play<ArrowRight size={14} /></a>}
        </header>
        {!localQuick && networkEnabled && (!game.config || !game.config.enabled) && <section className="multiplayer-message" data-tone="warning" role="status">
            <p>{!game.config ? 'Checking multiplayer availability…' : 'Friends rooms are under maintenance. Quick race and solo practice are available.'}</p><a href="/">Practice <ArrowRight size={14} /></a>
        </section>}
        {!!game.error && <div className="multiplayer-message" data-tone="danger" role="alert"><p>{game.error}</p><a href="/">Keep practicing</a></div>}
        {!!notice && <p className="multiplayer-notice" data-tone="success" role="status"><CircleCheck size={14} />{notice}</p>}

        <AvatarCustomizer open={avatarOpen} username={username} settings={avatar} onChange={updateAvatar} onClose={() => setAvatarOpen(false)} />
        {game.status === 'disconnected' && game.reconnectEntry?.participantId && <Card className="multiplayer-entry multiplayer-reconnect" aria-labelledby="multiplayer-reconnect-title">
            <Card.Header><Card.Title id="multiplayer-reconnect-title"><RefreshCw size={18} />Reconnect to your room</Card.Title>{game.reconnectUntil && <Chip size="sm" color={game.canReconnect ? 'warning' : 'danger'} variant="soft"><Chip.Label><Clock3 size={12} />{game.canReconnect ? remaining(game.reconnectUntil, game.now) : 'Expired'}</Chip.Label></Chip>}</Card.Header>
            <Card.Content><p className="multiplayer-reconnect-room"><Hash size={14} /><strong>{game.reconnectEntry.name}</strong></p><p>{game.canReconnect ? 'Your typing progress is saved. Complete a security check to return. The race clock keeps running.' : 'Your reconnect window ended. Join as a new player or leave the lobby.'}</p>
                {game.config?.enabled && game.canReconnect && <Turnstile siteKey={game.config.siteKey} action="room_entry" attempt={attempt} onToken={setToken} />}
            </Card.Content>
            <Card.Footer><div className="multiplayer-reconnect-actions"><Button variant="primary" className="online-primary-action" isDisabled={!entryEnabled || !game.canReconnect} onPress={() => void enter(true)}><RefreshCw size={14} />Reconnect</Button><Button variant="primary" className="online-primary-action" data-tone="danger" onPress={() => { game.leave(); setNotice(''); resetChallenge(); }}><LogOut size={14} />Leave lobby</Button></div><Button variant="ghost" onPress={() => { game.leave(); resetChallenge(); }}>Join as a new player<ArrowRight size={14} /></Button></Card.Footer>
        </Card>}
        {!room && !game.reconnectEntry?.participantId && <section className="multiplayer-entry-lobby" aria-label="Choose your typing race">
            <div className="multiplayer-lobby-intro">
                <ol className="multiplayer-lobby-steps" aria-label="How to start a race">
                    <li aria-current="step"><span>1</span>Choose a room</li><li><ArrowRight size={12} aria-hidden="true" /><span>2</span>Ready up</li><li><ArrowRight size={12} aria-hidden="true" /><span>3</span>Race together</li>
                </ol>
                <TextField className="multiplayer-lobby-identity" value={username} onChange={setUsername} isRequired isDisabled={entryLocked} maxLength={24}>
                    <Label>Your nickname</Label><InputGroup><InputGroup.Prefix><Avatar username={username} settings={avatar} /></InputGroup.Prefix><InputGroup.Input id="multiplayer-nickname" placeholder="Your nickname" autoComplete="off" /><InputGroup.Suffix><Button isIconOnly variant="ghost" aria-label="Customize your avatar" isDisabled={entryLocked} onPress={() => setAvatarOpen(true)}><Pencil size={15} /></Button></InputGroup.Suffix></InputGroup>
                </TextField>
            </div>
            <div className="multiplayer-lobby-cards">
                <Card className="multiplayer-lobby-card multiplayer-discovery" aria-labelledby="public-rooms-title">
                    <Card.Header className="multiplayer-lobby-card-heading"><span className="multiplayer-lobby-card-icon"><Zap size={22} /></span><div><span className="online-eyebrow">QUICK MATCH</span><Card.Title id="public-rooms-title">Start race</Card.Title></div><Chip size="sm" color="success" variant="soft"><Chip.Label>On your device</Chip.Label></Chip></Card.Header>
                    <Card.Description>Race against 2–4 simulated racers on your device. No room or security check needed.</Card.Description>
                    <Card.Content><dl className="multiplayer-lobby-match-details"><div><dt><Settings2 size={14} />Format</dt><dd>English 1k · 30 words</dd></div><div><dt><Users size={14} />Racers</dt><dd>You + 2–4 opponents</dd></div></dl></Card.Content>
                    <Card.Footer><Button className="online-primary-action" fullWidth isDisabled={entryLocked} onPress={() => openEntry(true)}>Start race<ArrowRight size={16} /></Button><p>Runs in your browser · no sign-up needed</p></Card.Footer>
                </Card>
                <Card className="multiplayer-lobby-card" aria-labelledby="create-room-title">
                    <Card.Header className="multiplayer-lobby-card-heading"><span className="multiplayer-lobby-card-icon"><Users size={22} /></span><div><span className="online-eyebrow">INVITE FRIENDS</span><Card.Title id="create-room-title">Race with friends</Card.Title></div><Chip size="sm" variant="secondary"><Chip.Label>Invite link</Chip.Label></Chip></Card.Header>
                    <Card.Description>Use the generated name to create a room, or enter an existing room name to join your friends.</Card.Description>
                    <Card.Content>
                        <form id="multiplayer-create-form" onSubmit={e => { e.preventDefault(); if (entryOpen) void enter(); else openEntry(false); }}>
                            <TextField value={name} onChange={value => { setName(value); setInviteEpoch(undefined); }} isRequired isDisabled={entryLocked} minLength={3} maxLength={48}>
                                <Label>Room name</Label><InputGroup><InputGroup.Prefix><Hash size={16} /></InputGroup.Prefix><InputGroup.Input id="multiplayer-room-name" pattern="[A-Za-z0-9_-]+" placeholder="Name your room" autoComplete="off" autoCapitalize="none" spellCheck={false} /><InputGroup.Suffix><Button isIconOnly size="sm" variant="ghost" aria-label="Generate a room name" isDisabled={entryLocked} onPress={() => { randomizeRoom(); setInviteEpoch(undefined); }}><Shuffle size={15} /></Button></InputGroup.Suffix></InputGroup><Description>Case-sensitive · letters, numbers, hyphens or underscores</Description>
                            </TextField>

                        </form>
                        <p className="multiplayer-lobby-invite-note"><Copy size={14} />Set the race mode and dictionary in the lobby.</p>
                    </Card.Content>
                    <Card.Footer><Button fullWidth isDisabled={entryLocked} onPress={() => openEntry(false)}>Race with friends<ArrowRight size={16} /></Button><p>Public room · up to {capacity} players · expires after 20 minutes</p></Card.Footer>
                </Card>
            </div>
            <Modal isOpen={entryOpen} onOpenChange={open => { if (!entryLocked) { setEntryOpen(open); if (!open) resetChallenge(); } }}>
                <Modal.Backdrop isDismissable={!entryLocked}><Modal.Container size="md" placement="center"><Modal.Dialog className="online-workspace multiplayer-workspace multiplayer-entry-dialog">
                    <Modal.CloseTrigger isDisabled={entryLocked} />
                    <Modal.Header><Modal.Heading>Race with friends</Modal.Heading></Modal.Header>
                    <Modal.Body>
                        <form id="multiplayer-entry-form" onSubmit={e => { e.preventDefault(); void enter(); }}>
                            <p className="multiplayer-entry-dialog-summary">Room: <strong>{entryName}</strong><br />Create or join this room. Configure race settings in the lobby.</p>
                        </form>
                                    <div className="multiplayer-lobby-security">
                {game.config?.enabled && <Turnstile siteKey={game.config.siteKey} action="room_entry" attempt={attempt} onToken={setToken} />}
                <p id="multiplayer-entry-help" role="status">{pendingEntry ? 'Complete the fresh check to join the room automatically.' : entryHelp}</p>
            </div>

                        {!!game.error && <p className="multiplayer-lobby-directory-note" role="alert">{game.error}</p>}
                    </Modal.Body>
                    <Modal.Footer><Button form="multiplayer-entry-form" type="submit" className="online-primary-action" fullWidth isDisabled={!entryEnabled || !entryName.trim()} aria-describedby="multiplayer-entry-help">{pendingEntry || game.status === 'connecting' ? 'Joining room…' : busy ? 'Creating room…' : 'Enter room'}<ArrowRight size={16} /></Button></Modal.Footer>
                </Modal.Dialog></Modal.Container></Modal.Backdrop>
            </Modal>
            <section className="multiplayer-lobby-guide" aria-labelledby="lobby-guide-title"><h2 id="lobby-guide-title" className="online-eyebrow">HOW TO START</h2><ol>
                <li><span>1</span><h3>Choose a race</h3><p>Race on your device, or create or join a room to race with friends.</p></li>
                <li><span>2</span><h3>Invite and ready up</h3><p>Share the invite link. At least two players must be ready to start.</p></li>
                <li><span>3</span><h3>Start typing</h3><p>Start the race, follow the countdown, then compare WPM and accuracy.</p></li>
            </ol></section>
        </section>}

        {room && <>
            <Card className="multiplayer-room-header" data-phase={room.phase} aria-label={localQuick ? 'Your race' : 'Your room'}>
                <div className="multiplayer-room-summary">
                    <div className="multiplayer-room-identity"><span className="multiplayer-room-icon">{localQuick ? <Zap size={24} /> : <Hash size={24} />}</span><div>
                        <div className="multiplayer-room-title-row"><h2>{room.name}</h2><Chip size="sm" color="success" variant="soft"><Chip.Label>{localQuick ? 'On this device' : room.quickMatch ? 'Quick match' : 'Friends room'}</Chip.Label></Chip></div>
                        <div className="multiplayer-room-meta"><span><Users size={13} />{playerCount}/{capacity} racers</span>{!localQuick && <span>{spectatorCount}/{MAX_SPECTATORS} spectators</span>}<span>{timed ? `${room.duration}s timed race` : `${room.wordCount} words`} · {dictionaryLabel}</span>{!localQuick && <span data-tone={room.expiresAt - game.now < 120_000 ? 'warning' : 'neutral'}><Clock3 size={13} />{remaining(room.expiresAt, game.now)} left</span>}</div>
                    </div></div>
                </div>
                <div className="multiplayer-actions">
                    {room.phase === 'lobby' && <ToggleButton className="online-primary-action multiplayer-auto-start" data-tone={room.autoStart ? 'success' : 'neutral'} isSelected={!!room.autoStart} isDisabled={!isHost || game.status !== 'connected' || room.phase !== 'lobby'} aria-label="Auto-start" onChange={value => game.send({ type: 'room_controls', autoStart: value })}><Clock3 size={14} />Auto-start<span aria-live="polite">{room.autoStart ? 'On' : 'Off'}</span></ToggleButton>}
                    {!localQuick && <Button variant="secondary" onPress={() => void copyInvite()}><Copy size={14} />Copy link</Button>}
                    {room.phase === 'lobby' && <Button variant="secondary" onPress={() => { if (localQuick) quickRaceStart(); else { game.leave(); resetChallenge(); } }}><Shuffle size={14} />{localQuick ? 'New race' : 'Switch room'}</Button>}
                    <Button variant="primary" className="online-primary-action" data-tone="danger" onPress={() => { game.leave(); resetChallenge(); }}><LogOut size={14} />Leave</Button>
                </div>
            </Card>
            {room.phase === 'lobby' && <div className="multiplayer-active-lobby" data-local-quick={localQuick}>
                <section className="multiplayer-active-players" aria-labelledby="active-lobby-players">
                    <Card className="multiplayer-active-waiting" role="status">
                        <Clock3 size={20} /><div><strong>{waitingForQuickMatch ? 'Getting racers ready…' : !self?.ready ? 'Ready when you are.' : readyPlayers >= 2 ? 'Your racers are ready.' : 'Waiting for another racer…'}</strong><p>{waitingForQuickMatch ? localQuick ? 'Your opponents are getting ready on this device.' : 'Racers are joining and getting ready.' : room.autoStart ? 'The 10-second countdown begins once everyone is ready.' : 'Auto-start is off. The host can start with two ready racers.'}</p></div>
                        <Chip size="sm" color="warning" variant="soft"><Chip.Label>{readyPlayers} / {playerCount} ready</Chip.Label></Chip>
                    </Card>
                    <div className="multiplayer-active-players-heading"><h2 id="active-lobby-players">Racers in the lobby <span>({playerCount} / {capacity})</span></h2><span>Host: <strong>{room.members.find(m => m.id === room.hostId)?.nickname ?? 'Reconnecting'}</strong></span></div>
                    <ul className="multiplayer-members">{room.members.map(m => <li key={m.id}>
                        <Card className="multiplayer-member-card" data-you={m.id === self?.id}>
                            <div className="multiplayer-member-avatar"><Avatar username={m.nickname} settings={m.avatar} />{m.id === room.hostId && <Chip size="sm" color="warning" variant="soft"><Chip.Label>Host</Chip.Label></Chip>}</div>
                            <div className="multiplayer-member-name"><span>{m.nickname}{m.id === self?.id && <Chip size="sm" variant="secondary"><Chip.Label>You</Chip.Label></Chip>}{m.spectator && <Chip size="sm" variant="secondary"><Chip.Label>Spectator</Chip.Label></Chip>}</span><small>{!m.connected ? 'Your seat is reserved for reconnecting.' : m.spectator ? 'Watching this room' : m.id === room.hostId ? localQuick ? 'Your racer · Ready when you are' : 'Room host · Invite friends to your race' : 'Same passage. Same start.'}</small></div>
                            {m.id === self?.id && !m.spectator ? <Button variant="primary" className="multiplayer-ready-action online-primary-action" data-tone="success" data-ready={!!m.ready} aria-pressed={!!m.ready} isDisabled={game.status !== 'connected'} onPress={toggleReady}>{m.ready ? <CircleCheck size={15} /> : <Check size={15} />}{m.ready ? 'Ready · undo' : 'Ready'}</Button> : <Chip size="sm" color={!m.connected ? 'danger' : m.ready ? 'success' : 'default'} variant="soft"><Chip.Label>{m.ready && <CircleCheck size={13} />}{!m.connected ? 'Reconnecting' : m.spectator ? 'Watching' : m.ready ? 'Ready' : 'Getting ready'}</Chip.Label></Chip>}
                        </Card>
                    </li>)}</ul>
                    {!localQuick && playerCount < capacity && <Card className="multiplayer-active-invite"><Users size={24} /><div><strong>Open racer slots · {capacity - playerCount}</strong><p>Share your room link to invite another racer.</p></div><Button variant="secondary" onPress={() => void copyInvite()}><Copy size={14} />Invite</Button></Card>}
                    <Card className="multiplayer-lobby-actions multiplayer-ready-bar"><div><p id="multiplayer-ready-hint" role="status">{self?.spectator ? 'You’re watching this room.' : !self?.ready ? 'Select Ready when you’re set.' : room.autoStart ? 'You’re ready. The race will start automatically.' : 'You’re ready. The host can start the race.'}</p><p className="multiplayer-active-shortcuts"><Kbd><Kbd.Content>Space</Kbd.Content></Kbd> toggle ready · {!localQuick && <><Kbd><Kbd.Content>Enter</Kbd.Content></Kbd> room chat</>}</p></div><Button variant="primary" className="online-primary-action" isDisabled={!canStartNow} onPress={() => game.send({ type: 'start' })}><Flag size={14} />Start race now</Button></Card>
                    <Card className="multiplayer-active-readiness" aria-label="Player readiness"><Card.Header><Card.Title>Lobby readiness</Card.Title><Chip size="sm" color="success" variant="soft"><Chip.Label>{readyPlayers} / {connectedPlayers} ready</Chip.Label></Chip></Card.Header><Card.Content><ul>{room.members.filter(m => !m.spectator).map(m => <li key={m.id}><strong>{m.nickname}</strong><small>{!m.connected ? 'Reconnecting' : m.ready ? 'Ready' : 'Getting ready'}</small><ProgressBar aria-label={`${m.nickname} readiness`} value={m.ready ? 100 : 0} color="success" size="sm"><ProgressBar.Track><ProgressBar.Fill /></ProgressBar.Track></ProgressBar></li>)}</ul></Card.Content></Card>
                </section>
                {!localQuick && <aside className="multiplayer-active-sidebar">
                    {!room.quickMatch && <Card className="multiplayer-active-rules" aria-labelledby="active-lobby-rules"><Card.Header><Card.Title id="active-lobby-rules"><Settings2 size={18} />Race settings</Card.Title><Chip size="sm" color="warning" variant="soft"><Chip.Label>{isHost ? 'Host controls' : 'Host settings'}</Chip.Label></Chip></Card.Header><Card.Content>
                        <form className="multiplayer-active-settings-form" onSubmit={e => { e.preventDefault(); game.send({ type: 'configure', wordCount, settings: { mode: raceMode, duration, dictionary }, sequence: room.sequence, autoStart: !!room.autoStart, allowSpectators: room.allowSpectators !== false }); }}>
                            <div className="multiplayer-active-setting"><Label>Race mode</Label><ToggleButtonGroup selectionMode="single" selectedKeys={new Set([raceMode])} onSelectionChange={keys => { const value = Array.from(keys)[0]; if (value === 'words' || value === 'time') setRaceMode(value); }} isDisabled={!!room.quickMatch || !isHost || game.status !== 'connected'} fullWidth><ToggleButton id="words">Words</ToggleButton><ToggleButton id="time">Timed</ToggleButton></ToggleButtonGroup></div>
                            <Select aria-label="Dictionary" value={dictionary} onChange={value => setDictionary(value as DictionaryKey)} isDisabled={!!room.quickMatch || !isHost || game.status !== 'connected'}><Label>Vocabulary set</Label><Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger><Select.Popover><ListBox>{DICTIONARIES.map(d => <ListBox.Item id={d.id} key={d.id} textValue={d.label}><Label>{d.label}</Label></ListBox.Item>)}</ListBox></Select.Popover></Select>
                            <div className="multiplayer-active-setting"><Label>{raceMode === 'time' ? 'Time limit' : 'Sprint target'}</Label><ToggleButtonGroup selectionMode="single" selectedKeys={new Set([String(raceMode === 'time' ? duration : wordCount)])} onSelectionChange={keys => { const value = Number(Array.from(keys)[0]); if (raceMode === 'time' && RACE_DURATIONS.includes(value as typeof RACE_DURATIONS[number])) setDuration(value); else if (raceMode === 'words' && WORD_COUNTS.includes(value as typeof WORD_COUNTS[number])) setWordCount(value); }} isDisabled={!!room.quickMatch || !isHost || game.status !== 'connected'} fullWidth>{(raceMode === 'time' ? RACE_DURATIONS : WORD_COUNTS).map(value => <ToggleButton id={String(value)} key={value}>{value}{raceMode === 'time' ? 's' : ' W'}</ToggleButton>)}</ToggleButtonGroup></div>
                            <Button type="submit" variant="secondary" fullWidth isDisabled={!isHost || game.status !== 'connected' || wordCount === room.wordCount && raceMode === room.mode && dictionary === room.dictionary && (raceMode === 'words' || duration === room.duration)}>Apply race settings</Button>
                        </form>
                        <div className="multiplayer-active-controls"><Switch isSelected={room.allowSpectators !== false} onChange={value => game.send({ type: 'room_controls', allowSpectators: value })} isDisabled={!isHost || game.status !== 'connected'}><Switch.Content><Label>Allow spectators</Label><Description>10 separate viewer seats</Description></Switch.Content><Switch.Control><Switch.Thumb /></Switch.Control></Switch><Switch isSelected={!!room.autoStart} onChange={value => game.send({ type: 'room_controls', autoStart: value })} isDisabled={!isHost || game.status !== 'connected'}><Switch.Content><Label>Auto-start on all ready</Label></Switch.Content><Switch.Control><Switch.Thumb /></Switch.Control></Switch></div>
                    </Card.Content></Card>}
                    <Card className="multiplayer-active-chat" aria-labelledby="lobby-chat-title"><Card.Header><Card.Title id="lobby-chat-title">Room chat</Card.Title><Chip size="sm" color="success" variant="soft"><Chip.Label>Live</Chip.Label></Chip></Card.Header><Card.Content>
                        <ol ref={chatFeed} role="log" aria-live="polite" aria-relevant="additions" className="multiplayer-chat-feed">{(room.chat ?? []).map(message => <li key={message.id}><time dateTime={new Date(message.sentAt).toISOString()}>{new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time><strong>{message.nickname}</strong><p>{message.text}</p></li>)}</ol>
                        {!room.chat?.length && <p className="multiplayer-active-rule-note">Say hello while everyone gets ready.</p>}
                        <form onSubmit={e => { e.preventDefault(); sendChat(); }}><TextField value={chatText} onChange={setChatText} maxLength={240} isDisabled={game.status !== 'connected'} aria-label="Room message"><InputGroup><InputGroup.Input id="lobby-chat-message" placeholder="Message your room…" autoComplete="off" /><InputGroup.Suffix><Button type="submit" isIconOnly aria-label="Send message" isDisabled={!chatText.trim() || game.status !== 'connected'}><ArrowRight size={16} /></Button></InputGroup.Suffix></InputGroup></TextField></form>
                    </Card.Content><Card.Footer><p className="multiplayer-chat-limit">2 messages per 10 seconds</p></Card.Footer></Card>
                    <Card className="multiplayer-active-room-link"><span>DIRECT ROOM LINK</span><div><code>{inviteURL}</code><Button isIconOnly variant="ghost" aria-label="Copy room invitation" onPress={() => void copyInvite()}><Copy size={16} /></Button></div></Card>
                </aside>}
            </div>}
            {round && <section className="online-race-panel multiplayer-arena" data-phase={room.phase} aria-label={finished ? "Typing race results" : "Multiplayer typing race"}>
                {finished ? <div className="multiplayer-finish-heading" data-tone={winner ? 'success' : 'warning'}>
                    <div className="multiplayer-finish-copy"><span className="multiplayer-outcome-icon">{winner ? <Trophy size={24} /> : <Clock3 size={24} />}</span><div><span className="multiplayer-status-pill" role="status" data-tone={winner ? 'success' : 'warning'}>{decidingWinner ? 'Race over · deciding winner' : 'Race over'}</span><h2 id="multiplayer-results-title">{decidingWinner ? 'Comparing final scores…' : won ? 'You won this round.' : winner ? `${winner.nickname} takes first.` : timed ? 'Time’s up.' : 'Every word counts.'}</h2><p>{won ? 'Nicely done. Keep the momentum going.' : winner ? 'A little competition. A little progress.' : timed ? 'The timer has ended. Final scores decide this round.' : 'No one finished before the time limit. Try another round.'}</p></div></div>
                    <div className="multiplayer-rematch"><button className="online-primary-action" type="button" disabled={!canRematch || game.status !== 'connected'} onClick={() => game.send({ type: 'rematch', roundId: round.id, value: !self?.rematch })}><RefreshCw size={14} />{self?.rematch ? 'Cancel rematch' : 'Race again'}</button><p>{game.now >= round.resultsUntil! ? 'Rematch window closed' : self?.rematch ? 'Waiting for another player' : !canRematch ? 'Collecting final scores…' : `Rematch · ${remaining(Math.min(round.resultsUntil!, room.expiresAt), game.now)} left`}</p></div>
                </div> : <div className="online-race-toolbar"><span className="multiplayer-status-pill" data-tone={game.status !== 'connected' ? 'danger' : room.phase === 'countdown' || game.run?.stopped ? 'warning' : 'primary'}><span className="multiplayer-status-dot" />{room.phase === 'countdown' ? `Starting in ${countdownSeconds ?? 0}…` : !isParticipant ? 'Spectating' : game.status !== 'connected' ? 'Reconnecting' : game.run?.stopped ? timed ? 'Passage complete · waiting for timer' : 'Confirming your finish' : 'Race in progress'}</span><span className="multiplayer-race-length">{timed ? `${room.duration}s` : `${room.wordCount} words`} · {dictionaryLabel}</span></div>}
                {finished ? <dl className="multiplayer-live-metrics" aria-label={room.phase === 'results' ? 'Your typing race results' : 'Your live typing metrics'}>
                    <div data-metric="wpm" data-tone="primary"><dt><Gauge size={14} />Your WPM</dt><dd>{metrics?.wpm ?? '—'}<span>words / min</span></dd></div>
                    <div data-metric="accuracy" data-tone={accuracyTone}><dt><ShieldCheck size={14} />Accuracy</dt><dd>{metrics ? `${metrics.accuracy}%` : '—'}<span>correct presses</span></dd></div>
                    <div data-metric="progress" data-tone={progress === 100 ? 'success' : 'primary'}><dt><Flag size={14} />Progress</dt><dd>{metrics?.completedWords ?? '—'}<span>{timed ? 'words typed' : `of ${room.wordCount} words`}</span></dd></div>
                    <div data-metric="time" data-tone={timeTone}><dt><Clock3 size={14} />{room.phase === 'results' ? 'Race time' : 'Time left'}</dt><dd>{room.phase === 'results' ? `${Math.max(0, Math.round((round.endedAt! - round.startAt) / 1000))}s` : remaining(round.deadline, Math.max(game.now, round.startAt))}<span>{room.phase === 'countdown' ? 'starts after countdown' : room.phase === 'results' ? 'round complete' : `${room.duration}s limit`}</span></dd></div>
                </dl> : room.phase !== 'countdown' ? <RaceLeaderboard players={standings} selfId={game.snapshot?.selfId} finished={false} track timed={timed} /> : null}
                {!isParticipant && <p className="multiplayer-spectator-note">You’re watching this round. Your live scores will appear when you join the next race.</p>}
                {!finished && <div className="multiplayer-race-layout"><div className="multiplayer-race-keyboard">
                <div className="online-you-progress" data-tone={progress === 100 ? 'success' : 'primary'} role="progressbar" aria-label="Your race progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-valuetext={`${progress}% of the passage typed correctly`}><span style={{ width: `${progress}%` }} /></div>
                <div className="online-writing-area"><div id="keyboard-container" data-kb-loaded={1}><div id="keyboard-wrapper">
                    {racing && <input ref={input} id="kb-hidden-input" type="text" value={game.run?.typedText ?? ''} onChange={e => game.type(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} aria-label="Multiplayer typing input" aria-describedby="multiplayer-typing-help" />}
                    <div id="keyboard" data-kb-focused={!racing || focused ? 1 : 0}><RaceParagraph text={round.text} typedText={game.run?.typedText ?? ''} active={racing} timed={timed} /></div>
                </div></div>
                    {room.phase === 'countdown' && <div className="online-start-overlay online-countdown multiplayer-passage-countdown" role="status" aria-label={`Race starts in ${countdownSeconds} seconds`}><Kbd className="analytics-key"><Kbd.Content>{countdownSeconds || 'go'}</Kbd.Content></Kbd><p>Get ready</p></div>}
                    {racing && !focused && <button className="online-focus-button" type="button" onClick={() => input.current?.focus()}><MousePointer2 size={16} />Click to keep racing</button>}
                </div><div className="online-panel-footer multiplayer-arena-footer"><dl aria-label="Your live typing metrics"><div data-tone={timeTone}><dt><Clock3 size={14} />Time left</dt><dd>{remaining(round.deadline, Math.max(game.now, round.startAt))}</dd></div><div data-tone="primary"><dt><Gauge size={14} />Your WPM</dt><dd>{metrics?.wpm ?? '—'}</dd></div><div><dt><Flag size={14} />{timed ? 'Words typed' : 'Progress'}</dt><dd>{metrics?.completedWords ?? '—'}{!timed && <small> / {room.wordCount}</small>}</dd></div><div data-tone={accuracyTone}><dt><ShieldCheck size={14} />Accuracy</dt><dd>{metrics ? `${metrics.accuracy}%` : '—'}</dd></div></dl><p id="multiplayer-typing-help">{timed ? 'Correct mistakes as you type. The timer ends the race.' : 'Correct mistakes before moving to the next word. First finisher ends the race.'}</p></div>
                </div></div>}
                {finished && rematchPlayers.length > 0 && <div className="multiplayer-rematch-notice" role="status"><RefreshCw size={14} /><span><strong>{rematchPlayers.length}</strong> {rematchPlayers.length === 1 ? 'player has' : 'players have'} opted to race again.{self?.rematch ? ' You’re in.' : ' Choose Race again to join.'}</span></div>}
                {finished && <div className="multiplayer-final-standings">
                    <RaceTrendChart key={round.id} round={round} trends={game.trends} collecting={game.now < round.collectionUntil! && round.players.some(p => !p.metrics)} />
                    <div className="multiplayer-standings-heading"><h3>Final standings</h3><span>{round.players.length} racers · {timed ? `${room.duration}s` : `${room.wordCount} words`}</span></div>
                    <div className="multiplayer-table-wrap"><table><caption className="sr-only">Final typing metrics</caption><thead><tr><th scope="col">Place</th><th scope="col">Player</th><th scope="col">WPM</th><th scope="col">Accuracy</th><th scope="col">Words</th></tr></thead><tbody>{sortedResults.map((p, index) => <tr key={p.id} data-you={p.id === game.snapshot?.selfId} data-winner={p.id === round.winnerId}><td><span className="multiplayer-result-rank" data-tone={p.id === round.winnerId ? 'warning' : 'neutral'}>{p.id === round.winnerId ? <Trophy size={15} aria-label="Winner" /> : p.metrics ? index + 1 : '—'}</span></td><th scope="row"><span className="multiplayer-result-player"><Avatar username={p.nickname} settings={p.avatar} /><span>{p.nickname}{p.id === game.snapshot?.selfId && <small>you</small>}{p.id === round.winnerId && <small data-tone="warning">winner</small>}</span></span></th><td className="multiplayer-result-wpm">{p.metrics?.wpm ?? '—'}</td><td><span data-tone={!p.metrics ? 'neutral' : p.metrics.accuracy >= 95 ? 'success' : p.metrics.accuracy >= 80 ? 'warning' : 'danger'}>{p.metrics ? `${p.metrics.accuracy}%` : game.now < round.collectionUntil! ? 'Collecting…' : 'Unavailable'}</span></td><td>{p.metrics ? timed ? p.metrics.completedWords : `${p.metrics.completedWords}/${room.wordCount}` : '—'}</td></tr>)}</tbody></table></div>
                    <div className="multiplayer-results-footer"><p><Users size={13} />{localQuick ? 'Choose Race again for another quick race.' : room.members.some(m => m.bot) ? 'Choose Race again to rematch with the bots.' : 'Two players choosing a rematch start the next race.'}</p><details className="multiplayer-passage"><summary>View passage<span aria-hidden="true">+</span></summary><p>{round.text}</p></details></div>
                </div>}
            </section>}
            {finished && round && <RematchPrompt key={round.id} requestedBy={rematchPlayers.map(m => m.nickname)} optedIn={!!self?.rematch} active={isParticipant && !self?.spectator && game.status === 'connected' && game.now < Math.min(round.resultsUntil!, room.expiresAt)} canJoin={canRematch} onJoin={() => game.send({ type: 'rematch', roundId: round.id, value: true })} />}
            {!finished && round && <details className="online-track multiplayer-roster" open={!round}><summary><span><Users size={14} />{localQuick ? 'Racers' : 'Players in this room'} <small>{room.members.length}</small></span><span aria-hidden="true">+</span></summary><p className="multiplayer-roster-note">{room.phase === 'lobby' ? 'Press Ready to start when you’re set. You’ll all start together.' : 'Your speed updates live. Other players’ progress is estimated.'}</p>
                <ul className="multiplayer-members">{room.members.map(m => {
                    const you = m.id === game.snapshot?.selfId;
                    const score = you ? metrics : round?.players.find(p => p.id === m.id)?.metrics;
                    const standing = standings.find(p => p.id === m.id);
                    const playing = round?.players.some(p => p.id === m.id);
                    const memberTone = !m.connected ? 'danger' : m.rematch ? 'success' : room.phase === 'racing' && playing ? 'primary' : room.phase === 'lobby' && m.ready ? 'success' : 'neutral';
                    return <li key={m.id} data-you={you}><Avatar username={m.nickname} settings={m.avatar} /><div className="multiplayer-member-name"><span>{m.nickname}{you && <small> you</small>}</span>{standing?.completion != null && <div className="multiplayer-member-progress" aria-hidden="true"><span style={{ width: `${standing.completion}%` }} /></div>}</div><div className="multiplayer-member-score">{(score || standing?.wpm !== null && standing?.wpm !== undefined) && <strong>{score?.wpm ?? standing?.wpm}<small> WPM</small></strong>}{you && room.phase === 'lobby' ? <Button variant="primary" className="multiplayer-ready-action multiplayer-roster-ready online-primary-action" data-tone="success" data-ready={m.ready} aria-pressed={m.ready} aria-describedby="multiplayer-ready-hint" isDisabled={game.status !== 'connected' || !m.connected} onPress={toggleReady}>{m.ready ? <CircleCheck size={14} /> : <Check size={14} />}{m.ready ? 'Ready · undo' : 'Ready to start'}</Button> : <span className="multiplayer-status-pill" data-tone={memberTone}><span className="multiplayer-status-dot" />{!m.connected ? 'Reconnecting' : m.rematch ? 'Rematch ready' : room.phase === 'results' && playing ? 'Finished' : room.phase === 'racing' && playing ? game.run?.stopped && you ? 'Finishing' : 'Typing' : round && !playing ? 'Watching' : m.ready ? 'Ready' : 'Not ready'}</span>}</div></li>;
                })}</ul>
            </details>}

        </>}

        <nav className="multiplayer-practice-links" aria-label="More typing practice"><a href="/">Solo practice<ArrowRight size={13} /></a><a href="/ghost-race/">Race your shadow<ArrowRight size={13} /></a></nav>
    </div>;
}
