import { useStore } from "@nanostores/react";
import { $learnProgress, areAllFingersCompleted } from "@/store/learn";
import { getAllFingers } from "@/constants/fingerKeys";
import { TYPE_NINJA_BADGE } from "@/constants/badges";
import { Info } from "lucide-react";
import FingerCard from "./FingerCard";

const FingerSelection = () => {
    const learnProgress = useStore($learnProgress);
    const allCompleted = areAllFingersCompleted();
    const fingers = getAllFingers();
    const TypeNinjaIcon = TYPE_NINJA_BADGE.icon;

    return (
        <div className="finger-selection-container">
            <div className="learn-header">
                <h1>Learn Touch Typing</h1>
                <p>Practice with each finger individually</p>
                <a href="/stars" className="stars-info-link">
                    <Info size={18} />
                    <span>How star ratings work</span>
                </a>
            </div>

            {allCompleted && (
                <div className="type-ninja-badge">
                    <TypeNinjaIcon size={24} />
                    <span>🎉 {TYPE_NINJA_BADGE.name} Unlocked!</span>
                </div>
            )}

            <div className="finger-cards-grid">
                {fingers.map(finger => (
                    <FingerCard key={finger} finger={finger} />
                ))}
            </div>
        </div>
    );
};

export default FingerSelection;
