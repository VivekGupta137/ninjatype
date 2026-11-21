/**
 * French AZERTY finger lessons — mirrors constants/fingerLessons.ts.
 *
 * Level structure matches the English lessons (anchors → upper reaches →
 * lower reaches), with AZERTY keys and French cues. Home anchors for the
 * pinky are A/M; Y sits on the right, Z on the left (AZERTY).
 *
 * @module fingerLessonsFR
 */

import { FINGER_KEYS_FR } from "./fingerKeysFR";
import type { FingerType } from "./fingerKeys";
import {
    generateSentenceFromKeys,
    getLevelFrom,
    type FingerLevel,
} from "./fingerLessons";

export const FINGER_LEVELS_FR: Record<FingerType, FingerLevel[]> = {
    pointer: [
        { name: "Positions de base", keys: ["f", "j"], cue: "Repose sur F et J. Les petites bosses tactiles te guident sans regarder." },
        { name: "Positions de base et grips supérieurs", keys: ["f", "j", "g", "h", "r", "u", "t", "y"], cue: "Ajoute les grips intérieurs et supérieurs. Reviens à F et J après chaque frappe." },
        { name: "Grips inférieurs", keys: [...FINGER_KEYS_FR.pointer], cue: "Ajoute V, B, N et M. Les poignets restent stables, retour aux positions de base." },
    ],
    middle: [
        { name: "Positions de base", keys: ["d", "k"], cue: "Repose sur D et K. Alterné avec douceur et régularité entre les mains." },
        { name: "Grips supérieurs", keys: ["d", "k", "e", "i"], cue: "Glisse de D à E et de K à I, puis reviens aux positions de base." },
        { name: "Grips inférieurs", keys: [...FINGER_KEYS_FR.middle], cue: "Ajoute C et l'apostrophe, tandis que les positions de base restent stables." },
    ],
    ring: [
        { name: "Positions de base", keys: ["s", "l"], cue: "Repose sur S et L. Garde les autres doigts détendus." },
        { name: "Grips supérieurs", keys: ["s", "l", "z", "o"], cue: "Glisse de S à Z et de L à O, sans bouger la main entière." },
        { name: "Grips inférieurs", keys: [...FINGER_KEYS_FR.ring], cue: "Ajoute le point. Touch légère, retour à S et L." },
    ],
    pinky: [
        { name: "Positions de base", keys: ["a", "m"], cue: "Repose sur A et M. Commence lentement avec une pression légère." },
        { name: "Grips supérieurs", keys: ["a", "m", "q", "p"], cue: "Glisse vers Q et P et reviens, sans forcer les mains." },
        { name: "Grips inférieurs et latéraux", keys: [...FINGER_KEYS_FR.pinky], cue: "Ajoute les accents français (è, ç, à, ù), W, X, et le trait d'union. Mouvements petits et contrôlés." },
    ],
};

export const getFingerLevelFR = (finger: FingerType, level: number): FingerLevel =>
    getLevelFrom(FINGER_LEVELS_FR, finger, level);

/** French lessons: drill sentence for a finger level (AZERTY). */
export const generateLevelSentenceFR = (finger: FingerType, level: number): string =>
    generateSentenceFromKeys(getFingerLevelFR(finger, level).keys);
