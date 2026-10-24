import { atom, computed } from "nanostores";
import { words1k } from "@/constants/words1k";
import { $history, addSession } from "./history";
import { diffTypedText } from "@/lib/keypressStats";
import { completedRaceWords, normalizeRaceInput, rankRacePlayers, recordedRacePlayers, type RacePlayer } from "@/lib/onlineRace";

export type OnlinePlayer = RacePlayer;
export type OnlineLobbyState = 'idle' | 'countdown' | 'racing' | 'finished';
export const ONLINE_WORD_COUNTS = [15, 30, 50] as const;
export const ONLINE_TICK_MS = 200;
export const $onlineLobbyState = atom<OnlineLobbyState>('idle');
export const $onlinePlayers = atom<OnlinePlayer[]>([]);
export const $onlineTargetWords = atom<number>(30);
export const $onlineSentence = atom('');
export const $onlineTypedText = atom('');
export const $onlineCountdown = atom(3);
export const $onlineElapsed = atom(0);
export const $onlineErrors = atom(0);
export const $onlineAttempts = atom(0);
export const $onlineWpm = atom(0);
export const $onlineTimedOut = atom(false);
export const $onlineAccuracy = computed([$onlineErrors, $onlineAttempts], (errors, attempts) => attempts ? Math.round((attempts - errors) / attempts * 100) : 100);
export const $onlineRankedPlayers = computed($onlinePlayers, rankRacePlayers);

let raceTimer: ReturnType<typeof setInterval> | null = null;
let startsAt = 0;
const MAX_RACE_MS = 10 * 60 * 1000;

const stopTimer = () => {
    if (raceTimer !== null) clearInterval(raceTimer);
    raceTimer = null;
};

export const prepareOnlineRace = (wordCount = $onlineTargetWords.get()) => {
    stopTimer();
    $onlineLobbyState.set('idle');
    const target = ONLINE_WORD_COUNTS.includes(wordCount as typeof ONLINE_WORD_COUNTS[number]) ? wordCount : 30;
    $onlineTargetWords.set(target);
    $onlineTypedText.set('');
    $onlineSentence.set(Array.from({ length: target }, () => words1k[Math.floor(Math.random() * words1k.length)]).join(' '));
    $onlineElapsed.set(0);
    $onlineErrors.set(0);
    $onlineAttempts.set(0);
    $onlineWpm.set(0);
    $onlineCountdown.set(3);
    $onlineTimedOut.set(false);
    startsAt = 0;
    $onlinePlayers.set([
        { id: 'you', name: 'You', isYou: true, avgWpm: 0, currentWpm: 0, progressWords: 0, finishedAt: null },
        ...recordedRacePlayers($history.get().sessions, 1),
    ]);
};

const finishRace = (now: number, completed: boolean) => {
    stopTimer();
    const duration = Math.max(.001, (now - startsAt) / 1000);
    $onlineElapsed.set(duration);
    $onlineTimedOut.set(!completed);
    if (completed) {
        const wpm = Math.round($onlineSentence.get().length / 5 / (duration / 60));
        $onlineWpm.set(wpm);
        $onlinePlayers.set($onlinePlayers.get().map(player => player.isYou ? { ...player, finishedAt: duration, progressWords: $onlineTargetWords.get(), currentWpm: wpm } : player));
        if (duration >= 1 && wpm > 0) addSession({ timestamp: now, wpm, cpm: wpm * 5, accuracy: $onlineAccuracy.get(), errors: $onlineErrors.get(), duration, mode: 'words' });
    }
    $onlineLobbyState.set('finished');
};

/** Explicit clock argument makes countdown and race timing testable. */
export const tickOnlineRace = (now = Date.now()) => {
    if ($onlineLobbyState.get() === 'countdown') {
        $onlineCountdown.set(Math.max(0, Math.ceil((startsAt - now) / 1000)));
        if (now < startsAt) return;
        $onlineLobbyState.set('racing');
    }
    if ($onlineLobbyState.get() !== 'racing') return;
    const elapsed = Math.max(0, (now - startsAt) / 1000);
    $onlineElapsed.set(elapsed);
    const typed = $onlineTypedText.get();
    const correctChars = [...typed].filter((char, i) => char === $onlineSentence.get()[i]).length;
    const wpm = elapsed > 0 ? Math.round(correctChars / 5 / (elapsed / 60)) : 0;
    $onlineWpm.set(wpm);
    const target = $onlineTargetWords.get();
    $onlinePlayers.set($onlinePlayers.get().map(player => {
        if (player.isYou) return { ...player, progressWords: completedRaceWords($onlineSentence.get(), typed), currentWpm: wpm };
        if (player.finishedAt !== null) return player;
        // A saved average pace projected onto this track, using standard 5-char WPM.
        const finishTime = ($onlineSentence.get().length / 5) / player.avgWpm * 60;
        const progress = Math.min(target, target * elapsed / finishTime);
        return { ...player, progressWords: progress, currentWpm: player.avgWpm,
            finishedAt: elapsed >= finishTime ? finishTime : null };
    }));
    if (now - startsAt >= MAX_RACE_MS) finishRace(now, false);
};

export const startOnlineRace = (now = Date.now()) => {
    const state = $onlineLobbyState.get();
    if (state === 'racing' || state === 'countdown') return;
    if (state === 'finished' || !$onlineSentence.get()) prepareOnlineRace();
    startsAt = now + 3000;
    $onlineCountdown.set(3);
    $onlineLobbyState.set('countdown');
    stopTimer();
    raceTimer = setInterval(() => tickOnlineRace(), ONLINE_TICK_MS);
};

export const typeOnlineText = (rawText: string, now = Date.now()) => {
    if ($onlineLobbyState.get() !== 'racing') return;
    const sentence = $onlineSentence.get();
    const previous = $onlineTypedText.get();
    const text = normalizeRaceInput(sentence, rawText);
    const presses = diffTypedText(previous, text, sentence, 0, now);
    $onlineAttempts.set($onlineAttempts.get() + presses.length);
    $onlineErrors.set($onlineErrors.get() + presses.filter(press => !press.correct).length);
    $onlineTypedText.set(text);
    tickOnlineRace(now);
    if ($onlineLobbyState.get() === 'racing' && text === sentence) finishRace(now, true);
};

export const stopOnlineLobby = () => {
    stopTimer();
    $onlineLobbyState.set('idle');
    $onlinePlayers.set([]);
    $onlineTypedText.set('');
};
