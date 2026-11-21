/**
 * Touch-typing finger key mappings for the Norwegian QWERTY layout.
 *
 * Norwegian keyboards are standard QWERTY with three additional keys:
 * - Ø (where US ';' is, right pinky upper reach)
 * - Æ (where US "'" is, right pinky upper reach)
 * - Å (where US '\' is, right pinky upper reach)
 * These are handled by the right pinky alongside other edge keys.
 *
 * @module fingerKeysNO
 */

import type { FingerType } from "./fingerKeys";

export const FINGER_KEYS_NO: Record<FingerType, string[]> = {
    // Index fingers: F/J home position
    // Left: F, R, T, V, B, G
    // Right: J, H, U, Y, N, M
    pointer: ["f", "g", "r", "t", "v", "b", "j", "h", "u", "y", "n", "m"],

    // Middle fingers: D/K home position
    // Left: D, E, C
    // Right: K, I, comma
    middle: ["d", "e", "c", "k", "i", ","],

    // Ring fingers: S/L home position
    // Left: S, W, X
    // Right: L, O, period
    ring: ["s", "w", "x", "l", "o", "."],

    // Pinky fingers: A/Ø home position
    // Left: A, Q, Z
    // Right: Ø, P, æ, å, hyphen, /
    pinky: ["a", "q", "z", "ø", "p", "æ", "å", "-", "/"],
};

export const FINGER_NAMES_NO: Record<FingerType, string> = {
    pointer: "pekefinger",
    middle: "langfinger",
    ring: "ringfinger",
    pinky: "lillefinger",
};

export const FINGER_HEADINGS_NO: Record<FingerType, string> = {
    // Norwegian finger nouns are invariant in the plural.
    pointer: "Pekefinger",
    middle: "Langfinger",
    ring: "Ringfinger",
    pinky: "Lillefinger",
};
