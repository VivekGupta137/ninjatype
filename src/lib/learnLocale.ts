/**
 * Locale-aware selectors for the learn app and game modes.
 *
 * React islands receive `locale` from their .astro page (SSR-correct, no
 * hydration mismatch) and resolve constants through these helpers. Client
 * stores use `clientLocale()` for the same detection.
 *
 * Every shipped locale has one entry in LOCALE_CONFIG. English is the default.
 *
 * @module learnLocale
 */

import { FINGER_KEYS, FINGER_NAMES, type FingerType } from "@/constants/fingerKeys";
import { FINGER_LEVELS, getFingerLevel, generateLevelSentence } from "@/constants/fingerLessons";
import { QWERTY_ROWS } from "@/constants/qwertyLayout";
import { LESSON_DETAILS } from "@/components/learn/lessonDetails";

import { FINGER_KEYS_DE, FINGER_NAMES_DE, FINGER_HEADINGS_DE } from "@/constants/fingerKeysDe";
import { FINGER_LEVELS_DE, getFingerLevelDe, generateLevelSentenceDe } from "@/constants/fingerLessonsDe";
import { QWERTZ_LETTER_ROWS } from "@/constants/qwertzLayout";
import { LESSON_DETAILS_DE } from "@/components/learn/lessonDetailsDe";

import { FINGER_KEYS_FR, FINGER_NAMES_FR, FINGER_HEADINGS_FR } from "@/constants/fingerKeysFR";
import { FINGER_LEVELS_FR, getFingerLevelFR, generateLevelSentenceFR } from "@/constants/fingerLessonsFR";
import { AZERTY_LETTER_ROWS } from "@/constants/azertyLayout";
import { LESSON_DETAILS_FR } from "@/components/learn/lessonDetailsFR";

import { FINGER_KEYS_IT, FINGER_NAMES_IT, FINGER_HEADINGS_IT } from "@/constants/fingerKeysIT";
import { FINGER_LEVELS_IT, getFingerLevelIT, generateLevelSentenceIT } from "@/constants/fingerLessonsIT";
import { QWERTY_IT_LETTER_ROWS } from "@/constants/qwertyItLayout";
import { LESSON_DETAILS_IT } from "@/components/learn/lessonDetailsIT";

import { FINGER_KEYS_NL, FINGER_NAMES_NL, FINGER_HEADINGS_NL } from "@/constants/fingerKeysNL";
import { FINGER_LEVELS_NL, getFingerLevelNL, generateLevelSentenceNL } from "@/constants/fingerLessonsNL";
import { LESSON_DETAILS_NL } from "@/components/learn/lessonDetailsNL";

import { FINGER_KEYS_NO, FINGER_NAMES_NO, FINGER_HEADINGS_NO } from "@/constants/fingerKeysNO";
import { FINGER_LEVELS_NO, getFingerLevelNO, generateLevelSentenceNO } from "@/constants/fingerLessonsNO";
import { QWERTY_NO_LETTER_ROWS } from "@/constants/qwertyNoLayout";
import { LESSON_DETAILS_NO } from "@/components/learn/lessonDetailsNO";

import { FINGER_KEYS_DA, FINGER_NAMES_DA, FINGER_HEADINGS_DA } from "@/constants/fingerKeysDA";
import { FINGER_LEVELS_DA, getFingerLevelDA, generateLevelSentenceDA } from "@/constants/fingerLessonsDA";
import { QWERTY_DA_LETTER_ROWS } from "@/constants/qwertyDaLayout";
import { LESSON_DETAILS_DA } from "@/components/learn/lessonDetailsDA";

import { FINGER_KEYS_SV, FINGER_NAMES_SV, FINGER_HEADINGS_SV } from "@/constants/fingerKeysSV";
import { FINGER_LEVELS_SV, getFingerLevelSV, generateLevelSentenceSV } from "@/constants/fingerLessonsSV";
import { QWERTY_SV_LETTER_ROWS } from "@/constants/qwertySvLayout";
import { LESSON_DETAILS_SV } from "@/components/learn/lessonDetailsSV";

import { FINGER_KEYS_JA, FINGER_NAMES_JA, FINGER_HEADINGS_JA } from "@/constants/fingerKeysJA";
import { FINGER_LEVELS_JA, getFingerLevelJA, generateLevelSentenceJA } from "@/constants/fingerLessonsJA";
import { LESSON_DETAILS_JA } from "@/components/learn/lessonDetailsJA";

import appFr from "@/i18n/app-fr";
import appIt from "@/i18n/app-it";
import appNl from "@/i18n/app-nl";
import appNo from "@/i18n/app-no";
import appDa from "@/i18n/app-da";
import appSv from "@/i18n/app-sv";
import appJa from "@/i18n/app-ja";

/** Every locale with a content tree. */
export type LearnLocale = "en" | "de" | "fr" | "it" | "nl" | "no" | "da" | "sv" | "ja";

