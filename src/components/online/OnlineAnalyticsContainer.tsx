import { useMemo } from "react";
import { useStore } from "@nanostores/react";
import { Avatar, Chip, Description, Label, ListBox } from "@heroui/react";
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

    const summary = useMemo(() => {
        const completed = rankedPlayers.filter(
            (player) => player.completed,
        ).length;
        const active = rankedPlayers.filter(
            (player) => !player.completed,
        ).length;
        const you = rankedPlayers.find((player) => player.isYou);

        return {
            completed,
            active,
            yourId: you?.id ?? null,
            yourRank: you?.rank ?? null,
            yourWpm: you ? Math.round(you.shownWpm) : null,
        };
    }, [rankedPlayers]);

    if (rankedPlayers.length === 0) {
        return null;
    }

    return (
        <section aria-label="Online race analytics">
            <div
                className="flex flex-row flex-wrap gap-2 justify-center mb-4"
                role="status"
                aria-live="polite"
            >
                <Chip size="sm" color="accent">
                    <Chip.Label>{rankedPlayers.length} racers</Chip.Label>
                </Chip>
                <Chip size="sm" color="success">
                    <Chip.Label>{summary.completed} finished</Chip.Label>
                </Chip>
                <Chip size="sm" color="warning">
                    <Chip.Label>{summary.active} racing</Chip.Label>
                </Chip>
                {summary.yourRank !== null && summary.yourWpm !== null && (
                    <Chip size="sm" color="accent">
                        <Chip.Label>
                            You: #{summary.yourRank} ({summary.yourWpm} WPM)
                        </Chip.Label>
                    </Chip>
                )}
                <Chip size="sm">
                    <Chip.Label>Target: {targetWords} words</Chip.Label>
                </Chip>
            </div>

            <ListBox
                aria-label="Online race leaderboard"
                selectionMode="single"
                disallowEmptySelection
                selectedKeys={summary.yourId ? [summary.yourId] : []}
                onSelectionChange={() => {
                    // Keep leaderboard read-only while preserving current-player highlight.
                }}
                variant="default"
                className="flex flex-row flex-wrap gap-2 justify-center"
            >
                {rankedPlayers.map((player) => {
                    const initials = player.name
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")
                        .toUpperCase();

                    const speedColor =
                        player.speedTier === "elite"
                            ? "success"
                            : player.speedTier === "fast"
                              ? "accent"
                              : player.speedTier === "medium"
                                ? "warning"
                                : "default";

                    return (
                        <ListBox.Item
                            key={player.id}
                            id={player.id}
                            textValue={player.name}
                            className="w-full md:w-40 data-selected:bg-surface data-selected:border-main data-selected:border-2 rounded-xl"
                        >
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Chip
                                        size="sm"
                                        color={
                                            player.rank <= 3
                                                ? "success"
                                                : "default"
                                        }
                                    >
                                        <Chip.Label>#{player.rank}</Chip.Label>
                                    </Chip>
                                    {player.isYou && (
                                        <Chip size="sm" color="accent">
                                            <Chip.Label>You</Chip.Label>
                                        </Chip>
                                    )}
                                    <Chip
                                        size="sm"
                                        color={
                                            player.completed
                                                ? "success"
                                                : "default"
                                        }
                                    >
                                        <Chip.Label>
                                            {player.completed
                                                ? "Finished"
                                                : "Racing"}
                                        </Chip.Label>
                                    </Chip>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Avatar size="sm">
                                        <Avatar.Fallback>
                                            {initials || "P"}
                                        </Avatar.Fallback>
                                    </Avatar>

                                    <div className="flex flex-col">
                                        <Label>{player.name}</Label>
                                        <Description>
                                            {Math.round(player.progressWords)}/
                                            {targetWords} words
                                        </Description>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <Chip size="sm" color={speedColor}>
                                        <Chip.Label>
                                            {Math.round(player.shownWpm)} WPM
                                        </Chip.Label>
                                    </Chip>

                                    <Description>
                                        {player.completionPct}% complete
                                    </Description>
                                </div>
                            </div>
                        </ListBox.Item>
                    );
                })}
            </ListBox>

            <Description>
                Leaderboard ranks by completion first, then live WPM.
            </Description>
        </section>
    );
};

export default OnlineAnalyticsContainer;
