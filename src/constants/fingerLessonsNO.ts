/**
 * Norwegian QWERTY finger lessons — mirrors constants/fingerLessonsDe.ts.
 *
 * Level structure matches the English lessons (anchors → upper reaches →
 * lower reaches), with QWERTY keys and Norwegian (Bokmål) cues.
 * Home anchors for the pinky are A/Ø; Norwegian special characters (ø, æ, å)
 * are in the pinky's reach.
 *
 * @module fingerLessonsNO
 */

import { FINGER_KEYS_NO } from "./fingerKeysNO";
import type { FingerType } from "./fingerKeys";
import {
    generateSentenceFromKeys,
    getLevelFrom,
    type FingerLevel,
} from "./fingerLessons";

export const FINGER_LEVELS_NO: Record<FingerType, FingerLevel[]> = {
    pointer: [
        { name: "Grunnstilling", keys: ["f", "j"], cue: "Kjenn små kuler på F og J — det er dine ankere." },
        { name: "Grunnstilling og øvre griper", keys: ["f", "j", "g", "h", "r", "u", "t", "y"], cue: "Legg til innertastene og øvre griper. Tilbake til F og J etter hver tast." },
        { name: "Nedre griper", keys: [...FINGER_KEYS_NO.pointer], cue: "Legg til V, B, N og M. Hold håndleddene stille, tilbake til grunnstilling." },
    ],
    middle: [
        { name: "Grunnstilling", keys: ["d", "k"], cue: "Hvil på D og K. Veksl mellom hendene med lett, jevn trykk." },
        { name: "Øvre griper", keys: ["d", "k", "e", "i"], cue: "Grep fra D til E og fra K til I, så tilbake til grunnstilling." },
        { name: "Nedre griper", keys: [...FINGER_KEYS_NO.middle], cue: "Legg til C og komma mens grunnstilling og øvre griper forblir stabil." },
    ],
    ring: [
        { name: "Grunnstilling", keys: ["s", "l"], cue: "Hvil på S og L. Hold de andre fingrene avslappet." },
        { name: "Øvre griper", keys: ["s", "l", "w", "o"], cue: "Grep fra S til W og fra L til O uten å flytte hele hånden." },
        { name: "Nedre griper", keys: [...FINGER_KEYS_NO.ring], cue: "Legg til X og punkt. Lett trykk, tilbake til S og L." },
    ],
    pinky: [
        { name: "Grunnstilling", keys: ["a", "ø"], cue: "Hvil på A og Ø. Start sakte og med lett trykk." },
        { name: "Øvre griper", keys: ["a", "ø", "q", "p"], cue: "Grep til Q og P og tilbake uten å vri håndleddet." },
        { name: "Nedre og sidegriper", keys: [...FINGER_KEYS_NO.pinky], cue: "Legg til Æ, Å, bindestrek og skråstrek. Små, kontrollerte bevegelser." },
    ],
};

export const getFingerLevelNO = (finger: FingerType, level: number): FingerLevel =>
    getLevelFrom(FINGER_LEVELS_NO, finger, level);

/** Norwegian lessons: drill sentence for a finger level (QWERTY). */
export const generateLevelSentenceNO = (finger: FingerType, level: number): string =>
    generateSentenceFromKeys(getFingerLevelNO(finger, level).keys);
