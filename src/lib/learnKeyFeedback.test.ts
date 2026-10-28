import { describe, expect, test } from 'bun:test';
import { captureLearnKeys, emptyLearnKeyCapture, learnKeyHeat, readLearnKeyMetric, mergeLearnKeyMetrics, sanitizeLearnKeyMetrics } from './learnKeyFeedback';
import { decodeLearnProgress, getFingerProgress, resetAllLearnProgress, updateFingerProgress } from '@/store/learn';

describe('finger key measurements', () => {
    test('keeps the first press unmeasured and attributes a mistake to its intended key', () => {
        let capture = captureLearnKeys(emptyLearnKeyCapture(), '', 'f', 'fjf', 100);
        expect(readLearnKeyMetric(capture.keys.f)).toEqual({ accuracy: 100, latency: null });
        capture = captureLearnKeys(capture, 'f', 'fx', 'fjf', 500);
        expect(capture.keys.x).toBeUndefined();
        expect(readLearnKeyMetric(capture.keys.j)).toEqual({ accuracy: 0, latency: null });
        capture = captureLearnKeys(capture, 'fx', 'fxf', 'fjf', 800);
        expect(readLearnKeyMetric(capture.keys.f)).toEqual({ accuracy: 100, latency: 300 });
    });

    test('backspace and correction retain the mistake without counting unchanged suffixes again', () => {
        let capture = captureLearnKeys(emptyLearnKeyCapture(), '', 'xj', 'fj', 100);
        capture = captureLearnKeys(capture, 'xj', 'fj', 'fj', 400);
        expect(capture.keys.j.attempts).toBe(1);
        expect(capture.keys.f).toMatchObject({ attempts: 2, errors: 1 });
        capture = captureLearnKeys(capture, 'fj', '', 'fj', 500);
        capture = captureLearnKeys(capture, '', 'f', 'fj', 700);
        expect(capture.keys.f).toMatchObject({ attempts: 3, errors: 1 });
        expect(readLearnKeyMetric(capture.keys.f).latency).toBe(250);
    });

    test('ignores long pauses and avoids invented zero-latency samples for batched text', () => {
        let capture = captureLearnKeys(emptyLearnKeyCapture(), '', 'f', 'fjj', 100);
        capture = captureLearnKeys(capture, 'f', 'fjj', 'fjj', 7000);
        expect(capture.keys.j).toMatchObject({ attempts: 2, latencySamples: 0, totalLatencyMs: 0 });
        expect(readLearnKeyMetric(capture.keys.j).latency).toBeNull();
    });

    test('uses weighted averages across drills and leaves unmeasured keys neutral', () => {
        const saved = { f: { attempts: 2, errors: 1, latencySamples: 1, totalLatencyMs: 600 } };
        const current = { f: { attempts: 4, errors: 0, latencySamples: 3, totalLatencyMs: 600 } };
        expect(readLearnKeyMetric(mergeLearnKeyMetrics(saved, current).f)).toEqual({ accuracy: 100 * (1 - 1 / 6), latency: 300 });
        expect(learnKeyHeat(undefined, 'latency')).toBeNull();
        expect(learnKeyHeat(undefined, 'accuracy')).toBeNull();
        expect(learnKeyHeat({ attempts: 5, errors: 0, latencySamples: 5, totalLatencyMs: 1000 }, 'latency')).toBe(0);
        expect(learnKeyHeat({ attempts: 5, errors: 1, latencySamples: 5, totalLatencyMs: 5000 }, 'accuracy')).toBe(1);
    });

    test('saves feedback to the practiced level without carrying it to a new level', () => {
        resetAllLearnProgress();
        const stats = { f: { attempts: 4, errors: 1, latencySamples: 3, totalLatencyMs: 900 } };
        updateFingerProgress('pointer', 20, 100, 1, stats);
        expect(getFingerProgress('pointer').levels[0].keyStats).toEqual(stats);
        expect(getFingerProgress('pointer').levels[1].keyStats).toBeUndefined();
        updateFingerProgress('pointer', 15, 100, 1, stats);
        expect(getFingerProgress('pointer').currentLevel).toBe(2);
        expect(getFingerProgress('pointer').levels[0].keyStats?.f.attempts).toBe(8);
        const restored = decodeLearnProgress(JSON.stringify({ pointer: getFingerProgress('pointer') }));
        expect(restored.pointer.levels[0].keyStats).toEqual(getFingerProgress('pointer').levels[0].keyStats);
        resetAllLearnProgress();
    });

    test('drops invalid measurements and data from keys outside the lesson', () => {
        expect(sanitizeLearnKeyMetrics({
            f: { attempts: 1, errors: 2, latencySamples: 1, totalLatencyMs: 200 },
            j: { attempts: 1, errors: 0, latencySamples: 1, totalLatencyMs: Infinity },
            x: { attempts: 1, errors: 0, latencySamples: 1, totalLatencyMs: 200 },
        }, ['f', 'j'])).toEqual({});
    });
});
