import { useStore } from "@nanostores/react";
import { $learnProgress } from "@/store/learn";
import { getStarRating } from "@/constants/badges";
import { FINGER_NAMES, type FingerType } from "@/constants/fingerKeys";
import { ArrowUpRight, Check } from "lucide-react";
import StarDisplay from "./StarDisplay";
import { LESSON_DETAILS } from "./lessonDetails";

interface FingerCardProps { finger: FingerType; number: number; recommended: boolean }

const FingerCard = ({ finger, number, recommended }: FingerCardProps) => {
    const progress = useStore($learnProgress)[finger];
    const rating = getStarRating(progress.bestWPM, progress.bestAccuracy);
    const started = progress.bestWPM > 0 || progress.bestAccuracy > 0;

    return (
        <a href={`/learn/fingers/${finger}/`} className="learn-lesson-card" data-recommended={recommended}>
            <div className="learn-lesson-top"><span className="learn-lesson-number">0{number}</span><span className="learn-lesson-status">{progress.completed ? <><Check size={13} />Completed</> : recommended ? 'Up next' : started ? 'In progress' : 'Ready when you are'}</span></div>
            <div className="learn-home-keys" aria-label="Home keys">{LESSON_DETAILS[finger].homeKeys.map(key => <kbd className="analytics-key" key={key}>{key}</kbd>)}</div>
            <h3>{FINGER_NAMES[finger]}s</h3>
            <p>{LESSON_DETAILS[finger].description}</p>
            <div className="learn-lesson-bottom">
                <div>{started ? <span className="learn-best-stats"><strong>{progress.bestWPM}</strong> wpm <span>·</span> <strong>{progress.bestAccuracy}%</strong> accuracy</span> : <span>Try your first session</span>}{rating && rating.stars > 0 && <StarDisplay stars={rating.stars} tier={rating.tier} size={11} showCount />}</div>
                <ArrowUpRight size={17} />
            </div>
        </a>
    );
};

export default FingerCard;
