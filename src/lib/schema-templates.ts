import type {
    WebSite,
    Organization,
    WebPage,
    FAQPage,
    WebApplication,
} from "schema-dts";

/**
 * Organization schema for NinjaType
 * Represents the organization/brand behind the website
 */
export const getOrganizationSchema = (): Organization => ({
    "@type": "Organization",
    "@id": "https://ninjatype.com/#organization",
    name: "NinjaType",
    url: "https://ninjatype.com",
    logo: "https://ninjatype.com/favicon/favicon-192x192.png",
    sameAs: ["https://twitter.com/realninjatype"],
    description:
        "Minimalist typing practice platform to improve typing speed and accuracy",
});

/**
 * Website schema for NinjaType
 * Represents the website itself
 */
export const getWebsiteSchema = (): WebSite => ({
    "@type": "WebSite",
    "@id": "https://ninjatype.com/#website",
    url: "https://ninjatype.com",
    name: "NinjaType",
    description:
        "Improve your typing speed and accuracy with NinjaType. A minimalist, distraction-free typing interface with real-time WPM tracking, performance analytics, and customizable themes.",
    publisher: { "@id": "https://ninjatype.com/#organization" },
    inLanguage: "en-US",
});

/**
 * Web Application schema for NinjaType
 * Represents the typing practice application
 */
export const getWebApplicationSchema = (): WebApplication => ({
    "@type": "WebApplication",
    "@id": "https://ninjatype.com/#webapp",
    name: "NinjaType - Typing Practice",
    url: "https://ninjatype.com",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
    },
    featureList: [
        "Real-time WPM (Words Per Minute) tracking",
        "Typing accuracy measurement",
        "Performance analytics and history",
        "Customizable themes (13+ themes)",
        "Touch typing practice",
        "Learn mode for specific key practice",
        "Distraction-free minimalist interface",
        "No registration required",
    ],
    screenshot: "https://ninjatype.com/images/og-image.png",
    aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "150",
        bestRating: "5",
        worstRating: "1",
    },
});

/**
 * WebPage schema template
 * Use this for individual pages
 */
export const getWebPageSchema = (props: {
    url: string;
    name: string;
    description: string;
    datePublished?: string;
    dateModified?: string;
}): WebPage => ({
    "@type": "WebPage",
    "@id": `${props.url}#webpage`,
    url: props.url,
    name: props.name,
    description: props.description,
    isPartOf: { "@id": "https://ninjatype.com/#website" },
    about: { "@id": "https://ninjatype.com/#organization" },
    inLanguage: "en-US",
    ...(props.datePublished && { datePublished: props.datePublished }),
    ...(props.dateModified && { dateModified: props.dateModified }),
});

/**
 * FAQ Page schema template
 * Use this for pages with FAQ sections
 */
export const getFAQPageSchema = (
    faqs: Array<{ question: string; answer: string }>,
): FAQPage => ({
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
        },
    })),
});

/**
 * Create a complete JSON-LD schema graph
 * Use this to combine multiple schemas on a page
 */
export const createSchemaGraph = (
    ...schemas: Array<
        Organization | WebSite | WebApplication | WebPage | FAQPage
    >
) => ({
    "@context": "https://schema.org",
    "@graph": schemas,
});
