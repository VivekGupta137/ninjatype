/**
 * Swedish lesson details (home keys, descriptions, cues) for Swedish QWERTY.
 * Mirrors components/learn/lessonDetails.ts for the English lessons.
 */

import type { FingerType } from "@/constants/fingerKeys";

export const LESSON_DETAILS_SV: Record<FingerType, { homeKeys: string[]; description: string; cue: string }> = {
    pointer: { homeKeys: ["f", "j"], description: "Bygga grunden med fingrarna som täcker flest tangenter.", cue: "Känn märkena på F och J. Det är dina ankare." },
    middle: { homeKeys: ["d", "k"], description: "Hitta en jämn rytm med korta, raka greppet.", cue: "Vila på D och K. Greppa upp och ner, sedan tillbaka." },
    ring: { homeKeys: ["s", "l"], description: "Ge dina ringfingrar lite mer oberoende.", cue: "Vila på S och L. Håll andra fingrar avslappnade när du greppar." },
    pinky: { homeKeys: ["a", "ö"], description: "Bygga kontroll på de yttre tangenterna på tangentbordet.", cue: "Vila på A och Ö. Lätt tryck utan att sträcka ut." },
};
