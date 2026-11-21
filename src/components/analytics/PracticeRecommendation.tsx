import { Chip } from "@heroui/react";
import { ArrowRight, Compass } from "lucide-react";
import KeyButton from "@/components/ui/KeyButton";
import KeyLink from "@/components/ui/KeyLink";
import TextLink from "@/components/ui/TextLink";
import type { TypingSession } from "@/store/history";
import { usePracticeRecommendation } from "@/hooks/usePracticeJourney";
import { readPracticeSettings, settingsLabel } from "@/lib/practiceJourney";

/** Recommendation content for the results "next" card: a clear title, the reason in plain sight, then one action. */
export default function PracticeRecommendation({ session }: { session: TypingSession }) {
    const { recommendation, comparison, practise } = usePracticeRecommendation(session);
    const settings = readPracticeSettings(session.practiceSettings);
    return (
        <section className="practice-recommendation" aria-label="Suggested next practice">
            <div className="rec-head">
                <Chip size="sm" variant="soft" color="accent"><Compass size={12} aria-hidden="true" /><Chip.Label>Recommended</Chip.Label></Chip>
                <h3 className="rec-title">{recommendation.title}</h3>
            </div>
            <p className="rec-reason">{recommendation.reason}</p>
            {(settings || comparison) && (
                <div className="rec-meta">
                    {settings && <Chip size="sm" variant="soft">This test: {settingsLabel(settings)}</Chip>}
                    {comparison && <Chip size="sm" variant="soft">Previous {comparison.count}: {comparison.averageWpm} WPM · {comparison.averageAccuracy}%</Chip>}
                </div>
            )}
            <div className="rec-actions">
                {recommendation.href
                    ? <KeyLink variant="primary" href={recommendation.href}>{recommendation.label}<ArrowRight size={14} aria-hidden="true" /></KeyLink>
                    : <KeyButton variant="primary" onPress={practise}>{recommendation.label}<ArrowRight size={14} aria-hidden="true" /></KeyButton>}
                <TextLink variant="muted" size="sm" href="/history/">Review history</TextLink>
            </div>
        </section>
    );
}
