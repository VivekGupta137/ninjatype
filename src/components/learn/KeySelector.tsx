import { useEffect } from "react";
import { useStore } from "@nanostores/react";
import { initializeLearnKeys, toggleLearnKey, $learnKeys } from "@/store/learnKeyboard";
import { FINGER_KEYS, type FingerType } from "@/constants/fingerKeys";
import { QWERTY_ROWS } from "@/constants/qwertyLayout";
import { keyDisplayLabel } from "@/lib/keypressStats";
import { LESSON_DETAILS } from "./lessonDetails";

const KeySelector = ({ finger, nextKey, onToggle }: { finger: FingerType; nextKey?: string; onToggle?: () => void }) => {
    const keys = FINGER_KEYS[finger];
    const learnKeys = useStore($learnKeys);
    const activeKeys = learnKeys.length ? learnKeys.filter(key => key.active).map(key => key.key) : keys;

    useEffect(() => { initializeLearnKeys(keys, finger); }, [keys, finger]);

    return (
        <div className="practice-key-map">
            <div className="practice-key-map-heading"><span>Practice keys <span>{activeKeys.length} selected</span></span><span>Click a highlighted key to toggle</span></div>
            <div className="lesson-keyboard practice-physical-keyboard" role="group" aria-label="Choose practice keys">
                {QWERTY_ROWS.slice(1).map((row, rowIndex) => <div className="lesson-keyboard-row" key={rowIndex}>
                    {row.map(keyId => {
                        const key = keyDisplayLabel(keyId).toLowerCase();
                        const assigned = keys.includes(key);
                        const active = activeKeys.includes(key);
                        const home = LESSON_DETAILS[finger].homeKeys.includes(key);
                        return assigned ? <button type="button" key={keyId} className="analytics-key lesson-key" data-active={active} data-home={home} data-next={nextKey === key && active} aria-pressed={active} aria-label={`Toggle ${key} key - currently ${active ? 'enabled' : 'disabled'}`} disabled={active && activeKeys.length === 1} onClick={() => { toggleLearnKey(key); onToggle?.(); }}>{key}</button> : <kbd key={keyId} className="analytics-key lesson-key" data-active={false} aria-hidden="true">{key}</kbd>;
                    })}
                </div>)}
                <div className="lesson-keyboard-row"><kbd className="analytics-key lesson-space" data-next={nextKey === ' '} aria-label="Space between words">space</kbd></div>
            </div>
            <div className="practice-key-legend"><span><i />practice keys</span><span><i />next key</span><span>Keep at least one key selected</span></div>
        </div>
    );
};

export default KeySelector;