export const LEARN_LOCALES: readonly LearnLocale[] = ["en", "de", "fr", "it", "nl", "no", "da", "sv", "ja"];

type Routes = { practice: string; learn: string; race: string; ghost: string };

/**
 * Per-locale app data. `learn` is the finger-lesson hub slug; finger pages
 * live at `<learn>/<finger>/`. English uses the root-level routes.
 */
interface LocaleConfig {
    keys: Record<FingerType, string[]>;
    names: Record<FingerType, string>;
    headings: Record<FingerType, string>;
    levels: typeof FINGER_LEVELS;
    levelOf: (finger: FingerType, level: number) => ReturnType<typeof getFingerLevel>;
    sentenceOf: (finger: FingerType, level: number) => string;
    details: typeof LESSON_DETAILS;
    rows: string[][];
    routes: Routes;
    /** Chrome translation table (English source string -> translation). */
    strings?: Record<string, string>;
}

const QWERTY_LETTER_ROWS = QWERTY_ROWS.slice(1);

const LOCALE_CONFIG: Record<Exclude<LearnLocale, "en">, LocaleConfig> = {
    de: {
        keys: FINGER_KEYS_DE, names: FINGER_NAMES_DE, headings: FINGER_HEADINGS_DE,
        levels: FINGER_LEVELS_DE, levelOf: getFingerLevelDe, sentenceOf: generateLevelSentenceDe,
        details: LESSON_DETAILS_DE, rows: QWERTZ_LETTER_ROWS,
        routes: { practice: "/de/tippgeschwindigkeitstest/", learn: "/de/tippen-lernen/", race: "/de/tipp-rennen/", ghost: "/de/tippgeschwindigkeit-ueben/" },
    },
    fr: {
        keys: FINGER_KEYS_FR, names: FINGER_NAMES_FR, headings: FINGER_HEADINGS_FR,
        levels: FINGER_LEVELS_FR, levelOf: getFingerLevelFR, sentenceOf: generateLevelSentenceFR,
        details: LESSON_DETAILS_FR, rows: AZERTY_LETTER_ROWS,
        routes: { practice: "/fr/test-de-vitesse-de-frappe/", learn: "/fr/apprendre-a-taper-au-clavier/", race: "/fr/defi-dactylo/", ghost: "/fr/exercices-de-dactylographie/" },
        strings: appFr,
    },
    it: {
        keys: FINGER_KEYS_IT, names: FINGER_NAMES_IT, headings: FINGER_HEADINGS_IT,
        levels: FINGER_LEVELS_IT, levelOf: getFingerLevelIT, sentenceOf: generateLevelSentenceIT,
        details: LESSON_DETAILS_IT, rows: QWERTY_IT_LETTER_ROWS,
        routes: { practice: "/it/test-di-dattilografia/", learn: "/it/dattilografia/", race: "/it/gara-di-dattilografia/", ghost: "/it/esercizi-di-dattilografia/" },
        strings: appIt,
    },
    nl: {
        keys: FINGER_KEYS_NL, names: FINGER_NAMES_NL, headings: FINGER_HEADINGS_NL,
        levels: FINGER_LEVELS_NL, levelOf: getFingerLevelNL, sentenceOf: generateLevelSentenceNL,
        details: LESSON_DETAILS_NL, rows: QWERTY_LETTER_ROWS,
        routes: { practice: "/nl/typsnelheid-test/", learn: "/nl/blind-typen/", race: "/nl/blind-typen-wedstrijd/", ghost: "/nl/blind-typen-oefenen/" },
        strings: appNl,
    },
    no: {
        keys: FINGER_KEYS_NO, names: FINGER_NAMES_NO, headings: FINGER_HEADINGS_NO,
        levels: FINGER_LEVELS_NO, levelOf: getFingerLevelNO, sentenceOf: generateLevelSentenceNO,
        details: LESSON_DETAILS_NO, rows: QWERTY_NO_LETTER_ROWS,
        routes: { practice: "/no/skrivetest/", learn: "/no/touch-typing/", race: "/no/skrivekonkurranse/", ghost: "/no/ord-i-minuttet/" },
        strings: appNo,
    },
    da: {
        keys: FINGER_KEYS_DA, names: FINGER_NAMES_DA, headings: FINGER_HEADINGS_DA,
        levels: FINGER_LEVELS_DA, levelOf: getFingerLevelDA, sentenceOf: generateLevelSentenceDA,
        details: LESSON_DETAILS_DA, rows: QWERTY_DA_LETTER_ROWS,
        routes: { practice: "/da/skrivehastighedstest/", learn: "/da/maskinskrivning/", race: "/da/skrivekonkurrence/", ghost: "/da/skrivetest-spil/" },
        strings: appDa,
    },
    sv: {
        keys: FINGER_KEYS_SV, names: FINGER_NAMES_SV, headings: FINGER_HEADINGS_SV,
        levels: FINGER_LEVELS_SV, levelOf: getFingerLevelSV, sentenceOf: generateLevelSentenceSV,
        details: LESSON_DETAILS_SV, rows: QWERTY_SV_LETTER_ROWS,
        routes: { practice: "/sv/skrivhastighetstest/", learn: "/sv/tangentbordstraning/", race: "/sv/skrivtavling/", ghost: "/sv/ova-skrivhastighet/" },
        strings: appSv,
    },
    ja: {
        keys: FINGER_KEYS_JA, names: FINGER_NAMES_JA, headings: FINGER_HEADINGS_JA,
        levels: FINGER_LEVELS_JA, levelOf: getFingerLevelJA, sentenceOf: generateLevelSentenceJA,
        details: LESSON_DETAILS_JA, rows: QWERTY_LETTER_ROWS,
        routes: { practice: "/ja/typing-test/", learn: "/ja/typing-practice/", race: "/ja/taisen-taipingu/", ghost: "/ja/taipingu-geemu/" },
        strings: appJa,
    },
};

