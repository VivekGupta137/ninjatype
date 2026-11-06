import type { Member, RoomState } from './protocol';

type Lobby = Pick<RoomState, 'phase' | 'hostId' | 'autoStart' | 'quickMatch' | 'quickMatchFilled'> & {
    members: Pick<Member, 'id' | 'connected' | 'ready' | 'spectator'>[];
};
export type LobbyReadiness = { action: 'ready' | 'start' | 'waiting'; label: string; title: string; hint: string; allReady: boolean };

/** UI readiness follows all racers; spectators never block the start action. */
export function lobbyReadiness(room: Lobby | undefined, selfId: string | undefined, connected: boolean): LobbyReadiness {
    const players = room?.members.filter(member => !member.spectator) ?? [];
    const self = room?.members.find(member => member.id === selfId);
    const allReady = players.length >= 2 && players.every(member => member.connected && member.ready);
    const waiting = (label: string, hint: string, title = label): LobbyReadiness => ({ action: 'waiting', label, title, hint, allReady });
    if (!connected || !self?.connected) return waiting('Reconnecting…', 'Lobby controls will return when your connection is restored.');
    if (room?.phase !== 'lobby') return waiting('Starting race…', 'Follow the countdown before typing.');
    if (self.spectator) return waiting('Watching', 'You’re watching this room. Racers will start when they are ready.', 'Watching the lobby.');
    if (!self.ready) return { action: 'ready', label: 'I’m ready', title: 'Waiting for you to get ready.', hint: 'Choose “I’m ready” to join the next race.', allReady };
    if (room.quickMatch && !room.quickMatchFilled) return waiting('Waiting for racers…', 'You’re ready. More racers are joining this match.');
    if (players.length < 2) return waiting('Waiting for another racer…', 'You’re ready. At least two racers are needed to start.');
    if (!allReady) return waiting('Waiting for racers…', players.some(member => !member.connected)
        ? 'You’re ready. Waiting for racers to reconnect and get ready.'
        : 'You’re ready. Waiting for the other racers to get ready.');
    if (room.hostId === self.id) return { action: 'start', label: 'Start race now', title: 'Everyone is ready.', hint: room.autoStart
        ? 'The 10-second countdown will begin automatically, or you can start it now.'
        : 'Everyone is ready. Start the 10-second countdown when you’re set.', allReady };
    return waiting(room.autoStart ? 'Waiting for countdown…' : 'Waiting for host…', room.autoStart
        ? 'Everyone is ready. The 10-second countdown will begin automatically.'
        : 'Everyone is ready. Waiting for the host to start the countdown.', 'Everyone is ready.');
}
