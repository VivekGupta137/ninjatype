import { words1k } from "@/constants/words1k";
import wordsDe1k from "@/data/words-de-1k.json";
import wordsFr1k from "@/data/words-fr-1k.json";
import wordsIt1k from "@/data/words-it-1k.json";
import wordsNl1k from "@/data/words-nl-1k.json";
import wordsNo1k from "@/data/words-no-1k.json";
import wordsDa1k from "@/data/words-da-1k.json";
import wordsSv1k from "@/data/words-sv-1k.json";
import wordsJa1k from "@/data/words-ja-1k.json";
import { clientLocale, type LearnLocale } from "@/lib/learnLocale";

/**
 * Word pools for self-contained (solo) game modes, e.g. Ghost Race.
 * Each locale's page races with its own dictionary list; the lists are the
 * same Monkeytype/Leipzig-corpus files served at /api/words/<locale>-1k/.
 */
const RACE_WORDS: Record<string, string[]> = {
    en: words1k,
    de: wordsDe1k.words,
    fr: wordsFr1k.words,
    it: wordsIt1k.words,
    nl: wordsNl1k.words,
    no: wordsNo1k.words,
    da: wordsDa1k.words,
    sv: wordsSv1k.words,
    ja: wordsJa1k.words,
};

export const raceWordsFor = (locale: LearnLocale = clientLocale()): string[] =>
    RACE_WORDS[locale] ?? words1k;
