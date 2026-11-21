/**
 * German QWERTZ finger lessons — mirrors constants/fingerLessons.ts.
 *
 * Level structure matches the English lessons (anchors → upper reaches →
 * lower reaches), with QWERTZ keys and German cues. Home anchors for the
 * pinky are A/Ö; Y sits on the left, Z on the right (QWERTZ).
 *
 * @module fingerLessonsDe
 */

import { FINGER_KEYS_DE } from "./fingerKeysDe";
import type { FingerType } from "./fingerKeys";
import {
    generateSentenceFromKeys,
    getLevelFrom,
    type FingerLevel,
} from "./fingerLessons";

export const FINGER_LEVELS_DE: Record<FingerType, FingerLevel[]> = {
    pointer: [
        { name: "Grundstellung", keys: ["f", "j"], cue: "Nutze die Erhebungen auf F und J, um die Grundstellung ohne Hinschauen zu finden." },
        { name: "Grundstellung und obere Griffe", keys: ["f", "j", "g", "h", "r", "u", "t", "z"], cue: "Ergänze die inneren und oberen Griffe. Kehre nach jedem Griff zu F und J zurück." },
        { name: "Untere Griffe", keys: [...FINGER_KEYS_DE.pointer], cue: "Ergänze V, B, N und M. Die Handgelenke bleiben ruhig, zurück in die Grundstellung." },
    ],
    middle: [
        { name: "Grundstellung", keys: ["d", "k"], cue: "Ruhe auf D und K. Wechsle die Hände mit leichter, gleichmäßiger Berührung." },
        { name: "Obere Griffe", keys: ["d", "k", "e", "i"], cue: "Greife von D zu E und von K zu I, dann zurück in die Grundstellung." },
        { name: "Untere Griffe", keys: [...FINGER_KEYS_DE.middle], cue: "Ergänze C und das Komma, während Grund- und obere Tasten ruhig bleiben." },
    ],
    ring: [
        { name: "Grundstellung", keys: ["s", "l"], cue: "Ruhe auf S und L. Halte die anderen Finger entspannt." },
        { name: "Obere Griffe", keys: ["s", "l", "w", "o"], cue: "Greife von S zu W und von L zu O, ohne die ganze Hand zu bewegen." },
        { name: "Untere Griffe", keys: [...FINGER_KEYS_DE.ring], cue: "Ergänze den Punkt. Leichte Berührung, zurück zu S und L." },
    ],
    pinky: [
        { name: "Grundstellung", keys: ["a", "ö"], cue: "Ruhe auf A und Ö. Fang langsam und mit leichtem Druck an." },
        { name: "Obere Griffe", keys: ["a", "ö", "q", "p"], cue: "Greife zu Q und P und kehre zurück, ohne die Hände zu verrenken." },
        { name: "Untere und Seitengriffe", keys: [...FINGER_KEYS_DE.pinky], cue: "Ergänze Ü, Ä, ß, Y, X und den Bindestrich. Kleine, kontrollierte Bewegungen." },
    ],
};

export const getFingerLevelDe = (finger: FingerType, level: number): FingerLevel =>
    getLevelFrom(FINGER_LEVELS_DE, finger, level);

/** German lessons: drill sentence for a finger level (QWERTZ). */
export const generateLevelSentenceDe = (finger: FingerType, level: number): string =>
    generateSentenceFromKeys(getFingerLevelDe(finger, level).keys);
