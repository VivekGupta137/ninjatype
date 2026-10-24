import { atom, computed, effect, onSet } from "nanostores";
import {
    $kbSentence,
    $kbSentenceWords,
    $kbTypedText,
    $kbTypedWords,
    $kbTypingState,
    $stopwatch,
} from "./keyboard";
import { KBTYPINGSTATE } from "@/constants/keyboardState";
import { $config } from "./config";
import { addSession, type TypingSession } from "./history";
import {
    getRhythm,
    measureSessionText,
    speedFromCount,
    upsertSample,
} from "@/lib/sessionInsights";
import { saveKeypressAttempt } from "./keypressAnalytics";
import {
    aggregateKeyStats,
    diffTypedText,
    type KeypressEvent,
} from "@/lib/keypressStats";

export const $keypressEvents = atom<KeypressEvent[]>([]);

export const $rawCPS = atom<{ count: number; time: number }[]>([]); // characters per second samples

export const $errorCPS = atom<{ time: number; count: number }[]>([]); // error count samples

export const $correctCPS = atom<{ time: number; count: number }[]>([]); // characters per second samples including only correct characters

export const $accuracy = computed([$errorCPS], (errorCPS) => {
    // accuracy percentage based on error count and total typed characters
    const latestErrors = errorCPS[errorCPS.length - 1];
    const typedText = $kbTypedText.get();
    const typedTextLength = typedText.length;
    if (!latestErrors || typedTextLength === 0) return 100;
    const errorCount = latestErrors.count;
    const accuracy = ((typedTextLength - errorCount) / typedTextLength) * 100;
    return Math.max(0, Math.min(100, Math.round(accuracy)));
});

export const $completedSession = atom<TypingSession | null>(null);

function captureAnalyticsSample(time: number) {
    const measurement = measureSessionText(
        $kbTypedText.get(),
        $kbSentence.get(),
    );
    $rawCPS.set(
        upsertSample($rawCPS.get(), { count: measurement.characters, time }),
    );
    $errorCPS.set(
        upsertSample($errorCPS.get(), { count: measurement.errors, time }),
    );
    $correctCPS.set(
        upsertSample($correctCPS.get(), { count: measurement.correct, time }),
    );
}

effect([$stopwatch], (stopwatch) => captureAnalyticsSample(stopwatch));

export const $rawCPM = computed($rawCPS, (cps) => {
    // characters per minute
    if (cps.length === 0) return 0;
    const latestSample = cps[cps.length - 1];
    const cpm = latestSample.count * (60 / (latestSample.time || 1));
    return Math.ceil(cpm);
});

export const $rawWPM = computed([$rawCPM], (rawCPM) => {
    // words per minute
    if (!rawCPM) return 0;
    // treat 5 characters as a word, round to nearest whole word per minute
    return Math.ceil(rawCPM / 5);
});

let previousTypedText = "";

const resetKeypressCapture = () => {
    previousTypedText = "";
    $keypressEvents.set([]);
};

onSet($kbTypedText, ({ newValue }) => {
    if (typeof window === "undefined") return;
    if ($kbTypingState.get() === KBTYPINGSTATE.COMPLETED) {
        previousTypedText = newValue;
        return;
    }

    const current = $keypressEvents.get();
    const lastEventTime = current[current.length - 1]?.time ?? 0;
    const events = diffTypedText(
        previousTypedText,
        newValue,
        $kbSentence.get(),
        lastEventTime,
        Date.now(),
    );
    previousTypedText = newValue;

    if (events.length > 0) {
        $keypressEvents.set([...current, ...events]);
    }
});

effect([$config], () => {
    if (typeof window === "undefined") return;
    resetKeypressCapture();
    $rawCPS.set([]);
    $errorCPS.set([]);
    $correctCPS.set([]);
    $completedSession.set(null);
});

/**
 * Automatically saves typing session to history when completed
 * Only saves sessions with valid data (WPM > 0, duration > 0)
 */
effect([$kbTypingState], (typingState) => {
    if (typeof window === "undefined") return;

    if (typingState === KBTYPINGSTATE.COMPLETED) {
        try {
            // Word/quote completion can happen between the 0.2s timer ticks.
            captureAnalyticsSample($stopwatch.get());
            const wpm = $rawWPM.get();
            const cpm = $rawCPM.get();
            const accuracy = $accuracy.get();
            const errorCPS = $errorCPS.get();
            const errors = errorCPS[errorCPS.length - 1]?.count || 0;
            const duration = $stopwatch.get();
            const mode = $config.get().mode;
            const timestamp = Date.now();
            const sessionId = `${timestamp}-${Math.random().toString(36).substring(2, 11)}`;

            // Validate data before saving
            if (wpm > 0 && duration > 0 && accuracy >= 0 && accuracy <= 100) {
                const session: TypingSession = {
                    id: sessionId,
                    timestamp,
                    wpm,
                    cpm,
                    accuracy,
                    errors,
                    duration,
                    mode,
                    source:
                        mode === "quotes"
                            ? $config.get().quotes
                            : $config.get().dictionary,
                    correctWpm: speedFromCount(
                        $correctCPS.get().at(-1)?.count ?? 0,
                        duration,
                    ),
                    rhythm: getRhythm($rawCPS.get()) ?? undefined,
                };
                addSession(session);
                $completedSession.set(session);
                saveKeypressAttempt({
                    sessionId,
                    timestamp,
                    keys: aggregateKeyStats($keypressEvents.get()),
                });
            } else {
                console.warn("Invalid session data, skipping history save", {
                    wpm,
                    duration,
                    accuracy,
                });
            }
        } catch (error) {
            console.error("Failed to save typing session to history:", error);
        }
    }
});
