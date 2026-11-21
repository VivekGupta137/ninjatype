/**
 * French UI strings for the /fr/ content tree (Phase A).
 * The interactive typing app itself stays English in this phase; these
 * strings cover the localized marketing pages, blog shell and legal footer.
 * Keyword targeting: research/international-keywords-2026-11-21/deep-dive.md
 * (dactylographie / test de frappe; éviter « vitesse de frappe » seule → football).
 */
export const fr = {
    brand: "Ninja Type",
    tagline: "dactylographie, sans bruit",
    /** App is English-only in Phase A — set expectations honestly. */
    appLanguageNote: "L'exercice lui-même est en anglais — le test ne demande aucune connaissance de la langue.",
    nav: {
        test: "Test de vitesse de frappe",
        learn: "Apprendre à taper",
        blog: "Blog",
        startTest: "Lancer le test",
    },
    footer: {
        heading: "Un endroit calme pour votre entraînement clavier.",
        explore: "Explorer",
        legal: "Mentions légales",
        privacy: "Confidentialité",
        terms: "Conditions d'utilisation",
        about: "À propos de NinjaType",
        links: [
            { label: "Test de vitesse de frappe", href: "/fr/test-de-vitesse-de-frappe/" },
            { label: "Apprendre à taper au clavier", href: "/fr/apprendre-a-taper-au-clavier/" },
            { label: "Comparatifs", href: "/fr/lp/10fastfingers-alternative/" },
            { label: "Blog", href: "/fr/blog/" },
        ],
        appLinks: [
            { label: "Test de frappe", href: "/fr/test-de-vitesse-de-frappe/" },
            { label: "Leçons de dactylographie", href: "/fr/apprendre-a-taper-au-clavier/" },
            { label: "Défi Dactylo (multijoueur)", href: "/fr/defi-dactylo/" },
            { label: "Exercices (Ghost Race)", href: "/fr/exercices-de-dactylographie/" },
        ],
        finePrint:
            "NinjaType est indépendant et n'est affilié à aucun des services mentionnés. Les autres noms de produits appartiennent à leurs propriétaires respectifs.",
    },
    blog: {
        indexTitle: "Blog NinjaType en français — vitesse de frappe, cours & guides",
        indexDescription:
            "Guides en français sur la dactylographie : test de vitesse de frappe, cours de dactylographie gratuit, exercices et jeux pour progresser au clavier.",
        indexHeading: "Taper sans se presser.<br />Progréder sans improviser.",
        indexIntro:
            "Guides en français : mesurer sa vitesse de frappe, apprendre la dactylographie et comparer honnêtement.",
        practiceNote: "Mettez un guide en pratique.",
        practiceTestCta: "Lancer le test de vitesse",
        practiceLearnCta: "Ouvrir les leçons",
        readMore: "Lire le guide",
        allPosts: "Tous les guides",
        publishedOn: "Publié",
        updatedOn: "Mis à jour",
        backToBlog: "Retour au blog",
        relatedTitle: "À lire ensuite",
    },
};
