/** Shared race rules, independent of the main typing session. */
export interface RacePlayer {
    id: string;
    name: string;
    isYou: boolean;
    avgWpm: number;
    currentWpm: number;
    progressWords: number;
    finishedAt: number | null;
    recordedAttempt?: { id: string; timestamp: number; accuracy: number };
}

export interface RecordedRaceAttempt {
    id?: string;
    timestamp: number;
    wpm: number;
    duration: number;
    accuracy: number;
}

/** Only authentic, valid records can become opponents. Never fill missing lanes. */
export const recordedRacePlayers = (attempts: RecordedRaceAttempt[], limit = 4): RacePlayer[] => {
    const seen = new Set<string>();
    return [...attempts]
        .filter(attempt => attempt && typeof attempt === 'object' && Number.isFinite(attempt.wpm) && attempt.wpm > 0 &&
            Number.isFinite(attempt.duration) && attempt.duration >= 1 &&
            Number.isFinite(attempt.timestamp) && attempt.timestamp > 0 && Number.isFinite(new Date(attempt.timestamp).getTime()) &&
            Number.isFinite(attempt.accuracy) && attempt.accuracy >= 0 && attempt.accuracy <= 100)
        .sort((a, b) => b.timestamp - a.timestamp)
        .filter(attempt => {
            const id = attempt.id || `${attempt.timestamp}:${attempt.wpm}:${attempt.duration}`;
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
        })
        .slice(0, Math.max(0, limit))
        .map((attempt, index) => {
            const id = attempt.id || `${attempt.timestamp}:${attempt.wpm}:${attempt.duration}`;
            return {
                id: `attempt-${id}`, name: `Past attempt ${index + 1}`, isYou: false,
                avgWpm: attempt.wpm, currentWpm: 0, progressWords: 0, finishedAt: null,
                recordedAttempt: { id, timestamp: attempt.timestamp, accuracy: attempt.accuracy },
            };
        });
};

export const completedRaceWords = (sentence: string, typedText: string): number => {
    if (!sentence || !typedText) return 0;
    if (typedText === sentence) return sentence.split(' ').length;
    const targets = sentence.split(' ');
    const typed = typedText.split(' ');
    let completed = 0;
    for (let i = 0; i < typed.length - 1; i++) {
        if (typed[i] !== targets[i]) break;
        completed++;
    }
    return completed;
};

/** Preserve mistakes for feedback, but require correction before advancing. */
export const normalizeRaceInput = (sentence: string, rawText: string): string => {
    let text = rawText.replace(/\s+/g, ' ').trimStart();
    if (text.endsWith(' ')) {
        const typed = text.trimEnd().split(' ');
        const targets = sentence.split(' ');
        if (typed.length >= targets.length || typed.some((word, i) => word !== targets[i])) {
            text = text.trimEnd();
        }
    }
    return text.slice(0, sentence.length + 10);
};

export const rankRacePlayers = (players: RacePlayer[]): RacePlayer[] => [...players].sort((a, b) => {
    if (a.finishedAt !== null && b.finishedAt !== null) return a.finishedAt - b.finishedAt || a.id.localeCompare(b.id);
    if (a.finishedAt !== null) return -1;
    if (b.finishedAt !== null) return 1;
    return b.progressWords - a.progressWords || b.currentWpm - a.currentWpm || a.id.localeCompare(b.id);
});
