/**
 * Italian lesson details (home keys, descriptions, cues) for QWERTY.
 * Mirrors components/learn/lessonDetails.ts for the English lessons.
 */

import type { FingerType } from "@/constants/fingerKeys";

export const LESSON_DETAILS_IT: Record<FingerType, { homeKeys: string[]; description: string; cue: string }> = {
    pointer: { homeKeys: ["f", "j"], description: "Costruisci le basi con le dita che coprono il maggior numero di tasti.", cue: "Senti i piccoli rilievi su F e J. Sono i tuoi ancoraggi." },
    middle: { homeKeys: ["d", "k"], description: "Trova un ritmo uniforme con movimenti brevi e diritti.", cue: "Appoggia su D e K. Premi in alto e in basso, poi torna." },
    ring: { homeKeys: ["s", "l"], description: "Dai ai tuoi anulari un po' più di indipendenza.", cue: "Appoggia su S e L. Mantieni le altre dita rilassate durante la pressione." },
    pinky: { homeKeys: ["a", "ò"], description: "Costruisci il controllo sui tasti esterni della tastiera QWERTY.", cue: "Appoggia su A e Ò. Pressione leggera, senza storcere." },
};
