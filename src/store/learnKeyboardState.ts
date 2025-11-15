/**
 * Basic Keyboard State Atoms for Learn Touch Typing Feature
 * 
 * Contains the fundamental keyboard state atoms that are shared between
 * learnKeyboard.ts and learnAnalytics.ts to avoid circular dependencies.
 * 
 * @module learnKeyboardState
 */

import { atom } from "nanostores";
import { KBSTATE, KBTYPINGSTATE } from "@/constants/keyboardState";
import type { FingerType } from "@/constants/fingerKeys";

/**
 * Key state for practice customization
 */
export interface LearnKeyState {
    /** The keyboard key character */
    key: string;
    /** Whether the key is active (enabled) for practice */
    active: boolean;
}

/**
 * Current keyboard focus state for learn practice
 * Controls whether the typing area is active
 */
export const $learnKbState = atom<KBSTATE>(KBSTATE.NOT_FOCUSSED);

/**
 * Current typing state for learn practice
 * Tracks whether user is idle, typing, or has completed
 */
export const $learnKbTypingState = atom<KBTYPINGSTATE>(KBTYPINGSTATE.IDLE);

/**
 * The sentence being typed in learn practice
 * Contains the finger-specific practice text
 */
export const $learnKbSentence = atom<string>("");

/**
 * The text the user has typed so far in learn practice
 * Used for real-time comparison with the target sentence
 */
export const $learnKbTypedText = atom<string>("");

/**
 * Stopwatch tracking elapsed time in seconds
 * Updates every second while typing is in progress
 */
export const $learnStopwatch = atom<number>(0);

/**
 * List of keys with their active/inactive state
 * Controls which keys are included in practice text generation
 * Keys with active: false are disabled and excluded from sentences
 */
export const $learnKeys = atom<LearnKeyState[]>([]);

/**
 * The current finger being practiced
 * Used by effects to generate finger-specific sentences and track progress
 */
export const $learnCurrentFinger = atom<FingerType>("pinky");
