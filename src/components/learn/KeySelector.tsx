import { useState, type CSSProperties } from 'react';
import { useStore } from '@nanostores/react';
import { FINGER_KEYS, FINGER_NAMES, type FingerType } from '@/constants/fingerKeys';
import { getFingerLevel } from '@/constants/fingerLessons';
import { QWERTY_ROWS } from '@/constants/qwertyLayout';
import { keyDisplayLabel } from '@/lib/keypressStats';
import { learnKeyHeat, mergeLearnKeyMetrics, readLearnKeyMetric } from '@/lib/learnKeyFeedback';
import { $learnKeyCapture, $learnCurrentFinger, $learnCurrentLevel, $learnSessionResult } from '@/store/learnKeyboardState';
import { $learnProgress } from '@/store/learn';
import { LESSON_DETAILS } from './lessonDetails';

const KeySelector = ({ finger, level, nextKey }: { finger: FingerType; level: number; nextKey?: string }) => {
    const [view, setView] = useState<'latency' | 'accuracy'>('latency');
    const keys = getFingerLevel(finger, level).keys;
    const capture = useStore($learnKeyCapture);
    const result = useStore($learnSessionResult);
    const currentFinger = useStore($learnCurrentFinger);
    const currentLevel = useStore($learnCurrentLevel);
    const saved = useStore($learnProgress)[finger].levels[level - 1].keyStats ?? {};
    // Completed attempts have already been merged into saved stats.
    const live = currentFinger === finger && currentLevel === level && !result?.saved ? capture.keys : {};
    const metrics = mergeLearnKeyMetrics(saved, live);
    return (
        <div className="practice-key-map">
            <div className="practice-key-map-heading">
                <span>Level {level} keys <span>{keys.length} keys</span></span>
                <div className="practice-key-views" role="group" aria-label="Key feedback view">
                    <button type="button" aria-pressed={view === 'latency'} onClick={() => setView('latency')}>Key latency</button>
                    <button type="button" aria-pressed={view === 'accuracy'} onClick={() => setView('accuracy')}>Accuracy</button>
                </div>
            </div>
            <div className="lesson-keyboard practice-physical-keyboard" role="group" aria-label={`${FINGER_NAMES[finger]} level ${level} ${view} feedback`}>
                {QWERTY_ROWS.slice(1).map((row, rowIndex) => <div className="lesson-keyboard-row" key={rowIndex}>
                    {row.map(keyId => {
                        const key = keyDisplayLabel(keyId).toLowerCase();
                        const active = keys.includes(key);
                        if (!active) return <kbd key={keyId} className="analytics-key lesson-key" data-active={false} data-locked={FINGER_KEYS[finger].includes(key)} aria-hidden="true">{key}</kbd>;
                        const reading = readLearnKeyMetric(metrics[key]);
                        const heat = learnKeyHeat(metrics[key], view);
                        const tooltip = `${key.toUpperCase()} · Latency: ${reading.latency === null ? 'not recorded yet' : `${Math.round(reading.latency)} ms (${metrics[key].latencySamples} samples)`} · Accuracy: ${reading.accuracy === null ? 'not recorded yet' : `${Math.round(reading.accuracy * 10) / 10}% (${metrics[key].attempts} attempts)`}`;
                        const color = heat === null ? undefined : `color-mix(in srgb, var(--error-color) ${heat * 100}%, var(--success-color))`;
                        return <button type="button" key={keyId} className="analytics-key lesson-key" data-active={true} data-home={LESSON_DETAILS[finger].homeKeys.includes(key)} data-next={nextKey === key} data-feedback={heat !== null} style={{ '--key-feedback-color': color } as CSSProperties} title={tooltip} aria-label={tooltip}>{key}</button>;
                    })}
                </div>)}
                <div className="lesson-keyboard-row"><kbd className="analytics-key lesson-space" data-next={nextKey === ' '} aria-label="Space between words">space</kbd></div>
            </div>
            <div className="practice-key-legend"><span className="practice-feedback-scale" />Needs practice → steady<span>Hover a key for details</span></div>
        </div>
    );
};

export default KeySelector;
