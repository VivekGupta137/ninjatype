import { atom } from "nanostores";
import { HACKER_SOURCE_LENGTH } from "../constants/hackerCode";
import {
    ANALYSIS_DURATION,
    INJECTION_DURATION,
    TRANSFER_DURATION,
    VERIFICATION_DURATION,
    TRANSFER_START,
    VERIFICATION_START,
    SEQUENCE_DURATION,
    buildSequenceEvents,
    sequencePhase,
    stageProgress,
    type SequenceEvent,
} from "../lib/hackerSequence";
export {
    ANALYSIS_DURATION,
    INJECTION_DURATION,
    TRANSFER_DURATION,
    VERIFICATION_DURATION,
    TRANSFER_START,
    VERIFICATION_START,
    SEQUENCE_DURATION,
} from "../lib/hackerSequence";

export type HackerPhase =
    | "awaiting"
    | "writing"
    | "analyzing"
    | "injecting"
    | "transferring"
    | "verifying"
    | "complete";
export type HackerColor = "green" | "amber" | "cyan" | "amoled";

export type HackerPaneId =
    | "editor"
    | "process"
    | "topology"
    | "memory"
    | "disasm"
    | "injector"
    | "transfer";

export interface HackerPanesState {
    editor: boolean;
    process: boolean;
    topology: boolean;
    memory: boolean;
    disasm: boolean;
    injector: boolean;
    transfer: boolean;
}

/** Total characters the user has "typed" into the editor */
export const $hackerCharCount = atom(0);

/** Current phase of the hacker sequence */
export const $hackerPhase = atom<HackerPhase>("awaiting");

/** Whether the bottom toolbar is visible */
export const $hackerToolbarVisible = atom(true);

/** Whether the settings modal is open */
export const $hackerSettingsOpen = atom(false);

/** Terminal color scheme */
export const $hackerColor = atom<HackerColor>("green");

/** Visibility of individual panes */
export const $hackerPanes = atom<HackerPanesState>({
    editor: true,
    process: true,
    topology: true,
    memory: true,
    disasm: true,
    injector: true,
    transfer: true,
});

export interface HackerLayoutSplits {
    mainSplit: number; // percentage of editor width (15..85, default 50)
    rowHeights: [number, number, number]; // heights of the 3 rows on the right (percentages, default [33.33, 33.33, 33.34])
    row1Split: number; // process vs topology (default 50)
    row2Split: number; // memory vs disasm (default 50)
    row3Split: number; // injector vs transfer (default 50)
}

export const DEFAULT_LAYOUT_SPLITS: HackerLayoutSplits = {
    mainSplit: 50,
    rowHeights: [33.33, 33.33, 33.34],
    row1Split: 50,
    row2Split: 50,
    row3Split: 50,
};

/** Dragged stretch/resize split percentages */
export const $hackerSplits = atom<HackerLayoutSplits>({
    ...DEFAULT_LAYOUT_SPLITS,
});

export function updateHackerSplits(partial: Partial<HackerLayoutSplits>) {
    $hackerSplits.set({
        ...$hackerSplits.get(),
        ...partial,
    });
}

export function resetHackerSplits() {
    $hackerSplits.set({ ...DEFAULT_LAYOUT_SPLITS });
}

/** Toggle visibility of a single pane */
export function toggleHackerPane(id: HackerPaneId) {
    const current = $hackerPanes.get();
    $hackerPanes.set({
        ...current,
        [id]: !current[id],
    });
}

/** Set visibility of a single pane */
export function setHackerPane(id: HackerPaneId, visible: boolean) {
    const current = $hackerPanes.get();
    $hackerPanes.set({
        ...current,
        [id]: visible,
    });
}

/** Restore all panes to visible */
export function restoreAllPanes() {
    $hackerPanes.set({
        editor: true,
        process: true,
        topology: true,
        memory: true,
        disasm: true,
        injector: true,
        transfer: true,
    });
    resetHackerSplits();
}

/** Number of characters needed to trigger code injection */
export const INJECTION_THRESHOLD = 200;

export interface HackerTarget {
    id: string;
    name: string;
    ip: string;
    type: "computer" | "globe" | "target-globe" | "router";
    ports: string;
    latency: number;
    status: "ONLINE" | "EXPLOITED" | "TARGET" | "INFILTRATING" | "SECURE";
}

