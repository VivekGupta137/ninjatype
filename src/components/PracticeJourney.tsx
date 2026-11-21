import { Chip } from "@heroui/react";
import PracticeInfo from "./common/PracticeInfo";
import { KBTYPINGSTATE } from "@/constants/keyboardState";
import { usePracticeJourney } from "@/hooks/usePracticeJourney";
import { readPracticeSettings, settingsLabel } from "@/lib/practiceJourney";

export default function PracticeJourney() {
    const { ready, typingState, latest, comparison } = usePracticeJourney();
    if (!ready || typingState !== KBTYPINGSTATE.IDLE || !latest) return null;
    const settings = readPracticeSettings(latest.practiceSettings);
    const delta = comparison ? latest.wpm - comparison.averageWpm : 0;
    return (
        <section className="practice-journey" aria-label="Previous typing attempt">
            <div className="practice-shortcuts">
                <PracticeInfo label="Previous attempt" href="/history/" hrefLabel="View history"
                    chip={<><span className="practice-secondary">last attempt</span> <span className="practice-previous-speed">{latest.wpm} wpm</span></>}>
                    <div className="pop-stats">
                        <div><span>Speed</span><b>{latest.wpm}<small>WPM</small></b></div>
                        <div><span>Accuracy</span><b>{latest.accuracy}<small>%</small></b></div>
                    </div>
                    <div className="pop-meta">
                        <Chip size="sm" variant="soft">{new Date(latest.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</Chip>
                        {settings && <Chip size="sm" variant="soft">{settingsLabel(settings)}</Chip>}
                    </div>
                    {comparison && (
                        <p className="pop-compare">
                            <Chip size="sm" variant="soft" color={delta >= 0 ? "success" : "danger"}>{delta > 0 ? "+" : ""}{delta} WPM</Chip>
                            <span>vs. your last {comparison.count} matching {comparison.count === 1 ? "test" : "tests"} (avg {comparison.averageWpm} WPM · {comparison.averageAccuracy}%)</span>
                        </p>
                    )}
                    <p className="pop-note">Complete a test, lesson or race each day to build your streak. Progress is saved in this browser.</p>
                </PracticeInfo>
            </div>
        </section>
    );
}
