/**
 * Italian UI strings for the /it/ content tree (Phase A).
 * The interactive typing app itself stays English in this phase; these
 * strings cover the localized marketing pages, blog shell and legal footer.
 * Keyword targeting: research/international-keywords-2026-11-21/deep-dive.md
 * ("dattilografia" is the dominant term — "test di battitura" has near-zero
 * interest; the market is driven by ATA/MIUR certification prep, but no
 * recognition is claimed and no provider is named without verification).
 */
export const it = {
    brand: "Ninja Type",
    tagline: "dattilografia, senza distrazioni",
    /** App is now in Italian (Phase B). */
    appLanguageNote: "L'esercitazione è completamente in italiano — con tastiera QWERTY e dizionario italiano.",
    nav: {
        test: "Test di dattilografia",
        learn: "Dattilografia",
        blog: "Blog",
        startTest: "Inizia il test",
    },
    footer: {
        heading: "Un posto tranquillo per allenare la tua digitazione.",
        explore: "Esplora",
        legal: "Note legali",
        privacy: "Privacy",
        terms: "Termini di servizio",
        about: "Chi è NinjaType",
        links: [
            { label: "Test di dattilografia", href: "/it/test-di-dattilografia/" },
            { label: "Dattilografia: imparare a digitare", href: "/it/dattilografia/" },
            { label: "Confronti", href: "/it/lp/10fastfingers-alternative/" },
            { label: "Blog", href: "/it/blog/" },
        ],
        appLinks: [
            { label: "Test di dattilografia", href: "/it/test-di-dattilografia/" },
            { label: "Dattilografia: impara a digitare", href: "/it/dattilografia/" },
            { label: "Gara di dattilografia", href: "/it/gara-di-dattilografia/" },
            { label: "Esercizi di dattilografia (Ghost Race)", href: "/it/esercizi-di-dattilografia/" },
        ],
        finePrint:
            "NinjaType è indipendente e non è collegato ai servizi citati. Gli altri nomi di prodotto appartengono ai rispettivi proprietari.",
    },
    blog: {
        indexTitle: "Blog NinjaType in italiano — dattilografia, test e guide",
        indexDescription:
            "Guide in italiano sulla dattilografia: test di velocità, corsi e certificazioni spiegate senza promesse, esercizi progressivi e simulazioni gratuite.",
        indexHeading: "Digitare meglio.<br />Con metodo, non a caso.",
        indexIntro:
            "Guide in italiano: misura la tua velocità, capisci il mondo dei corsi e certificazioni, esercita con progressi verificabili.",
        practiceNote: "Metti subito in pratica una guida.",
        practiceTestCta: "Inizia il test di velocità",
        practiceLearnCta: "Apri le lezioni",
        readMore: "Leggi la guida",
        allPosts: "Tutte le guide",
        publishedOn: "Pubblicato",
        updatedOn: "Aggiornato",
        backToBlog: "Torna al blog",
        relatedTitle: "Da leggere dopo",
    },
};
