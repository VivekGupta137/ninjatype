import { useStore } from "@nanostores/react";
import { $kbTypingState } from "@/store/keyboard";
import { $completedSession } from "@/store/analytics";
import { KBTYPINGSTATE } from "@/constants/keyboardState";
import { startPractice } from "@/hooks/usePracticeJourney";
import PracticeRecommendation from "./PracticeRecommendation";
import WPSLineChart from "@/components/charts/WPSLineChart";
import SessionKeyAnalytics from "./SessionKeyAnalytics";
import StreakInsights from "./StreakInsights";
import ShareResultButton from "@/components/share/ShareResultButton";
import { practiceShareSnapshot } from "@/lib/shareSession";
import { ArrowRight, CircleAlert, Compass, Keyboard, RotateCcw, Target, Timer, TrendingUp } from "lucide-react";
import { Card, Chip, Kbd } from "@heroui/react";
import { readPracticeSettings, settingsLabel } from "@/lib/practiceJourney";
import ResultOverview, { MetricCard } from "./ResultOverview";
import KeyButton from "@/components/ui/KeyButton";
import KeyLink from "@/components/ui/KeyLink";
import "@/styles/results.css";
import { tr, type LearnLocale } from "@/lib/learnLocale";
import { useCallback, useEffect } from "react";

const SessionResults = ({ locale = "en" }: { locale?: LearnLocale }) => {
    const state = useStore($kbTypingState);
    const session = useStore($completedSession);
    const restart = useCallback(() => startPractice(), []);
    useEffect(() => {
        if (state !== KBTYPINGSTATE.COMPLETED) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (
                event.defaultPrevented ||
                event.repeat ||
                event.isComposing ||
                event.ctrlKey ||
                event.metaKey ||
                event.altKey ||
                event.shiftKey ||
                event.key !== "Enter"
            )
                return;
            const target = event.target;
            // Let focused controls retain their native keyboard actions.
            if (
                target instanceof HTMLElement &&
                target.id !== "kb-hidden-input" &&
                target.closest(
                    "a, button, input, textarea, select, summary, [contenteditable=true], [role=button]",
                )
            )
                return;
            event.preventDefault();
            restart();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [state, restart]);
    if (state !== KBTYPINGSTATE.COMPLETED) return null;
    const retry = (
        <div className="res-retry">
            <KeyButton variant="primary" onPress={restart} aria-keyshortcuts="Enter" aria-label={tr(locale, "Practice again", "Nochmal tippen")}>
                <RotateCcw size={16} aria-hidden="true" />{tr(locale, "Practice again", "Nochmal tippen")}
            </KeyButton>
            <span className="res-retry-hint">{tr(locale, "or press", "oder drücke")} <Kbd><Kbd.Content>Enter</Kbd.Content></Kbd></span>
        </div>
    );
    if (!session)
        return (
            <section className="res">
                <Card>
                    <Card.Content className="res-empty">
                        <p className="analytics-empty">{tr(locale, "This attempt was too short to measure.", "Dieser Versuch war zu kurz zum Messen.")}</p>
                        {retry}
                    </Card.Content>
                </Card>
            </section>
        );
    const settings = readPracticeSettings(session.practiceSettings);
    const correctRatio = session.correctWpm != null && session.wpm > 0 ? Math.round((session.correctWpm / session.wpm) * 100) : null;
    return (
        <div className="res">
            <h1 className="sr-only">{tr(locale, "Typing session results", "Ergebnisse der Tippsession")}</h1>

            <ResultOverview session={session} actions={retry} locale={locale} />

            <Card className="res-chart">
                <Card.Header>
                    <div className="res-card-head"><TrendingUp size={16} aria-hidden="true" /><Card.Title>{tr(locale, "Speed over time", "Tempo im Verlauf")}</Card.Title></div>
                    <Card.Description>{tr(locale, "Raw speed and momentary pace across the test.", "Rohtempo und momentane Geschwindigkeit im Testverlauf.")}</Card.Description>
                </Card.Header>
                <Card.Content>
                    <section className="result-panel result-pace" aria-label={tr(locale, "Typing speed over time", "Tippgeschwindigkeit im Zeitverlauf")}><WPSLineChart /></section>
                </Card.Content>
            </Card>

            <section className="res-details" aria-label={tr(locale, "Session details", "Session-Details")}>
                <MetricCard icon={<Target size={16} />} label={tr(locale, "Correct speed", "Korrektes Tempo")} value={session.correctWpm ?? "—"} unit="wpm"
                    chip={correctRatio != null ? <Chip size="sm" variant="soft" color={correctRatio >= 95 ? "success" : "warning"}>{correctRatio} {tr(locale, "% of raw", "% des Rohwerts")}</Chip> : undefined} />
                <MetricCard icon={<Keyboard size={16} />} label={tr(locale, "Characters / min", "Zeichen pro Minute")} value={session.cpm} />
                <MetricCard icon={<CircleAlert size={16} />} label={tr(locale, "Errors", "Fehler")} value={session.errors} tone={session.errors > 0 ? "error" : "success"}
                    chip={<Chip size="sm" variant="soft" color={session.errors > 0 ? "danger" : "success"}>{session.errors > 0 ? tr(locale, "Review keys below", "Tasten unten ansehen") : tr(locale, "Clean run", "Fehlerfreier Lauf")}</Chip>} />
                <MetricCard icon={<Timer size={16} />} label={tr(locale, "Duration", "Dauer")} value={Number(session.duration.toFixed(1))} unit="s"
                    chip={settings ? <Chip size="sm" variant="soft">{settingsLabel(settings)}</Chip> : undefined} />
            </section>

            <div className="res-pair">
                <StreakInsights compact locale={locale} />
                <Card className="res-next">
                    <Card.Header><div className="res-card-head"><Compass size={16} aria-hidden="true" /><Card.Title>{tr(locale, "What to practise next", "Was als Nächstes üben")}</Card.Title></div></Card.Header>
                    <Card.Content><PracticeRecommendation session={session} locale={locale} /></Card.Content>
                </Card>
            </div>

            <Card className="res-keys">
                <Card.Header>
                    <div className="res-card-head"><Keyboard size={16} aria-hidden="true" /><Card.Title>{tr(locale, "Average key delay", "Durchschnittliche Tastenverzögerung")}</Card.Title></div>
                    <Card.Description>{tr(locale, "Slower keys glow brighter. Errors are marked on the key.", "Langsamere Tasten leuchten heller. Fehler sind auf der Taste markiert.")}</Card.Description>
                </Card.Header>
                <Card.Content><SessionKeyAnalytics locale={locale} /></Card.Content>
            </Card>

            <div className="res-end">
                <div className="res-end-keys">
                    <KeyButton variant="primary" onPress={restart} aria-keyshortcuts="Enter" aria-label={tr(locale, "Practice again", "Nochmal tippen")}>
                        <RotateCcw size={16} aria-hidden="true" />{tr(locale, "Practice again", "Nochmal tippen")}
                    </KeyButton>
                    <ShareResultButton result={practiceShareSnapshot(session)} label={tr(locale, "Share result", "Ergebnis teilen")} />
                    <KeyLink variant="ghost" href="/history/">{tr(locale, "Full report", "Vollständiger Bericht")}<ArrowRight size={14} aria-hidden="true" /></KeyLink>
                </div>
                <span className="res-retry-hint">{tr(locale, "or press", "oder drücke")} <Kbd><Kbd.Content>Enter</Kbd.Content></Kbd> {tr(locale, "to practise again", "für einen neuen Versuch")}</span>
            </div>
        </div>
    );
};
export default SessionResults;
