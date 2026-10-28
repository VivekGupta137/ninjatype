import { useEffect, useRef } from "react";
import { useStore } from "@nanostores/react";
import { $learnKbState, $learnKbTypingState, $learnKbSentence, $learnCurrentLevel, $learnSessionResult, startLearnPractice } from "@/store/learnKeyboard";
import { $learnRawWPM, $learnAccuracy } from "@/store/learnAnalytics";
import { $learnProgress } from "@/store/learn";
import { FINGER_NAMES, getAllFingers, type FingerType } from "@/constants/fingerKeys";
import { getStarTier } from "@/constants/badges";
import { FINGER_LEVELS, FINGER_LEVEL_COUNT, LEVEL_STAR_TARGET, LEVEL_ACCURACY_TARGET, getFingerLevel } from '@/constants/fingerLessons';
import { KBSTATE, KBTYPINGSTATE } from "@/constants/keyboardState";
import { ArrowLeft, ArrowRight, RotateCcw, Info, Check, LockKeyhole, MousePointer2 } from "lucide-react";
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
    const currentLevel = useStore($learnCurrentLevel);
    const result = useStore($learnSessionResult);
    const level = getFingerLevel(finger, currentLevel);
    const levelProgress = best.levels[currentLevel - 1];
    const replaying = currentLevel < best.currentLevel && !result?.advanced;
    useEffect(() => { startLearnPractice(finger); }, [finger]);
    const isFocused = kbState === KBSTATE.FOCUSSED;
    const isComplete = typingState === KBTYPINGSTATE.COMPLETED;
    const started = typedText.length > 0;
    const fingers = getAllFingers();
    const lessonIndex = fingers.indexOf(finger);
    const nextFinger = fingers[lessonIndex + 1];
    const words = sentence.trim().split(' ');
    const typedWords = typedText.split(' ');
    const wordCount = sentence ? words.length : 10;
    const finishedWords = isComplete ? wordCount : Math.min(wordCount, typedWords.length - 1);
    const nextKey = isComplete ? undefined : words[typedWords.length - 1]?.[typedWords[typedWords.length - 1].length] ?? ' ';

    const resetPractice = () => {
        startLearnPractice(finger, currentLevel);
        doFocus();
    };
    const chooseLevel = (levelNumber: number) => {
        startLearnPractice(finger, levelNumber);
        doFocus();
    };

    return (
        <div className="finger-practice-container practice-workspace">
            <nav className="practice-navigation" aria-label="Learning navigation">
                <a href="/learn/"><ArrowLeft size={15} />All lessons</a>
                <div className="practice-lesson-steps" aria-label="Finger lessons">
                    {fingers.map((item, index) => <a key={item} href={`/learn/fingers/${item}/`} aria-current={finger === item ? 'page' : undefined} aria-label={`Lesson ${index + 1}: ${FINGER_NAMES[item]}`}><span>0{index + 1}</span><span>{FINGER_NAMES[item].replace(' Finger', '')}</span></a>)}
                </div>
            </nav>

            <header className="practice-heading">
                <div><span className="learn-eyebrow">finger 0{lessonIndex + 1} / 04 · level {currentLevel} / {FINGER_LEVEL_COUNT}</span><h1>{FINGER_NAMES[finger]}s</h1><p>{level.name}. {level.cue}</p></div>
                <div className="practice-personal-best"><span className="learn-eyebrow">this level's best</span>{levelProgress.bestWPM > 0 || levelProgress.bestAccuracy > 0 ? <p><strong>{levelProgress.bestWPM}</strong> wpm <span>·</span> <strong>{levelProgress.bestAccuracy}%</strong> accuracy</p> : <p>A fresh level. Start with a light touch.</p>}</div>
            </header>

            <section className="practice-levels" aria-label="Finger level progress">
                <ol className="practice-level-path">
                    {FINGER_LEVELS[finger].map((item, index) => <li key={item.name} data-current={index + 1 === currentLevel} data-completed={best.levels[index].completed} data-locked={index + 1 > best.currentLevel} aria-current={index + 1 === currentLevel ? 'step' : undefined}>
                        <button type="button" disabled={index + 1 > best.currentLevel} aria-label={`Level ${index + 1}: ${item.name}${index + 1 > best.currentLevel ? ', locked' : best.levels[index].completed ? ', retake' : ', practice'}`} onClick={() => chooseLevel(index + 1)}><span className="practice-level-number">{best.levels[index].completed ? <Check size={13} /> : index + 1 > best.currentLevel ? <LockKeyhole size={12} /> : index + 1}</span><span><strong>{item.name}</strong><span>Level {index + 1}{index + 1 > best.currentLevel ? ' · locked' : best.levels[index].completed ? ' · retake' : ''}</span></span></button>
                    </li>)}
                </ol>
                <div className="practice-level-goal"><span><strong>{levelProgress.stars} / {LEVEL_STAR_TARGET} stars</strong> this level</span><StarDisplay stars={levelProgress.stars} tier={getStarTier(levelProgress.stars)} size={13} /><p>{replaying ? `Review this level. Your progress through level ${best.currentLevel} stays saved.` : `Reach ${LEVEL_STAR_TARGET} stars and ${LEVEL_ACCURACY_TARGET}% accuracy in one session. Stars reset for each new level.`}</p></div>
            </section>

            <section className="practice-session" aria-label="Typing exercise" data-complete={isComplete}>
                <div className="practice-session-toolbar">
                    <span className="practice-session-status"><i data-active={started || isFocused} />{isComplete ? 'Session complete' : started ? 'In your rhythm' : 'Ready when you are'}</span>
                    <div className="practice-live-stats" aria-label="Session statistics"><span><strong>{started ? wpm : '—'}</strong> wpm</span><span><strong>{started ? `${accuracy}%` : '—'}</strong> accuracy</span><span><strong>{finishedWords}<span> / {wordCount}</span></strong> words</span></div>
                </div>
                <div className="practice-progress" role="progressbar" aria-label="Words completed" aria-valuenow={finishedWords} aria-valuemin={0} aria-valuemax={wordCount}><span style={{ width: `${finishedWords / wordCount * 100}%` }} /></div>

                <div className="practice-writing-area">
                    <div id="keyboard-container" data-kb-loaded={sentence ? 1 : 0}>
                        <div id="keyboard-wrapper" data-kb-focused={isFocused || isComplete ? 1 : 0}>
                            <input value={typedText} onChange={handleInputChange} onPaste={event => event.preventDefault()} onDrop={event => event.preventDefault()} ref={keyboardInputRef} type="text" id="kb-hidden-input" autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} readOnly={isComplete} aria-label={`${FINGER_NAMES[finger]} level ${currentLevel} typing practice`} aria-describedby="practice-instructions" />
                            {!isComplete && <div id="keyboard-overlay" data-kb-focused={isFocused ? 1 : 0}><MousePointer2 size={18} /><span>Click here to continue</span></div>}
                            <div id="keyboard" data-kb-focused={isFocused || isComplete ? 1 : 0}><Paragraph paragraphText={sentence} typedText={typedText} isActive={!isComplete} /></div>
                        </div>
                    </div>
                    {!sentence && <p className="practice-loading">Preparing your practice…</p>}
                </div>

                <div className="practice-session-footer">
                    <p id="practice-instructions">{isComplete ? 'Your session is saved automatically.' : 'Type the letters above. Use space to move to the next word.'}</p>
                    <button type="button" onClick={isComplete && result?.advanced ? () => chooseLevel(best.currentLevel) : resetPractice}><RotateCcw size={14} />{isComplete && result?.advanced ? 'Next level' : 'Restart'}</button>
                </div>
            </section>

            {isComplete && result && <section className="practice-result" aria-labelledby="practice-result-title" aria-live="polite">
                <div><span className="practice-result-label"><Check size={14} />{result.saved ? 'Practice saved' : 'Progress updated elsewhere'}</span><h2 id="practice-result-title">{!result.saved ? 'Resume your current level.' : result.advanced ? `Level ${currentLevel + 1} unlocked!` : replaying ? `Level ${currentLevel} practiced.` : result.fingerCompleted ? 'All three levels mastered.' : accuracy < LEVEL_ACCURACY_TARGET ? 'Find your accuracy first.' : 'Build a little more speed.'}</h2><p>{!result.saved ? 'Your saved level changed during this drill. Start a fresh drill to continue.' : result.advanced ? `You mastered ${level.name.toLowerCase()}. Level ${currentLevel + 1} starts at 0 stars, with new keys to learn.` : replaying ? `Your key feedback is updated. Level ${best.currentLevel} remains unlocked.` : result.fingerCompleted ? 'Your finger training is complete. Keep practicing or try another finger pair.' : `Earn ${LEVEL_STAR_TARGET} stars with at least ${LEVEL_ACCURACY_TARGET}% accuracy in the same session to unlock ${currentLevel < FINGER_LEVEL_COUNT ? 'the next level' : 'finger mastery'}.`}</p><StarDisplay stars={result.stars} tier={getStarTier(result.stars)} size={14} showCount /></div>
                <div className="learn-completion-actions">{replaying || !result.saved ? <><button type="button" className="practice-secondary-action" onClick={resetPractice}>Retake again</button><button type="button" className="learn-primary-action" onClick={() => chooseLevel(best.currentLevel)}>Resume level {best.currentLevel}<ArrowRight size={15} /></button></> : result.fingerCompleted && result.saved ? <><button type="button" className="practice-secondary-action" onClick={resetPractice}>Practice again</button><a className="learn-primary-action" href={nextFinger ? `/learn/fingers/${nextFinger}/` : '/learn/'}>{nextFinger ? 'Next finger' : 'All lessons'}<ArrowRight size={15} /></a></> : <button type="button" className="learn-primary-action" onClick={result.advanced ? () => chooseLevel(best.currentLevel) : resetPractice}>{result.advanced ? `Start level ${currentLevel + 1}` : 'Practice again'}<ArrowRight size={15} /></button>}</div>
            </section>}

            <section className="practice-guide" aria-labelledby="practice-guide-title">
                <div className="practice-guide-copy"><span className="learn-eyebrow">let your fingers find the way</span><h2 id="practice-guide-title">Always come home.</h2><div className="practice-home-anchors">{LESSON_DETAILS[finger].homeKeys.map(key => <kbd className="analytics-key" key={key}>{key}</kbd>)}<span>your home position</span></div><p>{LESSON_DETAILS[finger].cue}</p><a href="/stars/"><Info size={13} />How star ratings work</a></div>
                <KeySelector finger={finger} level={currentLevel} nextKey={isFocused ? nextKey : undefined} />
            </section>
            <p className="practice-closing-note">Accuracy first. Speed will follow.</p>
        </div>
    );
};

export default FingerPractice;
