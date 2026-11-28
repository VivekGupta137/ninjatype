import { readPracticeSettings, settingsLabel, isUsableSession, type PracticeSettings } from "@/lib/practiceJourney";
import type { TypingSession } from "@/store/history";
import type { KeypressAttempt } from "@/lib/keypressStats";
import { analyzeKeys, evidenceText, type KeyAnalysis, type WeakKey } from "./weakKeys";
import { buildDrill, type Drill } from "./drills";

export type PlanStep =
    | { id: "drill"; title: string; detail: string; evidence: string[]; drill: Drill; focus: string[] }
    | { id: "retest"; title: string; detail: string; evidence: string[]; settings: PracticeSettings };

export type TrainingPlan =
    | { status: "insufficient"; attempts: number; presses: number; needAttempts: number; needPresses: number }
    | { status: "ready"; focus: WeakKey[]; steps: PlanStep[]; note: string | null };

const DEFAULT_SETTINGS: PracticeSettings = { mode: "time", countdownTime: "1m", dictionary: "1k" };

/** The settings the learner uses most over the last 30 days: the fair baseline for a retest. */
export function usualSettings(sessions: TypingSession[], now = Date.now()): { settings: PracticeSettings; avgWpm: number; count: number } | null {
    const rows = sessions.filter(s => isUsableSession(s) && s.timestamp > now - 30 * 86_400_000)
        .map(s => ({ s, settings: readPracticeSettings(s.practiceSettings) })).filter(x => x.settings);
    const groups = new Map<string, typeof rows>();
    for (const r of rows) groups.set(JSON.stringify(r.settings), [...(groups.get(JSON.stringify(r.settings)) ?? []), r]);
    const top = [...groups.values()].sort((a, b) => b.length - a.length)[0];
    if (!top) return null;
    return { settings: top[0].settings!, avgWpm: Math.round(top.reduce((n, r) => n + r.s.wpm, 0) / top.length), count: top.length };
}

/** Builds today's routine from recent keypress data. Same inputs and day give the same plan. */
export function buildPlan(input: { attempts: KeypressAttempt[]; sessions: TypingSession[]; wordPool: string[]; day: string; now?: number }): TrainingPlan {
    const analysis: KeyAnalysis = analyzeKeys(input.attempts);
    if (analysis.status === "insufficient") return analysis;
    const usual = usualSettings(input.sessions, input.now);
    const steps: PlanStep[] = [];
    let note: string | null = null;

    if (analysis.focus.length) {
        const keys = analysis.focus.map(k => k.key);
        const drill = buildDrill(keys, input.wordPool, `${input.day}:${keys.join("")}`);
        if (drill) {
            steps.push({
                id: "drill",
                title: `Drill ${keys.map(k => k.toUpperCase()).join(", ")}`,
                detail: `${drill.words} common words selected for your focus keys. Take them at your own pace.`,
                evidence: analysis.focus.map(evidenceText),
                drill, focus: keys,
            });
        } else note = "Your weakest keys are rare in the word list, so no drill was built. Keep to your usual practice.";
    } else {
        note = "No key stands out as weak right now. Your recent data shows no repeated misses or unusually slow letters.";
    }

    const settings = usual?.settings ?? DEFAULT_SETTINGS;
    steps.push({
        id: "retest",
        title: "Retest with your usual settings",
        detail: `One ${settingsLabel(settings)} test, so the result compares fairly with earlier ones.`,
        evidence: usual ? [`Your usual setup over 30 days: ${usual.count} tests averaging ${usual.avgWpm} WPM.`] : ["No earlier tests with saved settings yet, so this starts your baseline."],
        settings,
    });
    return { status: "ready", focus: analysis.focus, steps, note };
}
