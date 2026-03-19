import { atom, effect } from "nanostores";
import { $config, defaultConfig } from "./config";
import { $kbState, $kbTypedWords, $kbTypingState } from "./keyboard";
import { KBSTATE, KBTYPINGSTATE } from "@/constants/keyboardState";
import { $lifetimeStats } from "./history";
import {
    adjectives,
    animals,
    starWars,
    uniqueNamesGenerator,
} from "unique-names-generator";

export type OnlineLobbyState = "idle" | "joining" | "ready";

export interface OnlinePlayer {
    id: string;
    name: string;
    isYou: boolean;
    joined: boolean;
    avgWpm: number;
    currentWpm: number;
    progressWords: number;
}

export const ONLINE_BOT_TARGET = 4;
export const ONLINE_TICK_MS = 1000;
const BOT_BASE_MIN_WPM = 30;
const BOT_BASE_MAX_WPM = 60;

export const $onlineLobbyState = atom<OnlineLobbyState>("idle");
export const $onlinePlayers = atom<OnlinePlayer[]>([]);
export const $onlineTargetWords = atom<number>(100);

let pendingJoinTimeout: ReturnType<typeof setTimeout> | null = null;
let botSimulationInterval: ReturnType<typeof setInterval> | null = null;

effect([$kbState, $kbTypingState], (kbState, kbTypingState) => {
    if (typeof document === "undefined") {
        return;
    }

    document.body.setAttribute("data-kb-state", kbState.toString());
    document.body.setAttribute(
        "data-kb-typing-state",
        kbTypingState.toString(),
    );
});

const randomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const getAdjustedBotAvgWpm = (userBestWpm: number) => {
    const baseWpm = randomInt(BOT_BASE_MIN_WPM, BOT_BASE_MAX_WPM);
    if (userBestWpm <= 0) {
        return clamp(baseWpm + randomInt(-3, 8), 25, 80);
    }

    // Competitive profile: bots are usually near user's best, with some stronger opponents.
    const lowerMin = Math.max(25, Math.round(userBestWpm * 0.82));
    const lowerMax = Math.max(lowerMin + 3, Math.round(userBestWpm * 0.97));
    const parityMax = Math.max(lowerMax + 2, Math.round(userBestWpm * 1.03));

    const roll = Math.random();
    let targetWpm: number;
    if (roll < 0.45) {
        // 45% chance: slightly below user best.
        targetWpm = randomInt(lowerMin, lowerMax);
    } else if (roll < 0.85) {
        // 40% chance: near parity with user best.
        targetWpm = randomInt(lowerMax, parityMax);
    } else {
        // 15% chance: stronger bot.
        const strongerMin = Math.max(parityMax, Math.round(userBestWpm * 1.02));
        const strongerMax = Math.max(
            strongerMin + 2,
            Math.round(userBestWpm * 1.12),
        );
        targetWpm = randomInt(strongerMin, strongerMax);
    }

    const adjusted = Math.round(
        targetWpm * 0.82 + baseWpm * 0.18 + randomInt(-3, 4),
    );
    return clamp(adjusted, 20, 180);
};

const generateBotNames = (count: number) => {
    const names = new Set<string>();
    let attempts = 0;

    while (names.size < count && attempts < count * 12) {
        const name = uniqueNamesGenerator({
            dictionaries: [starWars],
            separator: "",
            style: "capital",
            length: 1,
        });
        names.add(name);
        attempts += 1;
    }

    while (names.size < count) {
        names.add(`Bot${names.size + 1}`);
    }

    return Array.from(names);
};

const createLobbyPlayers = (): OnlinePlayer[] => {
    const userBestWpm = $lifetimeStats.get().bestWpm;
    const botNames = generateBotNames(ONLINE_BOT_TARGET);

    const bots = botNames.map((name, index) => ({
        id: `bot-${index + 1}`,
        name,
        isYou: false,
        joined: false,
        avgWpm: getAdjustedBotAvgWpm(userBestWpm),
        currentWpm: 0,
        progressWords: 0,
    }));

    return [
        {
            id: "you",
            name: "You",
            isYou: true,
            joined: true,
            avgWpm: 0,
            currentWpm: 0,
            progressWords: 0,
        },
        ...bots,
    ];
};

const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

