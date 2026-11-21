/**
 * French AZERTY letter rows for the lesson keyboards.
 *
 * The French lesson keyboards render physical AZERTY letter rows
 * (no number row). `keyDisplayLabel` passes single characters through, so
 * the lesson components can render either row shape.
 *
 * @module azertyLayout
 */

/** Physical AZERTY letter rows (no number row) used by the French lessons. */
export const AZERTY_LETTER_ROWS: string[][] = [
    ["a", "z", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["q", "s", "d", "f", "g", "h", "j", "k", "l", "m"],
    ["w", "x", "c", "v", "b", "n"],
];

export const AZERTY_HOME_KEYS: Record<string, string[]> = {
    left: ["a", "q", "d", "f"],
    right: ["j", "k", "l", "m"],
};
