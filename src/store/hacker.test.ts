import { beforeEach, describe, expect, test } from "bun:test";
import {
    $hackerPhase,
    $hackerCharCount,
    AUTO_CODE_CHARS_PER_SECOND,
    $hackerSession,
    $hackerInjectionProgress,
    $hackerTransferProgress,
    $hackerSessionStartedAt,
    $hackerFinalMessageVisible,
    $hackerFinalMessageConfig,
    $hackerColor,
    $hackerPanes,
    $hackerTarget,
    ANALYSIS_DURATION,
    TRANSFER_START,
    VERIFICATION_START,
    SEQUENCE_DURATION,
    INJECTION_DURATION,
    TRANSFER_DURATION,
    TOPOLOGY_TARGETS,
    initiatePayloadInjection as beginOperation,
    tickHackerSession,
    resetHackerState,
    selectHackerTarget,
    toggleHackerPane,
} from "./hacker";
import { HACKER_SOURCE_LENGTH } from "../constants/hackerCode";
const start = 10_000;
// Pipeline tests start with an already completed source file.
function initiatePayloadInjection(now: number) {
    $hackerCharCount.set(HACKER_SOURCE_LENGTH);
    beginOperation(now);
}
beforeEach(() => {
    resetHackerState();
    selectHackerTarget(TOPOLOGY_TARGETS[11]);
    $hackerFinalMessageConfig.set({
        enabled: true,
        type: "success",
        text: "Access Granted",
    });
    $hackerPanes.set({
        editor: true,
        process: true,
        topology: true,
        memory: true,
        disasm: true,
        injector: true,
        transfer: true,
    });
    $hackerColor.set("green");
});
describe("terminal session controller", () => {
    test("progresses while both workflow panels are hidden", () => {
        initiatePayloadInjection(start);
        toggleHackerPane("injector");
        toggleHackerPane("transfer");
        tickHackerSession(start + ANALYSIS_DURATION + INJECTION_DURATION / 2);
        expect($hackerInjectionProgress.get()).toBe(50);
        expect($hackerPhase.get()).toBe("injecting");
        tickHackerSession(start + TRANSFER_START + TRANSFER_DURATION / 2);
        expect($hackerInjectionProgress.get()).toBe(100);
        expect($hackerTransferProgress.get()).toBe(50);
        expect($hackerPhase.get()).toBe("transferring");
        expect($hackerFinalMessageVisible.get()).toBe(false);
        tickHackerSession(start + SEQUENCE_DURATION);
        expect($hackerPhase.get()).toBe("complete");
        expect($hackerTransferProgress.get()).toBe(100);
        expect($hackerFinalMessageVisible.get()).toBe(true);
    });
    test("catches up after the tab is inactive and does not reopen dismissed results", () => {
        initiatePayloadInjection(start);
        tickHackerSession(start + 90_000);
        expect($hackerPhase.get()).toBe("complete");
        $hackerFinalMessageVisible.set(false);
        tickHackerSession(start + 100_000);
        expect($hackerFinalMessageVisible.get()).toBe(false);
    });
    test("repeated run presses do not restart the clock", () => {
        initiatePayloadInjection(start);
        initiatePayloadInjection(start + 2000);
        expect($hackerSessionStartedAt.get()).toBe(start);
    });
    test("switching targets cancels the previous run during either phase", () => {
        for (const elapsed of [
            1000,
            ANALYSIS_DURATION + 1000,
            TRANSFER_START + 1000,
            VERIFICATION_START + 1000,
        ]) {
            initiatePayloadInjection(start);
            tickHackerSession(start + elapsed);
            selectHackerTarget(TOPOLOGY_TARGETS[0]);
            tickHackerSession(start + 90_000);
            expect($hackerTarget.get().id).toBe("n1");
            expect($hackerPhase.get()).toBe("awaiting");
            expect($hackerInjectionProgress.get()).toBe(0);
            expect($hackerTransferProgress.get()).toBe(0);
            expect($hackerFinalMessageVisible.get()).toBe(false);
        }
    });
    test("reset cancels the run and retains appearance and result preferences", () => {
        $hackerColor.set("cyan");
        $hackerFinalMessageConfig.set({
            enabled: false,
            type: "fail",
            text: "Custom message",
        });
        initiatePayloadInjection(start);
        resetHackerState();
        tickHackerSession(start + 90_000);
        expect($hackerPhase.get()).toBe("awaiting");
        expect($hackerColor.get()).toBe("cyan");
        expect($hackerFinalMessageConfig.get().text).toBe("Custom message");
    });
    test("respects disabled completion dialogs", () => {
        $hackerFinalMessageConfig.set({
            ...$hackerFinalMessageConfig.get(),
            enabled: false,
        });
        initiatePayloadInjection(start);
        tickHackerSession(start + 90_000);
        expect($hackerPhase.get()).toBe("complete");
        expect($hackerFinalMessageVisible.get()).toBe(false);
    });
    test("never advances progress before the session start", () => {
        initiatePayloadInjection(start);
        tickHackerSession(start - 5000);
        expect($hackerInjectionProgress.get()).toBe(0);
        expect($hackerTransferProgress.get()).toBe(0);
    });
});

