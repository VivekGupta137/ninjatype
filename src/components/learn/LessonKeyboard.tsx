import { type FingerType } from "@/constants/fingerKeys";
import { keyDisplayLabel } from "@/lib/keypressStats";
import {
    fingerLevelFor,
    fingerNamesFor,
    keyboardRowsFor,
    lessonDetailsFor,
    type LearnLocale,
} from "@/lib/learnLocale";

interface LessonKeyboardProps {
    finger: FingerType;
    level?: number;
    /** Lesson locale: "en" (QWERTY) or "de" (QWERTZ). */
    locale?: LearnLocale;
}

const LessonKeyboard = ({ finger, level = 1, locale = "en" }: LessonKeyboardProps) => {
    const rows = keyboardRowsFor(locale);
    const levelKeys = fingerLevelFor(locale, finger, level).keys;
    const details = lessonDetailsFor(locale);
    return (
        <div className="lesson-keyboard" role="img" aria-label={`${fingerNamesFor(locale)[finger]} level ${level} key map. Practice keys: ${levelKeys.join(", ")}. Home keys: ${details[finger].homeKeys.join(" and ")}.`}>
            {rows.map((row, index) => (
                <div className="lesson-keyboard-row" key={index} aria-hidden="true">
                    {row.map(key => {
                        const label = keyDisplayLabel(key).toLowerCase();
                        return <kbd key={key} className="analytics-key lesson-key" data-active={levelKeys.includes(label)} data-home={details[finger].homeKeys.includes(label)}>{label}</kbd>;
                    })}
                </div>
            ))}
            <div className="lesson-keyboard-row" aria-hidden="true"><kbd className="analytics-key lesson-space">space</kbd></div>
        </div>
    );
};

export default LessonKeyboard;
