import type { Member, RoomState } from './protocol';
import { tr, type LearnLocale } from '@/lib/learnLocale';

type Lobby = Pick<RoomState, 'phase' | 'hostId' | 'autoStart' | 'quickMatch' | 'quickMatchFilled'> & {
    members: Pick<Member, 'id' | 'connected' | 'ready' | 'spectator'>[];
};
export type LobbyReadiness = { action: 'ready' | 'start' | 'waiting'; label: string; title: string; hint: string; allReady: boolean };

/** UI readiness follows all racers; spectators never block the start action. */
export function lobbyReadiness(room: Lobby | undefined, selfId: string | undefined, connected: boolean, locale: LearnLocale = 'en'): LobbyReadiness {
    const players = room?.members.filter(member => !member.spectator) ?? [];
    const self = room?.members.find(member => member.id === selfId);
    const allReady = players.length >= 2 && players.every(member => member.connected && member.ready);
    const waiting = (label: string, hint: string, title = label): LobbyReadiness => ({ action: 'waiting', label: tr(locale, label, label), title: tr(locale, title, title), hint: tr(locale, hint, hint), allReady });
    if (!connected || !self?.connected) return waiting(tr(locale, 'Reconnecting…', 'Verbinde neu…'), tr(locale, 'Lobby controls will return when your connection is restored.', 'Die Lobby-Steuerung kommt zurück, sobald die Verbindung steht.'));
    if (room?.phase !== 'lobby') return waiting(tr(locale, 'Starting race…', 'Rennen startet…'), tr(locale, 'Follow the countdown before typing.', 'Warte den Countdown ab, bevor du tippst.'));
    if (self.spectator) return waiting(tr(locale, 'Watching', 'Zuschauen'), tr(locale, 'You’re watching this room. Racers will start when they are ready.', 'Du schaust diesem Raum zu. Die Rennfahrer starten, wenn sie bereit sind.'), tr(locale, 'Watching the lobby.', 'Du schaust der Lobby zu.'));
    if (!self.ready) return { action: 'ready', label: tr(locale, 'I’m ready', 'Ich bin bereit'), title: tr(locale, 'Waiting for you to get ready.', 'Warte auf dich.'), hint: tr(locale, 'Choose “I’m ready” to join the next race.', 'Wähle „Ich bin bereit“, um beim nächsten Rennen mitzufahren.'), allReady };
    if (room.quickMatch && !room.quickMatchFilled) return waiting(tr(locale, 'Waiting for racers…', 'Warte auf Rennfahrer…'), tr(locale, 'You’re ready. More racers are joining this match.', 'Du bist bereit. Weitere Rennfahrer kommen dazu.'));
    if (players.length < 2) return waiting(tr(locale, 'Waiting for another racer…', 'Warte auf einen weiteren Rennfahrer…'), tr(locale, 'You’re ready. At least two racers are needed to start.', 'Du bist bereit. Zum Start braucht es mindestens zwei Rennfahrer.'));
    if (!allReady) return waiting(tr(locale, 'Waiting for racers…', 'Warte auf Rennfahrer…'), players.some(member => !member.connected)
        ? tr(locale, 'You’re ready. Waiting for racers to reconnect and get ready.', 'Du bist bereit. Warte auf die Rückkehr der anderen Rennfahrer.')
        : tr(locale, 'You’re ready. Waiting for the other racers to get ready.', 'Du bist bereit. Warte, bis die anderen Rennfahrer bereit sind.'));
    if (room.hostId === self.id) return { action: 'start', label: tr(locale, 'Start race now', 'Rennen jetzt starten'), title: tr(locale, 'Everyone is ready.', 'Alle sind bereit.'), hint: room.autoStart
        ? tr(locale, 'The 10-second countdown will begin automatically, or you can start it now.', 'Der 10-Sekunden-Countdown startet automatisch — oder du startest ihn jetzt.')
        : tr(locale, 'Everyone is ready. Start the 10-second countdown when you’re set.', 'Alle sind bereit. Starte den 10-Sekunden-Countdown, wenn du bereit bist.'), allReady };
    return waiting(room.autoStart ? tr(locale, 'Waiting for countdown…', 'Warte auf den Countdown…') : tr(locale, 'Waiting for host…', 'Warte auf den Host…'), room.autoStart
        ? tr(locale, 'Everyone is ready. The 10-second countdown will begin automatically.', 'Alle sind bereit. Der 10-Sekunden-Countdown startet automatisch.')
        : tr(locale, 'Everyone is ready. Waiting for the host to start the countdown.', 'Alle sind bereit. Der Host startet den Countdown.'), tr(locale, 'Everyone is ready.', 'Alle sind bereit.'));
}
