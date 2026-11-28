import ShareResultButton from '@/components/share/ShareResultButton';
import KeyButton from '@/components/ui/KeyButton';
import TextLink from '@/components/ui/TextLink';
import { TEST_DURATIONS } from "@/constants/testDurations";
import { useEffect, useRef, useState } from 'react';
import { Card, Chip, Description, InputGroup, Label, ListBox, Modal, Select, Switch, TextField, ToggleButton, ToggleButtonGroup, ProgressBar, Kbd } from '@heroui/react';
import { ArrowRight, Check, CircleCheck, Clock3, Copy, Flag, Gauge, LogOut, MousePointer2, ShieldCheck, Settings2, Shuffle, RefreshCw, Trophy, Users, Hash, Pencil, Zap } from 'lucide-react';
import RaceParagraph from './RaceParagraph';
import { RunningIcon } from '@/components/common/Navbar';
import { DEFAULT_AVATAR, avatarSettings, type AvatarSettings, DEFAULT_MAX_PLAYERS, DICTIONARIES, RACE_DURATIONS, WORD_COUNTS, nickname as validateNickname, roomName, type Entry, type RaceSettings, type DictionaryKey, MAX_SPECTATORS } from '@/lib/multiplayer/protocol';
import { lobbyReadiness } from '@/lib/multiplayer/lobbyReadiness';
import { localMetrics } from '@/lib/multiplayer/localRun';
import { raceStandings } from '@/lib/multiplayer/standings';
import RaceLeaderboard from './RaceLeaderboard';
import RematchPrompt from './RematchPrompt';
import RaceTrendChart from './RaceTrendChart';
import Avatar from './Avatar';
import AvatarCustomizer from './AvatarCustomizer';
import { defaultNickname, defaultRoomName } from '@/lib/multiplayer/identity';
import { useStore } from '@nanostores/react';
import { $account, refreshAccount } from '@/store/account';
import { loadProfileAvatar } from '@/lib/profileAvatar';
import Turnstile from './Turnstile';
import { useMultiplayer } from './useMultiplayer';
import { useQuickRace } from './useQuickRace';
import { tr, practiceHrefFor, raceHrefFor, ghostHrefFor, type LearnLocale } from '@/lib/learnLocale';

