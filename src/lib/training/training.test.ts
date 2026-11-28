import { expect, test } from "bun:test";
import type { KeyMetric, KeypressAttempt } from "@/lib/keypressStats";
import type { TypingSession } from "@/store/history";
import priorityWords from "@/data/words-5k.json";
import { analyzeKeys } from "./weakKeys";
import { buildDrill, buildKeyDrill } from "./drills";
import { buildPlan } from "./plan";
import { weeklyReview } from "./review";

const m = (expected: number, errors: number, presses = expected, latency = 200): KeyMetric => ({ expected, errors, presses, totalLatencyMs: presses * latency });
const attempt = (i: number, keys: Record<string, KeyMetric>): KeypressAttempt => ({ sessionId: `s${i}`, timestamp: 1000 + i, keys });
const base = (): Record<string, KeyMetric> => Object.fromEntries("abcdefghijklmnop".split("").map(k => [k, m(20, 0)]));
const POOL = ["the", "tree", "after", "water", "better", "street", "letter", "later", "tear", "rate", "great", "write", "enter", "turn", "toe", "net", "set", "rest"];

test("sparse data gives no recommendation", () => {
    expect(analyzeKeys([attempt(1, base())]).status).toBe("insufficient");
    expect(analyzeKeys([attempt(1, { a: m(5, 3) }), attempt(2, { a: m(5, 3) }), attempt(3, { a: m(5, 3) })]).status).toBe("insufficient");
});

test("repeated misses and slow keys are flagged; single slips are not", () => {
    const keys = base();
    keys.e = m(20, 6);           // 30% errors
    keys.q = m(20, 0, 20, 450);  // very slow
    keys.z = m(3, 2);            // too few samples
    const res = analyzeKeys([1, 2, 3].map(i => attempt(i, keys)));
    expect(res.status).toBe("ready");
    if (res.status !== "ready") return;
    const found = res.focus.map(f => f.key);
    expect(found).toContain("e");
    expect(found).toContain("q");
    expect(found).not.toContain("z");
    expect(res.focus.find(f => f.key === "e")!.reasons).toContain("errors");
    expect(res.focus.find(f => f.key === "q")!.reasons).toContain("slow");
});

test("clean data yields ready with no focus", () => {
    const res = analyzeKeys([1, 2, 3].map(i => attempt(i, base())));
    expect(res).toMatchObject({ status: "ready", focus: [] });
});

test("drills are deterministic per seed and use the focus keys", () => {
    const a = buildDrill(["t", "r"], POOL, "2026-11-28:tr")!;
    expect(a).toEqual(buildDrill(["t", "r"], POOL, "2026-11-28:tr")!);
    expect(a.words).toBe(30);
    expect(a.coverage.t).toBeGreaterThan(5);
    expect(buildDrill(["q"], POOL, "x")).toBeNull();
    expect(buildDrill(["1"], POOL, "x")).toBeNull();
});

test("drills give rare supported keys practice without letting duplicate pool entries bias selection", () => {
    const common = Array.from({ length: 100 }, (_, i) => `e${String.fromCharCode(97 + Math.floor(i / 26))}${String.fromCharCode(97 + i % 26)}e`);
    const pool = [...common, "quiz"];
    const drill = buildDrill(["e", "q"], [...pool, ...pool], "balanced")!;
    const words = drill.text.split(" ");
    expect(drill.coverage.q).toBeGreaterThanOrEqual(15);
    expect(drill).toEqual(buildDrill(["e", "q"], pool, "balanced")!);
    expect(words.every((word, i) => i === 0 || word !== words[i - 1])).toBe(true);
    expect(buildDrill(["e"], pool, "other")!.text).not.toBe(buildDrill(["e"], pool, "balanced")!.text);
});

test("drills report unavailable keys and reject sparse or invalid input", () => {
    const drill = buildDrill(["e", "q"], POOL, "missing")!;
    expect(drill.coverage.q).toBe(0);
    expect(drill.coverage.e).toBeGreaterThan(0);
    expect(buildDrill(["e"], Array(20).fill("tree"), "sparse")).toBeNull();
    expect(buildDrill(["e"], POOL, "invalid", Infinity)).toBeNull();
    expect(buildDrill(["e"], POOL, "invalid", 0)).toBeNull();
});

test("single-key drills are stable and only use matching words", () => {
    const drill = buildKeyDrill("t", POOL, "2026-11-28")!;
    expect(drill).toEqual(buildKeyDrill("t", POOL, "2026-11-28")!);
    expect(drill.text.split(" ").every(word => word.includes("t"))).toBe(true);
    expect(drill.coverage.t).toBeGreaterThanOrEqual(drill.words);
    expect(buildKeyDrill("q", POOL, "2026-11-28")).toBeNull();
    const rare = buildKeyDrill("z", priorityWords.words, "2026-11-28")!;
    expect(rare.text.split(" ").every(word => word.includes("z"))).toBe(true);
});

