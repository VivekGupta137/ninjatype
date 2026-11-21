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

/** Small metric card used for the secondary stats. */
export function MetricCard({ icon, label, value, unit, chip, tone }: { icon: ReactNode; label: string; value: ReactNode; unit?: string; chip?: ReactNode; tone?: "success" | "error" }) {
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

function accuracyLevel(accuracy: number): { label: string; color: "success" | "accent" | "warning" } {
    if (accuracy >= 98) return { label: "Clean", color: "success" };
    if (accuracy >= 94) return { label: "Solid", color: "accent" };
    return { label: "Slow down a touch", color: "warning" };
}

/** Top of the results: the two headline numbers, each with context, plus the actions. */
export default function ResultOverview({ session, actions }: { session: TypingSession; actions: ReactNode }) {
    const history = useStore($history);
    const { comparison } = usePracticeRecommendation(session);
    const best = personalBestSession(history.sessions, history.personalBest);
    const isBest = !!best && best.timestamp === session.timestamp;
    const delta = comparison ? session.wpm - comparison.averageWpm : null;
    const level = accuracyLevel(session.accuracy);

    return (
        <section className="res-overview" aria-label="Session speed and accuracy">
            <Card className="res-stat res-stat--lg" data-tone="success">
                <Card.Content>
                    <span className="res-stat-label"><Gauge size={16} />Speed</span>
                    <span className="res-stat-value">{session.wpm}<small> WPM</small></span>
                    <span className="res-stat-chip">
                        {isBest && <Chip size="sm" variant="soft" color="success"><Award size={12} /><Chip.Label>Personal best</Chip.Label></Chip>}
                        {delta != null
                            ? <Chip size="sm" variant="soft" color={delta >= 0 ? "success" : "danger"}>{delta > 0 ? "+" : ""}{delta} vs your last {comparison!.count}</Chip>
                            : !isBest && <Chip size="sm" variant="soft">First with these settings</Chip>}
                    </span>
                </Card.Content>
            </Card>
            <Card className="res-stat res-stat--lg" data-tone="primary">
                <Card.Content>
                    <span className="res-stat-label"><Target size={16} />Accuracy</span>
                    <span className="res-stat-value">{session.accuracy}<small>%</small></span>
                    <span className="res-stat-chip"><Chip size="sm" variant="soft" color={level.color}>{level.label}</Chip></span>
                </Card.Content>
            </Card>
            <Card className="res-overview-actions">
                <Card.Content>
                    {actions}
                    <ShareResultButton result={practiceShareSnapshot(session)} label="Share result" />
                </Card.Content>
            </Card>
        </section>
    );
}
