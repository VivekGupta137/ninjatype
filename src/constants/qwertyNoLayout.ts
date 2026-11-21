/**
 * Norwegian QWERTY letter rows for the lesson keyboards.
 *
 * Norwegian uses standard QWERTY plus three special keys:
 * - Ø (right pinky upper)
 * - Æ (right pinky middle)
 * - Å (right pinky lower)
 *
 * @module qwertyNoLayout
 */

/** Physical Norwegian QWERTY letter rows (no number row) used by the lessons. */
export const QWERTY_NO_LETTER_ROWS: string[][] = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "ø"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", "æ"],
    ["z", "x", "c", "v", "b", "n", "m", ",", ".", "å"],
];

export const QWERTY_NO_HOME_KEYS: Record<string, string[]> = {
    left: ["a", "s", "d", "f"],
    right: ["j", "k", "l", "ø"],
};
