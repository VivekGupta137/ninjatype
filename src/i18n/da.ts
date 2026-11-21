/**
 * Danish UI strings for the /da/ content tree (Phase A+B).
 * Full app chrome (Phase B) with Danish QWERTY keyboard, finger lessons, and all game modes.
 * Keyword targeting: research/international-keywords-2026-11-21/deep-dive.md
 * (maskinskrivning is the real touch-typing term; "fingersætning" means
 * instrument fingering only; "blindskrift" is dual-use with Braille, so the
 * content prefers "skrive blindt" and "10-fingersystemet").
 */
export const da = {
    brand: "Ninja Type",
    tagline: "maskinskrivning, uden støj",
    /** Phase B: full Danish chrome */
    appLanguageNote: "Testen og lektionerne kører på dansk — med dansk ordbog og QWERTY-tastatur.",
    nav: {
        test: "Skrivehastighedstest",
        learn: "Maskinskrivning",
        blog: "Blog",
        startTest: "Start testen",
    },
    footer: {
        heading: "Et roligt sted at træne dit skriv.",
        explore: "Udforsk",
        legal: "Juridisk",
        privacy: "Privatliv",
        terms: "Servicevilkår",
        about: "Om NinjaType",
        links: [
            { label: "Skrivehastighedstest", href: "/da/skrivehastighedstest/" },
            { label: "Maskinskrivning (10-finger)", href: "/da/maskinskrivning/" },
            { label: "Sammenligninger", href: "/da/lp/10fastfingers-alternative/" },
            { label: "Blog", href: "/da/blog/" },
        ],
        appLinks: [
            { label: "Skrivehastighedstest", href: "/da/skrivehastighedstest/" },
            { label: "Maskinskrivning (10-finger lektioner)", href: "/da/maskinskrivning/" },
            { label: "Multiplayer-skrivekonkurrence", href: "/da/skrivekonkurrence/" },
            { label: "Skrivetest-spil (Ghost Race)", href: "/da/skrivetest-spil/" },
        ],
        finePrint:
            "NinjaType er uafhængig og ikke tilknyttet de nævnte tjenester. Andre produktnavne tilhører deres respektive ejere.",
    },
    blog: {
        indexTitle: "NinjaType-bloggen på dansk — skrivehastighed & maskinskrivning",
        indexDescription:
            "Danske guider om maskinskrivning: skrivehastighedstest, 10-fingersystemet, øvelser og spil for begyndere, børn og voksne.",
        indexHeading: "Skrive bedre.<br />Med metode, ikke tilfældigt.",
        indexIntro:
            "Danske guider: mål din skrivehastighed, lær 10-fingersystemet og træn med øvelser, der giver målbare fremskridt.",
        practiceNote: "Sæt en guide i praksis med det samme.",
        practiceTestCta: "Start skrivehastighedstesten",
        practiceLearnCta: "Åbn lektionerne",
        readMore: "Læs guiden",
        allPosts: "Alle guider",
        publishedOn: "Udgivet",
        updatedOn: "Opdateret",
        backToBlog: "Tilbage til bloggen",
        relatedTitle: "Læs også",
    },
};
