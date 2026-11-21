/**
 * Dutch QWERTY finger lessons — mirrors constants/fingerLessons.ts.
 *
 * Level structure matches the English lessons (anchors → upper reaches →
 * lower reaches), with QWERTY keys and Dutch cues.
 *
 * @module fingerLessonsNL
 */

import { FINGER_KEYS_NL } from "./fingerKeysNL";
import type { FingerType } from "./fingerKeys";
import {
    generateSentenceFromKeys,
    getLevelFrom,
    type FingerLevel,
} from "./fingerLessons";

export const FINGER_LEVELS_NL: Record<FingerType, FingerLevel[]> = {
    pointer: [
        { name: "Basishouding", keys: ["f", "j"], cue: "Voel de kleine verhogingen op F en J — dit zijn je ankerpunten." },
        { name: "Basishouding en bovenste toetsen", keys: ["f", "j", "g", "h", "r", "u", "t", "y"], cue: "Voeg de binnenste en bovenste toetsen toe. Keer na elke toets terug naar F en J." },
        { name: "Onderste toetsen", keys: [...FINGER_KEYS_NL.pointer], cue: "Voeg V, B, N en M toe. Polsen blijven rustig, terug naar de basishouding." },
    ],
    middle: [
        { name: "Basishouding", keys: ["d", "k"], cue: "Rust op D en K. Wissel de handen af met lichte, gelijkmatige aanraking." },
        { name: "Bovenste toetsen", keys: ["d", "k", "e", "i"], cue: "Grijp van D naar E en van K naar I, dan terug naar basishouding." },
        { name: "Onderste toetsen", keys: [...FINGER_KEYS_NL.middle], cue: "Voeg C en de komma toe, terwijl basis- en bovenste toetsen rustig blijven." },
    ],
    ring: [
        { name: "Basishouding", keys: ["s", "l"], cue: "Rust op S en L. Houd je andere vingers ontspannen." },
        { name: "Bovenste toetsen", keys: ["s", "l", "w", "o"], cue: "Grijp van S naar W en van L naar O, zonder je hele hand te verplaatsen." },
        { name: "Onderste toetsen", keys: [...FINGER_KEYS_NL.ring], cue: "Voeg de punt toe. Lichte aanraking, terug naar S en L." },
    ],
    pinky: [
        { name: "Basishouding", keys: ["a", ";"], cue: "Rust op A en puntkomma. Begin voorzichtig met lichte druk." },
        { name: "Bovenste toetsen", keys: ["a", ";", "q", "'"], cue: "Grijp naar Q en apostrof en keer terug, zonder je handen te overrekken." },
        { name: "Onderste en zijtoetsen", keys: [...FINGER_KEYS_NL.pinky], cue: "Voeg Z en andere hoektoetsen toe. Kleine, gecontroleerde bewegingen." },
    ],
};

export const getFingerLevelNL = (finger: FingerType, level: number): FingerLevel =>
    getLevelFrom(FINGER_LEVELS_NL, finger, level);

/** Dutch lessons: drill sentence for a finger level (QWERTY). */
export const generateLevelSentenceNL = (finger: FingerType, level: number): string =>
    generateSentenceFromKeys(getFingerLevelNL(finger, level).keys);
