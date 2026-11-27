import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { AdvancedStatsView } from "./AdvancedStats";
import HistoryAdvancedStats from "./HistoryAdvancedStats";
import { aggregateAdvanced, fingerLoad } from "@/lib/advancedStats";

const advanced = {
    rhythm: 90, medianGapMs: 100, burstWpm: 80, sustainedWpm: 60,
    errorKinds: { substitution: 2, omission: 1, transposition: 0, extra: 0 },
    bigrams: { th: { attempts: 10, errors: 2, timed: 8, totalMs: 1000 } },
};

function expectFocusedPanels(html: string) {
    expect(html).toContain("Rhythm");
    expect(html).toContain("Burst vs sustained");
    for (const removed of ["Error types", "What kind of mistakes", "Clean run", "Key-pair analysis", "Slowest pairs", "Error-prone pairs", "adv-bigrams", "adv-bars"]) {
        expect(html).not.toContain(removed);
    }
}

test("shared session panel omits error types and key pairs even with measured data", () => {
    const view = aggregateAdvanced([advanced]);
    view.fingers = fingerLoad([{ typed: "a", expected: "a", correct: true, time: 100, latencyMs: 100 }], "qwerty");
    const html = renderToStaticMarkup(<AdvancedStatsView view={view} />);
    expectFocusedPanels(html);
    expect(html).toContain("Finger load");
});

test("history panel and its description omit removed analyses", () => {
    const html = renderToStaticMarkup(<HistoryAdvancedStats sessions={[{
        timestamp: Date.now(), wpm: 60, cpm: 300, accuracy: 95, errors: 3,
        duration: 30, mode: "words", advanced,
    }]} />);
    expectFocusedPanels(html);
    expect(html).not.toContain("error types");
    expect(html).not.toContain("key-pair");
    expect(html).not.toContain("advanced-stats-heading");
    expect(html).not.toContain("filtered attempts");
    expect(html).not.toContain("Attempts saved before this feature");
    const empty = renderToStaticMarkup(<HistoryAdvancedStats sessions={[]} />);
    expect(empty).toBe("");
});
