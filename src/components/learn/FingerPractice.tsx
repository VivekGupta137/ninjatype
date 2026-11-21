import { Chip, ToggleButton, ToggleButtonGroup } from "@heroui/react";
import KeyButton from "@/components/ui/KeyButton";
import KeyLink from "@/components/ui/KeyLink";
import { InfoTip } from "@/components/ui/InfoTip";
import ShareResultButton from '@/components/share/ShareResultButton';
import { useEffect, useRef } from "react";
import { useStore } from "@nanostores/react";
import { $learnKbState, $learnKbTypingState, $learnKbSentence, $learnCurrentLevel, $learnSessionResult, startLearnPractice } from "@/store/learnKeyboard";
import { $learnRawWPM, $learnAccuracy } from "@/store/learnAnalytics";
import { $learnProgress } from "@/store/learn";
import { getAllFingers, type FingerType } from "@/constants/fingerKeys";
import { getStarTier } from "@/constants/badges";
import { FINGER_LEVEL_COUNT, LEVEL_STAR_TARGET, LEVEL_ACCURACY_TARGET } from '@/constants/fingerLessons';
import { fingerHeadingFor, fingerHrefFor, fingerLevelFor, fingerLevelsFor, fingerNamesFor, learnHrefFor, lessonDetailsFor, tr, type LearnLocale } from '@/lib/learnLocale';
import { KBSTATE, KBTYPINGSTATE } from "@/constants/keyboardState";
import { ArrowLeft, ArrowRight, RotateCcw, Info, Check, LockKeyhole, MousePointer2 } from "lucide-react";
import Paragraph from "../keyboard/Paragraph";
import KeySelector from "./KeySelector";
import StarDisplay from "./StarDisplay";
import useFocus from "@/hooks/useFocus";
import { useLearnTypedText } from "@/hooks/useLearnTypedText";

