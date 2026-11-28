import { useEffect, useMemo, useState } from "react";
import { useStore } from "@nanostores/react";
import { Alert, Card, Chip } from "@heroui/react";
import { ArrowRight, Dumbbell, LoaderCircle } from "lucide-react";
import KeyButton from "@/components/ui/KeyButton";
import KeyLink from "@/components/ui/KeyLink";
import { ProBadge } from "@/components/ui/ProBadge";
import PriorityKeys from "./PriorityKeys";
import wordData from "@/data/words-1k.json";
import priorityWordData from "@/data/words-5k.json";
import { $account, refreshAccount } from "@/store/account";
import { $config } from "@/store/config";
import { $history } from "@/store/history";
import { $keypressAnalytics } from "@/store/keypressAnalytics";
import { saveDrill } from "@/store/trainingDrill";
import { localDayKey } from "@/lib/practiceJourney";
import { buildPlan, type PlanStep } from "@/lib/training/plan";
import { MIN_PER_WEEK, weeklyReview, type Verdict } from "@/lib/training/review";
import "@/styles/ui.css";
import "@/styles/account.css";
import "@/styles/results.css";
import "@/styles/training.css";

const POOL = (wordData as { words: string[] }).words;
const PRIORITY_POOL = priorityWordData.words;
const VERDICT: Record<Verdict, { text: string; color: "success" | "default" | "warning" }> = {
    improving: { text: "Improving", color: "success" },
    steady: { text: "Holding steady", color: "default" },
    declining: { text: "Slipping", color: "warning" },
};
const signed = (n: number) => `${n > 0 ? "+" : ""}${n}`;

function Step({ step, index }: { step: PlanStep; index: number }) {
    const [error, setError] = useState<string | null>(null);
    const run = () => {
        if (step.id === "drill") {
            const id = saveDrill(step.drill.text, localDayKey(), step.focus);
            if (!id) return setError("Could not save the drill. Check your browser storage or make room in My material, then try again.");
            window.location.assign(`/my-material/?start=${encodeURIComponent(id)}&from=training`);
        } else {
            $config.set({ ...$config.get(), ...step.settings });
            window.location.assign("/");
        }
    };
    return (
        <li>
            <Card className="trn-step">
            <Card.Content className="trn-body">
                <Chip size="sm" variant="soft"><Chip.Label>Step {index + 1}</Chip.Label></Chip>
                <h3>{step.title}</h3>
                <p className="acct-note">{step.detail}</p>
                <ul className="trn-evidence" aria-label="Why this step">{step.evidence.map(e => <li key={e}>{e}</li>)}</ul>
                {step.id === "drill" && <div className="trn-drill-preview">
                    <p className="trn-step-note">Preview: {step.drill.text.split(" ").slice(0, 8).join(" ")}…</p>
                    <ul className="trn-coverage" role="list" aria-label="Focus key appearances in the drill">
                        {step.focus.map(key => <li key={key}><kbd>{key.toUpperCase()}</kbd> {step.drill.coverage[key]} {step.drill.coverage[key] === 1 ? "appearance" : "appearances"}</li>)}
                    </ul>
                    {step.focus.some(key => !step.drill.coverage[key]) && <p className="trn-step-note">Some focus keys aren’t in the available word list; this drill practises the others.</p>}
                    <p className="trn-step-note">Saved to My material when you start. Your drill can change as your typing data changes.</p>
                </div>}
                {step.id === "retest" && <p className="trn-step-note">Starting this test changes your current test settings.</p>}
                {error && <p className="acct-note" role="alert">{error}</p>}
                <KeyButton variant={index === 0 ? "primary" : "secondary"} size="sm" onPress={run}>{step.id === "drill" ? "Start drill" : "Start test"}<ArrowRight size={14} aria-hidden="true" /></KeyButton>
            </Card.Content>
            </Card>
        </li>
    );
}

function Plan() {
    const { recentAttempts } = useStore($keypressAnalytics);
    const { sessions } = useStore($history);
    const day = localDayKey();
    const plan = useMemo(() => buildPlan({ attempts: recentAttempts, sessions, wordPool: POOL, day }), [recentAttempts, sessions, day]);
    return (
        <>
        {plan.status === "ready" && plan.focus.length > 0 && <PriorityKeys focus={plan.focus} pool={PRIORITY_POOL} day={day} />}
        <section className="trn-plan" aria-labelledby="trn-plan-title">
            <div className="acct-head"><h2 id="trn-plan-title">Today's routine</h2><Chip size="sm" variant="soft"><Dumbbell size={12} aria-hidden="true" /><Chip.Label>Personalized practice</Chip.Label></Chip></div>
            {plan.status === "insufficient" ? (
                <Card className="acct-card">
                    <p className="acct-note">Not enough typing data yet to pick keys fairly. Finish a few more tests; one slip is never treated as a pattern.</p>
                    <p className="acct-note" role="status">So far: {plan.attempts} of {plan.needAttempts} tests and {plan.presses} of {plan.needPresses} letters.</p>
                    <div className="acct-actions"><KeyLink href="/" variant="primary">Take a typing test</KeyLink></div>
                </Card>
            ) : (
                <>
                    {plan.note && <p className="acct-note">{plan.note}</p>}
                    <p className="trn-intro">Start a step below, then return to this page for the next one. Steps can also be practised independently.</p>
                    <ol className="trn-steps" role="list">{plan.steps.map((s, i) => <Step key={s.id} step={s} index={i} />)}</ol>
                </>
            )}
        </section>
        </>
    );
}

