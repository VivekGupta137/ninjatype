/**
 * Touch-typing finger key mappings for Japanese QWERTY layout (romaji input).
 *
 * Japanese romaji input uses the standard QWERTY keyboard (no layout transformation).
 * All keys are latinized (a-z, numbers, punctuation) because Japanese typists
 * input romaji as latin letters, then the IME converts to kana.
 *
 * Finger names use Japanese: 人差し指, 中指, 薬指, 小指
 *
 * @module fingerKeysJA
 */

import type { FingerType } from "./fingerKeys";

export const FINGER_KEYS_JA: Record<FingerType, string[]> = {
    // Index fingers: F/J home position
    // Left: F, R, T, V, B, G
    // Right: J, U, I, K, O, L
    pointer: ["f", "g", "r", "t", "v", "b", "j", "k", "u", "i", "o", "l"],

    // Middle fingers: D/K home position (already in pointer above, so different assignment)
    // Left: D, E, C
    // Right: K (home), comma
    // Note: K is primary home for right middle, but since QWERTY has it under index,
    // we assign the secondary reach keys to middle
    middle: ["d", "e", "c", ";", "p"],

    // Ring fingers: S/L home position
    // Left: S, W
    // Right: L (home), period
    ring: ["s", "w", "l", "."],

    // Pinky fingers: A/semicolon home position
    // Left: A, Q, Z, X
    // Right: semicolon, backslash, bracket, quote
    pinky: ["a", "q", "z", "x", ";", "[", "'", "-"],
};

export const FINGER_NAMES_JA: Record<FingerType, string> = {
    pointer: "人差し指",
    middle: "中指",
    ring: "薬指",
    pinky: "小指",
};

export const FINGER_HEADINGS_JA: Record<FingerType, string> = {
    pointer: "人差し指",
    middle: "中指",
    ring: "薬指",
    pinky: "小指",
};
