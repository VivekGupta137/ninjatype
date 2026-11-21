/**
 * Italian QWERTY finger lessons — mirrors constants/fingerLessons.ts.
 *
 * Level structure matches the English lessons (anchors → upper reaches →
 * lower reaches), with Italian keys and Italian cues. Home anchors for the
 * pinky are A/Ò; accented characters are included in the pinky's lower reaches.
 *
 * @module fingerLessonsIT
 */

import { FINGER_KEYS_IT } from "./fingerKeysIT";
import type { FingerType } from "./fingerKeys";
import {
    generateSentenceFromKeys,
    getLevelFrom,
    type FingerLevel,
} from "./fingerLessons";

export const FINGER_LEVELS_IT: Record<FingerType, FingerLevel[]> = {
    pointer: [
        { name: "Posizione base", keys: ["f", "j"], cue: "Usa i rilievi su F e J per trovare la posizione base senza guardare." },
        { name: "Posizione base e tasti superiori", keys: ["f", "j", "g", "h", "r", "u", "t", "y"], cue: "Aggiungi i tasti interni e superiori. Torna a F e J dopo ogni pressione." },
        { name: "Tasti inferiori", keys: [...FINGER_KEYS_IT.pointer], cue: "Aggiungi V, B, N e M. Mantieni il polso stabile, torna alla posizione base." },
    ],
    middle: [
        { name: "Posizione base", keys: ["d", "k"], cue: "Appoggia su D e K. Alterna le mani con tocchi leggeri e uniformi." },
        { name: "Tasti superiori", keys: ["d", "k", "e", "i"], cue: "Premi da D a E e da K a I, poi torna alla posizione base." },
        { name: "Tasti inferiori", keys: [...FINGER_KEYS_IT.middle], cue: "Aggiungi la virgola. Mantieni i tasti base e superiori fermi." },
    ],
    ring: [
        { name: "Posizione base", keys: ["s", "l"], cue: "Appoggia su S e L. Mantieni le altre dita rilassate." },
        { name: "Tasti superiori", keys: ["s", "l", "w", "o"], cue: "Premi da S a W e da L a O, senza muovere tutta la mano." },
        { name: "Tasti inferiori", keys: [...FINGER_KEYS_IT.ring], cue: "Aggiungi il punto. Tocco leggero, torna a S e L." },
    ],
    pinky: [
        { name: "Posizione base", keys: ["a", "ò"], cue: "Appoggia su A e Ò. Inizia lentamente con una pressione leggera." },
        { name: "Tasti superiori", keys: ["a", "ò", "q", "p"], cue: "Premi a Q e P e torna indietro, senza storcere le mani." },
        { name: "Tasti inferiori e laterali", keys: [...FINGER_KEYS_IT.pinky], cue: "Aggiungi è, à, ù, ì, Z, X e il trattino. Movimenti piccoli e controllati." },
    ],
};

export const getFingerLevelIT = (finger: FingerType, level: number): FingerLevel =>
    getLevelFrom(FINGER_LEVELS_IT, finger, level);

/** Italian lessons: drill sentence for a finger level (QWERTY). */
export const generateLevelSentenceIT = (finger: FingerType, level: number): string =>
    generateSentenceFromKeys(getFingerLevelIT(finger, level).keys);
