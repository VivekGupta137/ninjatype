import { FINGER_NAMES, type FingerType } from "@/constants/fingerKeys";
import { QWERTY_ROWS } from "@/constants/qwertyLayout";
import { keyDisplayLabel } from "@/lib/keypressStats";
import { LESSON_DETAILS } from "./lessonDetails";
import { getFingerLevel } from '@/constants/fingerLessons';

const LessonKeyboard = ({ finger, level = 1 }: { finger: FingerType; level?: number }) => (
    <div className="lesson-keyboard" role="img" aria-label={`${FINGER_NAMES[finger]} level ${level} key map. Practice keys: ${getFingerLevel(finger, level).keys.join(', ')}. Home keys: ${LESSON_DETAILS[finger].homeKeys.join(' and ')}.`}>
        {QWERTY_ROWS.slice(1).map((row, index) => (
            <div className="lesson-keyboard-row" key={index} aria-hidden="true">
                {row.map(key => {
                    const label = keyDisplayLabel(key).toLowerCase();
                    return <kbd key={key} className="analytics-key lesson-key" data-active={getFingerLevel(finger, level).keys.includes(label)} data-home={LESSON_DETAILS[finger].homeKeys.includes(label)}>{label}</kbd>;
                })}
            </div>
        ))}
        <div className="lesson-keyboard-row" aria-hidden="true"><kbd className="analytics-key lesson-space">space</kbd></div>
    </div>
);

export default LessonKeyboard;
