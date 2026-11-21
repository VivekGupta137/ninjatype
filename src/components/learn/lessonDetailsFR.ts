/**
 * French lesson details (home keys, descriptions, cues) for AZERTY.
 * Mirrors components/learn/lessonDetails.ts for the English lessons.
 */

import type { FingerType } from "@/constants/fingerKeys";

export const LESSON_DETAILS_FR: Record<FingerType, { homeKeys: string[]; description: string; cue: string }> = {
    pointer: { homeKeys: ["f", "j"], description: "Construis la base avec les doigts qui couvrent le plus de touches.", cue: "Sens les petites bosses sur F et J. Ce sont tes repères tactiles." },
    middle: { homeKeys: ["d", "k"], description: "Trouve un rythme régulier avec des frappes courtes et directes.", cue: "Repose sur D et K. Glisse haut et bas, puis reviens." },
    ring: { homeKeys: ["s", "l"], description: "Développe l'indépendance de tes annulaires.", cue: "Repose sur S et L. Garde les autres doigts détendus en frappant." },
    pinky: { homeKeys: ["a", "m"], description: "Maîtrise les touches externes du clavier AZERTY avec contrôle.", cue: "Repose sur A et M. Pression légère, sans forcer." },
};
