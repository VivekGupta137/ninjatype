import { useMemo } from "react";
import { useStore } from "@nanostores/react";
import { $rawWPM } from "@/store/analytics";
import { $onlinePlayers, $onlineTargetWords } from "@/store/online";

type SpeedTier = "slow" | "medium" | "fast" | "elite";

const getSpeedTier = (wpm: number): SpeedTier => {
    if (wpm >= 90) return "elite";
    if (wpm >= 70) return "fast";
    if (wpm >= 40) return "medium";
    return "slow";
};

const OnlineAnalyticsContainer = () => {
    const players = useStore($onlinePlayers);
    const targetWords = useStore($onlineTargetWords);
    const currentUserWpm = useStore($rawWPM);

    const rankedPlayers = useMemo(() => {
        const joinedPlayers = players
            .filter((player) => player.joined)
            .map((player) => {
                const completionPct = Math.min(
                    100,
                    Math.round(
                        (player.progressWords / Math.max(1, targetWords)) * 100,
                    ),
                );
                const isCompleted = completionPct >= 100;
                const shownWpm = player.isYou
                    ? currentUserWpm
                    : isCompleted
                      ? player.avgWpm
                      : player.currentWpm;

                return {
                    ...player,
                    shownWpm,
                    completionPct,
                    isCompleted,
                };
            })
            .sort((a, b) => {
                if (b.completionPct !== a.completionPct) {
                    return b.completionPct - a.completionPct;
                }
                if (b.shownWpm !== a.shownWpm) {
                    return b.shownWpm - a.shownWpm;
                }
                return a.name.localeCompare(b.name);
            });

        return joinedPlayers.map((player, index) => ({
            ...player,
            rank: index + 1,
            speedTier: getSpeedTier(player.shownWpm),
            completed: player.isCompleted,
        }));
    }, [players, currentUserWpm, targetWords]);

    if (rankedPlayers.length === 0) {
        return null;
    }

    return (
        <section
            className="online-analytics"
            aria-label="Online race analytics"
        >
            <div
                className="online-analytics-list"
                role="status"
                aria-live="polite"
            >
                {rankedPlayers.map((player) => (
                    <article
                        key={player.id}
                        className="online-analytics-card"
                        data-you={player.isYou ? 1 : 0}
                        data-speed={player.speedTier}
                        data-completed={player.completed ? 1 : 0}
                    >
                        <div className="online-analytics-rank">
                            #{player.rank}
                        </div>
                        <div className="online-analytics-name">
                            {player.name}
                        </div>
                        <div className="online-analytics-wpm">
                            {player.shownWpm} WPM
                        </div>
                        <div className="online-analytics-progress">
                            {player.completionPct}% complete
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default OnlineAnalyticsContainer;
