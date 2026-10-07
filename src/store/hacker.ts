import { atom } from "nanostores";

export type HackerPhase =
    | "awaiting"
    | "injecting"
    | "transferring"
    | "complete";
export type HackerColor = "green" | "amber" | "cyan";

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

/** Number of characters needed to trigger code injection */
export const INJECTION_THRESHOLD = 200;

/** Duration (ms) of the injection phase */
export const INJECTION_DURATION = 8000;

/** Duration (ms) of the file transfer phase */
export const TRANSFER_DURATION = 12000;

/** Reset all hacker state to initial values */
export function resetHackerState() {
    $hackerCharCount.set(0);
    $hackerPhase.set("awaiting");
}
