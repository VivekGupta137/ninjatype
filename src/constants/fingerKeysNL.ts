/**
 * Touch-typing finger key mappings for the Dutch QWERTY layout.
 *
 * Dutch keyboards use the standard QWERTY layout (same as English).
 * FINGER_KEYS_NL directly mirrors FINGER_KEYS; only the names are Dutch.
 *
 * Finger names: wijsvinger, middelvinger, ringvinger, pink.
 *
 * @module fingerKeysNL
 */

import type { FingerType } from "./fingerKeys";

export const FINGER_KEYS_NL: Record<FingerType, string[]> = {
    // Index fingers: F/J home position
    pointer: ["f", "g", "r", "t", "v", "b", "j", "h", "u", "y", "n", "m"],
    
    // Middle fingers: D/K home position
    middle: ["d", "e", "c", "k", "i", ","],
    
    // Ring fingers: S/L home position
    ring: ["s", "w", "x", "l", "o", "."],
    
    // Pinky fingers: A/; home position
    pinky: ["a", "q", "z", ";", "'"],
};

export const FINGER_NAMES_NL: Record<FingerType, string> = {
    pointer: "wijsvinger",
    middle: "middelvinger",
    ring: "ringvinger",
    pinky: "pink",
};

export const FINGER_HEADINGS_NL: Record<FingerType, string> = {
    // Dutch nouns take plural 's' or are invariant; here we use singular for headings
    pointer: "Wijsvinger",
    middle: "Middelvinger",
    ring: "Ringvinger",
    pinky: "Pink",
};