const FingerPractice = ({ finger, locale = 'en' }: { finger: FingerType; locale?: LearnLocale }) => {
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
    const level = fingerLevelFor(locale, finger, currentLevel);
    const levelProgress = best.levels[currentLevel - 1];
    const replaying = currentLevel < best.currentLevel && !result?.advanced;
    useEffect(() => { startLearnPractice(finger, undefined, locale); }, [finger, locale]);
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
            <nav className="practice-navigation" aria-label={tr(locale, "Learning navigation", "Lern-Navigation")}>
                <KeyLink variant="ghost" size="sm" href={learnHrefFor(locale)}><ArrowLeft size={15} />{tr(locale, "All lessons", "Alle Lektionen")}</KeyLink>
                <div className="practice-lesson-steps" aria-label={tr(locale, "Finger lessons", "Finger-Lektionen")}>
                    {fingers.map((item, index) => <KeyLink key={item} variant="ghost" size="sm" isActive={finger === item} href={fingerHrefFor(locale, item)} aria-current={finger === item ? 'page' : undefined} aria-label={tr(locale, `Lesson ${index + 1}: ${fingerNamesFor(locale)[item]}`, `Lektion ${index + 1}: ${fingerNamesFor(locale)[item]}`)}><span>0{index + 1}</span><span>{fingerHeadingFor(locale, item)}</span></KeyLink>)}
                </div>
            </nav>

            <header className="practice-heading">
                <div><span className="learn-eyebrow">{tr(locale, "finger", "Finger")} 0{lessonIndex + 1} / 04 · {tr(locale, "level", "Level")} {currentLevel} / {FINGER_LEVEL_COUNT}</span><h1>{fingerHeadingFor(locale, finger)}</h1><p>{level.name}. {level.cue}</p></div>
                <div className="practice-personal-best"><span className="learn-eyebrow">{tr(locale, "this level's best", "Bestwert dieses Levels")}</span>{levelProgress.bestWPM > 0 || levelProgress.bestAccuracy > 0 ? <p><strong>{levelProgress.bestWPM}</strong> wpm <span>·</span> <strong>{levelProgress.bestAccuracy}%</strong> {tr(locale, "accuracy", "Genauigkeit")}</p> : <p>{tr(locale, "A fresh level. Start with a light touch.", "Ein neues Level. Fang mit leichtem Druck an.")}</p>}</div>
            </header>

            <section className="practice-levels" aria-label={tr(locale, "Finger level progress", "Level-Fortschritt")}>
                <ToggleButtonGroup className="key-group practice-level-path" aria-label={tr(locale, "Choose a level", "Level wählen")} selectionMode="single" disallowEmptySelection selectedKeys={new Set([String(currentLevel)])} onSelectionChange={keys => { const v = Number(Array.from(keys)[0]); if (v && v <= best.currentLevel) chooseLevel(v); }}>
                    {fingerLevelsFor(locale)[finger].map((item, index) => {
                        const locked = index + 1 > best.currentLevel;
                        const done = best.levels[index].completed;
                        return <ToggleButton key={item.name} id={String(index + 1)} isDisabled={locked} className="key-btn key-btn--ghost practice-level-key" aria-label={tr(locale, `Level ${index + 1}: ${item.name}${locked ? ', locked' : done ? ', retake' : ', practice'}`, `Level ${index + 1}: ${item.name}${locked ? ', gesperrt' : done ? ', Wiederholung' : ', Übung'}`)}>
                            <span className="practice-level-number">{done ? <Check size={13} /> : locked ? <LockKeyhole size={12} /> : index + 1}</span>
                            <span className="practice-level-text"><strong>{item.name}</strong><small>Level {index + 1}{locked ? tr(locale, " · locked", " · gesperrt") : done ? tr(locale, " · retake", " · Wiederholung") : ''}</small></span>
                        </ToggleButton>;
                    })}
                </ToggleButtonGroup>
                <div className="practice-level-goal"><span><strong>{levelProgress.stars} / {LEVEL_STAR_TARGET} {tr(locale, "stars", "Sterne")}</strong> {tr(locale, "this level", "auf diesem Level")}</span><StarDisplay stars={levelProgress.stars} tier={getStarTier(levelProgress.stars)} size={13} /><p>{replaying ? tr(locale, `Review this level. Your progress through level ${best.currentLevel} stays saved.`, `Level wiederholen. Dein Fortschritt bis Level ${best.currentLevel} bleibt gespeichert.`) : tr(locale, `Reach ${LEVEL_STAR_TARGET} stars and ${LEVEL_ACCURACY_TARGET}% accuracy in one session. Stars reset for each new level.`, `Erreiche ${LEVEL_STAR_TARGET} Sterne und ${LEVEL_ACCURACY_TARGET} % Genauigkeit in einer Session. Sterne starten bei jedem Level neu.`)}</p></div>
            </section>

            <section className="practice-session" aria-label={tr(locale, "Typing exercise", "Tippübung")} data-complete={isComplete}>
                <div className="practice-session-toolbar">
                    <Chip size="md" variant="soft" color={isComplete ? 'success' : started || isFocused ? 'accent' : 'default'}><Chip.Label>{isComplete ? tr(locale, 'Session complete', 'Session abgeschlossen') : started ? tr(locale, 'In your rhythm', 'Im Rhythmus') : tr(locale, 'Ready when you are', 'Bereit, wenn du es bist')}</Chip.Label></Chip>
                    <div className="practice-live-stats" aria-label={tr(locale, "Session statistics", "Session-Statistik")}><span><strong>{started ? wpm : '—'}</strong> wpm</span><span><strong>{started ? `${accuracy}%` : '—'}</strong> {tr(locale, 'accuracy', 'Genauigkeit')}</span><span><strong>{finishedWords}<span> / {wordCount}</span></strong> {tr(locale, 'words', 'Wörter')}</span></div>
                </div>
                <div className="practice-progress" role="progressbar" aria-label={tr(locale, "Words completed", "Wörter abgeschlossen")} aria-valuenow={finishedWords} aria-valuemin={0} aria-valuemax={wordCount}><span style={{ width: `${finishedWords / wordCount * 100}%` }} /></div>

                <div className="practice-writing-area">
                    <div id="keyboard-container" data-kb-loaded={sentence ? 1 : 0}>
                        <div id="keyboard-wrapper" data-kb-focused={isFocused || isComplete ? 1 : 0}>
                            <input value={typedText} onChange={handleInputChange} onPaste={event => event.preventDefault()} onDrop={event => event.preventDefault()} ref={keyboardInputRef} type="text" id="kb-hidden-input" autoComplete="off" autoCapitalize="none" autoCorrect="off" spellCheck={false} readOnly={isComplete} aria-label={tr(locale, `${fingerNamesFor(locale)[finger]} level ${currentLevel} typing practice`, `${fingerNamesFor(locale)[finger]}-Übung, Level ${currentLevel}`)} aria-describedby="practice-instructions" />
                            {!isComplete && <div id="keyboard-overlay" data-kb-focused={isFocused ? 1 : 0}><MousePointer2 size={18} /><span>{tr(locale, "Click here to continue", "Hier klicken, um fortzufahren")}</span></div>}
                            <div id="keyboard" data-kb-focused={isFocused || isComplete ? 1 : 0}><Paragraph paragraphText={sentence} typedText={typedText} isActive={!isComplete} /></div>
                        </div>
                    </div>
                    {!sentence && <p className="practice-loading">{tr(locale, 'Preparing your practice…', 'Übung wird vorbereitet…')}</p>}
                </div>

                <div className="practice-session-footer">
                    <p id="practice-instructions">{isComplete ? tr(locale, 'Your session is saved automatically.', 'Deine Session wird automatisch gespeichert.') : tr(locale, 'Type the letters above. Use space to move to the next word.', 'Tippe die Buchstaben oben. Mit der Leertaste geht es zum nächsten Wort.')}</p>
                    <KeyButton variant="ghost" size="sm" onPress={isComplete && result?.advanced ? () => chooseLevel(best.currentLevel) : resetPractice}><RotateCcw size={14} />{isComplete && result?.advanced ? tr(locale, 'Next level', 'Nächstes Level') : tr(locale, 'Restart', 'Neustart')}</KeyButton>
                </div>
            </section>

            {isComplete && result && <section className="practice-result" aria-labelledby="practice-result-title" aria-live="polite">
                <div><span className="practice-result-label"><Check size={14} />{result.saved ? tr(locale, 'Practice saved', 'Übung gespeichert') : tr(locale, 'Progress updated elsewhere', 'Fortschritt woanders aktualisiert')}</span><h2 id="practice-result-title">{!result.saved ? tr(locale, 'Resume your current level.', 'Setze dein aktuelles Level fort.') : result.advanced ? tr(locale, `Level ${currentLevel + 1} unlocked!`, `Level ${currentLevel + 1} freigeschaltet!`) : replaying ? tr(locale, `Level ${currentLevel} practiced.`, `Level ${currentLevel} geübt.`) : result.fingerCompleted ? tr(locale, 'All three levels mastered.', 'Alle drei Level gemeistert.') : accuracy < LEVEL_ACCURACY_TARGET ? tr(locale, 'Find your accuracy first.', 'Finde zuerst deine Genauigkeit.') : tr(locale, 'Build a little more speed.', 'Baue etwas mehr Tempo auf.')}</h2><p>{!result.saved ? tr(locale, 'Your saved level changed during this drill. Start a fresh drill to continue.', 'Dein gespeichertes Level hat sich während der Übung geändert. Starte eine neue Übung, um fortzufahren.') : result.advanced ? tr(locale, `You mastered ${level.name.toLowerCase()}. Level ${currentLevel + 1} starts at 0 stars, with new keys to learn.`, `Du hast „${level.name}“ gemeistert. Level ${currentLevel + 1} startet bei 0 Sternen, mit neuen Tasten.`) : replaying ? tr(locale, `Your key feedback is updated. Level ${best.currentLevel} remains unlocked.`, 'Dein Tasten-Feedback ist aktualisiert. Level ' + best.currentLevel + ' bleibt freigeschaltet.') : result.fingerCompleted ? tr(locale, 'Your finger training is complete. Keep practicing or try another finger pair.', 'Dein Finger-Training ist abgeschlossen. Übe weiter oder probiere ein anderes Fingerpaar.') : tr(locale, `Earn ${LEVEL_STAR_TARGET} stars with at least ${LEVEL_ACCURACY_TARGET}% accuracy in the same session to unlock ${currentLevel < FINGER_LEVEL_COUNT ? 'the next level' : 'finger mastery'}.`, `Verdiene ${LEVEL_STAR_TARGET} Sterne mit mindestens ${LEVEL_ACCURACY_TARGET} % Genauigkeit in derselben Session, um ${currentLevel < FINGER_LEVEL_COUNT ? 'das nächste Level' : 'die Finger-Meisterschaft'} freizuschalten.`)}</p><StarDisplay stars={result.stars} tier={getStarTier(result.stars)} size={14} showCount /></div>
                <div className="learn-completion-actions">{replaying || !result.saved ? <><KeyButton onPress={resetPractice}>{tr(locale, 'Retake again', 'Nochmal wiederholen')}</KeyButton><KeyButton variant="primary" onPress={() => chooseLevel(best.currentLevel)}>{tr(locale, 'Resume level', 'Level fortsetzen')} {best.currentLevel}<ArrowRight size={15} /></KeyButton></> : result.fingerCompleted && result.saved ? <><KeyButton onPress={resetPractice}>{tr(locale, 'Practice again', 'Nochmal üben')}</KeyButton><KeyLink variant="primary" href={nextFinger ? fingerHrefFor(locale, nextFinger) : learnHrefFor(locale)}>{nextFinger ? tr(locale, 'Next finger', 'Nächster Finger') : tr(locale, 'All lessons', 'Alle Lektionen')}<ArrowRight size={15} /></KeyLink></> : <KeyButton variant="primary" onPress={result.advanced ? () => chooseLevel(best.currentLevel) : resetPractice}>{result.advanced ? tr(locale, `Start level ${currentLevel + 1}`, `Level ${currentLevel + 1} starten`) : tr(locale, 'Practice again', 'Nochmal üben')}<ArrowRight size={15} /></KeyButton>}<ShareResultButton result={{ challenge: 'learn', wpm: result.wpm, accuracy: result.accuracy, speed: 'raw', detail: `${fingerNamesFor(locale)[finger]} · Level ${currentLevel}` }} /></div>
            </section>}

            <section className="practice-guide" aria-labelledby="practice-guide-title">
                <div className="practice-guide-copy"><span className="learn-eyebrow">{tr(locale, "let your fingers find the way", "lass die Finger ihren Weg finden")}</span><h2 id="practice-guide-title">{tr(locale, "Always come home.", "Kehre immer heim.")}</h2><div className="practice-home-anchors">{lessonDetailsFor(locale)[finger].homeKeys.map(key => <kbd className="analytics-key" key={key}>{key}</kbd>)}<span>{tr(locale, "your home position", "deine Grundstellung")}</span></div><p>{lessonDetailsFor(locale)[finger].cue}</p><InfoTip label={tr(locale, "How star ratings work", "So funktionieren Sternebewertungen")} href="/stars/" hrefLabel={tr(locale, "Read the star guide →", "Sterneguide lesen →")}>{tr(locale, `Each level awards up to ${LEVEL_STAR_TARGET} stars from your speed and accuracy. Reach ${LEVEL_STAR_TARGET} stars with ${LEVEL_ACCURACY_TARGET}% accuracy in one session to unlock the next level.`, `Jedes Level vergibt bis zu ${LEVEL_STAR_TARGET} Sterne für Tempo und Genauigkeit. Erreiche ${LEVEL_STAR_TARGET} Sterne mit ${LEVEL_ACCURACY_TARGET} % Genauigkeit in einer Session, um das nächste Level freizuschalten.`)}</InfoTip></div>
                <KeySelector finger={finger} level={currentLevel} nextKey={isFocused ? nextKey : undefined} locale={locale} />
            </section>
            <p className="practice-closing-note">{tr(locale, 'Accuracy first. Speed will follow.', 'Erst Genauigkeit. Dann Tempo.')}</p>
        </div>
    );
};

export default FingerPractice;
