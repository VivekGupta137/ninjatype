import { useStore } from "@nanostores/react";
import {
    $onlineLobbyState,
    $onlinePlayers,
    ONLINE_BOT_TARGET,
} from "@/store/online";

const OnlineLobby = () => {
    const lobbyState = useStore($onlineLobbyState);
    const players = useStore($onlinePlayers);

    const joinedCount = players.filter((player) => player.joined).length;
    const joiningCount = players.length - joinedCount;
    const joinedBots = players.filter(
        (player) => !player.isYou && player.joined,
    ).length;

    if (lobbyState === "ready") {
        return null;
    }

    return (
        <>
            <div
                className="online-lobby-banner"
                role="status"
                aria-live="polite"
            >
                Online Mode searching players... {joinedBots}/
                {ONLINE_BOT_TARGET} bots joined ({joinedCount}/{players.length}{" "}
                ready)
            </div>
            <div
                className="online-lobby-players"
                role="status"
                aria-live="polite"
            >
                <div>
                    {joinedCount} joined • {joiningCount} joining
                </div>
            </div>
        </>
    );
};

export default OnlineLobby;
