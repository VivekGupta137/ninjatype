/**
 * Touch-typing finger key mappings for the German QWERTZ layout.
 *
 * Differences from the QWERTY mapping (constants/fingerKeys.ts):
 * - Y and Z are swapped: Y belongs to the left pinky, Z to the right index.
 * - The right pinky covers the umlauts Ü, Ö, Ä and ß (plus hyphen).
 * - The right home row ends on Ö; A and Ö are the pinky anchors.
 *
 * @module fingerKeysDe
 */

import type { FingerType } from "./fingerKeys";

export const FINGER_KEYS_DE: Record<FingerType, string[]> = {
    // Index fingers: F/J home position
    // Left: F, R, T, V, B, G
    // Right: J, Z, U, H, N, M (QWERTZ: Z replaces Y)
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
    // Right: Ö, P, Ü, Ä, ß, hyphen
    pinky: ["a", "q", "y", "x", "ö", "p", "ü", "ä", "ß", "-"],
};

export const FINGER_NAMES_DE: Record<FingerType, string> = {
    pointer: "Zeigefinger",
    middle: "Mittelfinger",
    ring: "Ringfinger",
    pinky: "Kleiner Finger",
};

export const FINGER_HEADINGS_DE: Record<FingerType, string> = {
    // German finger nouns are invariant in the plural.
    pointer: "Zeigefinger",
    middle: "Mittelfinger",
    ring: "Ringfinger",
    pinky: "Kleiner Finger",
};
