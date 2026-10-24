import { useRef } from "react";
import { useStore } from "@nanostores/react";
import { $learnKbState, $learnKbTypingState, $learnKbSentence, regenerateLearnSentence } from "@/store/learnKeyboard";
import { $learnRawWPM, $learnAccuracy } from "@/store/learnAnalytics";
import { $learnProgress } from "@/store/learn";
import { FINGER_NAMES, getAllFingers, type FingerType } from "@/constants/fingerKeys";
import { getStarRating } from "@/constants/badges";
import { KBSTATE, KBTYPINGSTATE } from "@/constants/keyboardState";
import { ArrowLeft, ArrowRight, RotateCcw, Info, Check, MousePointer2 } from "lucide-react";
import { LESSON_DETAILS } from "./lessonDetails";
import Paragraph from "../keyboard/Paragraph";
import KeySelector from "./KeySelector";
import StarDisplay from "./StarDisplay";
import useFocus from "@/hooks/useFocus";
import { useLearnTypedText } from "@/hooks/useLearnTypedText";

const FingerPractice = ({ finger }: { finger: FingerType }) => {
    const keyboardInputRef = useRef<HTMLInputElement>(null);
    const { doFocus } = useFocus(keyboardInputRef, true, $learnKbState);
    const { typedText, handleInputChange } = useLearnTypedText({ focusKeyboard: doFocus });
    const kbState = useStore($learnKbState);
    const typingState = useStore($learnKbTypingState);
    const sentence = useStore($learnKbSentence);
    const wpm = useStore($learnRawWPM);
    const accuracy = useStore($learnAccuracy);
    const best = useStore($learnProgress)[finger];
    const isFocused = kbState === KBSTATE.FOCUSSED;
    const isComplete = typingState === KBTYPINGSTATE.COMPLETED;
    const started = typedText.length > 0;
    const fingers = getAllFingers();
    const lessonIndex = fingers.indexOf(finger);
    const nextFinger = fingers[lessonIndex + 1];
    const rating = getStarRating(wpm, accuracy);
    const words = sentence.trim().split(' ');
    const typedWords = typedText.split(' ');
    const wordCount = sentence ? words.length : 10;
    const finishedWords = isComplete ? wordCount : Math.min(wordCount, typedWords.length - 1);
    const nextKey = isComplete ? undefined : words[typedWords.length - 1]?.[typedWords[typedWords.length - 1].length] ?? ' ';

    const resetPractice = () => {
        regenerateLearnSentence();
        doFocus();
    };

    return (
        <div className="finger-practice-container practice-workspace">
            <nav className="practice-navigation" aria-label="Learning navigation">
                <a href="/learn"><ArrowLeft size={15} />All lessons</a>
                <div className="practice-lesson-steps" aria-label="Finger lessons">
                    {fingers.map((item, index) => <a key={item} href={`/learn/fingers/${item}`} aria-current={finger === item ? 'page' : undefined} aria-label={`Lesson ${index + 1}: ${FINGER_NAMES[item]}`}><span>0{index + 1}</span><span>{FINGER_NAMES[item].replace(' Finger', '')}</span></a>)}
                </div>
            </nav>

            <header className="practice-heading">
                <div><span className="learn-eyebrow">lesson 0{lessonIndex + 1} / 04 · finger foundations</span><h1>{FINGER_NAMES[finger]}s</h1><p>Find your rhythm. A light touch goes a long way.</p></div>
                <div className="practice-personal-best"><span className="learn-eyebrow">your personal best</span>{best.bestWPM > 0 || best.bestAccuracy > 0 ? <p><strong>{best.bestWPM}</strong> wpm <span>·</span> <strong>{best.bestAccuracy}%</strong> accuracy</p> : <p>Your first session starts here.</p>}</div>
            </header>

            <section className="practice-session" aria-label="Typing exercise" data-complete={isComplete}>
                <div className="practice-session-toolbar">
                    <span className="practice-session-status"><i data-active={started || isFocused} />{isComplete ? 'Session complete' : started ? 'In your rhythm' : 'Ready when you are'}</span>
                    <div className="practice-live-stats" aria-label="Session statistics"><span><strong>{started ? wpm : '—'}</strong> wpm</span><span><strong>{started ? `${accuracy}%` : '—'}</strong> accuracy</span><span><strong>{finishedWords}<span> / {wordCount}</span></strong> words</span></div>
                </div>
                <div className="practice-progress" role="progressbar" aria-label="Words completed" aria-valuenow={finishedWords} aria-valuemin={0} aria-valuemax={wordCount}><span style={{ width: `${finishedWords / wordCount * 100}%` }} /></div>

                <div className="practice-writing-area">
                    <div id="keyboard-container" data-kb-loaded={sentence ? 1 : 0}>
                        <div id="keyboard-wrapper" data-kb-focused={isFocused || isComplete ? 1 : 0}>
                            <input value={typedText} onChange={handleInputChange} ref={keyboardInputRef} type="text" id="kb-hidden-input" autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} readOnly={isComplete} aria-label={`${FINGER_NAMES[finger]} typing practice`} aria-describedby="practice-instructions" />
                            {!isComplete && <div id="keyboard-overlay" data-kb-focused={isFocused ? 1 : 0}><MousePointer2 size={18} /><span>Click here to continue</span></div>}
                            <div id="keyboard" data-kb-focused={isFocused || isComplete ? 1 : 0}><Paragraph paragraphText={sentence} typedText={typedText} isActive={!isComplete} /></div>
                        </div>
                    </div>
                    {!sentence && <p className="practice-loading">Preparing your practice…</p>}
                </div>

                <div className="practice-session-footer">
                    <p id="practice-instructions">{isComplete ? 'Your session is saved automatically.' : 'Type the letters above. Use space to move to the next word.'}</p>
                    <button type="button" onClick={resetPractice}><RotateCcw size={14} />Restart</button>
                </div>
            </section>

            {isComplete && <section className="practice-result" aria-labelledby="practice-result-title">
                <div><span className="practice-result-label"><Check size={14} />Practice saved</span><h2 id="practice-result-title">{accuracy >= 70 ? 'A little more muscle memory.' : 'Slow down. Find your accuracy.'}</h2><p>{accuracy >= 70 ? 'Keep practicing for a steadier touch, or move on to the next finger.' : 'Aim for 70% accuracy to complete this lesson. Take your time with each key.'}</p>{rating && rating.stars > 0 && <StarDisplay stars={rating.stars} tier={rating.tier} size={14} showCount />}</div>
                <div className="learn-completion-actions"><button type="button" className="practice-secondary-action" onClick={resetPractice}>Practice again</button><a className="learn-primary-action" href={nextFinger ? `/learn/fingers/${nextFinger}` : '/learn'}>{nextFinger ? 'Next lesson' : 'All lessons'}<ArrowRight size={15} /></a></div>
            </section>}

            <section className="practice-guide" aria-labelledby="practice-guide-title">
                <div className="practice-guide-copy"><span className="learn-eyebrow">let your fingers find the way</span><h2 id="practice-guide-title">Always come home.</h2><div className="practice-home-anchors">{LESSON_DETAILS[finger].homeKeys.map(key => <kbd className="analytics-key" key={key}>{key}</kbd>)}<span>your home position</span></div><p>{LESSON_DETAILS[finger].cue}</p><a href="/stars"><Info size={13} />How star ratings work</a></div>
                <KeySelector finger={finger} nextKey={isFocused ? nextKey : undefined} onToggle={doFocus} />
            </section>
            <p className="practice-closing-note">Accuracy first. Speed will follow.</p>
        </div>
    );
};

export default FingerPractice;
