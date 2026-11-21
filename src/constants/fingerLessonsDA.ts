/**
 * Danish QWERTY finger lessons — mirrors constants/fingerLessons.ts.
 *
 * Level structure matches the English lessons (anchors → upper reaches →
 * lower reaches), with QWERTY keys and Danish cues. Home anchors for the
 * pinky are A/Æ. Danish home row: A-S-D-F (left), J-K-L-Æ (right).
 *
 * @module fingerLessonsDA
 */

import { FINGER_KEYS_DA } from "./fingerKeysDA";
import type { FingerType } from "./fingerKeys";
import {
    generateSentenceFromKeys,
    getLevelFrom,
    type FingerLevel,
} from "./fingerLessons";

export const FINGER_LEVELS_DA: Record<FingerType, FingerLevel[]> = {
    pointer: [
        { name: "Grundstilling", keys: ["f", "j"], cue: "Føl de små ophøjninger på F og J — det er dine ankertaster." },
        { name: "Grundstilling og øvre griff", keys: ["f", "j", "g", "h", "r", "u", "t", "y"], cue: "Tilføj de indre og øvre taster. Vend tilbage til F og J efter hver tast." },
        { name: "Nedre griff", keys: [...FINGER_KEYS_DA.pointer], cue: "Tilføj V, B, N og M. Hold håndleddet roligt, tilbage til grundstilling." },
    ],
    middle: [
        { name: "Grundstilling", keys: ["d", "k"], cue: "Hvil på D og K. Skift hænder med let, ensartet berøring." },
        { name: "Øvre griff", keys: ["d", "k", "e", "i"], cue: "Grib fra D til E og fra K til I, så tilbage til grundstilling." },
        { name: "Nedre griff", keys: [...FINGER_KEYS_DA.middle], cue: "Tilføj C og kommaet mens grund- og øvre taster forbliver rolige." },
    ],
    ring: [
        { name: "Grundstilling", keys: ["s", "l"], cue: "Hvil på S og L. Hold de øvrige fingre afslappede." },
        { name: "Øvre griff", keys: ["s", "l", "w", "o"], cue: "Grib fra S til W og fra L til O uden at flytte hele hånden." },
        { name: "Nedre griff", keys: [...FINGER_KEYS_DA.ring], cue: "Tilføj punktum. Let berøring, tilbage til S og L." },
    ],
    pinky: [
        { name: "Grundstilling", keys: ["a", "æ"], cue: "Hvil på A og Æ. Start langsomt og med let tryk." },
        { name: "Øvre griff", keys: ["a", "æ", "q", "p"], cue: "Grib til Q og P og vend tilbage uden at forvride hænderne." },
        { name: "Nedre og side griff", keys: [...FINGER_KEYS_DA.pinky], cue: "Tilføj Ø, Å, X, Z og bindestreg. Små, kontrollerede bevægelser." },
    ],
};

export const getFingerLevelDA = (finger: FingerType, level: number): FingerLevel =>
    getLevelFrom(FINGER_LEVELS_DA, finger, level);

/** Danish lessons: drill sentence for a finger level (QWERTY). */
export const generateLevelSentenceDA = (finger: FingerType, level: number): string =>
    generateSentenceFromKeys(getFingerLevelDA(finger, level).keys);
