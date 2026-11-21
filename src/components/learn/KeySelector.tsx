import { ToggleButton, ToggleButtonGroup, Tooltip } from '@heroui/react';
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
                <ToggleButtonGroup className="key-group practice-key-views" aria-label="Key feedback view" selectionMode="single" disallowEmptySelection selectedKeys={new Set([view])} onSelectionChange={keys => { const v = Array.from(keys)[0] as 'latency' | 'accuracy' | undefined; if (v) setView(v); }}>
                    <ToggleButton id="latency" className="key-btn key-btn--ghost">Key latency</ToggleButton>
                    <ToggleButton id="accuracy" className="key-btn key-btn--ghost">Accuracy</ToggleButton>
                </ToggleButtonGroup>
            </div>
            <div className="lesson-keyboard practice-physical-keyboard" role="group" aria-label={`${FINGER_NAMES[finger]} level ${level} ${view} feedback`}>
                {QWERTY_ROWS.slice(1).map((row, rowIndex) => <div className="lesson-keyboard-row" key={rowIndex}>
                    {row.map(keyId => {
                        const key = keyDisplayLabel(keyId).toLowerCase();
                        const active = keys.includes(key);
                        if (!active) return <kbd key={keyId} className="analytics-key lesson-key" data-active={false} data-locked={FINGER_KEYS[finger].includes(key)} aria-hidden="true">{key}</kbd>;
                        const reading = readLearnKeyMetric(metrics[key]);
                        const heat = learnKeyHeat(metrics[key], view);
                        const latencyText = reading.latency === null ? 'not recorded yet' : `${Math.round(reading.latency)} ms (${metrics[key].latencySamples} samples)`;
                        const accuracyText = reading.accuracy === null ? 'not recorded yet' : `${Math.round(reading.accuracy * 10) / 10}% (${metrics[key].attempts} attempts)`;
                        const tooltip = `${key.toUpperCase()} · Latency: ${latencyText} · Accuracy: ${accuracyText}`;
                        const color = heat === null ? undefined : `color-mix(in srgb, var(--error-color) ${heat * 100}%, var(--success-color))`;
                        const keyButton = (props: Record<string, unknown>) => <button {...props} type="button" className="analytics-key lesson-key" data-active={true} data-home={LESSON_DETAILS[finger].homeKeys.includes(key)} data-next={nextKey === key} data-feedback={heat !== null} style={{ '--key-feedback-color': color } as CSSProperties} aria-label={tooltip}>{key}</button>;
                        return <Tooltip key={keyId} delay={0} closeDelay={0}>
                            <Tooltip.Trigger<"button"> render={props => keyButton(props as Record<string, unknown>)} />
                            <Tooltip.Content className="key-tip key-tip--pairs">
                                <span className="key-tip-row"><kbd>{key.toUpperCase()}</kbd></span>
                                <span className="key-tip-metric">Latency</span><strong>{latencyText}</strong>
                                <span className="key-tip-metric">Accuracy</span><strong>{accuracyText}</strong>
                            </Tooltip.Content>
                        </Tooltip>;
                    })}
                </div>)}
                <div className="lesson-keyboard-row"><kbd className="analytics-key lesson-space" data-next={nextKey === ' '} aria-label="Space between words">space</kbd></div>
            </div>
            <div className="practice-key-legend"><span className="practice-feedback-scale" />Needs practice → steady<span>Hover a key for details</span></div>
        </div>
    );
};

export default KeySelector;
