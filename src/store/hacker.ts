import { atom } from "nanostores";

export type HackerPhase =
    | "awaiting"
    | "injecting"
    | "transferring"
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
export const $hackerSplits = atom<HackerLayoutSplits>({ ...DEFAULT_LAYOUT_SPLITS });

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

/** Duration (ms) of the injection phase */
export const INJECTION_DURATION = 8000;

/** Duration (ms) of the file transfer phase */
export const TRANSFER_DURATION = 12000;

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
    { id: "n1", name: "H0600", ip: "28.3.126", type: "router", ports: "22/tcp", latency: 12, status: "ONLINE" },
    { id: "n2", name: "10-CORE", ip: "192.126.123.238", type: "router", ports: "80,443", latency: 8, status: "EXPLOITED" },
    { id: "n3", name: "GW-CENTRAL", ip: "192.168.10.103", type: "globe", ports: "53,80,443,8080", latency: 2, status: "EXPLOITED" },
    { id: "n4", name: "WAN-GW", ip: "WAN", type: "target-globe", ports: "21,22,80,8443", latency: 34, status: "TARGET" },
    { id: "n5", name: "LAN-VAULT", ip: "LAN", type: "target-globe", ports: "3389,8000", latency: 45, status: "INFILTRATING" },
    { id: "n6", name: "D6910", ip: "192.168.6.213", type: "computer", ports: "22/tcp", latency: 14, status: "EXPLOITED" },
    { id: "n7", name: "500-NODE", ip: "193.186.2.238", type: "computer", ports: "80/tcp", latency: 19, status: "ONLINE" },
    { id: "n8", name: "10000-SYS", ip: "203.205.23.206", type: "computer", ports: "443/tcp", latency: 29, status: "SECURE" },
    { id: "n9", name: "S06-HOST", ip: "192.186.3.124", type: "computer", ports: "445/tcp", latency: 11, status: "ONLINE" },
    { id: "n10", name: "UGBN6", ip: "192.186.3.256", type: "computer", ports: "139/tcp", latency: 15, status: "ONLINE" },
    { id: "n11", name: "066606", ip: "192.168.3.324", type: "computer", ports: "22,80", latency: 9, status: "EXPLOITED" },
    { id: "n12", name: "SOKGSST010DE6", ip: "192.182.183.336", type: "computer", ports: "22,443", latency: 16, status: "TARGET" },
    { id: "n13", name: "SUB-GLOBE", ip: "193.180.2.204", type: "globe", ports: "8080/tcp", latency: 22, status: "EXPLOITED" },
    { id: "n14", name: "EXT-EXFIL", ip: "103.383.260.200", type: "target-globe", ports: "9001/tcp", latency: 62, status: "TARGET" },
];

/** Currently selected cyber target */
export const $hackerTarget = atom<HackerTarget>(TOPOLOGY_TARGETS[11]); // SOKGSST010DE6

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

/** Select a new target and signal all active panes */
export function selectHackerTarget(target: HackerTarget) {
    $hackerTarget.set(target);
    $hackerTargetVersion.set($hackerTargetVersion.get() + 1);
    // If previous attack had completed or transferred, re-arm to awaiting for the new target
    if ($hackerPhase.get() === "complete" || $hackerPhase.get() === "transferring") {
        $hackerPhase.set("awaiting");
    }
}

/** Reset all hacker state to initial values */
export function resetHackerState() {
    $hackerCharCount.set(0);
    $hackerPhase.set("awaiting");
    $hackerTarget.set(TOPOLOGY_TARGETS[11]);
    $hackerTargetVersion.set(0);
    $hackerFinalMessageVisible.set(false);
    $hackerFinalMessageConfig.set({
        enabled: true,
        type: "success",
        text: "Access Granted",
    });
    resetHackerSplits();
}
