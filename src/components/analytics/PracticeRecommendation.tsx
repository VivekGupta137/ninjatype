import { Chip } from "@heroui/react";
import { ArrowRight, Compass } from "lucide-react";
import KeyButton from "@/components/ui/KeyButton";
import KeyLink from "@/components/ui/KeyLink";
import TextLink from "@/components/ui/TextLink";
import type { TypingSession } from "@/store/history";
import { usePracticeRecommendation } from "@/hooks/usePracticeJourney";
import { readPracticeSettings, settingsLabel } from "@/lib/practiceJourney";
import { tr, type LearnLocale } from "@/lib/learnLocale";

/** Recommendation content for the results "next" card: a clear title, the reason in plain sight, then one action. */
export default function PracticeRecommendation({ session, locale = "en" }: { session: TypingSession; locale?: LearnLocale }) {
    const { recommendation, comparison, practise } = usePracticeRecommendation(session, locale);
    const settings = readPracticeSettings(session.practiceSettings);
    return (
        <section className="practice-recommendation" aria-label={tr(locale, "Suggested next practice", "Vorgeschlagene nächste Übung")}>
            <div className="rec-head">
                <Chip size="sm" variant="soft" color="accent"><Compass size={12} aria-hidden="true" /><Chip.Label>{tr(locale, "Recommended", "Empfohlen")}</Chip.Label></Chip>
                <h3 className="rec-title">{recommendation.title}</h3>
            </div>
            <p className="rec-reason">{recommendation.reason}</p>
            {(settings || comparison) && (
                <div className="rec-meta">
                    {settings && <Chip size="sm" variant="soft">{tr(locale, "This test:", "Dieser Test:")} {settingsLabel(settings)}</Chip>}
                    {comparison && <Chip size="sm" variant="soft">{tr(locale, `Previous ${comparison.count}`, `Letzte ${comparison.count}`)}: {comparison.averageWpm} WPM · {comparison.averageAccuracy}%</Chip>}
                </div>
            )}
            <div className="rec-actions">
                {recommendation.href
                    ? <KeyLink variant="primary" href={recommendation.href}>{recommendation.label}<ArrowRight size={14} aria-hidden="true" /></KeyLink>
                    : <KeyButton variant="primary" onPress={practise}>{recommendation.label}<ArrowRight size={14} aria-hidden="true" /></KeyButton>}
                <TextLink variant="muted" size="sm" href="/history/">{tr(locale, "Review history", "Verlauf ansehen")}</TextLink>
            </div>
        </section>
    );
}
