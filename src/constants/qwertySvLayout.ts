/**
 * Swedish QWERTY letter rows for the lesson keyboards.
 *
 * Swedish layout: standard QWERTY with Swedish characters:
 * - Row 1: QWERTYUIOPÅÄÖ mapped to Swedish keys
 * - Row 2: ASDFGHJKLÖ (right pinky covers Ö)
 * - Row 3: ZXCVBNM with å/ä accessible from pinky
 *
 * @module qwertySvLayout
 */

/** Physical Swedish QWERTY letter rows (no number row) used by the Swedish lessons. */
export const QWERTY_SV_LETTER_ROWS: string[][] = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "å"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ö", "ä"],
    ["z", "x", "c", "v", "b", "n", "m", ",", ".", "-"],
];

export const QWERTY_SV_HOME_KEYS: Record<string, string[]> = {
    left: ["a", "s", "d", "f"],
    right: ["j", "k", "l", "ö"],
};
