/**
 * Japanese lesson details (home keys, descriptions, cues) for QWERTY romaji input.
 * Mirrors components/learn/lessonDetails.ts for the English lessons.
 */

import type { FingerType } from "@/constants/fingerKeys";

export const LESSON_DETAILS_JA: Record<FingerType, { homeKeys: string[]; description: string; cue: string }> = {
    pointer: { homeKeys: ["f", "j"], description: "ほとんどのキーをカバーする指です。ここから始めましょう。", cue: "FとJの小さなでっぱりを感じてください。それがあなたの基本ポジションです。" },
    middle: { homeKeys: ["d", "k"], description: "安定したリズムで、短く、まっすぐなキーストロークを作ります。", cue: "DとKに置いてください。上下に伸ばして、それから戻ります。" },
    ring: { homeKeys: ["s", "l"], description: "薬指に独立性を与えます。他の指を邪魔しないようにしましょう。", cue: "SとLに置いてください。人差し指の時と同じように、他の指はリラックスさせます。" },
    pinky: { homeKeys: ["a", ";"], description: "QWERTYキーボードの外側のキーをコントロールしましょう。", cue: "Aとセミコロンに置いてください。力を入れすぎず、でもしっかりコントロール。" },
};
