import { useState } from "react";
import { useStore } from "@nanostores/react";
import { $learnProgress } from "@/store/learn";
import { FINGER_NAMES, getAllFingers, type FingerType } from "@/constants/fingerKeys";
import { ArrowRight, Check, Info, Settings2 } from "lucide-react";
import FingerCard from "./FingerCard";
import LessonKeyboard from "./LessonKeyboard";
import { LESSON_DETAILS } from "./lessonDetails";

const FingerSelection = () => {
    const progress = useStore($learnProgress);
    const fingers = getAllFingers();
    const completed = fingers.filter(finger => progress[finger].completed).length;
    const nextFinger = fingers.find(finger => !progress[finger].completed) ?? fingers[0];
    const [preview, setPreview] = useState<FingerType | null>(null);
    const selected = preview ?? nextFinger;
    const hasProgress = fingers.some(finger => progress[finger].bestWPM > 0 || progress[finger].bestAccuracy > 0);

    return (
        <div className="learn-hub">
            <header className="learn-intro">
                <div>
                    <span className="learn-eyebrow">a little practice, a lasting skill</span>
                    <h1>Learn touch typing.</h1>
                    <p>Learn touch typing, one finger at a time.<br />Find your keys. Build a rhythm. Let muscle memory take over.</p>
                </div>
                <div className="learn-progress-summary">
                    <span className="learn-eyebrow">your learning progress</span>
                    <div className="learn-progress-count"><strong>{completed}<span> / 4</span></strong><span>lessons completed</span></div>
                    <div className="learn-progress-track" role="img" aria-label={`${completed} of 4 lessons completed`}>
                        {fingers.map(finger => <span key={finger} data-completed={progress[finger].completed} />)}
                    </div>
                    <p>{completed === 4 ? 'TypeNinja unlocked. Keep refining your touch.' : 'Small steps. Steadier hands.'}</p>
                </div>
            </header>

            <section className="learn-preview" aria-labelledby="learn-preview-title">
                <div className="learn-preview-copy">
                    <span className="learn-eyebrow">{selected === nextFinger && completed < 4 ? 'your next step' : 'explore a lesson'}</span>
                    <h2 id="learn-preview-title">{FINGER_NAMES[selected]}s</h2>
                    <p>{LESSON_DETAILS[selected].cue}</p>
                    <a className="learn-primary-action" href={`/learn/fingers/${selected}/`}>
                        {progress[selected].completed ? 'Practice again' : hasProgress ? 'Continue learning' : 'Start practicing'}<ArrowRight size={17} />
                    </a>
                    <span className="learn-session-note">10 words · your own pace</span>
                </div>
                <div className="learn-preview-map">
                    <div className="learn-finger-switcher" role="group" aria-label="Preview finger placement">
                        {fingers.map(finger => <button type="button" key={finger} aria-pressed={selected === finger} onClick={() => setPreview(finger)}>{FINGER_NAMES[finger].replace(' Finger', '')}</button>)}
                    </div>
                    <LessonKeyboard finger={selected} />
                    <div className="learn-keyboard-caption"><span><i />practice keys</span><span><kbd>{LESSON_DETAILS[selected].homeKeys[0]}</kbd><kbd>{LESSON_DETAILS[selected].homeKeys[1]}</kbd>home position</span></div>
                </div>
            </section>

            <section className="learn-lessons" aria-labelledby="learn-lessons-title">
                <div className="learn-section-heading"><h2 id="learn-lessons-title">Your practice path</h2><span>Start anywhere. Come back anytime.</span></div>
                <div className="learn-lesson-grid">{fingers.map((finger, index) => <FingerCard key={finger} finger={finger} number={index + 1} recommended={finger === nextFinger && completed < 4} />)}</div>
            </section>

            <aside className="learn-guidance" aria-label="Practice tips">
                <div><Check size={16} /><p><strong>Accuracy before speed.</strong> Keep your eyes on the screen and let your fingers find their way.</p></div>
                <span>Your progress saves automatically.</span>
            </aside>
            <div className="learn-utility-links">
                <a href="/stars"><Info size={14} />How star ratings work</a>
                <a href="/settings/#reset-training-data"><Settings2 size={14} />Manage learning progress</a>
            </div>
        </div>
    );
};

export default FingerSelection;