describe("coordinated reverse-engineering pipeline", () => {
    test("memory and disassembly respond before the payload is identified or injected", () => {
        initiatePayloadInjection(start);
        tickHackerSession(start + 800);
        expect($hackerPhase.get()).toBe("analyzing");
        expect(
            $hackerSession
                .get()
                .events.some(
                    (event) =>
                        event.pane === "memory" &&
                        event.text.includes("REQUEST ← PAYLOAD"),
                ),
        ).toBe(true);
        expect($hackerInjectionProgress.get()).toBe(0);
        expect($hackerTransferProgress.get()).toBe(0);
        tickHackerSession(start + 3600);
        expect(
            $hackerSession
                .get()
                .events.some(
                    (event) =>
                        event.pane === "injector" &&
                        event.text.includes("RESPONSE ← MEMDUMP"),
                ),
        ).toBe(true);
        expect(
            $hackerSession
                .get()
                .events.some((event) =>
                    event.text.includes("PAYLOAD IDENTIFIED"),
                ),
        ).toBe(false);
        tickHackerSession(start + 8000);
        const events = $hackerSession.get().events;
        const memoryReply = events.findIndex(
            (event) =>
                event.pane === "memory" &&
                event.text.includes("RESPONSE → PAYLOAD"),
        );
        const disasmReply = events.findIndex(
            (event) =>
                event.pane === "disasm" &&
                event.text.includes("RESPONSE → PAYLOAD"),
        );
        const payloadIdentified = events.findIndex((event) =>
            event.text.includes("PAYLOAD IDENTIFIED"),
        );
        expect(memoryReply).toBeGreaterThan(-1);
        expect(disasmReply).toBeGreaterThan(memoryReply);
        expect(payloadIdentified).toBeGreaterThan(disasmReply);
        expect($hackerInjectionProgress.get()).toBe(0);
        tickHackerSession(start + ANALYSIS_DURATION);
        expect($hackerPhase.get()).toBe("injecting");
    });
    test("all evidence references agree across panes and survive hidden analysis panels", () => {
        toggleHackerPane("memory");
        toggleHackerPane("disasm");
        initiatePayloadInjection(start);
        tickHackerSession(start + ANALYSIS_DURATION);
        const events = $hackerSession.get().events;
        const memoryFinding = events.find((event) =>
            event.text.includes("AUTH BUFFER FOUND"),
        )!;
        const key = memoryFinding.text.match(/key=(0x[0-9a-f]+)/)![1];
        const buffer = memoryFinding.text.match(/FOUND \/\/ (0x[0-9a-f]+)/)![1];
        const identified = events.find((event) =>
            event.text.includes("PAYLOAD IDENTIFIED"),
        )!;
        expect(identified.text).toContain(key);
        expect(identified.text).toContain(buffer);
        expect(
            events.some(
                (event) =>
                    event.pane === "disasm" && event.text.includes(buffer),
            ),
        ).toBe(true);
    });
    test("scp waits for injection, then verification waits for all bytes", () => {
        initiatePayloadInjection(start);
        tickHackerSession(start + TRANSFER_START - 1);
        expect(
            $hackerSession
                .get()
                .events.some((event) => event.pane === "transfer"),
        ).toBe(false);
        expect($hackerTransferProgress.get()).toBe(0);
        tickHackerSession(start + TRANSFER_START);
        expect($hackerPhase.get()).toBe("transferring");
        expect(
            $hackerSession
                .get()
                .events.some(
                    (event) =>
                        event.pane === "transfer" &&
                        event.text.includes("HANDOFF ← PAYLOAD"),
                ),
        ).toBe(true);
        tickHackerSession(start + VERIFICATION_START);
        expect($hackerTransferProgress.get()).toBe(100);
        expect($hackerPhase.get()).toBe("verifying");
        expect($hackerFinalMessageVisible.get()).toBe(false);
        expect(
            $hackerSession
                .get()
                .events.filter(
                    (event) =>
                        event.pane === "transfer" &&
                        event.text.includes("// RECEIVED."),
                ),
        ).toHaveLength(5);
        tickHackerSession(start + SEQUENCE_DURATION);
        expect($hackerPhase.get()).toBe("complete");
        expect($hackerFinalMessageVisible.get()).toBe(true);
    });
    test("denied operations use one captured outcome, with no contradictory success messages", () => {
        $hackerFinalMessageConfig.set({
            enabled: true,
            type: "fail",
            text: "LOCKOUT",
        });
        initiatePayloadInjection(start);
        $hackerFinalMessageConfig.set({
            enabled: false,
            type: "success",
            text: "Changed preference",
        });
        tickHackerSession(start + SEQUENCE_DURATION);
        const session = $hackerSession.get();
        expect(session.result?.type).toBe("fail");
        expect(session.result?.text).toBe("LOCKOUT");
        expect($hackerFinalMessageVisible.get()).toBe(true);
        expect(
            session.events.some((event) =>
                event.text.includes("ACCESS GRANTED"),
            ),
        ).toBe(false);
        expect(
            session.events.some((event) =>
                event.text.includes("EXFILTRATION COMPLETE"),
            ),
        ).toBe(false);
        expect(
            session.events
                .filter((event) => event.at === SEQUENCE_DURATION)
                .every((event) => event.level === "warning"),
        ).toBe(true);
    });
    test("ticks catch up in order without duplicate events or backwards progress", () => {
        initiatePayloadInjection(start);
        tickHackerSession(start + 12_000);
        const elapsed = $hackerSession.get().elapsed;
        tickHackerSession(start + 1000);
        expect($hackerSession.get().elapsed).toBe(elapsed);
        tickHackerSession(start + SEQUENCE_DURATION);
        const events = $hackerSession.get().events;
        expect(new Set(events.map((event) => event.id)).size).toBe(
            events.length,
        );
        expect(events.map((event) => event.at)).toEqual(
            [...events.map((event) => event.at)].sort((a, b) => a - b),
        );
    });
    test("target changes and resets remove every old request and response", () => {
        initiatePayloadInjection(start);
        tickHackerSession(start + 9000);
        selectHackerTarget(TOPOLOGY_TARGETS[1]);
        expect($hackerSession.get().events).toEqual([]);
        initiatePayloadInjection(start + 10_000);
        tickHackerSession(start + 19_000);
        expect(
            $hackerSession
                .get()
                .events.some((event) => event.text.includes("REV-02")),
        ).toBe(true);
        expect(
            $hackerSession
                .get()
                .events.some((event) => event.text.includes("REV-12")),
        ).toBe(false);
        resetHackerState();
        tickHackerSession(start + 90_000);
        expect($hackerSession.get().events).toEqual([]);
        expect($hackerFinalMessageVisible.get()).toBe(false);
    });
});

