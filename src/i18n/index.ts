import { de } from "./de";
import { fr } from "./fr";
import { ja } from "./ja";
import { nl } from "./nl";
import { it } from "./it";
import { sv } from "./sv";
import { da } from "./da";
import { no } from "./no";

export type LocaleCode = "de" | "fr" | "ja" | "nl" | "it" | "sv" | "da" | "no";

/** Widened strings shape shared by every locale file. */
export interface LocaleStrings {
    brand: string;
    tagline: string;
    appLanguageNote: string;
    nav: { test: string; learn: string; blog: string; startTest: string };
    footer: {
        heading: string;
        explore: string;
        legal: string;
        privacy: string;
        terms: string;
        about: string;
        links: { label: string; href: string }[];
        appLinks: { label: string; href: string }[];
        finePrint: string;
    };
    blog: {
        indexTitle: string;
        indexDescription: string;
        indexHeading: string;
        indexIntro: string;
        practiceNote: string;
        practiceTestCta: string;
        practiceLearnCta: string;
        readMore: string;
        allPosts: string;
        publishedOn: string;
        updatedOn: string;
        backToBlog: string;
        relatedTitle: string;
    };
}

/** Strings for the localized content trees (Phase A pages). */
export const LOCALE_STRINGS: Record<LocaleCode, LocaleStrings> = { de, fr, ja, nl, it, sv, da, no };

/** og:locale per content locale. */
export const OG_LOCALES: Record<LocaleCode, string> = {
    de: "de_DE",
    fr: "fr_FR",
    ja: "ja_JP",
    nl: "nl_NL",
    it: "it_IT",
    sv: "sv_SE",
    da: "da_DK",
    no: "nb_NO",
};

/**
 * Extra hreflang tags per locale pointing at the same localized page.
 * French content also serves Quebec (fr-CA) and Suisse romande (fr-CH).
 */
export const EXTRA_HREFLANG: Record<LocaleCode, string[]> = {
    de: [],
    fr: ["fr-CA", "fr-CH"],
    ja: [],
    nl: [],
    it: [],
    sv: [],
    da: [],
    no: [],
};

/** Content-collection + locale settings for the generic blog routes. */
export const BLOG_CONFIG: Record<LocaleCode, {
    collection: "blogDe" | "blogFr" | "blogJa" | "blogNl" | "blogIt" | "blogSv" | "blogDa" | "blogNo";
    dateLocale: string;
}> = {
    de: { collection: "blogDe", dateLocale: "de-DE" },
    fr: { collection: "blogFr", dateLocale: "fr-FR" },
    ja: { collection: "blogJa", dateLocale: "ja-JP" },
    nl: { collection: "blogNl", dateLocale: "nl-NL" },
    it: { collection: "blogIt", dateLocale: "it-IT" },
    sv: { collection: "blogSv", dateLocale: "sv-SE" },
    da: { collection: "blogDa", dateLocale: "da-DK" },
    no: { collection: "blogNo", dateLocale: "nb-NO" },
};