function Review() {
    const { sessions } = useStore($history);
    const review = useMemo(() => weeklyReview(sessions), [sessions]);
    return (
        <Card className="acct-card">
            <div className="acct-head">
                <h2>Weekly review</h2>
                {review.verdict && <Chip size="sm" variant="soft" color={VERDICT[review.verdict].color}><Chip.Label>{VERDICT[review.verdict].text}</Chip.Label></Chip>}
            </div>
            <dl className="res-streak-metrics">
                <div><dt>Tests</dt><dd>{review.sessionsThisWeek}</dd></div>
                <div><dt>Practice days</dt><dd>{review.practiceDays}<span> / 7</span></dd></div>
            </dl>
            <p className="acct-note">In the last 7 days.</p>
            {review.status === "insufficient" ? (
                <Alert status="default"><Alert.Indicator /><Alert.Content><Alert.Title>Not enough evidence yet</Alert.Title><Alert.Description>{review.missing}</Alert.Description></Alert.Content></Alert>
            ) : (
                <>
                    <div className="trn-table-wrap" role="region" aria-label="This week compared with last week" tabIndex={0}>
                        <table className="pro-table" aria-label="This week compared with last week">
                            <thead><tr><th scope="col">Test</th><th scope="col">WPM</th><th scope="col">Accuracy</th></tr></thead>
                            <tbody>
                                {review.groups.map(g => (
                                    <tr key={g.label}>
                                        <th scope="row">{g.label}<small className="trn-sub">{g.sessionsThis} vs {g.sessionsPrev} tests</small></th>
                                        <td>{g.wpmThis} <small className="trn-sub">{signed(g.deltaWpm)} from {g.wpmPrev}</small></td>
                                        <td>{g.accThis}% <small className="trn-sub">{signed(g.deltaAcc)} from {g.accPrev}%</small></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {review.plateau && <Alert status="warning"><Alert.Indicator /><Alert.Content><Alert.Title>Possible plateau</Alert.Title><Alert.Description>Your speed on these settings has stayed within 2 WPM for three weeks. Try the key drill daily, or slow down for one week and aim for fewer errors.</Alert.Description></Alert.Content></Alert>}
                    <p className="acct-note">Only tests with the same mode, length and word list are compared, and each side needs at least {MIN_PER_WEEK} tests. Changes under 2 WPM count as steady.</p>
                </>
            )}
        </Card>
    );
}

/** Pro: today's key-focused routine and a fair week-over-week review, built only from data stored in this browser. */
export default function TrainingPanel() {
    const account = useStore($account);
    useEffect(() => { void refreshAccount(); }, []);
    if (account.status === "loading") return <p className="trn-status"><LoaderCircle className="acct-spin" size={16} aria-hidden="true" /> Loading your training…</p>;
    if (account.status === "error") return (
        <Card className="acct-card trn-gate">
            <h2>Could not load your training</h2>
            <p className="acct-note" role="alert">{account.message}</p>
            <div className="acct-actions"><KeyButton onPress={() => { $account.set({ status: "loading" }); void refreshAccount(); }}>Try again</KeyButton></div>
        </Card>
    );
    if (account.status !== "in" || !account.pro) {
        const out = account.status === "out";
        return (
            <Card className="acct-card trn-gate">
                <div className="acct-head"><h2>Adaptive training is a Pro feature</h2><ProBadge /></div>
                <p className="trn-intro">Build a practice routine around your own typing history.</p>
                <ul className="trn-points">
                    <li>A daily routine built from the keys you miss or hesitate on.</li>
                    <li>The evidence for every step, so you can see why a key was picked.</li>
                    <li>A fair weekly review that only compares like-for-like tests.</li>
                </ul>
                <div className="acct-actions">
                    <KeyLink href="/pro/" variant="primary">See NinjaType Pro</KeyLink>
                    {out && <KeyLink href="/account/">Sign in</KeyLink>}
                </div>
            </Card>
        );
    }
    return <div className="trn-grid"><Plan /><Review /></div>;
}
