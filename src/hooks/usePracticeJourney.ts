import { useCallback, useEffect, useMemo, useState } from "react";
import { useStore } from "@nanostores/react";
import { $config } from "@/store/config";
import { dismissCelebration } from "@/store/celebrations";
import { $history, type TypingSession } from "@/store/history";
import { $kbTypedText, $kbTypingState } from "@/store/keyboard";
import { $keypressEvents } from "@/store/analytics";
import { KBTYPINGSTATE } from "@/constants/keyboardState";
import { aggregateKeyStats } from "@/lib/keypressStats";
import {
    capturePracticeSettings,
    latestPracticeSession, practiceComparison, readPracticeSettings,
    recommendPractice, type PracticeSettings,
} from "@/lib/practiceJourney";

/** Shared reset path for retry and recommended practice. */
export function startPractice(settings?: PracticeSettings) {
    dismissCelebration();
    $kbTypingState.set(KBTYPINGSTATE.IDLE);
    $kbTypedText.set("");
    $config.set({ ...$config.get(), ...settings });
    requestAnimationFrame(() => {
        document.getElementById("kb-hidden-input")?.focus({ preventScroll: true });
        window.scrollTo({ top: 0, behavior: "instant" });
    });
}

export function usePracticeJourney() {
    const { sessions } = useStore($history);
    const typingState = useStore($kbTypingState);
    const [ready, setReady] = useState(false);
    useEffect(() => {
        setReady(true);
        // Stop abandoned timers on navigation and return to the continuation view.
        // Completed history is untouched; unfinished attempts are not saved.
        const abandon = () => {
            if ($kbTypingState.get() === KBTYPINGSTATE.IDLE) return;
            $kbTypingState.set(KBTYPINGSTATE.IDLE);
            $kbTypedText.set("");
            $config.set({ ...$config.get() });
        };
        document.addEventListener("astro:before-swap", abandon);
        return () => {
            document.removeEventListener("astro:before-swap", abandon);
            abandon();
        };
    }, []);
    const latest = useMemo(() => latestPracticeSession(sessions), [sessions]);
    const comparison = useMemo(() => latest ? practiceComparison(latest, sessions) : null, [latest, sessions]);
    return { ready, typingState, latest, comparison };
}

export function usePracticeRecommendation(session: TypingSession) {
    const events = useStore($keypressEvents);
    const { sessions } = useStore($history);
    const recommendation = useMemo(() => recommendPractice(session, aggregateKeyStats(events)), [session, events]);
    const comparison = useMemo(() => practiceComparison(session, sessions), [session, sessions]);
    const practise = useCallback(() => {
        const settings = readPracticeSettings(session.practiceSettings) ?? capturePracticeSettings($config.get());
        startPractice(session.duration < 10 ? { mode: "time", countdownTime: "1m", dictionary: $config.get().dictionary } : settings);
    }, [session]);
    return { recommendation, comparison, practise };
}