const EN_ROUTES: Routes = { practice: "/", learn: "/learn/", race: "/multiplayer-typing-race/", ghost: "/ghost-race/" };

/** Inline string helper. German passes its own string; other locales use their translation table and fall back to English. */
export const tr = (locale: LearnLocale, en: string, de: string) => {
    if (locale === "de") return de;
    if (locale === "en") return en;
    return LOCALE_CONFIG[locale as Exclude<LearnLocale, "en">]?.strings?.[en] ?? en;
};

/** Client-only locale from the URL path (used by nanostores, never during SSR). */
export const clientLocale = (): LearnLocale => {
    const pathname = typeof window !== "undefined" ? window.location?.pathname : undefined;
    if (typeof pathname === "string") {
        const segment = pathname.split("/")[1];
        const match = LEARN_LOCALES.find(l => l !== "en" && l === segment);
        if (match) return match;
    }
    return "en";
};

const cfg = (locale: LearnLocale) => (locale === "en" ? null : LOCALE_CONFIG[locale]);

export const fingerKeysFor = (locale: LearnLocale) => cfg(locale)?.keys ?? FINGER_KEYS;

export const fingerNamesFor = (locale: LearnLocale) => cfg(locale)?.names ?? FINGER_NAMES;

/** Finger display heading. English appends "s"; other locales use their plural-invariant noun. */
export const fingerHeadingFor = (locale: LearnLocale, finger: FingerType) => {
    const c = cfg(locale);
    return c ? c.headings[finger] : `${FINGER_NAMES[finger]}s`;
};

/** Short nav label. English strips "Finger"; other locales keep the full name. */
export const fingerShortLabelFor = (locale: LearnLocale, finger: FingerType) => {
    const c = cfg(locale);
    return c ? c.headings[finger] : FINGER_NAMES[finger].replace(" Finger", "");
};

export const fingerLevelFor = (locale: LearnLocale, finger: FingerType, level: number) => {
    const c = cfg(locale);
    return c ? c.levelOf(finger, level) : getFingerLevel(finger, level);
};

export const fingerLevelsFor = (locale: LearnLocale) => cfg(locale)?.levels ?? FINGER_LEVELS;

export const generateDrillSentence = (locale: LearnLocale, finger: FingerType, level: number) => {
    const c = cfg(locale);
    return c ? c.sentenceOf(finger, level) : generateLevelSentence(finger, level);
};

export const lessonDetailsFor = (locale: LearnLocale) => cfg(locale)?.details ?? LESSON_DETAILS;

/** Physical letter rows for the on-screen lesson keyboards. */
export const keyboardRowsFor = (locale: LearnLocale): string[][] => cfg(locale)?.rows ?? QWERTY_LETTER_ROWS;

/** Learn hub URL in the given locale. */
export const learnHrefFor = (locale: LearnLocale) => (cfg(locale)?.routes ?? EN_ROUTES).learn;

/** Lesson URL for a finger in the given locale. */
export const fingerHrefFor = (locale: LearnLocale, finger: FingerType) =>
    locale === "en" ? `/learn/fingers/${finger}/` : `${learnHrefFor(locale)}${finger}/`;

/** Practice URL in the given locale. */
export const practiceHrefFor = (locale: LearnLocale) => (cfg(locale)?.routes ?? EN_ROUTES).practice;

/** Multiplayer race URL in the given locale. */
export const raceHrefFor = (locale: LearnLocale) => (cfg(locale)?.routes ?? EN_ROUTES).race;

/** Ghost Race URL in the given locale. */
export const ghostHrefFor = (locale: LearnLocale) => (cfg(locale)?.routes ?? EN_ROUTES).ghost;

/** Practice dictionary key for the locale (matches WORD_TYPES). */
export const dictionaryFor = (locale: LearnLocale) => (locale === "en" ? "1k" : `${locale}-1k`);
