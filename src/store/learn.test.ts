import { afterEach, beforeEach, describe, expect, test, spyOn } from 'bun:test';
import { FINGER_KEYS, getAllFingers } from '@/constants/fingerKeys';
import { FINGER_LEVELS, generateLevelSentence } from '@/constants/fingerLessons';
import { $learnProgress, decodeLearnProgress, getFingerProgress, resetAllLearnProgress, resetFingerProgress, updateFingerProgress, areAllFingersCompleted } from './learn';
import { getLearnSessionMetrics } from './learnAnalytics';
import { startLearnPractice, $learnKbSentence, $learnKbTypedText, $learnKbTypingState, $learnSessionResult, $learnCurrentLevel } from './learnKeyboard';
import { KBTYPINGSTATE } from '@/constants/keyboardState';

beforeEach(resetAllLearnProgress);
afterEach(() => {
    $learnKbSentence.set('');
    $learnKbTypedText.set('');
    $learnKbTypingState.set(KBTYPINGSTATE.IDLE);
    Reflect.deleteProperty(globalThis, 'window');
    resetAllLearnProgress();
});

describe('compact finger curriculum', () => {
    test('starts with the home pair and adds only that finger pair’s required keys', () => {
        const home = { pointer: ['f', 'j'], middle: ['d', 'k'], ring: ['s', 'l'], pinky: ['a', ';'] };
        for (const finger of getAllFingers()) {
            const levels = FINGER_LEVELS[finger];
            expect(levels).toHaveLength(3);
            expect(levels[0].keys).toEqual(home[finger]);
            expect(new Set(levels[2].keys)).toEqual(new Set(FINGER_KEYS[finger]));
            for (let index = 1; index < levels.length; index++) {
                expect(levels[index].keys.length).toBeGreaterThan(levels[index - 1].keys.length);
                expect(levels[index - 1].keys.every(key => levels[index].keys.includes(key))).toBe(true);
            }
        }
    });

    test('every drill covers every required key without leaking locked keys', () => {
        for (const finger of getAllFingers()) for (let level = 1; level <= 3; level++) {
            for (let attempt = 0; attempt < 10; attempt++) {
                const sentence = generateLevelSentence(finger, level);
                expect(sentence.split(' ')).toHaveLength(10);
                const keys = FINGER_LEVELS[finger][level - 1].keys;
                expect([...sentence].every(key => key === ' ' || keys.includes(key))).toBe(true);
                expect(keys.every(key => sentence.includes(key))).toBe(true);
            }
        }
    });
});

