import PracticeInfo from "@/components/common/PracticeInfo";
import type { TypingSession } from "@/store/history";
import { usePracticeRecommendation } from "@/hooks/usePracticeJourney";
import { readPracticeSettings, settingsLabel } from "@/lib/practiceJourney";

export default function PracticeRecommendation({ session }: { session: TypingSession }) {
    const { recommendation, comparison, practise } = usePracticeRecommendation(session);
    const settings = readPracticeSettings(session.practiceSettings);
    return (
        <section className="practice-recommendation" aria-label="Suggested next practice">
            <span className="practice-secondary">next</span>
            {recommendation.href ? <a className="practice-next" href={recommendation.href}>{recommendation.label} →</a> :
                <button type="button" className="practice-next" onClick={practise}>{recommendation.label} →</button>}
            <PracticeInfo label="Why this recommendation?">
                    <p>{recommendation.reason}</p>
                    {settings && <p>This test: {settingsLabel(settings)}.</p>}
                    {comparison && <p>Previous {comparison.count} matching tests averaged {comparison.averageWpm} WPM and {comparison.averageAccuracy}% accuracy. Compare both, not speed alone.</p>}
                    <a href="/history/">Review history →</a>
            </PracticeInfo>
        </section>
    );
}