const updateBotSimulation = () => {
    const targetWords = $onlineTargetWords.get();
    const players = $onlinePlayers.get();
    const nextPlayers = players.map((player) => {
        if (player.isYou || !player.joined) {
            return player;
        }

        if (player.progressWords >= targetWords) {
            return { ...player, currentWpm: 0, progressWords: targetWords };
        }

        const nextCurrentWpm = clamp(
            player.avgWpm + randomInt(-10, 10),
            20,
            180,
        );
        const wordsPerTick = (nextCurrentWpm / 60) * (ONLINE_TICK_MS / 1000);
        const nextProgressWords = Math.min(
            targetWords,
            player.progressWords + wordsPerTick,
        );

        return {
            ...player,
            currentWpm: nextCurrentWpm,
            progressWords: nextProgressWords,
        };
    });

    $onlinePlayers.set(nextPlayers);
};

const clearBotSimulationInterval = () => {
    if (botSimulationInterval) {
        clearInterval(botSimulationInterval);
        botSimulationInterval = null;
    }
};

const startBotSimulation = () => {
    clearBotSimulationInterval();
    botSimulationInterval = setInterval(updateBotSimulation, ONLINE_TICK_MS);
};

const getJoinedBotCount = (players: OnlinePlayer[]) =>
    players.filter((player) => !player.isYou && player.joined).length;

const joinRandomBot = () => {
    const players = $onlinePlayers.get();
    const unjoinedBotIndexes = players
        .map((player, index) => ({ player, index }))
        .filter(({ player }) => !player.isYou && !player.joined)
        .map(({ index }) => index);

    if (unjoinedBotIndexes.length === 0) {
        return;
    }

    const randomIndex =
        unjoinedBotIndexes[randomInt(0, unjoinedBotIndexes.length - 1)];
    const nextPlayers = [...players];
    nextPlayers[randomIndex] = { ...nextPlayers[randomIndex], joined: true };
    $onlinePlayers.set(nextPlayers);

    if (getJoinedBotCount(nextPlayers) >= ONLINE_BOT_TARGET) {
        $onlineLobbyState.set("ready");
    }
};

const queueNextRandomJoin = () => {
    if ($onlineLobbyState.get() !== "joining") {
        return;
    }

    const players = $onlinePlayers.get();
    const hasPendingBots = players.some(
        (player) => !player.isYou && !player.joined,
    );
    if (!hasPendingBots) {
        $onlineLobbyState.set("ready");
        return;
    }

    let joinDelay = randomInt(900, 2200);
    if (import.meta.env.DEV) {
        joinDelay = randomInt(200, 500);
    }
    pendingJoinTimeout = setTimeout(() => {
        joinRandomBot();
        if ($onlineLobbyState.get() !== "ready") {
            queueNextRandomJoin();
        }
    }, joinDelay);
};

const clearPendingJoinTimeout = () => {
    if (pendingJoinTimeout) {
        clearTimeout(pendingJoinTimeout);
        pendingJoinTimeout = null;
    }
};

effect([$onlineLobbyState, $kbTypingState], (lobbyState, kbTypingState) => {
    const shouldSimulate =
        lobbyState === "ready" && kbTypingState === KBTYPINGSTATE.TYPING;

    if (shouldSimulate) {
        startBotSimulation();
        return;
    }

    clearBotSimulationInterval();
});

effect([$kbTypedWords], (typedWords) => {
    const targetWords = $onlineTargetWords.get();
    const players = $onlinePlayers.get();
    const youIndex = players.findIndex((player) => player.isYou);
    if (youIndex === -1) {
        return;
    }

    const nextPlayers = [...players];
    nextPlayers[youIndex] = {
        ...nextPlayers[youIndex],
        progressWords: Math.min(targetWords, typedWords.length),
    };
    $onlinePlayers.set(nextPlayers);
});

export const stopOnlineLobby = () => {
    clearPendingJoinTimeout();
    clearBotSimulationInterval();
    $onlineLobbyState.set("idle");
    $onlinePlayers.set([]);
};

export const startOnlineLobby = () => {
    clearPendingJoinTimeout();

    // Online race runs in words mode.
    $config.setKey("maxWordCount", "30");
    $config.setKey("mode", "words");
    $config.set({ ...defaultConfig, ...$config.get() });
    $kbTypingState.set(KBTYPINGSTATE.IDLE);
    $kbState.set(KBSTATE.NOT_FOCUSSED);

    const targetWords = parseInt($config.get().maxWordCount, 10) || 100;
    $onlineTargetWords.set(targetWords);

    $onlineLobbyState.set("joining");
    $onlinePlayers.set(createLobbyPlayers());
    queueNextRandomJoin();
};