const remaining = (deadline: number, now: number) => {
    const seconds = Math.max(0, Math.ceil((deadline - now) / 1000));
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};
export default function MultiplayerContainer({ locale = 'en' }: { locale?: LearnLocale }) {
    const T = (en: string, de: string) => tr(locale, en, de);
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
    const account = useStore($account);
    const profileUser = account.status === 'in' ? account.user : null;
    const nicknameEdited = useRef(false);
    const customAvatar = useRef(false);
    const [wordCount, setWordCount] = useState(30);
    const [raceMode, setRaceMode] = useState<RaceSettings['mode']>('words');
    const [duration, setDuration] = useState(60);
    const [dictionary, setDictionary] = useState<DictionaryKey>(locale === 'de' ? 'de-1k' : '1k');
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
    const isHost = !!self && room?.hostId === self.id;
    const playerCount = room?.members.filter(m => !m.spectator).length ?? 0;
    const spectatorCount = room?.members.filter(m => m.spectator).length ?? 0;
    const readiness = lobbyReadiness(room, game.snapshot?.selfId, game.status === 'connected', locale);
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
    // Signed-in racers start as their profile name and picture; both stay editable.
    useEffect(() => { if ($account.get().status === 'loading') void refreshAccount(); }, []);
    useEffect(() => {
        if (account.status === 'loading') return;
        if (!profileUser) { setAvatar(a => a.profile ? { ...a, profile: undefined } : a); return; }
        if (game.reconnectEntry?.participantId) return;
        let customName: string | null = null, avatarChosen = false;
        try { customName = localStorage.getItem('ninjatype-multiplayer-nickname-custom'); avatarChosen = localStorage.getItem('ninjatype-multiplayer-avatar-custom') === '1'; } catch {}
        if (!nicknameEdited.current) setUsername(customName || profileUser.name.normalize('NFC').trim().replace(/\s+/g, ' ').slice(0, 24) || defaultNickname());
        customAvatar.current = avatarChosen;
        if (!avatarChosen) applyProfilePicture(false);
    }, [account.status, profileUser?.id]);
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
    const updateAvatar = (next: AvatarSettings, custom = true) => {
        setAvatar(next);
        try { localStorage.setItem('ninjatype-multiplayer-avatar', JSON.stringify(next)); } catch {}
        if (custom) { customAvatar.current = true; try { localStorage.setItem('ninjatype-multiplayer-avatar-custom', '1'); } catch {} }
    };
    function applyProfilePicture(remember = true) {
        const user = $account.get(); if (user.status !== 'in') return;
        const choice = loadProfileAvatar(user.user.id);
        setAvatar(a => { const next = { ...a, profile: { style: choice.style, variant: choice.variant, seed: user.user.id } }; try { localStorage.setItem('ninjatype-multiplayer-avatar', JSON.stringify(next)); } catch {} return next; });
        if (remember) { customAvatar.current = false; try { localStorage.removeItem('ninjatype-multiplayer-avatar-custom'); } catch {} }
    }
    const rememberNickname = (value: string) => {
        try {
            if (!profileUser) localStorage.setItem('ninjatype-multiplayer-nickname', value);
            else if (value !== profileUser.name.normalize('NFC').trim().replace(/\s+/g, ' ').slice(0, 24)) localStorage.setItem('ninjatype-multiplayer-nickname-custom', value);
            else localStorage.removeItem('ninjatype-multiplayer-nickname-custom');
        } catch {}
    };
    const randomizeRoom = () => { generatedRoom.current = defaultRoomName(name); setName(generatedRoom.current); };
    const enter = async (reconnect = false, action: 'join' | 'create' = mode) => {
        if (!token || busy) return;
        let entry: Entry;
        try {
            entry = reconnect && game.reconnectEntry ? game.reconnectEntry : {
                name: roomName(name), nickname: validateNickname(username), avatar, browserId: game.browserId, ...(inviteEpoch ? { epoch: inviteEpoch } : {}),
            };
        } catch (e) { game.setError(e instanceof Error ? e.message : T('Check the room name and nickname.', 'Prüfe Raumname und Spitznamen.')); return; }
        const challenge = token; setToken('');
        const creating = !reconnect;
        setMode(action);
        rememberNickname(entry.nickname);
        setBusy(true);
        try {
            if (creating) {
                const created = await game.create(entry.name, 30, challenge, {}, { enterExisting: true, ...(inviteEpoch ? { epoch: inviteEpoch } : {}) });
                setName(created.name); setInviteEpoch(created.epoch); setMode('join');
                setPendingEntry({ ...entry, name: created.name, epoch: created.epoch });
                setNotice(T('Room is ready. Joining you to the lobby…', 'Der Raum ist bereit. Du wirst zur Lobby gebracht…'));
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
        const link = new URL(raceHrefFor(locale), window.location.origin);
        link.searchParams.set('room', room.name); link.searchParams.set('epoch', room.epoch);
        try { await navigator.clipboard.writeText(link.href); setNotice(T('Invite link copied.', 'Einladungslink kopiert.')); }
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
        catch (e) { game.setError(e instanceof Error ? e.message : T('Check your nickname and room name.', 'Prüfe Spitznamen und Raumnamen.')); return; }
        if (quick) {
            rememberNickname(username);
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
    const invitePath = room ? `${raceHrefFor(locale)}?room=${encodeURIComponent(room.name)}&epoch=${encodeURIComponent(room.epoch)}` : '';
    const inviteURL = room && typeof window !== 'undefined' ? new URL(invitePath, window.location.origin).href : invitePath;
    const sendChat = () => {
        const now = Date.now();
        chatTimes.current = chatTimes.current.filter(at => now - at < 10_000);
        if (chatTimes.current.length >= 2) { game.setError(T('Send at most two messages every ten seconds.', 'Sende höchstens zwei Nachrichten alle zehn Sekunden.')); return; }
        if (!chatText.trim()) return;
        if (game.send({ type: 'chat', text: chatText.trim() })) { chatTimes.current.push(now); setChatText(''); }
    };
    const entryName = name;
    const entryEnabled = !!game.config?.enabled && !!token && !entryLocked && !!game.browserId && !!username.trim();
    const entryHelp = !game.config?.enabled ? T('Multiplayer is currently unavailable.', 'Multiplayer ist derzeit nicht verfügbar.') : !token ? T('Complete the security check to enter the room.', 'Absolviere die Sicherheitsprüfung, um den Raum zu betreten.') : T('Security check complete. Enter your room to continue.', 'Sicherheitsprüfung abgeschlossen. Betritt deinen Raum, um fortzufahren.');
    return <div className="online-workspace multiplayer-workspace" data-in-room={!!room} data-entry-lobby={!room && !game.reconnectEntry?.participantId}>
        <header className="multiplayer-heading" data-in-room={!!room}>
            <div>{room ? <h1>{localQuick ? T('Quick typing race', 'Schnelles Tipp-Rennen') : T('Multiplayer typing race', 'Multiplayer-Tipp-Rennen')}<span className="multiplayer-title-dot">.</span></h1> : <div className="multiplayer-title-row"><RunningIcon size={32} aria-hidden="true" /><h1>{T('Typing Race', 'Tipp-Rennen')}</h1><Chip color="success" variant="soft" className="multiplayer-title-badge"><Chip.Label>MULTIPLAYER</Chip.Label></Chip></div>}<p>{room ? T('A friendly race. The same words. A little motivation to get better.', 'Ein freundliches Rennen. Dieselben Wörter. Ein wenig Motivation, besser zu werden.') : T('Start a quick match or create or join a room to race with friends.', 'Starte ein Schnellspiel oder erstelle/joine einen Raum, um mit Freunden zu tippen.')}</p></div>
            {room ? <div className="multiplayer-active-step-header"><ol className="multiplayer-lobby-steps" aria-label={T('Race stages', 'Renn-Phasen')}><li><Check size={13} />{localQuick ? T('Choose race', 'Rennen wählen') : T('Enter room', 'Raum betreten')}</li><li aria-current={!round ? 'step' : undefined}><span>2</span>{T('Lobby', 'Lobby')}</li><li aria-current={round ? 'step' : undefined}><span>3</span>{T('Race together', 'Gemeinsam tippen')}</li></ol><span className="multiplayer-active-format">{dictionaryLabel} · {timed ? `${room.duration}s` : `${room.wordCount} ${T('words', 'Wörter')}`}{room.phase === 'lobby' && <> · {T('Auto-start', 'Autostart')} {room.autoStart ? T('on', 'an') : T('off', 'aus')}</>}</span></div> : <TextLink variant="muted" size="sm" href="#how-to-race">{T('How to play →', 'So wird gespielt →')}</TextLink>}
        </header>
        {!localQuick && networkEnabled && (!game.config || !game.config.enabled) && <section className="multiplayer-message" data-tone="warning" role="status">
            <p>{!game.config ? T('Checking multiplayer availability…', 'Prüfe die Multiplayer-Verfügbarkeit…') : T('Friends rooms are under maintenance. Quick race and solo practice are available.', 'Freundesräume werden gewartet. Schnellrennen und Solo-Übung sind verfügbar.')}</p><TextLink variant="muted" size="sm" href={practiceHrefFor(locale)}>{T('Practice →', 'Üben →')}</TextLink>
        </section>}
        {!!game.error && <div className="multiplayer-message" data-tone="danger" role="alert"><p>{game.error}</p><TextLink variant="muted" size="sm" href={practiceHrefFor(locale)}>{T('Keep practicing →', 'Weiter üben →')}</TextLink></div>}
        {!!notice && <p className="multiplayer-notice" data-tone="success" role="status"><CircleCheck size={14} />{notice}</p>}

        <AvatarCustomizer open={avatarOpen} username={username} settings={avatar} onChange={next => updateAvatar(next)} onUseProfile={profileUser ? () => applyProfilePicture() : undefined} onClose={() => setAvatarOpen(false)} locale={locale} />
        {game.status === 'disconnected' && game.reconnectEntry?.participantId && <Card className="multiplayer-entry multiplayer-reconnect" aria-labelledby="multiplayer-reconnect-title">
            <Card.Header><Card.Title id="multiplayer-reconnect-title"><RefreshCw size={18} />{T('Reconnect to your room', 'Mit deinem Raum verbinden')}</Card.Title>{game.reconnectUntil && <Chip size="sm" color={game.canReconnect ? 'warning' : 'danger'} variant="soft"><Chip.Label><Clock3 size={12} />{game.canReconnect ? remaining(game.reconnectUntil, game.now) : T('Expired', 'Abgelaufen')}</Chip.Label></Chip>}</Card.Header>
            <Card.Content><p className="multiplayer-reconnect-room"><Hash size={14} /><strong>{game.reconnectEntry.name}</strong></p><p>{game.canReconnect ? T('Your typing progress is saved. Complete a security check to return. The race clock keeps running.', 'Dein Tipp-Fortschritt ist gespeichert. Absolviere eine Sicherheitsprüfung für die Rückkehr. Die Rennuhr läuft weiter.') : T('Your reconnect window ended. Join as a new player or leave the lobby.', 'Dein Rückkehrfenster ist abgelaufen. Tritt als neuer Spieler bei oder verlasse die Lobby.')}</p>
                {game.config?.enabled && game.canReconnect && <Turnstile siteKey={game.config.siteKey} action="room_entry" attempt={attempt} onToken={setToken} locale={locale} />}
            </Card.Content>
            <Card.Footer><div className="multiplayer-reconnect-actions"><KeyButton variant="primary" isDisabled={!entryEnabled || !game.canReconnect} onPress={() => void enter(true)}><RefreshCw size={14} />{T('Reconnect', 'Verbinden')}</KeyButton><KeyButton variant="danger" onPress={() => { game.leave(); setNotice(''); resetChallenge(); }}><LogOut size={14} />{T('Leave lobby', 'Lobby verlassen')}</KeyButton></div><KeyButton variant="ghost" onPress={() => { game.leave(); resetChallenge(); }}>{T('Join as a new player', 'Als neuer Spieler beitreten')}<ArrowRight size={14} /></KeyButton></Card.Footer>
        </Card>}
        {!room && !game.reconnectEntry?.participantId && <section className="multiplayer-entry-lobby" aria-label={T("Choose your typing race", "Wähle dein Tipp-Rennen")}>
            <div className="multiplayer-lobby-intro">
                <ol className="multiplayer-lobby-steps" aria-label={T("How to start a race", "So startest du ein Rennen")}>
                    <li aria-current="step"><span>1</span>{T("Choose a room", "Raum wählen")}</li><li><ArrowRight size={12} aria-hidden="true" /><span>2</span>{T("Ready up", "Bereit machen")}</li><li><ArrowRight size={12} aria-hidden="true" /><span>3</span>{T("Race together", "Gemeinsam tippen")}</li>
                </ol>
                <TextField className="multiplayer-lobby-identity" value={username} onChange={value => { nicknameEdited.current = true; setUsername(value); }} isRequired isDisabled={entryLocked} maxLength={24}>
                    <Label>{T("Your nickname", "Dein Spitzname")}</Label><InputGroup><InputGroup.Prefix><Avatar username={username} settings={avatar} /></InputGroup.Prefix><InputGroup.Input id="multiplayer-nickname" placeholder={T("Your nickname", "Dein Spitzname")} autoComplete="off" /><InputGroup.Suffix><KeyButton isIconOnly variant="ghost" aria-label={T("Customize your avatar", "Avatar anpassen")} isDisabled={entryLocked} onPress={() => setAvatarOpen(true)}><Pencil size={15} /></KeyButton></InputGroup.Suffix></InputGroup>
                </TextField>
            </div>
            <div className="multiplayer-lobby-cards">
                <Card className="multiplayer-lobby-card multiplayer-discovery" aria-labelledby="public-rooms-title">
                    <Card.Header className="multiplayer-lobby-card-heading"><span className="multiplayer-lobby-card-icon"><Zap size={22} /></span><div><span className="online-eyebrow">{T("QUICK MATCH", "SCHNELLRENNEN")}</span><Card.Title id="public-rooms-title">{T("Start race", "Rennen starten")}</Card.Title></div></Card.Header>
                    <Card.Description>{T('Jump into a quick typing race. No room or security check needed.', 'Spring direkt in ein schnelles Tipp-Rennen. Ohne Raum und Sicherheitsprüfung.')}</Card.Description>
                    <Card.Content><dl className="multiplayer-lobby-match-details"><div><dt><Settings2 size={14} />{T('Format', 'Format')}</dt><dd>English 1k · {T('30 words', '30 Wörter')}</dd></div><div><dt><Users size={14} />{T('Racers', 'Rennfahrer')}</dt><dd>{T('You + 2–4 opponents', 'Du + 2–4 Gegner')}</dd></div></dl></Card.Content>
                    <Card.Footer><KeyButton variant="primary" isActive fullWidth isDisabled={entryLocked} onPress={() => openEntry(true)}>{T('Start race', 'Rennen starten')}<ArrowRight size={16} /></KeyButton><p>{T('Runs in your browser · no sign-up needed', 'Läuft im Browser · ohne Anmeldung')}</p></Card.Footer>
                </Card>
                <Card className="multiplayer-lobby-card" aria-labelledby="create-room-title">
                    <Card.Header className="multiplayer-lobby-card-heading"><span className="multiplayer-lobby-card-icon"><Users size={22} /></span><div><span className="online-eyebrow">{T("INVITE FRIENDS", "FREUNDE EINLADEN")}</span><Card.Title id="create-room-title">{T("Race with friends", "Mit Freunden tippen")}</Card.Title></div><Chip size="sm" variant="secondary"><Chip.Label>{T('Invite link', 'Einladungslink')}</Chip.Label></Chip></Card.Header>
                    <Card.Description>{T('Use the generated name to create a room, or enter an existing room name to join your friends.', 'Nutze den generierten Namen, um einen Raum zu erstellen, oder gib einen bestehenden Raumnamen ein.')}</Card.Description>
                    <Card.Content>
                        <form id="multiplayer-create-form" onSubmit={e => { e.preventDefault(); if (entryOpen) void enter(); else openEntry(false); }}>
                            <TextField value={name} onChange={value => { setName(value); setInviteEpoch(undefined); }} isRequired isDisabled={entryLocked} minLength={3} maxLength={48}>
                                <Label>{T('Room name', 'Raumname')}</Label><InputGroup><InputGroup.Prefix><Hash size={16} /></InputGroup.Prefix><InputGroup.Input id="multiplayer-room-name" pattern={'[A-Za-z0-9_\\-]+'} placeholder={T("Name your room", "Benenne deinen Raum")} autoComplete="off" autoCapitalize="none" spellCheck={false} /><InputGroup.Suffix><KeyButton isIconOnly size="sm" variant="ghost" aria-label={T("Generate a room name", "Raumnamen generieren")} isDisabled={entryLocked} onPress={() => { randomizeRoom(); setInviteEpoch(undefined); }}><Shuffle size={15} /></KeyButton></InputGroup.Suffix></InputGroup><Description>{T('Case-sensitive · letters, numbers, hyphens or underscores', 'Groß-/Kleinschreibung · Buchstaben, Zahlen, Bindestriche')}</Description>
                            </TextField>

                        </form>
                        <p className="multiplayer-lobby-invite-note"><Copy size={14} />{T('Set the race mode and dictionary in the lobby.', 'Stelle Modus und Wörterbuch in der Lobby ein.')}</p>
                    </Card.Content>
                    <Card.Footer><KeyButton fullWidth isDisabled={entryLocked} onPress={() => openEntry(false)}>{T('Race with friends', 'Mit Freunden tippen')}<ArrowRight size={16} /></KeyButton><p>{T('Public room · up to', 'Öffentlicher Raum · bis zu')} {capacity} {T('players · expires after 20 minutes', 'Spieler · läuft nach 20 Minuten ab')}</p></Card.Footer>
                </Card>
            </div>
            <Modal isOpen={entryOpen} onOpenChange={open => { if (!entryLocked) { setEntryOpen(open); if (!open) resetChallenge(); } }}>
                <Modal.Backdrop isDismissable={!entryLocked}><Modal.Container size="md" placement="center"><Modal.Dialog className="online-workspace multiplayer-workspace multiplayer-entry-dialog">
                    <Modal.CloseTrigger isDisabled={entryLocked} />
                    <Modal.Header><Modal.Heading>{T('Race with friends', 'Mit Freunden tippen')}</Modal.Heading></Modal.Header>
                    <Modal.Body>
                        <form id="multiplayer-entry-form" onSubmit={e => { e.preventDefault(); void enter(); }}>
                            <p className="multiplayer-entry-dialog-summary">{T('Room:', 'Raum:')} <strong>{entryName}</strong><br />{T('Create or join this room. Configure race settings in the lobby.', 'Erstelle oder betrete diesen Raum. Die Renneinstellungen änderst du in der Lobby.')}</p>
                        </form>
                                    <div className="multiplayer-lobby-security">
                {game.config?.enabled && <Turnstile siteKey={game.config.siteKey} action="room_entry" attempt={attempt} onToken={setToken} locale={locale} />}
                <p id="multiplayer-entry-help" role="status">{pendingEntry ? T('Complete the fresh check to join the room automatically.', 'Absolviere die neue Prüfung, um automatisch beizutreten.') : entryHelp}</p>
            </div>

                        {!!game.error && <p className="multiplayer-lobby-directory-note" role="alert">{game.error}</p>}
                    </Modal.Body>
                    <Modal.Footer><KeyButton form="multiplayer-entry-form" type="submit" variant="primary" fullWidth isDisabled={!entryEnabled || !entryName.trim()} aria-describedby="multiplayer-entry-help">{pendingEntry || game.status === 'connecting' ? T('Joining room…', 'Raum wird betreten…') : busy ? T('Creating room…', 'Raum wird erstellt…') : T('Enter room', 'Raum betreten')}<ArrowRight size={16} /></KeyButton></Modal.Footer>
                </Modal.Dialog></Modal.Container></Modal.Backdrop>
            </Modal>
            <section className="multiplayer-lobby-guide" aria-labelledby="lobby-guide-title"><h2 id="lobby-guide-title" className="online-eyebrow">{T("HOW TO START", "SO STARTEST DU")}</h2><ol>
                <li><span>1</span><h3>{T('Choose a race', 'Rennen wählen')}</h3><p>{T('Start a quick race, or create or join a room to race with friends.', 'Starte ein Schnellrennen oder erstelle/joine einen Raum für ein Rennen mit Freunden.')}</p></li>
                <li><span>2</span><h3>{T('Invite and ready up', 'Einladen und bereit machen')}</h3><p>{T('Share the invite link. At least two players must be ready to start.', 'Teile den Einladungslink. Zum Start müssen mindestens zwei bereit sein.')}</p></li>
                <li><span>3</span><h3>{T('Start typing', 'Loslegen')}</h3><p>{T('Start the race, follow the countdown, then compare WPM and accuracy.', 'Starte das Rennen, folge dem Countdown und vergleiche WPM und Genauigkeit.')}</p></li>
            </ol></section>
        </section>}

        {room && <>
            <Card className="multiplayer-room-header" data-phase={room.phase} aria-label={localQuick ? T('Your race', 'Dein Rennen') : T('Your room', 'Dein Raum')}>
                <div className="multiplayer-room-summary">
                    <div className="multiplayer-room-identity"><span className="multiplayer-room-icon">{localQuick ? <Zap size={24} /> : <Hash size={24} />}</span><div>
                        <div className="multiplayer-room-title-row"><h2>{room.name}</h2>{!localQuick && <Chip size="sm" color="success" variant="soft"><Chip.Label>{room.quickMatch ? T('Quick match', 'Schnellrennen') : T('Friends room', 'Freundesraum')}</Chip.Label></Chip>}</div>
                        <div className="multiplayer-room-meta"><span><Users size={13} />{playerCount}/{capacity} {T('racers', 'Rennfahrer')}</span>{!localQuick && <span>{spectatorCount}/{MAX_SPECTATORS} {T('spectators', 'Zuschauer')}</span>}<span>{timed ? `${room.duration}s ${T('timed race', 'Zeitrennen')}` : `${room.wordCount} ${T('words', 'Wörter')}`} · {dictionaryLabel}</span>{!localQuick && <span data-tone={room.expiresAt - game.now < 120_000 ? 'warning' : 'neutral'}><Clock3 size={13} />{remaining(room.expiresAt, game.now)} {T('left', 'übrig')}</span>}</div>
                    </div></div>
                </div>
                <div className="multiplayer-actions">
                    {room.phase === 'lobby' && <ToggleButton className="key-btn key-btn--ghost multiplayer-auto-start" data-tone={room.autoStart ? 'success' : 'neutral'} isSelected={!!room.autoStart} isDisabled={!isHost || game.status !== 'connected' || room.phase !== 'lobby'} aria-label={T("Auto-start", "Autostart")} onChange={value => game.send({ type: 'room_controls', autoStart: value })}><Clock3 size={14} />{T("Auto-start", "Autostart")}<span aria-live="polite">{room.autoStart ? T('On', 'An') : T('Off', 'Aus')}</span></ToggleButton>}
                    {!localQuick && <KeyButton variant="secondary" onPress={() => void copyInvite()}><Copy size={14} />{T('Copy link', 'Link kopieren')}</KeyButton>}
                    {room.phase === 'lobby' && <KeyButton variant="secondary" onPress={() => { if (localQuick) quickRaceStart(); else { game.leave(); resetChallenge(); } }}><Shuffle size={14} />{localQuick ? T('New race', 'Neues Rennen') : T('Switch room', 'Raum wechseln')}</KeyButton>}
                    <KeyButton variant="danger" onPress={() => { game.leave(); resetChallenge(); }}><LogOut size={14} />{T('Leave', 'Verlassen')}</KeyButton>
                </div>
            </Card>
            {room.phase === 'lobby' && <div className="multiplayer-active-lobby" data-local-quick={localQuick}>
                <section className="multiplayer-active-players" aria-labelledby="active-lobby-players">
                    <Card className="multiplayer-active-waiting" role="status">
                        <Clock3 size={20} /><div><strong>{readiness.title}</strong><p>{readiness.hint}</p></div>
                        <Chip size="sm" color={readiness.allReady ? "success" : "warning"} variant="soft"><Chip.Label>{readyPlayers} / {playerCount} {T('ready', 'bereit')}</Chip.Label></Chip>
                    </Card>
                    <div className="multiplayer-active-players-heading"><h2 id="active-lobby-players">{T('Racers in the lobby', 'Rennfahrer in der Lobby')} <span>({playerCount} / {capacity})</span></h2><span>{T('Host:', 'Host:')} <strong>{room.members.find(m => m.id === room.hostId)?.nickname ?? T('Reconnecting', 'Verbinde neu')}</strong></span></div>
                    <ul className="multiplayer-members">{room.members.map(m => <li key={m.id}>
                        <Card className="multiplayer-member-card" data-you={m.id === self?.id}>
                            <div className="multiplayer-member-avatar"><Avatar username={m.nickname} settings={m.avatar} />{m.id === room.hostId && <Chip size="sm" color="warning" variant="soft"><Chip.Label>{T('Host', 'Host')}</Chip.Label></Chip>}</div>
                            <div className="multiplayer-member-name"><span>{m.nickname}{m.id === self?.id && <Chip size="sm" variant="secondary"><Chip.Label>{T('You', 'Du')}</Chip.Label></Chip>}{m.spectator && <Chip size="sm" variant="secondary"><Chip.Label>{T('Spectator', 'Zuschauer')}</Chip.Label></Chip>}</span><small>{!m.connected ? T('Your seat is reserved for reconnecting.', 'Dein Platz bleibt für die Rückkehr reserviert.') : m.spectator ? T('Watching this room', 'Schaut diesem Raum zu') : m.id === room.hostId ? localQuick ? T('Your racer · Ready when you are', 'Dein Rennfahrer · bereit, wenn du es bist') : T('Room host · Invite friends to your race', 'Raum-Host · lade Freunde ein') : T('Same passage. Same start.', 'Gleicher Text. Gleicher Start.')}</small></div>
                            {m.id === self?.id && !m.spectator ? <KeyButton variant="primary" className="multiplayer-ready-action" data-tone={m.ready ? "success" : "warning"} data-ready={!!m.ready} aria-pressed={!!m.ready} aria-label={m.ready ? T("Ready. Undo ready status", "Bereit. Bereit-Status zurücknehmen") : T("Waiting. Mark yourself ready", "Wartend. Markiere dich als bereit")} isDisabled={game.status !== 'connected' || !m.connected} onPress={toggleReady}>{m.ready ? <CircleCheck size={15} /> : <Clock3 size={15} />}{m.ready ? T('Ready · undo', 'Bereit · zurück') : T('Waiting · ready up', 'Warten · bereit')}</KeyButton> : <Chip size="sm" color={!m.connected ? 'danger' : m.ready ? 'success' : 'default'} variant="soft"><Chip.Label>{m.connected && !m.spectator && (m.ready ? <CircleCheck size={13} /> : <Clock3 size={13} />)}{!m.connected ? T('Reconnecting', 'Verbinde neu') : m.spectator ? T('Watching', 'Schaut zu') : m.ready ? T('Ready', 'Bereit') : T('Waiting', 'Warten')}</Chip.Label></Chip>}
                        </Card>
                    </li>)}</ul>
                    {!localQuick && playerCount < capacity && <Card className="multiplayer-active-invite"><Users size={24} /><div><strong>{T('Open racer slots', 'Freie Rennplätze')} · {capacity - playerCount}</strong><p>{T('Share your room link to invite another racer.', 'Teile den Raum-Link, um weitere Rennfahrer einzuladen.')}</p></div><KeyButton variant="secondary" onPress={() => void copyInvite()}><Copy size={14} />{T('Invite', 'Einladen')}</KeyButton></Card>}
                    <Card className="multiplayer-lobby-actions multiplayer-ready-bar">
                        <div><p id="multiplayer-ready-hint" role="status">{readiness.hint}</p>{!self?.spectator && <p className="multiplayer-active-shortcuts"><Kbd><Kbd.Content>Space</Kbd.Content></Kbd> {T('toggle ready', 'Bereit umschalten')}{!localQuick && <> · <Kbd><Kbd.Content>Enter</Kbd.Content></Kbd> {T('room chat', 'Raum-Chat')}</>}</p>}</div>
                        {readiness.action === 'ready' ? <KeyButton variant="primary" aria-describedby="multiplayer-ready-hint" onPress={() => game.send({ type: 'ready', value: true })}><Check size={15} />{readiness.label}</KeyButton>
                            : readiness.action === 'start' ? <KeyButton variant="primary" aria-describedby="multiplayer-ready-hint" onPress={() => game.send({ type: 'start' })}><Flag size={14} />{readiness.label}</KeyButton>
                                : <Chip className="multiplayer-lobby-wait-status" size="sm" variant="soft" color="default"><Clock3 size={14} aria-hidden="true" /><Chip.Label>{readiness.label}</Chip.Label></Chip>}
                    </Card>
                    <Card className="multiplayer-active-readiness" aria-label={T("Player readiness", "Bereitschaft der Spieler")}><Card.Header><Card.Title>{T("Lobby readiness", "Lobby-Bereitschaft")}</Card.Title><Chip size="sm" color={readiness.allReady ? "success" : "warning"} variant="soft"><Chip.Label>{readyPlayers} / {playerCount} {T('ready', 'bereit')}</Chip.Label></Chip></Card.Header><Card.Content><ul>{room.members.filter(m => !m.spectator).map(m => <li key={m.id}><strong>{m.nickname}</strong><small>{!m.connected ? T('Reconnecting', 'Verbinde neu') : m.ready ? T('Ready', 'Bereit') : T('Waiting', 'Warten')}</small><ProgressBar aria-label={`${m.nickname} ${T('readiness', 'Bereitschaft')}`} value={m.connected && m.ready ? 100 : 0} color="success" size="sm"><ProgressBar.Track><ProgressBar.Fill /></ProgressBar.Track></ProgressBar></li>)}</ul></Card.Content></Card>
                </section>
                {!localQuick && <aside className="multiplayer-active-sidebar">
                    {!room.quickMatch && <Card className="multiplayer-active-rules" aria-labelledby="active-lobby-rules"><Card.Header><Card.Title id="active-lobby-rules"><Settings2 size={18} />{T('Race settings', 'Renn-Einstellungen')}</Card.Title><Chip size="sm" color="warning" variant="soft"><Chip.Label>{isHost ? T('Host controls', 'Host-Steuerung') : T('Host settings', 'Host-Einstellungen')}</Chip.Label></Chip></Card.Header><Card.Content>
                        <form className="multiplayer-active-settings-form" onSubmit={e => { e.preventDefault(); game.send({ type: 'configure', wordCount, settings: { mode: raceMode, duration, dictionary }, sequence: room.sequence, autoStart: !!room.autoStart, allowSpectators: room.allowSpectators !== false }); }}>
                            <div className="multiplayer-active-setting"><Label>{T('Race mode', 'Renn-Modus')}</Label><ToggleButtonGroup className="key-group" selectionMode="single" selectedKeys={new Set([raceMode])} onSelectionChange={keys => { const value = Array.from(keys)[0]; if (value === 'words' || value === 'time') setRaceMode(value); }} isDisabled={!!room.quickMatch || !isHost || game.status !== 'connected'} fullWidth><ToggleButton id="words" className="key-btn key-btn--ghost">{T('Words', 'Wörter')}</ToggleButton><ToggleButton id="time" className="key-btn key-btn--ghost">{T('Timed', 'Zeit')}</ToggleButton></ToggleButtonGroup></div>
                            <Select aria-label={T('Dictionary', 'Wörterbuch')} value={dictionary} onChange={value => setDictionary(value as DictionaryKey)} isDisabled={!!room.quickMatch || !isHost || game.status !== 'connected'}><Label>{T('Vocabulary set', 'Wortschatz')}</Label><Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger><Select.Popover><ListBox>{DICTIONARIES.map(d => <ListBox.Item id={d.id} key={d.id} textValue={d.label}><Label>{d.label}</Label></ListBox.Item>)}</ListBox></Select.Popover></Select>
                            <div className="multiplayer-active-setting"><Label>{raceMode === 'time' ? T('Time limit', 'Zeitlimit') : T('Sprint target', 'Wort-Ziel')}</Label><ToggleButtonGroup className="key-group" selectionMode="single" selectedKeys={new Set([String(raceMode === 'time' ? duration : wordCount)])} onSelectionChange={keys => { const value = Number(Array.from(keys)[0]); if (raceMode === 'time' && RACE_DURATIONS.includes(value as typeof RACE_DURATIONS[number])) setDuration(value); else if (raceMode === 'words' && WORD_COUNTS.includes(value as typeof WORD_COUNTS[number])) setWordCount(value); }} isDisabled={!!room.quickMatch || !isHost || game.status !== 'connected'} fullWidth>{(raceMode === 'time' ? RACE_DURATIONS : WORD_COUNTS).map(value => <ToggleButton id={String(value)} key={value} className="key-btn key-btn--ghost">{raceMode === 'time' ? TEST_DURATIONS.find(option => option.seconds === value)?.label : `${value} W`}</ToggleButton>)}</ToggleButtonGroup></div>
                            <KeyButton type="submit" variant="secondary" fullWidth isDisabled={!isHost || game.status !== 'connected' || wordCount === room.wordCount && raceMode === room.mode && dictionary === room.dictionary && (raceMode === 'words' || duration === room.duration)}>{T('Apply race settings', 'Einstellungen anwenden')}</KeyButton>
                        </form>
                        <div className="multiplayer-active-controls"><Switch isSelected={room.allowSpectators !== false} onChange={value => game.send({ type: 'room_controls', allowSpectators: value })} isDisabled={!isHost || game.status !== 'connected'}><Switch.Content><Label>{T('Allow spectators', 'Zuschauer erlauben')}</Label><Description>{T('10 separate viewer seats', '10 separate Zuschauerplätze')}</Description></Switch.Content><Switch.Control><Switch.Thumb /></Switch.Control></Switch><Switch isSelected={!!room.autoStart} onChange={value => game.send({ type: 'room_controls', autoStart: value })} isDisabled={!isHost || game.status !== 'connected'}><Switch.Content><Label>{T('Auto-start on all ready', 'Autostart, wenn alle bereit sind')}</Label></Switch.Content><Switch.Control><Switch.Thumb /></Switch.Control></Switch></div>
                    </Card.Content></Card>}
                    <Card className="multiplayer-active-chat" aria-labelledby="lobby-chat-title"><Card.Header><Card.Title id="lobby-chat-title">{T('Room chat', 'Raum-Chat')}</Card.Title><Chip size="sm" color="success" variant="soft"><Chip.Label>{T('Live', 'Live')}</Chip.Label></Chip></Card.Header><Card.Content>
                        <ol ref={chatFeed} role="log" aria-live="polite" aria-relevant="additions" className="multiplayer-chat-feed">{(room.chat ?? []).map(message => <li key={message.id}><time dateTime={new Date(message.sentAt).toISOString()}>{new Date(message.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time><strong>{message.nickname}</strong><p>{message.text}</p></li>)}</ol>
                        {!room.chat?.length && <p className="multiplayer-active-rule-note">{T('Say hello while everyone gets ready.', 'Sag hallo, während alle bereit werden.')}</p>}
                        <form onSubmit={e => { e.preventDefault(); sendChat(); }}><TextField value={chatText} onChange={setChatText} maxLength={240} isDisabled={game.status !== 'connected'} aria-label={T("Room message", "Raum-Nachricht")}><InputGroup><InputGroup.Input id="lobby-chat-message" placeholder={T("Message your room…", "Nachricht an den Raum…")} autoComplete="off" /><InputGroup.Suffix><KeyButton type="submit" isIconOnly aria-label={T("Send message", "Nachricht senden")} isDisabled={!chatText.trim() || game.status !== 'connected'}><ArrowRight size={16} /></KeyButton></InputGroup.Suffix></InputGroup></TextField></form>
                    </Card.Content><Card.Footer><p className="multiplayer-chat-limit">{T('2 messages per 10 seconds', '2 Nachrichten pro 10 Sekunden')}</p></Card.Footer></Card>
                    <Card className="multiplayer-active-room-link"><span>{T('DIRECT ROOM LINK', 'DIREKTER RAUM-LINK')}</span><div><code>{inviteURL}</code><KeyButton isIconOnly variant="ghost" aria-label={T("Copy room invitation", "Raum-Einladung kopieren")} onPress={() => void copyInvite()}><Copy size={16} /></KeyButton></div></Card>
                </aside>}
            </div>}
            {round && <section className="online-race-panel multiplayer-arena" data-phase={room.phase} aria-label={finished ? T("Typing race results", "Rennergebnisse") : T("Multiplayer typing race", "Multiplayer-Tipp-Rennen")}>
                {finished ? <div className="multiplayer-finish-heading" data-tone={winner ? 'success' : 'warning'}>
                    <div className="multiplayer-finish-copy"><span className="multiplayer-outcome-icon">{winner ? <Trophy size={24} /> : <Clock3 size={24} />}</span><div><span className="multiplayer-status-pill" role="status" data-tone={winner ? 'success' : 'warning'}>{decidingWinner ? T('Race over · deciding winner', 'Rennen vorbei · Sieger wird ermittelt') : T('Race over', 'Rennen vorbei')}</span><h2 id="multiplayer-results-title">{decidingWinner ? T('Comparing final scores…', 'Endpunkte werden verglichen…') : won ? T('You won this round.', 'Du hast diese Runde gewonnen.') : winner ? `${winner.nickname} ${T('takes first.', 'ist Erste/r.')}` : timed ? T('Time’s up.', 'Zeit ist um.') : T('Every word counts.', 'Jedes Wort zählt.')}</h2><p>{won ? T('Nicely done. Keep the momentum going.', 'Gut gemacht. Bleib im Rhythmus.') : winner ? T('A little competition. A little progress.', 'Ein wenig Wettkampf. Ein wenig Fortschritt.') : timed ? T('The timer has ended. Final scores decide this round.', 'Die Zeit ist um. Die Endpunkte entscheiden.') : T('No one finished before the time limit. Try another round.', 'Niemand war vor Zeitablauf fertig. Probiere eine neue Runde.')}</p></div></div>
                    <div className="multiplayer-rematch"><div className="share-result-controls"><KeyButton variant="primary" isDisabled={!canRematch || game.status !== 'connected'} onPress={() => game.send({ type: 'rematch', roundId: round.id, value: !self?.rematch })}><RefreshCw size={14} />{self?.rematch ? T('Cancel rematch', 'Revanche abbrechen') : T('Race again', 'Nochmal tippen')}</KeyButton>{selfResult?.metrics && <ShareResultButton defaultUsername={selfResult.nickname} result={{ challenge: 'multiplayer', wpm: selfResult.metrics.wpm, accuracy: selfResult.metrics.accuracy, speed: 'correct', duration: selfResult.metrics.duration, dictionary: room.dictionary, detail: `${timed ? `${room.duration}s` : `${room.wordCount} ${T('words', 'Wörter')}`} · ${dictionaryLabel}` }} />}</div><p>{game.now >= round.resultsUntil! ? T('Rematch window closed', 'Revanche-Fenster geschlossen') : self?.rematch ? T('Waiting for another player', 'Warte auf weitere Spieler') : !canRematch ? T('Collecting final scores…', 'Sammle Endpunkte…') : `${T('Rematch', 'Revanche')} · ${remaining(Math.min(round.resultsUntil!, room.expiresAt), game.now)} ${T('left', 'übrig')}`}</p></div>
                </div> : <div className="online-race-toolbar"><span className="multiplayer-status-pill" data-tone={game.status !== 'connected' ? 'danger' : room.phase === 'countdown' || game.run?.stopped ? 'warning' : 'primary'}><span className="multiplayer-status-dot" />{room.phase === 'countdown' ? `${T('Starting in', 'Start in')} ${countdownSeconds ?? 0}…` : !isParticipant ? T('Spectating', 'Zuschauen') : game.status !== 'connected' ? T('Reconnecting', 'Verbinde neu') : game.run?.stopped ? timed ? T('Passage complete · waiting for timer', 'Text fertig · warte auf die Zeit') : T('Confirming your finish', 'Bestätige dein Ergebnis') : T('Race in progress', 'Rennen läuft')}</span><span className="multiplayer-race-length">{timed ? `${room.duration}s` : `${room.wordCount} ${T('words', 'Wörter')}`} · {dictionaryLabel}</span></div>}
                {finished ? <dl className="multiplayer-live-metrics" aria-label={room.phase === 'results' ? T('Your typing race results', 'Deine Rennergebnisse') : T('Your live typing metrics', 'Deine Live-Werte')}>
                    <div data-metric="wpm" data-tone="primary"><dt><Gauge size={14} />{T('Your WPM', 'Dein WPM')}</dt><dd>{metrics?.wpm ?? '—'}<span>{T('words / min', 'Wörter / Min')}</span></dd></div>
                    <div data-metric="accuracy" data-tone={accuracyTone}><dt><ShieldCheck size={14} />{T('Accuracy', 'Genauigkeit')}</dt><dd>{metrics ? `${metrics.accuracy}%` : '—'}<span>{T('correct presses', 'korrekte Anschläge')}</span></dd></div>
                    <div data-metric="progress" data-tone={progress === 100 ? 'success' : 'primary'}><dt><Flag size={14} />{T('Progress', 'Fortschritt')}</dt><dd>{metrics?.completedWords ?? '—'}<span>{timed ? T('words typed', 'getippte Wörter') : `${T('of', 'von')} ${room.wordCount} ${T('words', 'Wörtern')}`}</span></dd></div>
                    <div data-metric="time" data-tone={timeTone}><dt><Clock3 size={14} />{room.phase === 'results' ? T('Race time', 'Rennzeit') : T('Time left', 'Zeit übrig')}</dt><dd>{room.phase === 'results' ? `${Math.max(0, Math.round((round.endedAt! - round.startAt) / 1000))}s` : remaining(round.deadline, Math.max(game.now, round.startAt))}<span>{room.phase === 'countdown' ? T('starts after countdown', 'startet nach dem Countdown') : room.phase === 'results' ? T('round complete', 'Runde abgeschlossen') : `${room.duration}s ${T('limit', 'Limit')}`}</span></dd></div>
                </dl> : null}
                {!isParticipant && <p className="multiplayer-spectator-note">{T('You’re watching this round. Your live scores will appear when you join the next race.', 'Du schaust dieser Runde zu. Deine Live-Werte erscheinen, wenn du beim nächsten Rennen mitfährst.')}</p>}
                {!finished && <div className="multiplayer-race-layout"><div className="multiplayer-race-keyboard">
                <div className="online-you-progress" data-tone={progress === 100 ? 'success' : 'primary'} role="progressbar" aria-label={T("Your race progress", "Dein Renn-Fortschritt")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-valuetext={`${progress}% ${T("of the passage typed correctly", "des Textes korrekt getippt")}`}><span style={{ width: `${progress}%` }} /></div>
                <div className="online-writing-area"><div id="keyboard-container" data-kb-loaded={1}><div id="keyboard-wrapper">
                    {racing && <input ref={input} id="kb-hidden-input" type="text" value={game.run?.typedText ?? ''} onChange={e => game.type(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} aria-label={T("Multiplayer typing input", "Multiplayer-Tipp-Eingabe")} aria-describedby="multiplayer-typing-help" />}
                    <div id="keyboard" data-kb-focused={!racing || focused ? 1 : 0}><RaceParagraph text={round.text} typedText={game.run?.typedText ?? ''} active={racing} timed={timed} /></div>
                </div></div>
                    {room.phase === 'countdown' && <div className="online-start-overlay online-countdown multiplayer-passage-countdown" role="status" aria-label={`${T('Race starts in', 'Rennen startet in')} ${countdownSeconds} ${T('seconds', 'Sekunden')}`}><Kbd className="analytics-key"><Kbd.Content>{countdownSeconds || T('go', 'los')}</Kbd.Content></Kbd><p>{T('Get ready', 'Mach dich bereit')}</p></div>}
                    {racing && !focused && <KeyButton className="online-focus-button" onPress={() => input.current?.focus()}><MousePointer2 size={16} />{T('Click to keep racing', 'Klicke, um weiter zu tippen')}</KeyButton>}
                </div><div className="online-panel-footer multiplayer-arena-footer"><dl aria-label={T('Your live typing metrics', 'Deine Live-Werte')}><div data-tone={timeTone}><dt><Clock3 size={14} />{T('Time left', 'Zeit übrig')}</dt><dd>{remaining(round.deadline, Math.max(game.now, round.startAt))}</dd></div><div data-tone="primary"><dt><Gauge size={14} />{T('Your WPM', 'Dein WPM')}</dt><dd>{metrics?.wpm ?? '—'}</dd></div><div><dt><Flag size={14} />{timed ? T('Words typed', 'Getippte Wörter') : T('Progress', 'Fortschritt')}</dt><dd>{metrics?.completedWords ?? '—'}{!timed && <small> / {room.wordCount}</small>}</dd></div><div data-tone={accuracyTone}><dt><ShieldCheck size={14} />{T('Accuracy', 'Genauigkeit')}</dt><dd>{metrics ? `${metrics.accuracy}%` : '—'}</dd></div></dl><p id="multiplayer-typing-help">{timed ? T('Correct mistakes as you type. The timer ends the race.', 'Korrigiere Fehler beim Tippen. Der Timer beendet das Rennen.') : T('Correct mistakes before moving to the next word. First finisher ends the race.', 'Korrigiere Fehler, bevor du weiter tippst. Der Erste im Ziel beendet das Rennen.')}</p></div>
                </div></div>}
                {!finished && room.phase !== 'countdown' && <RaceLeaderboard players={standings} selfId={game.snapshot?.selfId} finished={false} track timed={timed} locale={locale} />}
                {finished && rematchPlayers.length > 0 && <div className="multiplayer-rematch-notice" role="status"><RefreshCw size={14} /><span><strong>{rematchPlayers.length}</strong> {rematchPlayers.length === 1 ? T('player has', 'Spieler hat') : T('players have', 'Spieler haben')} {T('opted to race again.', 'sich für eine Revanche entschieden.')}{self?.rematch ? T(' You’re in.', ' Du bist dabei.') : T(' Choose Race again to join.', ' Wähle „Nochmal tippen“, um mitzumachen.')}</span></div>}
                {finished && <div className="multiplayer-final-standings">
                    <RaceTrendChart key={round.id} round={round} trends={game.trends} collecting={game.now < round.collectionUntil! && round.players.some(p => !p.metrics)} locale={locale} />
                    <div className="multiplayer-standings-heading"><h3>{T('Final standings', 'Endstand')}</h3><span>{round.players.length} {T('racers', 'Rennfahrer')} · {timed ? `${room.duration}s` : `${room.wordCount} ${T('words', 'Wörter')}`}</span></div>
                    <div className="multiplayer-table-wrap"><table><caption className="sr-only">{T('Final typing metrics', 'Endgültige Tipp-Werte')}</caption><thead><tr><th scope="col">{T('Place', 'Platz')}</th><th scope="col">{T('Player', 'Spieler')}</th><th scope="col">WPM</th><th scope="col">{T('Accuracy', 'Genauigkeit')}</th><th scope="col">{T('Words', 'Wörter')}</th></tr></thead><tbody>{sortedResults.map((p, index) => <tr key={p.id} data-you={p.id === game.snapshot?.selfId} data-winner={p.id === round.winnerId}><td><span className="multiplayer-result-rank" data-tone={p.id === round.winnerId ? 'warning' : 'neutral'}>{p.id === round.winnerId ? <Trophy size={15} aria-label={T("Winner", "Sieger")} /> : p.metrics ? index + 1 : '—'}</span></td><th scope="row"><span className="multiplayer-result-player"><Avatar username={p.nickname} settings={p.avatar} /><span>{p.nickname}{p.id === game.snapshot?.selfId && <small>{T('you', 'du')}</small>}{p.id === round.winnerId && <small data-tone="warning">{T('winner', 'Sieger')}</small>}</span></span></th><td className="multiplayer-result-wpm">{p.metrics?.wpm ?? '—'}</td><td><span data-tone={!p.metrics ? 'neutral' : p.metrics.accuracy >= 95 ? 'success' : p.metrics.accuracy >= 80 ? 'warning' : 'danger'}>{p.metrics ? `${p.metrics.accuracy}%` : game.now < round.collectionUntil! ? T('Collecting…', 'Sammle…') : T('Unavailable', 'Nicht verfügbar')}</span></td><td>{p.metrics ? timed ? p.metrics.completedWords : `${p.metrics.completedWords}/${room.wordCount}` : '—'}</td></tr>)}</tbody></table></div>
                    <div className="multiplayer-results-footer"><p><Users size={13} />{localQuick ? T('Choose Race again for another quick race.', 'Wähle „Nochmal tippen“ für ein weiteres Schnellrennen.') : room.members.some(m => m.bot) ? T('Choose Race again for a rematch.', 'Wähle „Nochmal tippen“ für die Revanche.') : T('Two players choosing a rematch start the next race.', 'Zwei Spieler mit Revanche starten das nächste Rennen.')}</p><details className="multiplayer-passage"><summary>{T('View passage', 'Text ansehen')}<span aria-hidden="true">+</span></summary><p>{round.text}</p></details></div>
                </div>}
            </section>}
            {finished && round && <RematchPrompt key={round.id} requestedBy={rematchPlayers.map(m => m.nickname)} optedIn={!!self?.rematch} active={isParticipant && !self?.spectator && game.status === 'connected' && game.now < Math.min(round.resultsUntil!, room.expiresAt)} canJoin={canRematch} onJoin={() => game.send({ type: 'rematch', roundId: round.id, value: true })} locale={locale} />}
            {!finished && round && <details className="online-track multiplayer-roster" open={!round}><summary><span><Users size={14} />{localQuick ? T('Racers', 'Rennfahrer') : T('Players in this room', 'Spieler in diesem Raum')} <small>{room.members.length}</small></span><span aria-hidden="true">+</span></summary><p className="multiplayer-roster-note">{room.phase === 'lobby' ? T('Press Ready to start when you’re set. You’ll all start together.', 'Drücke „Bereit“, wenn du startklar bist. Ihr startet gemeinsam.') : T('Your speed updates live. Other players’ progress is estimated.', 'Dein Tempo aktualisiert sich live. Der Fortschritt der anderen wird geschätzt.')}</p>
                <ul className="multiplayer-members">{room.members.map(m => {
                    const you = m.id === game.snapshot?.selfId;
                    const score = you ? metrics : round?.players.find(p => p.id === m.id)?.metrics;
                    const standing = standings.find(p => p.id === m.id);
                    const playing = round?.players.some(p => p.id === m.id);
                    const memberTone = !m.connected ? 'danger' : m.rematch ? 'success' : room.phase === 'racing' && playing ? 'primary' : room.phase === 'lobby' && m.ready ? 'success' : 'neutral';
                    return <li key={m.id} data-you={you}><Avatar username={m.nickname} settings={m.avatar} /><div className="multiplayer-member-name"><span>{m.nickname}{you && <small> {T('you', 'du')}</small>}</span>{standing?.completion != null && <div className="multiplayer-member-progress" aria-hidden="true"><span style={{ width: `${standing.completion}%` }} /></div>}</div><div className="multiplayer-member-score">{(score || standing?.wpm !== null && standing?.wpm !== undefined) && <strong>{score?.wpm ?? standing?.wpm}<small> WPM</small></strong>}{you && room.phase === 'lobby' ? <KeyButton variant="primary" className="multiplayer-ready-action multiplayer-roster-ready" data-tone={m.ready ? "success" : "warning"} data-ready={m.ready} aria-pressed={m.ready} aria-describedby="multiplayer-ready-hint" isDisabled={game.status !== 'connected' || !m.connected} onPress={toggleReady}>{m.ready ? <CircleCheck size={14} /> : <Clock3 size={14} />}{m.ready ? T('Ready · undo', 'Bereit · zurück') : T('Waiting · ready up', 'Warten · bereit')}</KeyButton> : <span className="multiplayer-status-pill" data-tone={memberTone}><span className="multiplayer-status-dot" />{!m.connected ? T('Reconnecting', 'Verbinde neu') : m.rematch ? T('Rematch ready', 'Revanche bereit') : room.phase === 'results' && playing ? T('Finished', 'Fertig') : room.phase === 'racing' && playing ? game.run?.stopped && you ? T('Finishing', 'Beende') : T('Typing', 'Tippt') : round && !playing ? T('Watching', 'Schaut zu') : m.ready ? T('Ready', 'Bereit') : T('Not ready', 'Nicht bereit')}</span>}</div></li>;
                })}</ul>
            </details>}

        </>}

        <nav className="multiplayer-practice-links" aria-label={T('More typing practice', 'Weitere Tipp-Übungen')}><TextLink variant="muted" size="sm" href={practiceHrefFor(locale)}>{T('Solo practice →', 'Solo üben →')}</TextLink><TextLink variant="muted" size="sm" href={ghostHrefFor(locale)}>{T('Race your shadow →', 'Gegen deinen Schatten →')}</TextLink></nav>
    </div>;
}
