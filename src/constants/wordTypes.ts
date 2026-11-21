export const WORD_TYPES = {
    "1k": {
        label: "1K Common",
    },
    "de-1k": {
        label: "1K Deutsch",
    },
    "fr-1k": {
        label: "1K Français",
    },
    "it-1k": {
        label: "1K Italiano",
    },
    "nl-1k": {
        label: "1K Nederlands",
    },
    "no-1k": {
        label: "1K Norsk",
    },
    "da-1k": {
        label: "Dansk",
    },
    "sv-1k": {
        label: "1K Svenska",
    },
    "ja-1k": {
        label: "1K Romaji",
    },
    "2k-short": {
        label: "2K Short",
    },
    "2k-long": {
        label: "2K Long",
    },
    "5k": {
        label: "5K Common",
    },
    "5k-medium": {
        label: "5K Medium",
    },
    "brainrot": {
        label: "Brainrot",
    },
}

export const QUOTE_TYPES = {
    "motivational-quotes": {
        label: "Motivational",
    },
    "programming-quotes": {
        label: "Programming",
    },
    "funny-quotes": {
        label: "Funny",
    },
}

/**
 * Dictionaries selectable in the practice toolbar, per page locale.
 * Each localized practice page shows only its own supported lists;
 * the English page shows the English lists.
 */
export const LOCALE_DICTIONARY_KEYS: Record<string, Array<keyof typeof WORD_TYPES>> = {
    en: ["1k", "2k-short", "2k-long", "5k", "5k-medium", "brainrot"],
    de: ["de-1k"],
    fr: ["fr-1k"],
    it: ["it-1k"],
    nl: ["nl-1k"],
    no: ["no-1k"],
    da: ["da-1k"],
    sv: ["sv-1k"],
    ja: ["ja-1k"],
};

export const dictionaryKeysFor = (locale: string): Array<keyof typeof WORD_TYPES> =>
    LOCALE_DICTIONARY_KEYS[locale] ?? LOCALE_DICTIONARY_KEYS.en;