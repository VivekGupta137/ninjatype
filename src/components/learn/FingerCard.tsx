import { Chip } from "@heroui/react";
import { useStore } from "@nanostores/react";
import { $learnProgress } from "@/store/learn";
import { getStarTier } from "@/constants/badges";
import { FINGER_LEVEL_COUNT, LEVEL_STAR_TARGET } from '@/constants/fingerLessons';
import { type FingerType } from "@/constants/fingerKeys";
import { fingerHeadingFor, fingerHrefFor, fingerLevelFor, lessonDetailsFor, tr, type LearnLocale } from '@/lib/learnLocale';
import { ArrowUpRight, Check } from "lucide-react";
import StarDisplay from "./StarDisplay";

interface FingerCardProps { finger: FingerType; number: number; recommended: boolean; locale?: LearnLocale }

const FingerCard = ({ finger, number, recommended, locale = 'en' }: FingerCardProps) => {
    const progress = useStore($learnProgress)[finger];
    const level = fingerLevelFor(locale, finger, progress.currentLevel);
    const details = lessonDetailsFor(locale);
    const current = progress.levels[progress.currentLevel - 1];
    const started = progress.currentLevel > 1 || current.bestWPM > 0 || current.bestAccuracy > 0;

    return (
        <a href={fingerHrefFor(locale, finger)} className="learn-lesson-card" data-recommended={recommended}>
            <div className="learn-lesson-top"><span className="learn-lesson-number">0{number}</span><Chip size="sm" variant="soft" color={progress.completed ? 'success' : recommended ? 'accent' : 'default'}><Chip.Label>{progress.completed ? <><Check size={12} /> {tr(locale, 'Completed', 'Abgeschlossen')}</> : recommended ? tr(locale, 'Up next', 'Als Nächstes') : started ? tr(locale, 'In progress', 'In Arbeit') : tr(locale, 'Ready when you are', 'Bereit, wenn du es bist')}</Chip.Label></Chip></div>
            <div className="learn-home-keys" aria-label={tr(locale, "Home keys", "Grundstellungstasten")}>{details[finger].homeKeys.map(key => <kbd className="analytics-key" key={key}>{key}</kbd>)}</div>
            <h3>{fingerHeadingFor(locale, finger)}</h3>
            <p>{details[finger].description}</p>
            <div className="learn-card-level"><span>Level {progress.currentLevel} / {FINGER_LEVEL_COUNT} · {level.name}</span><div className="learn-level-mini-track" aria-label={tr(locale, `${progress.levels.filter(item => item.completed).length} of ${FINGER_LEVEL_COUNT} levels mastered`, `${progress.levels.filter(item => item.completed).length} von ${FINGER_LEVEL_COUNT} Leveln gemeistert`)}>{progress.levels.map((item, index) => <span key={index} data-completed={item.completed} />)}</div></div>
            <div className="learn-lesson-bottom">
                <div><span className="learn-best-stats"><strong>{current.stars} / {LEVEL_STAR_TARGET}</strong> {tr(locale, "stars this level", "Sterne auf diesem Level")}</span><StarDisplay stars={current.stars} tier={getStarTier(current.stars)} size={11} /><span>{progress.completed ? tr(locale, 'All levels mastered', 'Alle Level gemeistert') : tr(locale, 'Unlock with 95% accuracy', 'Mit 95 % Genauigkeit freischalten')}</span></div>
                <ArrowUpRight size={17} />
            </div>
        </a>
    );
};

export default FingerCard;
