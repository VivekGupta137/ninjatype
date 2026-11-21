/**
 * Italian QWERTY letter rows for the lesson keyboards.
 *
 * Italian keyboards follow the US QWERTY standard with accented
 * characters available through AltGr combinations. For lessons, we render
 * the common letters plus the accented characters that appear in typical
 * Italian typing text (è, à, ò, ù, ì).
 *
 * @module qwertyItLayout
 */

/** Physical QWERTY letter rows (no number row) used by the Italian lessons. */
export const QWERTY_IT_LETTER_ROWS: string[][] = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "è", "ì"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ò", "à", "ù"],
    ["z", "x", "c", "v", "b", "n", "m", ",", ".", "-"],
];

export const QWERTY_IT_HOME_KEYS: Record<string, string[]> = {
    left: ["a", "s", "d", "f"],
    right: ["j", "k", "l", "ò"],
};
