import { describe, expect, test } from "bun:test";
import { paneActivity, sequenceFocusPane, sequencePhase, SEQUENCE_DURATION, type SequencePane } from "./hackerSequence";

const panes: SequencePane[] = ["editor", "process", "topology", "memory", "disasm", "injector", "transfer"];

describe("pane run indicators", () => {
    test("idle before a run and after completion, including denied runs", () => {
        for (const pane of panes) {
            expect(paneActivity(pane, "awaiting", 0)).toBe("idle");
            expect(paneActivity(pane, "complete", SEQUENCE_DURATION)).toBe("idle");
        }
    });
    test("writing marks the editor active and workers pending", () => {
        expect(paneActivity("editor", "writing", 0)).toBe("active");
        expect(paneActivity("process", "writing", 0)).toBe("active");
        expect(paneActivity("topology", "writing", 0)).toBe("active");
        for (const pane of ["memory", "disasm", "injector", "transfer"] as const) {
            expect(paneActivity(pane, "writing", 0)).toBe("pending");
        }
    });
    test("worker requests, acknowledgements and later work determine state", () => {
        expect(paneActivity("memory", "analyzing", 799)).toBe("pending");
        expect(paneActivity("memory", "analyzing", 800)).toBe("active");
        expect(paneActivity("memory", "analyzing", 3600)).toBe("pending");
        expect(paneActivity("editor", "analyzing", 0)).toBe("idle");
        expect(paneActivity("disasm", "analyzing", 4400)).toBe("active");
        expect(paneActivity("transfer", "injecting", 17999)).toBe("pending");
        expect(paneActivity("transfer", "transferring", 18000)).toBe("active");
        expect(paneActivity("injector", "transferring", 18000)).toBe("pending");
        expect(paneActivity("injector", "verifying", 30000)).toBe("active");
    });
});

describe("mobile sequence following", () => {
    test("follows readable handoffs and catches up after backgrounding", () => {
        expect(sequenceFocusPane("writing", 0, panes)).toBe("editor");
        for (const [elapsed, pane] of [[0, "injector"], [800, "memory"], [4400, "disasm"], [8000, "injector"], [10000, "injector"], [18000, "transfer"], [29000, "transfer"], [30000, "injector"]] as const) {
            expect(sequenceFocusPane(sequencePhase(elapsed), elapsed, panes)).toBe(pane);
        }
        expect(sequenceFocusPane("awaiting", 0, panes)).toBe("editor");
    });
    test("never reopens closed panes and handles all panes closed", () => {
        expect(sequenceFocusPane("transferring", 20000, ["editor", "memory"])).toBe("memory");
        expect(sequenceFocusPane("writing", 0, ["transfer"])).toBe("transfer");
        expect(sequenceFocusPane("transferring", 20000, [])).toBeUndefined();
    });
});
