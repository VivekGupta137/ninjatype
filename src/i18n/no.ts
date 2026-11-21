/**
 * Norwegian UI strings for the /no/ content tree (Phase A, bokmål).
 * The interactive typing app itself stays English in this phase; these
 * strings cover the localized marketing pages, blog shell and legal footer.
 * Keyword targeting: research/international-keywords-2026-11-21/deep-dive.md
 * ("skrivetest" is the strongest keyword with long-tails like jobbintervju
 * and ord i minuttet; "touch typing" is used as-is in Norwegian; "blindskrift"
 * means Braille and is never used as a target).
 */
export const no = {
    brand: "Ninja Type",
    tagline: "skrivetrening, uten støy",
    /** Full app chrome in Norwegian as of Phase B. */
    appLanguageNote: "Hele øvelsen er på norsk — touch typing, leksjoner og spill.",
    nav: {
        test: "Skrivetest",
        learn: "Touch typing",
        blog: "Blogg",
        startTest: "Start testen",
    },
    footer: {
        heading: "Et rolig sted å trene skriving.",
        explore: "Utforsk",
        legal: "Juridisk",
        privacy: "Personvern",
        terms: "Vilkår",
        about: "Om NinjaType",
        links: [
            { label: "Skrivetest", href: "/no/skrivetest/" },
            { label: "Touch typing på norsk", href: "/no/touch-typing/" },
            { label: "Sammenligninger", href: "/no/lp/10fastfingers-alternative/" },
            { label: "Blogg", href: "/no/blog/" },
        ],
        appLinks: [
            { label: "Skrivetest", href: "/no/skrivetest/" },
            { label: "Touch typing-leksjoner", href: "/no/touch-typing/" },
            { label: "Ord i minuttet (solo race)", href: "/no/ord-i-minuttet/" },
            { label: "Skrivekonkurranse (multiplayer)", href: "/no/skrivekonkurranse/" },
        ],
        finePrint:
            "NinjaType er uavhengig og ikke tilknyttet de nevnte tjenestene. Andre produktnavner tilhører sine respektive eiere.",
    },
    blog: {
        indexTitle: "NinjaType-bloggen på norsk — skrivehastighet, skrivetest & guider",
        indexDescription:
            "Norske guider om skriving: skrivetest, skrivehastighet i ord per minutt, touch typing-teknikk og øvelser for nybegynnere, barn og voksne.",
        indexHeading: "Skrive bedre.<br />Med metode, ikke tilfeldig.",
        indexIntro:
            "Norske guider: mål skrivehastigheten din, lær touch typing-teknikken og tren med øvelser som gir målbare framskritt.",
        practiceNote: "Sett en guide ut i praksis med én gang.",
        practiceTestCta: "Start skrivehastighetstesten",
        practiceLearnCta: "Åpne leksjonene",
        readMore: "Les guiden",
        allPosts: "Alle guider",
        publishedOn: "Publisert",
        updatedOn: "Oppdatert",
        backToBlog: "Tilbake til bloggen",
        relatedTitle: "Les også",
    },
};
