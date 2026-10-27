import { completedRaceWords } from '../onlineRace';
import type { Metrics, Round, RoundPlayer } from './protocol';

/** Repeatable bursts and correction pauses; no per-keystroke writes or timers. */
function* typingBursts(round: Round, player: RoundPlayer) {
    let seed = 2166136261;
    for (const char of `${round.id}:${player.id}`) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619);
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    for (let i = 0; ; i++) {
        yield { duration: 2400 + random() * 3600, rate: (player.botWpm ?? 60) * (.7 + random() * .6) / 12_000 };
        const pause = random();
        if (pause < .35 || i % 4 === 3) yield { duration: 500 + random() * 2300, rate: 0 };
    }
}
export function botFinishAt(round: Round, player: RoundPlayer): number {
    let elapsed = player.botDelayMs ?? 1000, remaining = round.text.length;
    for (const burst of typingBursts(round, player)) {
        if (burst.rate && burst.duration * burst.rate >= remaining) return round.startAt + Math.ceil(elapsed + remaining / burst.rate);
        remaining -= burst.duration * burst.rate;
        elapsed += burst.duration;
    }
    return Infinity;
}
export function botCorrectChars(round: Round, player: RoundPlayer, now: number): number {
    let remaining = Math.max(0, now - round.startAt - (player.botDelayMs ?? 1000)), chars = 0;
    for (const burst of typingBursts(round, player)) {
        chars += Math.min(remaining, burst.duration) * burst.rate;
        remaining -= burst.duration;
        if (chars >= round.text.length || remaining <= 0) break;
    }
    return Math.min(round.text.length, Math.floor(chars));
}
export function botMetrics(round: Round, player: RoundPlayer, now: number): Metrics {
    const correctChars = botCorrectChars(round, player, now);
    const duration = Math.max(.001, (now - round.startAt) / 1000);
    const errors = Math.floor(correctChars * (.01 + ((player.botWpm ?? 60) % 4) / 100));
    const attempts = correctChars + errors;
    return { correctChars, completedWords: completedRaceWords(round.text, round.text.slice(0, correctChars)), attempts, errors,
        accuracy: attempts ? Math.round(correctChars / attempts * 100) : 100,
        wpm: Math.round(correctChars * 12 / duration), duration };
}
