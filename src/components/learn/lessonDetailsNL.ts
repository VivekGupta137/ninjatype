/**
 * Dutch lesson details (home keys, descriptions, cues) for QWERTY.
 * Mirrors components/learn/lessonDetails.ts for the English lessons.
 */

import type { FingerType } from "@/constants/fingerKeys";

export const LESSON_DETAILS_NL: Record<FingerType, { homeKeys: string[]; description: string; cue: string }> = {
    pointer: { homeKeys: ["f", "j"], description: "Bouw de basis met de vingers die de meeste toetsen bereiken.", cue: "Voel de kleine verhogingen op F en J. Dit zijn je ankerpunten." },
    middle: { homeKeys: ["d", "k"], description: "Vind een gelijkmatige maat met korte, rechte grepen.", cue: "Rust op D en K. Grijp omhoog en omlaag, dan terug." },
    ring: { homeKeys: ["s", "l"], description: "Geef je ringvingers meer onafhankelijkheid.", cue: "Rust op S en L. Houd je andere vingers ontspannen terwijl je grijpt." },
    pinky: { homeKeys: ["a", ";"], description: "Bouw controle op op de buitentoetsen van het toetsenbord.", cue: "Rust op A en puntkomma. Lichte druk, zonder je handen te overrekken." },
};
