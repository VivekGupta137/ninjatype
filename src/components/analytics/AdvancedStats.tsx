import { useMemo } from "react";
import { useStore } from "@nanostores/react";
import { Card, Chip } from "@heroui/react";
import { Activity, Hand, Waves, Zap } from "lucide-react";
import { $keypressEvents } from "@/store/analytics";
import { burstSustained, consistencyScore, errorBreakdown, fingerLoad, type AdvancedView, type ErrorKind } from "@/lib/advancedStats";
import { tr, type LearnLocale } from "@/lib/learnLocale";
import HandsChart from "./HandsChart";
import "@/styles/results.css";

const ERROR_LABEL: Record<ErrorKind, [string, string]> = {
    substitution: ["Wrong key", "Falsche Taste"], omission: ["Skipped key", "Übersprungen"], transposition: ["Swapped pair", "Vertauscht"], extra: ["Extra key", "Zu viel"],
};

const consistencyLabel = (score: number, locale: LearnLocale) =>
    score >= 75 ? { text: tr(locale, "Steady", "Gleichmäßig"), color: "success" as const }
        : score >= 50 ? { text: tr(locale, "Some wobble", "Leicht unruhig"), color: "accent" as const }
            : { text: tr(locale, "Uneven", "Ungleichmäßig"), color: "warning" as const };

/** Advanced stats for the session just completed. */
export default function AdvancedStats({ locale = "en" }: { locale?: LearnLocale }) {
    const events = useStore($keypressEvents);
    const view = useMemo<AdvancedView>(() => {
        const layout = locale === "de" ? "qwertz" : "qwerty";
        return {
            sessions: 1,
            rhythm: consistencyScore(events),
            pace: burstSustained(events),
            errors: errorBreakdown(events),
            fingers: locale === "en" || locale === "de" ? fingerLoad(events, layout) : [],
        };
    }, [events, locale]);
    if (events.length === 0) return null;
    return <AdvancedStatsView view={view} locale={locale} />;
}

/** Presentational panel, shared by the results page (one session) and /history/ (aggregate). */
export function AdvancedStatsView({ view, locale = "en", id }: { view: AdvancedView; locale?: LearnLocale; id?: string }) {
    const { rhythm, pace, errors, fingers } = view;

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

            <Card>
                <Card.Header><div className="res-card-head"><Activity size={16} aria-hidden="true" /><Card.Title>{tr(locale, "Error types", "Fehlerarten")}</Card.Title></div>
                    <Card.Description>{tr(locale, "What kind of mistakes you made.", "Welche Art von Fehlern passiert ist.")}</Card.Description></Card.Header>
                <Card.Content>
                    {errors.total === 0 ? <p className="analytics-empty">{tr(locale, "No errors. Clean run!", "Keine Fehler. Sauberer Lauf!")}</p> : (
                        <ul className="adv-bars">
                            {(Object.keys(ERROR_LABEL) as ErrorKind[]).map((kind) => (
                                <li key={kind}>
                                    <span className="adv-bar-label">{tr(locale, ERROR_LABEL[kind][0], ERROR_LABEL[kind][1])}</span>
                                    <span className="adv-bar" aria-hidden="true"><span style={{ width: `${(errors.counts[kind] / errors.total) * 100}%`, background: "var(--error-color)" }} /></span>
                                    <span className="adv-bar-value">{errors.counts[kind]}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card.Content>
            </Card>

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
