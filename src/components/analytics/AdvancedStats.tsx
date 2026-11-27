import { useMemo } from "react";
import { useStore } from "@nanostores/react";
import { Card, Chip } from "@heroui/react";
import { Hand, Waves, Zap } from "lucide-react";
import { $keypressEvents } from "@/store/analytics";
import { burstSustained, consistencyScore, fingerLoad, type AdvancedView } from "@/lib/advancedStats";
import { tr, type LearnLocale } from "@/lib/learnLocale";
import HandsChart from "./HandsChart";
import "@/styles/results.css";

const consistencyLabel = (score: number, locale: LearnLocale) =>
    score >= 75 ? { text: tr(locale, "Steady", "Gleichmäßig"), color: "success" as const }
        : score >= 50 ? { text: tr(locale, "Some wobble", "Leicht unruhig"), color: "accent" as const }
            : { text: tr(locale, "Uneven", "Ungleichmäßig"), color: "warning" as const };

/** Advanced stats for the session just completed. */
export default function AdvancedStats({ locale = "en" }: { locale?: LearnLocale }) {
    const events = useStore($keypressEvents);
    const view = useMemo<Pick<AdvancedView, "rhythm" | "pace" | "fingers">>(() => {
        const layout = locale === "de" ? "qwertz" : "qwerty";
        return {
            rhythm: consistencyScore(events),
            pace: burstSustained(events),
            fingers: locale === "en" || locale === "de" ? fingerLoad(events, layout) : [],
        };
    }, [events, locale]);
    if (events.length === 0) return null;
    return <AdvancedStatsView view={view} locale={locale} />;
}

/** Presentational panel, shared by the results page (one session) and /history/ (aggregate). */
export function AdvancedStatsView({ view, locale = "en", id }: { view: Pick<AdvancedView, "rhythm" | "pace" | "fingers">; locale?: LearnLocale; id?: string }) {
    const { rhythm, pace, fingers } = view;

    return (
        <section className="adv-stats" id={id} aria-label={tr(locale, "Advanced stats", "Erweiterte Statistiken")}>
            <div className="adv-stats-row">
                <Card>
                    <Card.Header><div className="res-card-head"><Waves size={16} aria-hidden="true" /><Card.Title>{tr(locale, "Rhythm", "Rhythmus")}</Card.Title></div>
                        <Card.Description>{tr(locale, "How even the gaps between keystrokes are.", "Wie gleichmäßig die Abstände zwischen Anschlägen sind.")}</Card.Description></Card.Header>
                    <Card.Content>
                        {rhythm ? (<>
                            <span className="res-stat-value">{rhythm.score}<small> /100</small></span>
                            <span className="res-stat-chip"><Chip size="sm" variant="soft" color={consistencyLabel(rhythm.score, locale).color}>{consistencyLabel(rhythm.score, locale).text}</Chip>
                                <Chip size="sm" variant="soft">{tr(locale, "median gap", "Median")} {rhythm.medianMs} ms</Chip></span>
                        </>) : <p className="analytics-empty">{tr(locale, "Type a little longer to measure rhythm.", "Tippe etwas länger, um den Rhythmus zu messen.")}</p>}
                    </Card.Content>
                </Card>
                <Card>
                    <Card.Header><div className="res-card-head"><Zap size={16} aria-hidden="true" /><Card.Title>{tr(locale, "Burst vs sustained", "Spitze vs. Dauer")}</Card.Title></div>
                        <Card.Description>{tr(locale, "Your fastest 10 keystrokes against your whole-run pace.", "Deine schnellsten 10 Anschläge im Vergleich zum Gesamttempo.")}</Card.Description></Card.Header>
                    <Card.Content>
                        {pace ? (<>
                            <div className="adv-pair">
                                <span><span className="res-stat-value">{pace.burstWpm}<small> WPM</small></span><span className="adv-cap">{tr(locale, "burst", "Spitze")}</span></span>
                                <span><span className="res-stat-value">{pace.sustainedWpm}<small> WPM</small></span><span className="adv-cap">{tr(locale, "sustained", "Dauer")}</span></span>
                            </div>
                            <span className="res-stat-chip"><Chip size="sm" variant="soft">{tr(locale, "gap", "Differenz")} {Math.max(0, pace.burstWpm - pace.sustainedWpm)} WPM</Chip></span>
                        </>) : <p className="analytics-empty">{tr(locale, "Not enough keystrokes yet.", "Noch zu wenige Anschläge.")}</p>}
                    </Card.Content>
                </Card>
            </div>

            {fingers.length > 0 && (
                <Card>
                    <Card.Header><div className="res-card-head"><Hand size={16} aria-hidden="true" /><Card.Title>{tr(locale, "Finger load", "Fingerbelastung")}</Card.Title></div>
                        <Card.Description>{tr(locale, "Share of keystrokes per finger (standard touch-typing assignment). Finger colours blend from success at 0% errors to error at 20% or more; unused fingers stay neutral. Labels show each finger’s keystroke share and error rate.", "Anteil der Anschläge pro Finger (Standard-Zehnfingersystem). Die Fingerfarben reichen von Erfolg bei 0 % Fehlern bis Fehler bei mindestens 20 %; ungenutzte Finger bleiben neutral. Die Beschriftung zeigt Anschlagsanteil und Fehlerrate pro Finger.")}</Card.Description></Card.Header>
                    <Card.Content><HandsChart fingers={fingers} locale={locale} /></Card.Content>
                </Card>
            )}
        </section>
    );
}
