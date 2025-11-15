import { useStore } from "@nanostores/react";
import { $learnProgress } from "@/store/learn";
import { getStarRating } from "@/constants/badges";
import { FINGER_NAMES, type FingerType } from "@/constants/fingerKeys";
import { CheckCircle2, Circle } from "lucide-react";
import StarDisplay from "./StarDisplay";

interface FingerCardProps {
    finger: FingerType;
}

const FingerCard = ({ finger }: FingerCardProps) => {
    const learnProgress = useStore($learnProgress);
    const progress = learnProgress[finger];
    const starRating = getStarRating(progress.bestWPM, progress.bestAccuracy);

    return (
        <a 
            href={`/learn/fingers/${finger}`}
            className="finger-card"
            data-completed={progress.completed}
        >
            <div className="finger-card-header">
                <h3>{FINGER_NAMES[finger]}</h3>
                {progress.completed ? (
                    <CheckCircle2 size={20} className="completion-icon" />
                ) : (
                    <Circle size={20} className="completion-icon incomplete" />
                )}
            </div>
            
            <div className="finger-card-stats">
                {progress.bestWPM > 0 ? (
                    <>
                        <div className="stat-item">
                            <span className="stat-value">{progress.bestWPM}</span>
                            <span className="stat-label">WPM</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{progress.bestAccuracy}%</span>
                            <span className="stat-label">Accuracy</span>
                        </div>
                    </>
                ) : (
                    <div className="no-data">Not started</div>
                )}
            </div>

            {starRating && starRating.stars > 0 && (
                <div className="finger-card-stars">
                    <StarDisplay 
                        stars={starRating.stars} 
                        tier={starRating.tier}
                        size={14}
                        showCount
                    />
                </div>
            )}
        </a>
    );
};

export default FingerCard;
