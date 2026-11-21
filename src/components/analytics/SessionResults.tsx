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
import { useCallback, useEffect } from "react";

const SessionResults = () => {
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
            <KeyButton variant="primary" onPress={restart} aria-keyshortcuts="Enter" aria-label="Practice again">
                <RotateCcw size={16} aria-hidden="true" />Practice again
            </KeyButton>
            <span className="res-retry-hint">or press <Kbd><Kbd.Content>Enter</Kbd.Content></Kbd></span>
        </div>
    );
    if (!session)
        return (
            <section className="res">
                <Card>
                    <Card.Content className="res-empty">
                        <p className="analytics-empty">This attempt was too short to measure.</p>
                        {retry}
                    </Card.Content>
                </Card>
            </section>
        );
    const settings = readPracticeSettings(session.practiceSettings);
    const correctRatio = session.correctWpm != null && session.wpm > 0 ? Math.round((session.correctWpm / session.wpm) * 100) : null;
    return (
        <div className="res">
            <h1 className="sr-only">Typing session results</h1>

            <ResultOverview session={session} actions={retry} />

            <Card className="res-chart">
                <Card.Header>
                    <div className="res-card-head"><TrendingUp size={16} aria-hidden="true" /><Card.Title>Speed over time</Card.Title></div>
                    <Card.Description>Raw speed and momentary pace across the test.</Card.Description>
                </Card.Header>
                <Card.Content>
                    <section className="result-panel result-pace" aria-label="Typing speed over time"><WPSLineChart /></section>
                </Card.Content>
            </Card>

            <section className="res-details" aria-label="Session details">
                <MetricCard icon={<Target size={16} />} label="Correct speed" value={session.correctWpm ?? "—"} unit="wpm"
                    chip={correctRatio != null ? <Chip size="sm" variant="soft" color={correctRatio >= 95 ? "success" : "warning"}>{correctRatio}% of raw</Chip> : undefined} />
                <MetricCard icon={<Keyboard size={16} />} label="Characters / min" value={session.cpm} />
                <MetricCard icon={<CircleAlert size={16} />} label="Errors" value={session.errors} tone={session.errors > 0 ? "error" : "success"}
                    chip={<Chip size="sm" variant="soft" color={session.errors > 0 ? "danger" : "success"}>{session.errors > 0 ? "Review keys below" : "Clean run"}</Chip>} />
                <MetricCard icon={<Timer size={16} />} label="Duration" value={Number(session.duration.toFixed(1))} unit="s"
                    chip={settings ? <Chip size="sm" variant="soft">{settingsLabel(settings)}</Chip> : undefined} />
            </section>

            <div className="res-pair">
                <StreakInsights compact />
                <Card className="res-next">
                    <Card.Header><div className="res-card-head"><Compass size={16} aria-hidden="true" /><Card.Title>What to practise next</Card.Title></div></Card.Header>
                    <Card.Content><PracticeRecommendation session={session} /></Card.Content>
                </Card>
            </div>

            <Card className="res-keys">
                <Card.Header>
                    <div className="res-card-head"><Keyboard size={16} aria-hidden="true" /><Card.Title>Average key delay</Card.Title></div>
                    <Card.Description>Slower keys glow brighter. Errors are marked on the key.</Card.Description>
                </Card.Header>
                <Card.Content><SessionKeyAnalytics /></Card.Content>
            </Card>

            <div className="res-end">
                <div className="res-end-keys">
                    <KeyButton variant="primary" onPress={restart} aria-keyshortcuts="Enter" aria-label="Practice again">
                        <RotateCcw size={16} aria-hidden="true" />Practice again
                    </KeyButton>
                    <ShareResultButton result={practiceShareSnapshot(session)} label="Share result" />
                    <KeyLink variant="ghost" href="/history/">Full report<ArrowRight size={14} aria-hidden="true" /></KeyLink>
                </div>
                <span className="res-retry-hint">or press <Kbd><Kbd.Content>Enter</Kbd.Content></Kbd> to practise again</span>
            </div>
        </div>
    );
};
export default SessionResults;
