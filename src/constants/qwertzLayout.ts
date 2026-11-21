/**
 * German QWERTZ letter rows for the lesson keyboards.
 *
 * The English lesson keyboards render `QWERTY_ROWS.slice(1)` (KEYBOARD event
 * codes); German umlauts have no KEYBOARD code mapping, so these rows are
 * plain characters. `keyDisplayLabel` passes single characters through, so
 * the lesson components can render either row shape.
 *
 * @module qwertzLayout
 */

/** Physical QWERTZ letter rows (no number row) used by the German lessons. */
export const QWERTZ_LETTER_ROWS: string[][] = [
    ["q", "w", "e", "r", "t", "z", "u", "i", "o", "p", "ü", "ß"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ö", "ä"],
    ["y", "x", "c", "v", "b", "n", "m", ",", ".", "-"],
];

export const QWERTZ_HOME_KEYS: Record<string, string[]> = {
    left: ["a", "s", "d", "f"],
    right: ["j", "k", "l", "ö"],
};