test("priority keys retain error and latency evidence in ranked order", () => {
    const keys = base();
    keys.t = m(20, 6);
    keys.e = m(20, 4);
    keys.q = m(20, 0, 20, 450);
    const plan = buildPlan({ attempts: [1, 2, 3].map(i => attempt(i, keys)), sessions: [], wordPool: POOL, day: "2026-11-28" });
    expect(plan.status).toBe("ready");
    if (plan.status !== "ready") return;
    expect(plan.focus.map(item => item.key)).toEqual(["t", "q", "e"]);
    expect(plan.focus[0]).toMatchObject({ errors: 18, expected: 60, errorRate: 30, reasons: ["errors"] });
    expect(plan.focus[1].reasons).toContain("slow");
    expect(plan.focus[1].errors).toBe(0);
});

test("plan: drill plus retest with usual settings and evidence", () => {
    const keys = base();
    keys.t = m(20, 6);
    const settings = { mode: "time", countdownTime: "1m", dictionary: "1k" };
    const now = Date.now();
    const sessions: TypingSession[] = [1, 2, 3].map(i => ({ id: `${i}`, timestamp: now - i * 1000, wpm: 50 + i, cpm: 250, accuracy: 96, errors: 2, duration: 60, mode: "time", practiceSettings: settings as any }));
    const plan = buildPlan({ attempts: [1, 2, 3].map(i => attempt(i, keys)), sessions, wordPool: POOL, day: "2026-11-28", now });
    expect(plan.status).toBe("ready");
    if (plan.status !== "ready") return;
    expect(plan.steps.map(s => s.id)).toEqual(["drill", "retest"]);
    expect(plan.steps[0].evidence[0]).toMatch(/^T: 18 misses in 60/);
    expect(plan.steps[1].evidence[0]).toMatch(/3 tests averaging 52 WPM/);
});

const sess = (daysAgo: number, wpm: number, now: number, countdownTime = "1m"): TypingSession => ({ id: `${daysAgo}-${wpm}-${countdownTime}`, timestamp: now - daysAgo * 86_400_000, wpm, cpm: wpm * 5, accuracy: 96, errors: 1, duration: 60, mode: "time", practiceSettings: { mode: "time", countdownTime, dictionary: "1k" } as any });

test("weekly review: insufficient without comparable sessions in both weeks", () => {
    const now = Date.now();
    const r = weeklyReview([sess(1, 50, now), sess(2, 52, now), sess(9, 40, now, "30s"), sess(10, 41, now, "30s")], now);
    expect(r.status).toBe("insufficient");
    expect(r.missing).toBeTruthy();
    expect(r.sessionsThisWeek).toBe(2);
});

test("weekly review: compares like with like and reports improvement", () => {
    const now = Date.now();
    const r = weeklyReview([sess(1, 55, now), sess(2, 57, now), sess(8, 50, now), sess(9, 52, now), sess(3, 90, now, "30s")], now);
    expect(r.status).toBe("ready");
    expect(r.groups).toHaveLength(1);
    expect(r.groups[0]).toMatchObject({ wpmThis: 56, wpmPrev: 51, deltaWpm: 5 });
    expect(r.verdict).toBe("improving");
});

test("weekly review: plateau needs three flat comparable weeks", () => {
    const now = Date.now();
    const flat = [1, 2, 8, 9, 15, 16].map((d, i) => sess(d, 50 + (i % 2) * 0.5, now));
    expect(weeklyReview(flat, now)).toMatchObject({ verdict: "steady", plateau: true });
    const rising = [1, 2, 8, 9, 15, 16].map(d => sess(d, 60 - d, now));
    expect(weeklyReview(rising, now).plateau).toBe(false);
});

test("library drills are stable per day, respect their rules and need enough words", async () => {
    const { LIBRARY, buildLibraryDrill } = await import("./library");
    const words = (await import("@/data/words-5k.json")).default.words as string[];
    const long = (await import("@/data/words-2k-long.json")).default.words as string[];
    const pools = { words, long };
    for (const d of LIBRARY) {
        const a = buildLibraryDrill(d.id, pools, "2026-11-28");
        expect(a).not.toBeNull();
        expect(buildLibraryDrill(d.id, pools, "2026-11-28")).toBe(a);
        expect(a!.length).toBeLessThan(900);
    }
    expect(buildLibraryDrill("home-row", pools, "2026-11-28")!.replace(/ /g, "")).toMatch(/^[asdfghjkl]+$/);
    expect(buildLibraryDrill("numbers", pools, "2026-11-28")!).toMatch(/^[0-9 ]+$/);
    expect(buildLibraryDrill("home-row", { words: ["a"], long: [] }, "d")).toBeNull();
    expect(buildLibraryDrill("nope", pools, "d")).toBeNull();
});
