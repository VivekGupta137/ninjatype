/**
 * Touch-typing finger key mappings for the Italian QWERTY layout.
 *
 * Italian QWERTY follows the US QWERTY pattern but includes accented
 * characters on the right pinky: è, à, ò, ù, ì (in place of brackets, quotes, etc.).
 * Home row anchors: A and Ì (or the comma/colon position for right pinky).
 *
 * @module fingerKeysIT
 */

import type { FingerType } from "./fingerKeys";

export const FINGER_KEYS_IT: Record<FingerType, string[]> = {
    // Index fingers: F/J home position
    // Left: F, R, T, V, B, G
    // Right: J, H, U, N, M, Y
    pointer: ["f", "g", "r", "t", "v", "b", "j", "h", "u", "n", "m", "y"],

    // Middle fingers: D/K home position
    // Left: D, E, C
    // Right: K, I, comma
    middle: ["d", "e", "c", "k", "i", ","],

    // Ring fingers: S/L home position
    // Left: S, W
    // Right: L, O, period
    ring: ["s", "w", "l", "o", "."],

    // Pinky fingers: A/Ì home position
    // Left: A, Q, Z, X
    // Right: Ì (accent), P, è, à, ò, ù, hyphen
    pinky: ["a", "q", "z", "x", "ì", "p", "è", "à", "ò", "ù", "-"],
};

export const FINGER_NAMES_IT: Record<FingerType, string> = {
    pointer: "Indice",
    middle: "Medio",
    ring: "Anulare",
    pinky: "Mignolo",
};

export const FINGER_HEADINGS_IT: Record<FingerType, string> = {
    // Italian finger nouns are invariant in the plural in this context.
    pointer: "Indice",
    middle: "Medio",
    ring: "Anulare",
    pinky: "Mignolo",
};
