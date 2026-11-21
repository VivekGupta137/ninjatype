/**
 * German lesson details (home keys, descriptions, cues) for QWERTZ.
 * Mirrors components/learn/lessonDetails.ts for the English lessons.
 */

import type { FingerType } from "@/constants/fingerKeys";

export const LESSON_DETAILS_DE: Record<FingerType, { homeKeys: string[]; description: string; cue: string }> = {
    pointer: { homeKeys: ["f", "j"], description: "Baue die Basis mit den Fingern auf, die die meisten Tasten abdecken.", cue: "Fühle die kleinen Erhebungen auf F und J. Das sind deine Anker." },
    middle: { homeKeys: ["d", "k"], description: "Finde einen gleichmäßigen Rhythmus mit kurzen, geraden Griffen.", cue: "Ruhe auf D und K. Greife nach oben und unten, dann zurück." },
    ring: { homeKeys: ["s", "l"], description: "Gib deinen Ringfingern etwas mehr Unabhängigkeit.", cue: "Ruhe auf S und L. Halte die anderen Finger beim Greifen entspannt." },
    pinky: { homeKeys: ["a", "ö"], description: "Baue Kontrolle an den äußeren Tasten des QWERTZ-Keyboards auf.", cue: "Ruhe auf A und Ö. Leichter Druck, ohne Verrenken." },
};
