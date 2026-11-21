import { ToggleButton, ToggleButtonGroup, Tooltip } from '@heroui/react';
import { useState, type CSSProperties } from 'react';
import { useStore } from '@nanostores/react';
import { type FingerType } from '@/constants/fingerKeys';
import { fingerLevelFor, fingerKeysFor, fingerNamesFor, keyboardRowsFor, lessonDetailsFor, tr, type LearnLocale } from '@/lib/learnLocale';
import { keyDisplayLabel } from '@/lib/keypressStats';
import { learnKeyHeat, mergeLearnKeyMetrics, readLearnKeyMetric } from '@/lib/learnKeyFeedback';
import { $learnKeyCapture, $learnCurrentFinger, $learnCurrentLevel, $learnSessionResult } from '@/store/learnKeyboardState';
import { $learnProgress } from '@/store/learn';

const KeySelector = ({ finger, level, nextKey, locale = 'en' }: { finger: FingerType; level: number; nextKey?: string; locale?: LearnLocale }) => {
    const [view, setView] = useState<'latency' | 'accuracy'>('latency');
    const keys = fingerLevelFor(locale, finger, level).keys;
    const fingerKeys = fingerKeysFor(locale)[finger];
    const details = lessonDetailsFor(locale);
    const rows = keyboardRowsFor(locale);
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
                <span>{tr(locale, `Level ${level} keys`, `Level ${level}: Tasten`)} <span>{keys.length} {tr(locale, "keys", "Tasten")}</span></span>
                <ToggleButtonGroup className="key-group practice-key-views" aria-label={tr(locale, "Key feedback view", "Tasten-Feedback")} selectionMode="single" disallowEmptySelection selectedKeys={new Set([view])} onSelectionChange={keys => { const v = Array.from(keys)[0] as 'latency' | 'accuracy' | undefined; if (v) setView(v); }}>
                    <ToggleButton id="latency" className="key-btn key-btn--ghost">{tr(locale, "Key latency", "Tasten-Latenz")}</ToggleButton>
                    <ToggleButton id="accuracy" className="key-btn key-btn--ghost">{tr(locale, "Accuracy", "Genauigkeit")}</ToggleButton>
                </ToggleButtonGroup>
            </div>
            <div className="lesson-keyboard practice-physical-keyboard" role="group" aria-label={tr(locale, `${fingerNamesFor(locale)[finger]} level ${level} ${view} feedback`, `${fingerNamesFor(locale)[finger]} Level ${level}: ${view === 'latency' ? 'Latenz' : 'Genauigkeit'}-Feedback`)}>
                {rows.map((row, rowIndex) => <div className="lesson-keyboard-row" key={rowIndex}>
                    {row.map(keyId => {
                        const key = keyDisplayLabel(keyId).toLowerCase();
                        const active = keys.includes(key);
                        if (!active) return <kbd key={keyId} className="analytics-key lesson-key" data-active={false} data-locked={fingerKeys.includes(key)} aria-hidden="true">{key}</kbd>;
                        const reading = readLearnKeyMetric(metrics[key]);
                        const heat = learnKeyHeat(metrics[key], view);
                        const latencyText = reading.latency === null ? tr(locale, 'not recorded yet', 'noch nicht erfasst') : `${Math.round(reading.latency)} ms (${metrics[key].latencySamples} ${tr(locale, 'samples', 'Messungen')})`;
                        const accuracyText = reading.accuracy === null ? tr(locale, 'not recorded yet', 'noch nicht erfasst') : `${Math.round(reading.accuracy * 10) / 10}% (${metrics[key].attempts} ${tr(locale, 'attempts', 'Versuche')})`;
                        const tooltip = `${key.toUpperCase()} · ${tr(locale, 'Latency:', 'Latenz:')} ${latencyText} · ${tr(locale, 'Accuracy:', 'Genauigkeit:')} ${accuracyText}`;
                        const color = heat === null ? undefined : `color-mix(in srgb, var(--error-color) ${heat * 100}%, var(--success-color))`;
                        const keyButton = (props: Record<string, unknown>) => <button {...props} type="button" className="analytics-key lesson-key" data-active={true} data-home={details[finger].homeKeys.includes(key)} data-next={nextKey === key} data-feedback={heat !== null} style={{ '--key-feedback-color': color } as CSSProperties} aria-label={tooltip}>{key}</button>;
                        return <Tooltip key={keyId} delay={0} closeDelay={0}>
                            <Tooltip.Trigger<"button"> render={props => keyButton(props as Record<string, unknown>)} />
                            <Tooltip.Content className="key-tip key-tip--pairs">
                                <span className="key-tip-row"><kbd>{key.toUpperCase()}</kbd></span>
                                <span className="key-tip-metric">{tr(locale, "Latency", "Latenz")}</span><strong>{latencyText}</strong>
                                <span className="key-tip-metric">{tr(locale, "Accuracy", "Genauigkeit")}</span><strong>{accuracyText}</strong>
                            </Tooltip.Content>
                        </Tooltip>;
                    })}
                </div>)}
                <div className="lesson-keyboard-row"><kbd className="analytics-key lesson-space" data-next={nextKey === ' '} aria-label={tr(locale, "Space between words", "Leertaste zwischen Wörtern")}>space</kbd></div>
            </div>
            <div className="practice-key-legend"><span className="practice-feedback-scale" />{tr(locale, "Needs practice → steady", "Braucht Übung → sicher")}<span>{tr(locale, "Hover a key for details", "Taste für Details ansehen")}</span></div>
        </div>
    );
};

export default KeySelector;
