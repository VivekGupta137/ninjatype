/**
 * Japanese QWERTY finger lessons (romaji input) — mirrors constants/fingerLessons.ts.
 *
 * Level structure matches the English lessons (anchors → upper reaches →
 * lower reaches), with QWERTY keys and Japanese cues. Home anchors for the
 * pinky are A/semicolon; lessons are in Japanese to guide Japanese learners.
 *
 * @module fingerLessonsJA
 */

import { FINGER_KEYS_JA } from "./fingerKeysJA";
import type { FingerType } from "./fingerKeys";
import {
    generateSentenceFromKeys,
    getLevelFrom,
    type FingerLevel,
} from "./fingerLessons";

export const FINGER_LEVELS_JA: Record<FingerType, FingerLevel[]> = {
    pointer: [
        { name: "基本ポジション", keys: ["f", "j"], cue: "FとJの小さなでっぱりを感じて、目を見ずに基本ポジションを探してください。" },
        { name: "基本と上段", keys: ["f", "j", "g", "k", "r", "u", "t", "i"], cue: "上段のキーを足しましょう。一つのキーをタッチしたら、いつも基本に戻ります。" },
        { name: "下段と全キー", keys: [...FINGER_KEYS_JA.pointer], cue: "下段（V、B、O、L）を加えます。手首を動かさず、指だけで届かせましょう。" },
    ],
    middle: [
        { name: "基本ポジション", keys: ["d", "k"], cue: "DとKに指を置いて、リラックスしましょう。両手を交互に、やさしく触れて。" },
        { name: "上段", keys: ["d", "k", "e", ";"], cue: "DからEへ、Kからセミコロンへ。基本に戻ってから、次のキーへ。" },
        { name: "下段と全キー", keys: [...FINGER_KEYS_JA.middle], cue: "CとPを加えます。速さより正確さ。基本ポジションに戻る習慣をつけましょう。" },
    ],
    ring: [
        { name: "基本ポジション", keys: ["s", "l"], cue: "SとLに置いて、他の指の力を抜いてください。" },
        { name: "上段", keys: ["s", "l", "w", "."], cue: "SからWへ、Lからピリオドへ。手全体を動かさず、指だけです。" },
        { name: "下段と全キー", keys: [...FINGER_KEYS_JA.ring], cue: "すべてのキーに対応できるようになりました。安定したリズムを保ちましょう。" },
    ],
    pinky: [
        { name: "基本ポジション", keys: ["a", ";"], cue: "Aとセミコロンにそっと置いてください。まずは軽く、ゆっくり始めましょう。" },
        { name: "上段", keys: ["a", ";", "q", "["], cue: "Qとブラケットキーへ。手を曲げすぎないようにしてください。" },
        { name: "下段と全キー", keys: [...FINGER_KEYS_JA.pinky], cue: "X、Z、シングルクォート、ダッシュを加えます。小指は力を入れすぎず、コントロールを優先。" },
    ],
};

export const getFingerLevelJA = (finger: FingerType, level: number): FingerLevel =>
    getLevelFrom(FINGER_LEVELS_JA, finger, level);

/** Japanese lessons: drill sentence for a finger level (romaji QWERTY). */
export const generateLevelSentenceJA = (finger: FingerType, level: number): string =>
    generateSentenceFromKeys(getFingerLevelJA(finger, level).keys);
