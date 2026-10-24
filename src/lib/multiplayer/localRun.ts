import { completedRaceWords, normalizeRaceInput } from '../onlineRace';
import { diffTypedText } from '../keypressStats';
import type { Metrics } from './protocol';

export interface LocalRun { roundId: string; text: string; typedText: string; attempts: number; errors: number; stopped: boolean }
export const newLocalRun = (roundId: string, text: string): LocalRun => ({ roundId, text, typedText: '', attempts: 0, errors: 0, stopped: false });
export function typeLocalRun(run: LocalRun, input: string, now: number): LocalRun {
    if (run.stopped) return run;
    const typedText = normalizeRaceInput(run.text, input);
    const presses = diffTypedText(run.typedText, typedText, run.text, 0, now);
    return { ...run, typedText, attempts: run.attempts + presses.length,
        errors: run.errors + presses.filter(p => !p.correct).length, stopped: typedText === run.text };
}
export function localMetrics(run: LocalRun, startAt: number, endAt: number): Metrics {
    const correctChars = [...run.typedText].filter((c, i) => c === run.text[i]).length;
    const duration = Math.max(.001, (endAt - startAt) / 1000);
    return { correctChars, completedWords: completedRaceWords(run.text, run.typedText), attempts: run.attempts, errors: run.errors,
        accuracy: run.attempts ? Math.round((run.attempts - run.errors) / run.attempts * 100) : 100,
        duration, wpm: Math.round(correctChars / 5 / (duration / 60)) };
}
