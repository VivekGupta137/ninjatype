import PracticeInfo from "./common/PracticeInfo";
import { KBTYPINGSTATE } from "@/constants/keyboardState";
import { usePracticeJourney } from "@/hooks/usePracticeJourney";
import { readPracticeSettings, settingsLabel } from "@/lib/practiceJourney";

export default function PracticeJourney() {
    const { ready, typingState, latest, comparison } = usePracticeJourney();
    if (!ready || typingState !== KBTYPINGSTATE.IDLE || !latest) return null;
    const settings = readPracticeSettings(latest.practiceSettings);
    return (
        <section className="practice-journey" aria-label="Previous typing attempt">
            <div className="practice-shortcuts">
                <div className="practice-shortcut">
                    <span className="practice-secondary">last attempt</span>
                    <span className="practice-previous-speed">{latest.wpm} wpm</span>
                </div>
                <PracticeInfo label="Previous attempt details">
                    <p>{latest.wpm} WPM · {latest.accuracy}% accuracy. Completed {new Date(latest.timestamp).toLocaleDateString()}.</p>
                    {settings && <p>Settings: {settingsLabel(settings)}.</p>}
                    {comparison && <p>Previous {comparison.count} matching tests: {comparison.averageWpm} WPM · {comparison.averageAccuracy}% accuracy on average.</p>}
                    <p>Complete a typing test, finger lesson, or race each day to build your practice streak. Progress is saved in this browser; clearing typing history also clears your streak. <a href="/history/">View history →</a></p>
                </PracticeInfo>
            </div>
        </section>
    );
}
