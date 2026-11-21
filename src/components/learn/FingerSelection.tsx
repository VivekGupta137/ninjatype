import { ToggleButton, ToggleButtonGroup } from "@heroui/react";
import KeyLink from "@/components/ui/KeyLink";
import TextLink from "@/components/ui/TextLink";
import { InfoTip } from "@/components/ui/InfoTip";
import { useState } from "react";
import { useStore } from "@nanostores/react";
import { $learnProgress } from "@/store/learn";
import { getAllFingers, type FingerType } from "@/constants/fingerKeys";
import { fingerHeadingFor, fingerHrefFor, fingerLevelFor, fingerShortLabelFor, lessonDetailsFor, tr, type LearnLocale } from "@/lib/learnLocale";
import { ArrowRight, Check, Info, Settings2 } from "lucide-react";
import FingerCard from "./FingerCard";
import LessonKeyboard from "./LessonKeyboard";
import { FINGER_LEVEL_COUNT, LEVEL_STAR_TARGET, LEVEL_ACCURACY_TARGET } from '@/constants/fingerLessons';

const FingerSelection = ({ locale = 'en' }: { locale?: LearnLocale }) => {
    const progress = useStore($learnProgress);
    const fingers = getAllFingers();
    const completed = fingers.filter(finger => progress[finger].completed).length;
    const nextFinger = fingers.find(finger => !progress[finger].completed) ?? fingers[0];
    const [preview, setPreview] = useState<FingerType | null>(null);
    const selected = preview ?? nextFinger;
    const selectedLevel = progress[selected].currentLevel;
    const levelsCompleted = fingers.reduce((total, finger) => total + progress[finger].levels.filter(level => level.completed).length, 0);
    const hasProgress = fingers.some(finger => progress[finger].bestWPM > 0 || progress[finger].bestAccuracy > 0);

    return (
        <div className="learn-hub">
            <header className="learn-intro">
                <div>
                    <span className="learn-eyebrow">{tr(locale, "a little practice, a lasting skill", "ein wenig Übung, eine bleibende Fähigkeit")}</span>
                    <h1>{tr(locale, "Learn touch typing.", "Tippen lernen.")}</h1>
                    <p>{tr(locale, "Learn touch typing, one finger at a time.", "Tippen lernen, ein Finger nach dem anderen.")}<br />{tr(locale, "Find your keys. Build a rhythm. Let muscle memory take over.", "Finde deine Tasten. Baue einen Rhythmus auf. Lass den Muskelspeicher übernehmen.")}</p>
                </div>
                <div className="learn-progress-summary">
                    <span className="learn-eyebrow">{tr(locale, "your learning progress", "dein Lernfortschritt")}</span>
                    <div className="learn-progress-count"><strong>{levelsCompleted}<span> / {fingers.length * FINGER_LEVEL_COUNT}</span></strong><span>{tr(locale, "levels mastered", "Level gemeistert")}</span></div>
                    <div className="learn-progress-track" role="img" aria-label={`${levelsCompleted} of ${fingers.length * FINGER_LEVEL_COUNT} levels mastered`}>
                        {fingers.flatMap(finger => progress[finger].levels.map((level, index) => <span key={`${finger}-${index}`} data-completed={level.completed} />))}
                    </div>
                    <p>{completed === 4 ? tr(locale, 'TypeNinja unlocked. Keep refining your touch.', 'TypeNinja freigeschaltet. Feinschliff geht weiter.') : tr(locale, 'Small steps. Steadier hands.', 'Kleine Schritte. Sicherere Hände.')}</p>
                </div>
            </header>

            <section className="learn-preview" aria-labelledby="learn-preview-title">
                <div className="learn-preview-copy">
                    <span className="learn-eyebrow">{selected === nextFinger && completed < 4 ? tr(locale, 'your next step', 'dein nächster Schritt') : tr(locale, 'explore a lesson', 'eine Lektion ansehen')}</span>
                    <h2 id="learn-preview-title">{fingerHeadingFor(locale, selected)}</h2>
                    <p>{tr(locale, "Level", "Level")} {selectedLevel}: {fingerLevelFor(locale, selected, selectedLevel).name}. {fingerLevelFor(locale, selected, selectedLevel).cue}</p>
                    <KeyLink variant="primary" href={fingerHrefFor(locale, selected)}>
                        {progress[selected].completed ? tr(locale, 'Practice again', 'Nochmal üben') : hasProgress ? tr(locale, 'Continue learning', 'Weiterlernen') : tr(locale, 'Start practicing', 'Jetzt üben')}<ArrowRight size={16} />
                    </KeyLink>
                    <span className="learn-session-note">{tr(locale, "10 words", "10 Wörter")} · {LEVEL_STAR_TARGET} {tr(locale, "stars + 95% accuracy to unlock", "Sterne + 95 % Genauigkeit zum Freischalten")}</span>
                </div>
                <div className="learn-preview-map">
                    <ToggleButtonGroup className="key-group learn-finger-switcher" aria-label={tr(locale, "Preview finger placement", "Fingerplatzierung ansehen")} selectionMode="single" disallowEmptySelection selectedKeys={new Set([selected])} onSelectionChange={keys => { const v = Array.from(keys)[0] as FingerType | undefined; if (v) setPreview(v); }}>
                        {fingers.map(finger => <ToggleButton key={finger} id={finger} className="key-btn key-btn--ghost">{fingerShortLabelFor(locale, finger)}</ToggleButton>)}
                    </ToggleButtonGroup>
                    <LessonKeyboard finger={selected} level={selectedLevel} locale={locale} />
                    <div className="learn-keyboard-caption"><span><i />{tr(locale, "practice keys", "Übungstasten")}</span><span><kbd>{lessonDetailsFor(locale)[selected].homeKeys[0]}</kbd><kbd>{lessonDetailsFor(locale)[selected].homeKeys[1]}</kbd>{tr(locale, "home position", "Grundstellung")}</span></div>
                </div>
            </section>

            <section className="learn-lessons" aria-labelledby="learn-lessons-title">
                <div className="learn-section-heading"><h2 id="learn-lessons-title">{tr(locale, "Your practice path", "Dein Übungsplan")}</h2><span>{tr(locale, "Four finger pairs. Three focused levels each.", "Vier Fingerpaare. Drei fokussierte Level pro Paar.")}</span></div>
                <div className="learn-lesson-grid">{fingers.map((finger, index) => <FingerCard key={finger} finger={finger} number={index + 1} locale={locale} recommended={finger === nextFinger && completed < 4} />)}</div>
            </section>

            <aside className="learn-guidance" aria-label={tr(locale, "Practice tips", "Übungstipps")}>
                <div><Check size={16} /><p><strong>{tr(locale, "Accuracy before speed.", "Genauigkeit vor Tempo.")}</strong> {tr(locale, "Keep your eyes on the screen and let your fingers find their way.", "Halte die Augen auf dem Bildschirm und lass die Finger ihren Weg finden.")}</p></div>
                <span>{tr(locale, "Your progress saves automatically.", "Dein Fortschritt wird automatisch gespeichert.")}</span>
            </aside>
            <div className="learn-utility-links">
                <InfoTip label={tr(locale, "How star ratings work", "So funktionieren Sternebewertungen")} href="/stars/" hrefLabel={tr(locale, "Read the star guide →", "Sterneguide lesen →")}>{tr(locale, `Each level awards up to ${LEVEL_STAR_TARGET} stars from your speed and accuracy. Reach ${LEVEL_STAR_TARGET} stars with ${LEVEL_ACCURACY_TARGET}% accuracy in one session to unlock the next level.`, `Jedes Level vergibt bis zu ${LEVEL_STAR_TARGET} Sterne für Tempo und Genauigkeit. Erreiche ${LEVEL_STAR_TARGET} Sterne mit ${LEVEL_ACCURACY_TARGET} % Genauigkeit in einer Session, um das nächste Level freizuschalten.`)}</InfoTip>
                <TextLink variant="muted" size="sm" href="/settings/#reset-training-data" icon={<Settings2 size={14} />}>{tr(locale, "Manage learning progress", "Lernfortschritt verwalten")}</TextLink>
            </div>
        </div>
    );
};

export default FingerSelection;