export const TOPOLOGY_TARGETS: HackerTarget[] = [
    {
        id: "n1",
        name: "EDGE-GW",
        ip: "10.24.0.1",
        type: "router",
        ports: "22/tcp",
        latency: 12,
        status: "ONLINE",
    },
    {
        id: "n2",
        name: "CORE-RELAY",
        ip: "10.24.0.2",
        type: "router",
        ports: "80,443",
        latency: 8,
        status: "EXPLOITED",
    },
    {
        id: "n3",
        name: "GW-CENTRAL",
        ip: "10.24.0.3",
        type: "globe",
        ports: "53,80,443,8080",
        latency: 2,
        status: "EXPLOITED",
    },
    {
        id: "n4",
        name: "WAN-GW",
        ip: "10.24.0.4",
        type: "target-globe",
        ports: "21,22,80,8443",
        latency: 34,
        status: "TARGET",
    },
    {
        id: "n5",
        name: "LAN-VAULT",
        ip: "10.24.0.5",
        type: "target-globe",
        ports: "3389,8000",
        latency: 45,
        status: "INFILTRATING",
    },
    {
        id: "n6",
        name: "RELAY-06",
        ip: "10.24.1.1",
        type: "computer",
        ports: "22/tcp",
        latency: 14,
        status: "EXPLOITED",
    },
    {
        id: "n7",
        name: "PROXY-07",
        ip: "10.24.1.2",
        type: "computer",
        ports: "80/tcp",
        latency: 19,
        status: "ONLINE",
    },
    {
        id: "n8",
        name: "SECURE-08",
        ip: "10.24.1.3",
        type: "computer",
        ports: "443/tcp",
        latency: 29,
        status: "SECURE",
    },
    {
        id: "n9",
        name: "NODE-09",
        ip: "10.24.1.4",
        type: "computer",
        ports: "445/tcp",
        latency: 11,
        status: "ONLINE",
    },
    {
        id: "n10",
        name: "CACHE-10",
        ip: "10.24.1.5",
        type: "computer",
        ports: "139/tcp",
        latency: 15,
        status: "ONLINE",
    },
    {
        id: "n11",
        name: "AUTH-11",
        ip: "10.24.2.1",
        type: "computer",
        ports: "22,80",
        latency: 9,
        status: "EXPLOITED",
    },
    {
        id: "n12",
        name: "VAULT-12",
        ip: "10.24.2.2",
        type: "computer",
        ports: "22,443",
        latency: 16,
        status: "TARGET",
    },
    {
        id: "n13",
        name: "SUB-RELAY",
        ip: "10.24.2.3",
        type: "globe",
        ports: "8080/tcp",
        latency: 22,
        status: "EXPLOITED",
    },
    {
        id: "n14",
        name: "EXFIL-14",
        ip: "10.24.2.4",
        type: "target-globe",
        ports: "9001/tcp",
        latency: 62,
        status: "TARGET",
    },
];

/** Currently selected cyber target */
export const $hackerTarget = atom<HackerTarget>(TOPOLOGY_TARGETS[11]); // archive host

/** Version counter incremented on every target change to re-trigger cinematic pane re-inits */
export const $hackerTargetVersion = atom(0);

/** Final post-injection message configuration */
export type FinalMessageType = "success" | "fail";

export interface FinalMessageConfig {
    enabled: boolean;
    type: FinalMessageType;
    text: string;
}

export const $hackerFinalMessageConfig = atom<FinalMessageConfig>({
    enabled: true,
    type: "success",
    text: "Access Granted",
});

/** Whether the final message modal is currently displayed */
export const $hackerFinalMessageVisible = atom(false);

export function updateFinalMessageConfig(partial: Partial<FinalMessageConfig>) {
    const current = $hackerFinalMessageConfig.get();
    $hackerFinalMessageConfig.set({
        ...current,
        ...partial,
    });
}

/** Real-time injection progress (0-100%) shared across Injector and Transfer panes */
export const $hackerInjectionProgress = atom<number>(0);

/** Session timing belongs to the controller, independent of visible panes. */
export const $hackerTransferProgress = atom(0);
export const $hackerSessionStartedAt = atom<number | null>(null);