describe("finite automatic code stream", () => {
    test("payload waits for the editor, then starts exactly once after the source finishes", () => {
        beginOperation(start);
        const duration = $hackerSession.get().codeDuration;
        expect($hackerPhase.get()).toBe("writing");
        toggleHackerPane("editor");
        tickHackerSession(start + 1000);
        expect($hackerCharCount.get()).toBe(AUTO_CODE_CHARS_PER_SECOND);
        expect($hackerSession.get().events).toEqual([]);
        expect($hackerInjectionProgress.get()).toBe(0);
        tickHackerSession(start + duration - 1);
        expect($hackerCharCount.get()).toBeLessThan(HACKER_SOURCE_LENGTH);
        expect($hackerPhase.get()).toBe("writing");
        tickHackerSession(start + duration);
        expect($hackerCharCount.get()).toBe(HACKER_SOURCE_LENGTH);
        expect($hackerPhase.get()).toBe("analyzing");
        tickHackerSession(start + duration + 1000);
        expect(
            $hackerSession
                .get()
                .events.some((event) =>
                    event.text.includes("REQUEST → MEMDUMP"),
                ),
        ).toBe(true);
        const events = $hackerSession.get().events.length;
        beginOperation(start + duration + 1000);
        tickHackerSession(start + duration + 1000);
        expect($hackerSession.get().events).toHaveLength(events);
        expect($hackerCharCount.get()).toBe(HACKER_SOURCE_LENGTH);
    });
    test("the source never repeats during injection, exfiltration, or completion", () => {
        beginOperation(start);
        const duration = $hackerSession.get().codeDuration;
        for (const elapsed of [
            duration,
            duration + ANALYSIS_DURATION + 1000,
            duration + TRANSFER_START + 1000,
            duration + SEQUENCE_DURATION,
            100_000,
        ]) {
            tickHackerSession(start + elapsed);
            expect($hackerCharCount.get()).toBe(HACKER_SOURCE_LENGTH);
        }
        expect($hackerPhase.get()).toBe("complete");
    });
    test("existing typed code is completed and cancellation stops the writer", () => {
        $hackerCharCount.set(1000);
        beginOperation(start);
        tickHackerSession(start + 1000);
        expect($hackerCharCount.get()).toBe(1000 + AUTO_CODE_CHARS_PER_SECOND);
        selectHackerTarget(TOPOLOGY_TARGETS[1]);
        const cancelled = $hackerCharCount.get();
        tickHackerSession(start + 90_000);
        expect($hackerCharCount.get()).toBe(cancelled);
        resetHackerState();
        tickHackerSession(start + 100_000);
        expect($hackerCharCount.get()).toBe(0);
    });
});
