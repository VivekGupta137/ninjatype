/**
 * Swedish QWERTY finger lessons — mirrors constants/fingerLessons.ts.
 *
 * Level structure matches the English lessons (anchors → upper reaches →
 * lower reaches), with Swedish keys and Swedish cues. Home anchors for the
 * pinky are A/Ö; standard QWERTY with Swedish characters.
 *
 * @module fingerLessonsSV
 */

import { FINGER_KEYS_SV } from "./fingerKeysSV";
import type { FingerType } from "./fingerKeys";
import {
    generateSentenceFromKeys,
    getLevelFrom,
    type FingerLevel,
} from "./fingerLessons";

export const FINGER_LEVELS_SV: Record<FingerType, FingerLevel[]> = {
    pointer: [
        { name: "Grundställning", keys: ["f", "j"], cue: "Känn märkena på F och J — de hjälper dig hitta hemställningen utan att titta." },
        { name: "Grundställning och övre greppet", keys: ["f", "j", "g", "h", "r", "u", "t", "z"], cue: "Lägg till de inre och övre tangenterna. Återvänd till F och J efter varje tangent." },
        { name: "Nedre greppet", keys: [...FINGER_KEYS_SV.pointer], cue: "Lägg till V, B, N och M. Låt handlederna vila, återgå till hemställningen." },
    ],
    middle: [
        { name: "Grundställning", keys: ["d", "k"], cue: "Vila på D och K. Växla händerna med lätt, jämn beröring." },
        { name: "Övre greppet", keys: ["d", "k", "e", "i"], cue: "Greppa från D till E och från K till I, sedan tillbaka till grundställning." },
        { name: "Nedre greppet", keys: [...FINGER_KEYS_SV.middle], cue: "Lägg till C och kommatecken, medan hemställning och övre tangenterna stannar lugna." },
    ],
    ring: [
        { name: "Grundställning", keys: ["s", "l"], cue: "Vila på S och L. Håll de andra fingrarna avslappnade." },
        { name: "Övre greppet", keys: ["s", "l", "w", "o"], cue: "Greppa från S till W och från L till O utan att röra hela handen." },
        { name: "Nedre greppet", keys: [...FINGER_KEYS_SV.ring], cue: "Lägg till punkten. Lätt beröring, återvänd till S och L." },
    ],
    pinky: [
        { name: "Grundställning", keys: ["a", "ö"], cue: "Vila på A och Ö. Börja långsamt och lätt." },
        { name: "Övre greppet", keys: ["a", "ö", "q", "p"], cue: "Greppa till Q och P och återvänd utan att sträcka ut armarna." },
        { name: "Nedre och sidgreppet", keys: [...FINGER_KEYS_SV.pinky], cue: "Lägg till Å, Ä, Y, X och bindestreck. Små, kontrollerade rörelser." },
    ],
};

export const getFingerLevelSV = (finger: FingerType, level: number): FingerLevel =>
    getLevelFrom(FINGER_LEVELS_SV, finger, level);

/** Swedish lessons: drill sentence for a finger level (Swedish QWERTY). */
export const generateLevelSentenceSV = (finger: FingerType, level: number): string =>
    generateSentenceFromKeys(getFingerLevelSV(finger, level).keys);
