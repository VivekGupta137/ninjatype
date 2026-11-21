/**
 * Touch-typing finger key mappings for the Danish QWERTY layout.
 *
 * Danish QWERTY differs from the US layout in that Æ, Ø, and Å replace US ';', "'", and '\' keys.
 * The right pinky covers Æ, Ø, Å (the Danish vowels) plus dot and hyphen.
 * Danish keyboard order: Æ, Ø, Å (not Norwegian Ø, Æ).
 *
 * @module fingerKeysDA
 */

import type { FingerType } from "./fingerKeys";

export const FINGER_KEYS_DA: Record<FingerType, string[]> = {
    // Index fingers: F/J home position
    // Left: F, R, T, V, B, G
    // Right: J, Y, U, H, N, M (QWERTY standard for Danish)
    pointer: ["f", "g", "r", "t", "v", "b", "j", "h", "y", "u", "n", "m"],

    // Middle fingers: D/K home position
    // Left: D, E, C
    // Right: K, I, comma
    middle: ["d", "e", "c", "k", "i", ","],

    // Ring fingers: S/L home position
    // Left: S, W
    // Right: L, O, period
    ring: ["s", "w", "l", "o", "."],

    // Pinky fingers: A/Æ home position
    // Left: A, Q, X
    // Right: Æ, P, Ø, Å, hyphen (Danish vowels on right pinky)
    pinky: ["a", "q", "x", "æ", "p", "ø", "å", "-"],
};

export const FINGER_NAMES_DA: Record<FingerType, string> = {
    pointer: "pegefinger",
    middle: "langefinger",
    ring: "ringfinger",
    pinky: "lillefinger",
};

export const FINGER_HEADINGS_DA: Record<FingerType, string> = {
    // Danish finger nouns are invariant in the plural.
    pointer: "Pegefinger",
    middle: "Langefinger",
    ring: "Ringfinger",
    pinky: "Lillefinger",
};
