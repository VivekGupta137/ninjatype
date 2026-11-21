/**
 * Danish QWERTY letter rows for the lesson keyboards.
 *
 * Danish QWERTY: æ, ø, å replace the US ;, ', \ keys.
 * These rows are plain characters (no KEYBOARD event codes for Danish vowels).
 *
 * Home keys: A-S-D-F (left), J-K-L-Æ (right).
 *
 * @module qwertyDaLayout
 */

/** Physical Danish QWERTY letter rows (no number row) used by the lessons. */
export const QWERTY_DA_LETTER_ROWS: string[][] = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "å"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", "æ", "ø"],
    ["z", "x", "c", "v", "b", "n", "m", ",", ".", "-"],
];

export const QWERTY_DA_HOME_KEYS: Record<string, string[]> = {
    left: ["a", "s", "d", "f"],
    right: ["j", "k", "l", "æ"],
};
