/**
 * Touch-typing finger key mappings for the French AZERTY layout.
 *
 * AZERTY layout (France standard):
 * - Top row: a z e r t y u i o p (left to right)
 * - Home row: q s d f g h j k l m (left to right)
 * - Bottom row: w x c v b n (left to right)
 * - French accents/specials: é è ê ç à ù (rightmost keys and shifted positions)
 *
 * Finger mapping for AZERTY:
 * - Left pinky: Q, A, W, X
 * - Left ring: S, Z
 * - Left middle: D, E, C
 * - Left index: F, R, T, V, B, G
 * - Right index: H, Y, U, J, N, M
 * - Right middle: K, I, apostrophe (')
 * - Right ring: L, O, period (.)
 * - Right pinky: P, asterisk (*), colon (:), slash (/), equals (=), accent keys (^, `, $), è, ç, à, ù, minus (-)
 *
 * Home row anchors: A and M (where fingers rest; bumps on A and M in physical keyboards)
 *
 * @module fingerKeysFR
 */

import type { FingerType } from "./fingerKeys";

export const FINGER_KEYS_FR: Record<FingerType, string[]> = {
    // Index fingers: F/J home position (AZERTY)
    // Left: F, R, T, V, B, G
    // Right: H, Y, U, J, N, M
    pointer: ["f", "g", "r", "t", "v", "b", "h", "j", "y", "u", "n", "m"],

    // Middle fingers: D/K home position (AZERTY)
    // Left: D, E, C
    // Right: K, I, apostrophe
    middle: ["d", "e", "c", "k", "i", "'"],

    // Ring fingers: S/L home position (AZERTY)
    // Left: S, Z
    // Right: L, O, period
    ring: ["s", "z", "l", "o", "."],

    // Pinky fingers: A/M home position (AZERTY)
    // Left: A, Q, W, X
    // Right: M, P, colon, slash, equals, caret, backtick, dollar, è, ç, à, ù, minus
    // Note: French accents are included (è, ç, à, ù)
    pinky: ["a", "q", "w", "x", "m", "p", ":", "/", "=", "^", "`", "$", "è", "ç", "à", "ù", "-"],
};

export const FINGER_NAMES_FR: Record<FingerType, string> = {
    pointer: "index",
    middle: "majeur",
    ring: "annulaire",
    pinky: "auriculaire",
};

export const FINGER_HEADINGS_FR: Record<FingerType, string> = {
    // French finger nouns are invariant in the plural (used as headings).
    pointer: "Index",
    middle: "Majeur",
    ring: "Annulaire",
    pinky: "Auriculaire",
};
