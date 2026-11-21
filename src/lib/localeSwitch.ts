/**
 * Navbar language switch: maps the current page to its counterpart in another
 * shipped locale (routes from plan/international-expansion.md §2).
 *
 * Pages without a counterpart fall back to the target locale's home page.
 *
 * @module localeSwitch
 */

export type SwitchLocale = "en" | "de" | "fr" | "ja" | "nl" | "it" | "sv" | "da" | "no";

export interface LanguageOption {
    locale: SwitchLocale;
    /** Native name, shown in the menu. */
    label: string;
    /** Home page of the locale. */
    home: string;
}

/** Locales with shipped pages. Add a locale here only once its pages exist. */
export const LANGUAGE_OPTIONS: LanguageOption[] = [
    { locale: "en", label: "English", home: "/" },
    { locale: "de", label: "Deutsch", home: "/de/" },
    { locale: "fr", label: "Français", home: "/fr/" },
    { locale: "ja", label: "日本語", home: "/ja/" },
    { locale: "nl", label: "Nederlands", home: "/nl/" },
    { locale: "it", label: "Italiano", home: "/it/" },
    { locale: "sv", label: "Svenska", home: "/sv/" },
    { locale: "da", label: "Dansk", home: "/da/" },
    { locale: "no", label: "Norsk", home: "/no/" },
];

type RouteRow = Record<SwitchLocale, string>;

/** Equivalent pages across locales. English "/" is the typing test. */
const ROUTE_ROWS: RouteRow[] = [
    { en: "/", de: "/de/tippgeschwindigkeitstest/", fr: "/fr/test-de-vitesse-de-frappe/", ja: "/ja/typing-test/", nl: "/nl/typsnelheid-test/", it: "/it/test-di-dattilografia/", sv: "/sv/skrivhastighetstest/", da: "/da/skrivehastighedstest/", no: "/no/skrivetest/" },
    { en: "/learn/", de: "/de/tippen-lernen/", fr: "/fr/apprendre-a-taper-au-clavier/", ja: "/ja/typing-practice/", nl: "/nl/blind-typen/", it: "/it/dattilografia/", sv: "/sv/tangentbordstraning/", da: "/da/maskinskrivning/", no: "/no/touch-typing/" },
    { en: "/blog/", de: "/de/blog/", fr: "/fr/blog/", ja: "/ja/blog/", nl: "/nl/blog/", it: "/it/blog/", sv: "/sv/blog/", da: "/da/blog/", no: "/no/blog/" },
    { en: "/ghost-race/", de: "/de/tippgeschwindigkeit-ueben/", fr: "/fr/exercices-de-dactylographie/", ja: "/ja/taipingu-geemu/", nl: "/nl/blind-typen-oefenen/", it: "/it/esercizi-di-dattilografia/", sv: "/sv/ova-skrivhastighet/", da: "/da/skrivetest-spil/", no: "/no/ord-i-minuttet/" },
    { en: "/multiplayer-typing-race/", de: "/de/tipp-rennen/", fr: "/fr/defi-dactylo/", ja: "/ja/taisen-taipingu/", nl: "/nl/blind-typen-wedstrijd/", it: "/it/gara-di-dattilografia/", sv: "/sv/skrivtavling/", da: "/da/skrivekonkurrence/", no: "/no/skrivekonkurranse/" },
];

const LEARN_PATH: RouteRow = ROUTE_ROWS[1];
const BLOG_PATH: RouteRow = ROUTE_ROWS[2];

/** Learn-hub prefixes for every locale, e.g. "/fr/apprendre-a-taper-au-clavier/". */
const LEARN_PREFIXES = (Object.keys(LEARN_PATH) as (keyof RouteRow)[])
    .filter(k => k !== "en")
    .map(k => ({ locale: k, prefix: LEARN_PATH[k] }));

/** Normalise to a single trailing slash, e.g. "/learn" -> "/learn/". */
const normalise = (pathname: string) => `${pathname.replace(/\/+$/, "")}/`;

/** The URL of the same page in `target`, or that locale's home if no counterpart exists. */
export const localeHrefFor = (pathname: string, target: SwitchLocale): string => {
    const path = normalise(pathname);
    const option = LANGUAGE_OPTIONS.find(o => o.locale === target);
    const home = option?.home ?? "/";

    const exact = ROUTE_ROWS.find(row => Object.values(row).includes(path));
    if (exact) return exact[target];

    // Finger lesson pages: /learn/fingers/<f>/ or /<locale>/<learn-slug>/<f>/
    const fingerEn = /^\/learn\/fingers\/([a-z]+)\/$/.exec(path);
    const localised = LEARN_PREFIXES.find(({ prefix }) => path.startsWith(prefix) && /^[a-z]+\/$/.test(path.slice(prefix.length)));
    const finger = fingerEn ?? (localised ? /^([a-z]+)\/$/.exec(path.slice(localised.prefix.length)) : null);
    if (finger) {
        const fingerName = finger[1];
        if (target === "en") return `/learn/fingers/${fingerName}/`;
        return `${LEARN_PATH[target]}${fingerName}/`;
    }

    if (/^(?:\/(?:de|fr|it|nl|no|da|sv|ja))?\/blog\/.+\/$/.test(path)) return BLOG_PATH[target];

    return home;
};
