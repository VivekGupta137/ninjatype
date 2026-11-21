/**
 * Swedish UI strings for the /sv/ content tree (Phase A).
 * The interactive typing app itself stays English in this phase; these
 * strings cover the localized marketing pages, blog shell and legal footer.
 * Keyword targeting: research/international-keywords-2026-11-21/deep-dive.md
 * (tangentbordsträning is the verified school term; "blindskrift" means
 * Braille in Swedish and "skrivhastighet" alone is contaminated by SSD/HDD
 * write-speed queries — both are avoided as targets).
 */
export const sv = {
    brand: "Ninja Type",
    tagline: "tangentbordsträning, utan brus",
    /** App is now fully Swedish — UI, keyboard layout, dictionary, and game modes. */
    appLanguageNote: "Övningen är på svenska — med svensk ordbok och svenska lektioner.",
    nav: {
        test: "Skrivhastighetstest",
        learn: "Tangentbordsträning",
        blog: "Blogg",
        startTest: "Starta testet",
    },
    footer: {
        heading: "En lugn plats att träna skrivande på.",
        explore: "Utforska",
        legal: "Juridiskt",
        privacy: "Integritetspolicy",
        terms: "Användarvillkor",
        about: "Om NinjaType",
        links: [
            { label: "Skrivhastighetstest", href: "/sv/skrivhastighetstest/" },
            { label: "Tangentbordsträning", href: "/sv/tangentbordstraning/" },
            { label: "Jämförelser", href: "/sv/lp/monkeytype-alternative/" },
            { label: "Blogg", href: "/sv/blog/" },
        ],
        appLinks: [
            { label: "Skrivhastighetstest", href: "/sv/skrivhastighetstest/" },
            { label: "Tangentbordsträning (fingerlektioner)", href: "/sv/tangentbordstraning/" },
            { label: "Skrivtävling (multiplayer)", href: "/sv/skrivtavling/" },
            { label: "Öva skrivhastighet (Ghost Race)", href: "/sv/ova-skrivhastighet/" },
        ],
        finePrint:
            "NinjaType är fristående och inte kopplad till de nämnda tjänsterna. Andra produktnamn tillhör sina respektive ägare.",
    },
    blog: {
        indexTitle: "NinjaType-bloggen på svenska — skrivhastighet, träning & guider",
        indexDescription:
            "Svenska guider om tangentbordsträning: skrivhastighetstest, fingersättning, övningar och spel för nybörjare, barn och vuxna.",
        indexHeading: "Skriva snabbare.<br />Med metod, inte slump.",
        indexIntro:
            "Svenska guider: testa din skrivhastighet, lär dig fingersättning och träna med övningar som ger mätbara framsteg.",
        practiceNote: "Omsätt en guide i praktiken direkt.",
        practiceTestCta: "Starta skrivhastighetstestet",
        practiceLearnCta: "Öppna lektionerna",
        readMore: "Läs guiden",
        allPosts: "Alla guider",
        publishedOn: "Publicerad",
        updatedOn: "Uppdaterad",
        backToBlog: "Tillbaka till bloggen",
        relatedTitle: "Läs också",
    },
};