describe('level mastery and saved progress', () => {
    test('unlocks one level, saves mastery, and starts the next with fresh stars and bests', () => {
        expect(updateFingerProgress('pointer', 20, 100, 1)).toMatchObject({ advanced: true, level: 1, stars: 10 });
        const progress = getFingerProgress('pointer');
        expect(progress.currentLevel).toBe(2);
        expect(progress.levels[0]).toMatchObject({ completed: true, stars: 10 });
        expect(progress.levels[1]).toEqual({ bestWPM: 0, bestAccuracy: 0, stars: 0, completed: false });
        expect(progress.completed).toBe(false);
        expect(getFingerProgress('middle').currentLevel).toBe(1);
    });

    test('requires ten stars and 95% in the same completed attempt', () => {
        expect(updateFingerProgress('pointer', 20, 95).advanced).toBe(false); // Accuracy penalty leaves 9 stars.
        expect(updateFingerProgress('pointer', 22, 94.9).advanced).toBe(false);
        expect(updateFingerProgress('pointer', 22, 95).advanced).toBe(true);
    });

    test('does not combine a fast inaccurate attempt with a slow accurate one', () => {
        updateFingerProgress('pointer', 40, 80);
        updateFingerProgress('pointer', 10, 100);
        expect(getFingerProgress('pointer')).toMatchObject({ currentLevel: 1, completed: false });
        expect(getFingerProgress('pointer').levels[0]).toMatchObject({ bestWPM: 40, bestAccuracy: 100, stars: 10, completed: false });
    });

    test('keeps the best star count through weaker retries without accumulating them', () => {
        updateFingerProgress('ring', 16, 100);
        updateFingerProgress('ring', 8, 100);
        expect(getFingerProgress('ring').levels[0].stars).toBe(8);
        expect(getFingerProgress('ring').currentLevel).toBe(1);
    });

    test('replaying an earlier level cannot award or regress the newly unlocked level', () => {
        updateFingerProgress('pointer', 20, 100, 1);
        expect(updateFingerProgress('pointer', 50, 100, 1)).toMatchObject({ saved: true, advanced: false });
        expect(getFingerProgress('pointer').currentLevel).toBe(2);
        expect(getFingerProgress('pointer').levels[1].stars).toBe(0);
    });

    test('locked levels cannot start or receive results, while earlier levels can be retaken', () => {
        startLearnPractice('pointer');
        const sentence = $learnKbSentence.get();
        startLearnPractice('pointer', 3);
        expect($learnKbSentence.get()).toBe(sentence);
        expect(updateFingerProgress('pointer', 20, 100, 3).saved).toBe(false);
        updateFingerProgress('pointer', 20, 100, 1);
        updateFingerProgress('pointer', 20, 100, 2);
        startLearnPractice('pointer', 1);
        expect($learnCurrentLevel.get()).toBe(1);
        expect(getFingerProgress('pointer').currentLevel).toBe(3);
    });

    test('only all three levels complete a finger, and all four fingers complete TypeNinja', () => {
        for (const finger of getAllFingers()) {
            updateFingerProgress(finger, 20, 100, 1);
            updateFingerProgress(finger, 20, 100, 2);
            expect(getFingerProgress(finger).completed).toBe(false);
            expect(updateFingerProgress(finger, 20, 100, 3)).toMatchObject({ advanced: false, fingerCompleted: true });
            expect(getFingerProgress(finger).currentLevel).toBe(3);
        }
        expect(areAllFingersCompleted()).toBe(true);
        updateFingerProgress('pointer', 10, 80, 3);
        expect(areAllFingersCompleted()).toBe(true);
        resetFingerProgress('middle');
        expect(areAllFingersCompleted()).toBe(false);
        expect(getFingerProgress('pointer').completed).toBe(true);
    });

    test('round-trips saved levels and migrates legacy records without inventing mastery', () => {
        updateFingerProgress('pinky', 22, 95);
        expect(decodeLearnProgress(JSON.stringify($learnProgress.get()))).toEqual($learnProgress.get());
        const legacy = decodeLearnProgress(JSON.stringify({ index: { bestWPM: 50, bestAccuracy: 100, completed: true } }));
        expect(legacy.pointer).toMatchObject({ bestWPM: 50, bestAccuracy: 100, currentLevel: 1, completed: false });
        expect(legacy.pointer.levels.every(level => level.stars === 0)).toBe(true);
    });

    test('malformed data and invalid results cannot skip or complete levels', () => {
        for (const saved of ['bad JSON', 'null', '[]', '{"pointer":null}', '{"pointer":{"levels":[null],"bestWPM":"fast"}}', '{"pointer":{"levels":[{"stars":"10","bestAccuracy":"100","completed":true}]}}']) {
            expect(decodeLearnProgress(saved).pointer.currentLevel).toBe(1);
        }
        const skipped = decodeLearnProgress(JSON.stringify({ pointer: { currentLevel: 3, levels: [{}, { stars: 10, bestAccuracy: 100, completed: true }] } }));
        expect(skipped.pointer.currentLevel).toBe(1);
        expect(skipped.pointer.levels[1].completed).toBe(false);
        expect(updateFingerProgress('pointer', Infinity, 100).saved).toBe(false);
        expect(updateFingerProgress('pointer', 30, 101).saved).toBe(false);
    });
});

describe('final-keystroke scoring', () => {
    test('counts the final mistakes and does not round up below the accuracy requirement', () => {
        expect(getLearnSessionMetrics('f'.repeat(100), 'f'.repeat(95) + 'j'.repeat(5), 60)).toEqual({ wpm: 20, accuracy: 95 });
        expect(getLearnSessionMetrics('f'.repeat(99), 'f'.repeat(94) + 'j'.repeat(5), 60).accuracy).toBeLessThan(95);
    });

    test('completion freezes one result and the next drill resumes the new level', () => {
        Object.defineProperty(globalThis, 'window', { value: {}, configurable: true });
        let now = 100_000;
        const clock = spyOn(performance, 'now').mockImplementation(() => now);
        try {
            startLearnPractice('pointer');
            const sentence = $learnKbSentence.get();
            $learnKbTypedText.set(sentence[0]);
            now += sentence.length * 600; // Exactly 20 WPM.
            $learnKbTypedText.set(sentence);
            expect($learnKbTypingState.get()).toBe(KBTYPINGSTATE.COMPLETED);
            expect($learnSessionResult.get()).toMatchObject({ accuracy: 100, wpm: 20, advanced: true, level: 1 });
            expect($learnCurrentLevel.get()).toBe(1); // Results stay on screen until continuing.
            startLearnPractice('pointer');
            expect($learnCurrentLevel.get()).toBe(2);
            expect($learnSessionResult.get()).toBeNull();
            expect(getFingerProgress('pointer').levels[1].stars).toBe(0);
            startLearnPractice('middle');
            expect(getFingerProgress('middle').levels[0].stars).toBe(0);
        } finally { clock.mockRestore(); }
    });
});