export interface HackerSession {
    elapsed: number;
    codeElapsed: number;
    codeDuration: number;
    phase: HackerPhase;
    events: SequenceEvent[];
    result: FinalMessageConfig | null;
}
export const $hackerSession = atom<HackerSession>({
    elapsed: 0,
    codeElapsed: 0,
    codeDuration: 0,
    phase: "awaiting",
    events: [],
    result: null,
});
let operationEvents: SequenceEvent[] = [];
let operationCodeStart = 0;
export const AUTO_CODE_CHARS_PER_SECOND = 900;

export function tickHackerSession(now = Date.now()) {
    const start = $hackerSessionStartedAt.get();
    const previous = $hackerSession.get();
    if (start === null || previous.phase === "complete") return;
    const wallElapsed = Math.max(
        previous.codeElapsed + previous.elapsed,
        now - start,
        0,
    );
    $hackerCharCount.set(
        Math.min(
            HACKER_SOURCE_LENGTH,
            Math.max(
                $hackerCharCount.get(),
                operationCodeStart +
                    Math.floor(
                        (wallElapsed / 1000) * AUTO_CODE_CHARS_PER_SECOND,
                    ),
            ),
        ),
    );
    const codeComplete = $hackerCharCount.get() >= HACKER_SOURCE_LENGTH;
    const codeDuration =
        codeComplete && previous.phase === "writing"
            ? Math.min(previous.codeDuration, wallElapsed)
            : previous.codeDuration;
    const elapsed = Math.min(
        SEQUENCE_DURATION,
        Math.max(0, wallElapsed - codeDuration),
    );
    const phase: HackerPhase = !codeComplete
        ? "writing"
        : sequencePhase(elapsed);
    const session = {
        ...previous,
        elapsed,
        codeElapsed: Math.min(wallElapsed, codeDuration),
        codeDuration,
        phase,
        events:
            phase === "writing"
                ? []
                : operationEvents.filter((event) => event.at <= elapsed),
    };
    $hackerSession.set(session);
    $hackerInjectionProgress.set(
        stageProgress(elapsed, ANALYSIS_DURATION, INJECTION_DURATION),
    );
    $hackerTransferProgress.set(
        stageProgress(elapsed, TRANSFER_START, TRANSFER_DURATION),
    );
    $hackerPhase.set(phase);
    if (phase === "complete")
        $hackerFinalMessageVisible.set(!!session.result?.enabled);
}

function clearSession() {
    operationEvents = [];
    $hackerSession.set({
        elapsed: 0,
        codeElapsed: 0,
        codeDuration: 0,
        phase: "awaiting",
        events: [],
        result: null,
    });
    $hackerSessionStartedAt.set(null);
    $hackerPhase.set("awaiting");
    $hackerInjectionProgress.set(0);
    $hackerTransferProgress.set(0);
    $hackerFinalMessageVisible.set(false);
}

export function selectHackerTarget(target: HackerTarget) {
    clearSession();
    $hackerTarget.set(target);
    $hackerTargetVersion.set($hackerTargetVersion.get() + 1);
}

export function initiatePayloadInjection(now = Date.now()) {
    if ($hackerPhase.get() !== "awaiting") return;
    $hackerCharCount.set(
        Math.min($hackerCharCount.get(), HACKER_SOURCE_LENGTH),
    );
    operationCodeStart = $hackerCharCount.get();
    const result = { ...$hackerFinalMessageConfig.get() };
    operationEvents = buildSequenceEvents(
        $hackerTarget.get(),
        result.type === "fail",
    );
    $hackerSession.set({
        elapsed: 0,
        codeElapsed: 0,
        codeDuration: Math.ceil(
            ((HACKER_SOURCE_LENGTH - operationCodeStart) /
                AUTO_CODE_CHARS_PER_SECOND) *
                1000,
        ),
        phase:
            operationCodeStart < HACKER_SOURCE_LENGTH ? "writing" : "analyzing",
        events:
            operationCodeStart < HACKER_SOURCE_LENGTH
                ? []
                : operationEvents.filter((event) => event.at === 0),
        result,
    });
    $hackerSessionStartedAt.set(now);
    $hackerPhase.set($hackerSession.get().phase);
}

/** Start another session without discarding appearance or message preferences. */
export function resetHackerState() {
    clearSession();
    $hackerCharCount.set(0);
    $hackerTargetVersion.set($hackerTargetVersion.get() + 1);
    resetHackerSplits();
}
