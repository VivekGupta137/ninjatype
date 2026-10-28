import { useStore } from "@nanostores/react";
import { $learnProgress } from "@/store/learn";
import { getStarTier } from "@/constants/badges";
import { FINGER_LEVEL_COUNT, LEVEL_STAR_TARGET, getFingerLevel } from '@/constants/fingerLessons';
import { FINGER_NAMES, type FingerType } from "@/constants/fingerKeys";
import { ArrowUpRight, Check } from "lucide-react";
import StarDisplay from "./StarDisplay";
import { LESSON_DETAILS } from "./lessonDetails";

interface FingerCardProps { finger: FingerType; number: number; recommended: boolean }

const FingerCard = ({ finger, number, recommended }: FingerCardProps) => {
    const progress = useStore($learnProgress)[finger];
    const level = getFingerLevel(finger, progress.currentLevel);
    const current = progress.levels[progress.currentLevel - 1];
    const started = progress.currentLevel > 1 || current.bestWPM > 0 || current.bestAccuracy > 0;

    return (
        <a href={`/learn/fingers/${finger}/`} className="learn-lesson-card" data-recommended={recommended}>
            <div className="learn-lesson-top"><span className="learn-lesson-number">0{number}</span><span className="learn-lesson-status">{progress.completed ? <><Check size={13} />Completed</> : recommended ? 'Up next' : started ? 'In progress' : 'Ready when you are'}</span></div>
            <div className="learn-home-keys" aria-label="Home keys">{LESSON_DETAILS[finger].homeKeys.map(key => <kbd className="analytics-key" key={key}>{key}</kbd>)}</div>
            <h3>{FINGER_NAMES[finger]}s</h3>
            <p>{LESSON_DETAILS[finger].description}</p>
            <div className="learn-card-level"><span>Level {progress.currentLevel} / {FINGER_LEVEL_COUNT} · {level.name}</span><div className="learn-level-mini-track" aria-label={`${progress.levels.filter(item => item.completed).length} of ${FINGER_LEVEL_COUNT} levels mastered`}>{progress.levels.map((item, index) => <span key={index} data-completed={item.completed} />)}</div></div>
            <div className="learn-lesson-bottom">
                <div><span className="learn-best-stats"><strong>{current.stars} / {LEVEL_STAR_TARGET}</strong> stars this level</span><StarDisplay stars={current.stars} tier={getStarTier(current.stars)} size={11} /><span>{progress.completed ? 'All levels mastered' : 'Unlock with 95% accuracy'}</span></div>
                <ArrowUpRight size={17} />
            </div>
        </a>
    );
};

export default FingerCard;
