/**
 * Touch-typing finger key mappings for the Swedish QWERTY layout.
 *
 * Swedish layout notes:
 * - Ö is where English semicolon is (right side of L)
 * - Ä is where English apostrophe is (far right of the home row)
 * - Å is at the backslash position (left of backspace)
 * - The home row is: A S D F (left) and J K L Ö (right)
 * - Right pinky covers Ö, Å, Ä, and punctuation (. -)
 *
 * @module fingerKeysSV
 */

import type { FingerType } from "./fingerKeys";

export const FINGER_KEYS_SV: Record<FingerType, string[]> = {
    // Index fingers: F/J home position
    // Left: F, R, T, V, B, G
    // Right: J, Z, U, H, N, M (standard QWERTY)
    pointer: ["f", "g", "r", "t", "v", "b", "j", "h", "z", "u", "n", "m"],

    // Middle fingers: D/K home position
    // Left: D, E, C
    // Right: K, I, comma
    middle: ["d", "e", "c", "k", "i", ","],

    // Ring fingers: S/L home position
    // Left: S, W
    // Right: L, O, period
    ring: ["s", "w", "l", "o", "."],

    // Pinky fingers: A/Ö home position
    // Left: A, Q, Y, X
    // Right: Ö, P, Å, Ä, hyphen
    pinky: ["a", "q", "y", "x", "ö", "p", "å", "ä", "-"],
};

export const FINGER_NAMES_SV: Record<FingerType, string> = {
    pointer: "pekfinger",
    middle: "långfinger",
    ring: "ringfinger",
    pinky: "lillfinger",
};

export const FINGER_HEADINGS_SV: Record<FingerType, string> = {
    // Swedish finger nouns are plural-invariant in compound headings.
    pointer: "pekfinger",
    middle: "långfinger",
    ring: "ringfinger",
    pinky: "lillfinger",
};
