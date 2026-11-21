/**
 * Danish lesson details (home keys, descriptions, cues) for QWERTY.
 * Mirrors components/learn/lessonDetails.ts for the English lessons.
 */

import type { FingerType } from "@/constants/fingerKeys";

export const LESSON_DETAILS_DA: Record<FingerType, { homeKeys: string[]; description: string; cue: string }> = {
    pointer: { homeKeys: ["f", "j"], description: "Byg grundlaget med de fingre, der dækker flest taster.", cue: "Føl de små bumper på F og J — det er dine ankerogter." },
    middle: { homeKeys: ["d", "k"], description: "Find en stabil rytme med korte, lige greb.", cue: "Hvil på D og K. Grib op og ned, så tilbage." },
    ring: { homeKeys: ["s", "l"], description: "Giv dine ringfingre mere selvstændighed.", cue: "Hvil på S og L. Hold de øvrige fingre afslappede når du griber." },
    pinky: { homeKeys: ["a", "æ"], description: "Byg kontrol på QWERTY-tastaturets ydertaster.", cue: "Hvil på A og Æ. Let tryk uden at forvride." },
};
