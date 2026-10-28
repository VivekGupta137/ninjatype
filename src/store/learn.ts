import { persistentAtom } from '@nanostores/persistent';
import { getAllFingers, type FingerType } from '@/constants/fingerKeys';
import { FINGER_LEVEL_COUNT, LEVEL_ACCURACY_TARGET, LEVEL_STAR_TARGET, getFingerLevel } from '@/constants/fingerLessons';
import { getStarRating } from '@/constants/badges';
import { mergeLearnKeyMetrics, sanitizeLearnKeyMetrics, type LearnKeyMetrics } from '@/lib/learnKeyFeedback';

export interface LevelProgress {
    bestWPM: number;
    bestAccuracy: number;
    stars: number;
    completed: boolean;
    keyStats?: LearnKeyMetrics;
}

export interface FingerProgress {
    /** All-time records, including practice saved before levels were introduced. */
    bestWPM: number;
    bestAccuracy: number;
    completed: boolean;
    currentLevel: number;
    levels: LevelProgress[];
}

export type LearnProgress = Record<FingerType, FingerProgress>;
const emptyLevel = (): LevelProgress => ({ bestWPM: 0, bestAccuracy: 0, stars: 0, completed: false });
const emptyFinger = (): FingerProgress => ({
    bestWPM: 0, bestAccuracy: 0, completed: false, currentLevel: 1,
    levels: Array.from({ length: FINGER_LEVEL_COUNT }, emptyLevel),
});
const emptyProgress = (): LearnProgress => Object.fromEntries(getAllFingers().map(finger => [finger, emptyFinger()])) as LearnProgress;
export const defaultLearnProgress = emptyProgress();

const safeNumber = (value: unknown, max = Infinity): number =>
    typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(0, value)) : 0;

/** Old records keep their all-time bests; they cannot prove mastery of new levels. */
export const decodeLearnProgress = (value: string): LearnProgress => {
    const progress = emptyProgress();
    try {
        const parsed = JSON.parse(value);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return progress;
        for (const finger of getAllFingers()) {
            const saved = parsed[finger] ?? (finger === 'pointer' ? parsed.index : undefined);
            if (!saved || typeof saved !== 'object') continue;
            const levels = Array.from({ length: FINGER_LEVEL_COUNT }, (_, index) => {
                const level = Array.isArray(saved.levels) ? saved.levels[index] : undefined;
                const bestAccuracy = safeNumber(level?.bestAccuracy, 100);
                const stars = Math.floor(safeNumber(level?.stars, LEVEL_STAR_TARGET));
                const keyStats = sanitizeLearnKeyMetrics(level?.keyStats, getFingerLevel(finger, index + 1).keys);
                return {
                    bestWPM: safeNumber(level?.bestWPM),
                    bestAccuracy,
                    stars,
                    completed: level?.completed === true && stars >= LEVEL_STAR_TARGET && bestAccuracy >= LEVEL_ACCURACY_TARGET,
                    ...(Object.keys(keyStats).length ? { keyStats } : {}),
                };
            });
            // Completion must form a continuous path; malformed data cannot skip levels.
            let previousComplete = true;
            for (const level of levels) {
                level.completed = previousComplete && level.completed;
                previousComplete = level.completed;
            }
            const firstUnfinished = levels.findIndex(level => !level.completed);
            progress[finger] = {
                bestWPM: safeNumber(saved.bestWPM),
                bestAccuracy: safeNumber(saved.bestAccuracy, 100),
                levels,
                currentLevel: firstUnfinished === -1 ? FINGER_LEVEL_COUNT : firstUnfinished + 1,
                completed: firstUnfinished === -1,
            };
        }
    } catch { /* Invalid saved data starts a clean learning path. */ }
    return progress;
};

export const $learnProgress = persistentAtom<LearnProgress>('learn-progress', defaultLearnProgress, {
    encode: JSON.stringify,
    decode: decodeLearnProgress,
});

export interface LessonOutcome {
    level: number;
    stars: number;
    advanced: boolean;
    fingerCompleted: boolean;
    saved: boolean;
}

export const updateFingerProgress = (finger: FingerType, wpm: number, accuracy: number, expectedLevel?: number, keyMetrics?: LearnKeyMetrics): LessonOutcome => {
    const progress = $learnProgress.get();
    const current = progress[finger];
    const level = expectedLevel ?? current.currentLevel;
    const valid = Number.isInteger(level) && level >= 1 && level <= current.currentLevel && Number.isFinite(wpm) && wpm >= 0 && Number.isFinite(accuracy) && accuracy >= 0 && accuracy <= 100;
    const stars = valid ? getStarRating(wpm, accuracy)?.stars ?? 0 : 0;
    const outcome: LessonOutcome = { level, stars, advanced: false, fingerCompleted: current.completed, saved: false };
    if (!valid) return outcome;

    const previous = current.levels[level - 1];
    const mastered = stars >= LEVEL_STAR_TARGET && accuracy >= LEVEL_ACCURACY_TARGET;
    const completed = previous.completed || mastered;
    const advanced = mastered && !previous.completed && level === current.currentLevel && level < FINGER_LEVEL_COUNT;
    const keyStats = mergeLearnKeyMetrics(previous.keyStats ?? {}, sanitizeLearnKeyMetrics(keyMetrics, getFingerLevel(finger, level).keys));
    const levels = current.levels.map((entry, index) => index !== level - 1 ? entry : {
        bestWPM: Math.max(entry.bestWPM, wpm),
        bestAccuracy: Math.max(entry.bestAccuracy, accuracy),
        stars: Math.min(LEVEL_STAR_TARGET, Math.max(entry.stars, stars)),
        completed,
        ...(Object.keys(keyStats).length ? { keyStats } : {}),
    });
    const fingerCompleted = levels.every(entry => entry.completed);
    $learnProgress.set({ ...progress, [finger]: {
        bestWPM: Math.max(current.bestWPM, wpm),
        bestAccuracy: Math.max(current.bestAccuracy, accuracy),
        currentLevel: advanced ? level + 1 : current.currentLevel,
        completed: fingerCompleted,
        levels,
    } });
    return { level, stars, advanced, fingerCompleted, saved: true };
};

export const getFingerProgress = (finger: FingerType): FingerProgress => $learnProgress.get()[finger];
export const resetFingerProgress = (finger: FingerType) => $learnProgress.set({ ...$learnProgress.get(), [finger]: emptyFinger() });
export const resetAllLearnProgress = () => $learnProgress.set(emptyProgress());
export const areAllFingersCompleted = (): boolean => getAllFingers().every(finger => $learnProgress.get()[finger].completed);
