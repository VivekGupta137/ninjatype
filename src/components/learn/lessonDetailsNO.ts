/**
 * Norwegian lesson details (home keys, descriptions, cues) for QWERTY.
 * Mirrors components/learn/lessonDetails.ts for the English lessons.
 */

import type { FingerType } from "@/constants/fingerKeys";

export const LESSON_DETAILS_NO: Record<FingerType, { homeKeys: string[]; description: string; cue: string }> = {
    pointer: { homeKeys: ["f", "j"], description: "Bygg grunnlaget med fingrene som dekker flest taster.", cue: "Kjenn små kuler på F og J. Det er dine ankere." },
    middle: { homeKeys: ["d", "k"], description: "Finn en jevn rytme med korte, rette griper.", cue: "Hvil på D og K. Grep opp og ned, så tilbake." },
    ring: { homeKeys: ["s", "l"], description: "Gi ringfingrene litt mer frihet.", cue: "Hvil på S og L. Hold de andre fingrene avslappet ved grep." },
    pinky: { homeKeys: ["a", "ø"], description: "Bygg kontroll på ytterkantene av tastaturet.", cue: "Hvil på A og Ø. Lett trykk, uten vridning." },
};
