import { useStore } from "@nanostores/react";
import { $kbTypingState } from "@/store/keyboard";
import { $completedSession } from "@/store/analytics";
import { KBTYPINGSTATE } from "@/constants/keyboardState";
import { $config } from "@/store/config";
import WPSLineChart from "@/components/charts/WPSLineChart";
import Stats from "./Stats";
import SessionKeyAnalytics from "./SessionKeyAnalytics";
import { RotateCcw, ArrowRight } from "lucide-react";
import { useCallback, useEffect } from "react";

const SessionResults = () => {
    const state = useStore($kbTypingState);
    const session = useStore($completedSession);
    const restart = useCallback(() => {
        $config.set({ ...$config.get() });
        requestAnimationFrame(() => {
            document
                .getElementById("kb-hidden-input")
                ?.focus({ preventScroll: true });
            window.scrollTo({ top: 0, behavior: "instant" });
        });
    }, []);
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
                !["Enter", "Tab"].includes(event.key)
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
        <div className="result-retry-control">
            <button
                type="button"
                className="result-action-button"
                onClick={restart}
                aria-keyshortcuts="Enter"
                aria-label="Practice again"
                title="Practice again (Enter)"
            >
                <RotateCcw size={16} aria-hidden="true" />
                <span className="result-retry-label">Practice again</span>
            </button>
            <span className="result-retry-hint">
                <span className="result-retry-hint-intro">or press </span>
                <kbd>Enter</kbd>
            </span>
        </div>
    );
    if (!session)
        return (
            <section className="result-panel">
                <p className="analytics-empty">
                    This attempt was too short to measure.
                </p>
                {retry}
            </section>
        );
    return (
        <div className="session-results session-results--minimal">
            <h1 className="sr-only">Typing session results</h1>
            <div className="result-topline">
                <Stats />
                {retry}
            </div>
            <section
                className="result-panel result-pace"
                aria-label="Typing speed over time"
            >
                <WPSLineChart />
            </section>
            <section
                className="result-details"
                aria-labelledby="result-details-title"
            >
                <h2 id="result-details-title" className="sr-only">
                    Session details
                </h2>
                <dl className="result-detail-metrics">
                    <div>
                        <dt>Correct speed</dt>
                        <dd>
                            {session.correctWpm ?? "—"}
                            <span> wpm</span>
                        </dd>
                    </div>
                    <div>
                        <dt>Characters / min</dt>
                        <dd>{session.cpm}</dd>
                    </div>
                    <div data-tone={session.errors > 0 ? "error" : undefined}>
                        <dt>Errors</dt>
                        <dd>{session.errors}</dd>
                    </div>
                    <div>
                        <dt>Duration</dt>
                        <dd>
                            {Number(session.duration.toFixed(1))}
                            <span>s</span>
                        </dd>
                    </div>
                </dl>
            </section>
            <SessionKeyAnalytics />
            <div className="result-end-actions">
                {retry}
                <a href="/history/" className="result-history-link">
                    Full report in History{" "}
                    <ArrowRight size={14} aria-hidden="true" />
                </a>
            </div>
        </div>
    );
};
export default SessionResults;
