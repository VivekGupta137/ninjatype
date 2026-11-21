import type { ReactNode } from "react";
import { useStore } from "@nanostores/react";
import { Card, Chip } from "@heroui/react";
import { Award, Gauge, Target } from "lucide-react";
import type { TypingSession } from "@/store/history";
import { $history } from "@/store/history";
import { personalBestSession } from "@/lib/celebrations";
import { usePracticeRecommendation } from "@/hooks/usePracticeJourney";
import ShareResultButton from "@/components/share/ShareResultButton";
import { practiceShareSnapshot } from "@/lib/shareSession";
import { tr, type LearnLocale } from "@/lib/learnLocale";

/** Small metric card used for the secondary stats. */
export function MetricCard({ icon, label, value, unit, chip, tone }: { icon: ReactNode; label: string; value: ReactNode; unit?: string; chip?: ReactNode; tone?: "success" | "error" | "primary" | "warning" }) {
    return (
        <Card className="res-stat" data-tone={tone}>
            <Card.Content>
                <span className="res-stat-label">{icon}{label}</span>
                <span className="res-stat-value">{value}{unit && <small> {unit}</small>}</span>
                {chip && <span className="res-stat-chip">{chip}</span>}
            </Card.Content>
        </Card>
    );
}

function accuracyLevel(accuracy: number, locale: LearnLocale): { label: string; color: "success" | "accent" | "warning" } {
    if (accuracy >= 98) return { label: tr(locale, "Clean", "Sauber"), color: "success" };
    if (accuracy >= 94) return { label: tr(locale, "Solid", "Solide"), color: "accent" };
    return { label: tr(locale, "Slow down a touch", "Etwas langsamer"), color: "warning" };
}

/** Top of the results: the two headline numbers, each with context, plus the actions. */
export default function ResultOverview({ session, actions, locale = "en" }: { session: TypingSession; actions: ReactNode; locale?: LearnLocale }) {
    const history = useStore($history);
    const { comparison } = usePracticeRecommendation(session, locale);
    const best = personalBestSession(history.sessions, history.personalBest);
    const isBest = !!best && best.timestamp === session.timestamp;
    const delta = comparison ? session.wpm - comparison.averageWpm : null;
    const level = accuracyLevel(session.accuracy, locale);

    return (
        <section className="res-overview" aria-label={tr(locale, "Session speed and accuracy", "Tempo und Genauigkeit der Session")}>
            <Card className="res-stat res-stat--lg" data-tone="success">
                <Card.Content>
                    <span className="res-stat-label"><Gauge size={16} />{tr(locale, "Speed", "Tempo")}</span>
                    <span className="res-stat-value">{session.wpm}<small> WPM</small></span>
                    <span className="res-stat-chip">
                        {isBest && <Chip size="sm" variant="soft" color="success"><Award size={12} /><Chip.Label>{tr(locale, "Personal best", "Personal Best")}</Chip.Label></Chip>}
                        {delta != null
                            ? <Chip size="sm" variant="soft" color={delta >= 0 ? "success" : "danger"}>{delta > 0 ? "+" : ""}{delta} {tr(locale, `vs your last ${comparison!.count}`, `ggü. deinen letzten ${comparison!.count}`)}</Chip>
                            : !isBest && <Chip size="sm" variant="soft">{tr(locale, "First with these settings", "Erster mit diesen Einstellungen")}</Chip>}
                    </span>
                </Card.Content>
            </Card>
            <Card className="res-stat res-stat--lg" data-tone="primary">
                <Card.Content>
                    <span className="res-stat-label"><Target size={16} />{tr(locale, "Accuracy", "Genauigkeit")}</span>
                    <span className="res-stat-value">{session.accuracy}<small>%</small></span>
                    <span className="res-stat-chip"><Chip size="sm" variant="soft" color={level.color}>{level.label}</Chip></span>
                </Card.Content>
            </Card>
            <Card className="res-overview-actions">
                <Card.Content>
                    {actions}
                    <ShareResultButton result={practiceShareSnapshot(session)} label={tr(locale, "Share result", "Ergebnis teilen")} />
                </Card.Content>
            </Card>
        </section>
    );
}
