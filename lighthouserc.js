module.exports = {
    ci: {
        collect: {
            startServerCommand: "npm run preview",
            url: [
                "http://localhost:4321/",
                "http://localhost:4321/history",
                "http://localhost:4321/learn",
                "http://localhost:4321/about",
            ],
            numberOfRuns: 3,
        },
        assert: {
            preset: "lighthouse:recommended",
            assertions: {
                "categories:performance": ["error", { minScore: 0.85 }],
                "categories:accessibility": ["error", { minScore: 0.9 }],
                "categories:best-practices": ["error", { minScore: 0.9 }],
                "categories:seo": ["error", { minScore: 0.95 }],

                // Core Web Vitals
                "first-contentful-paint": ["error", { maxNumericValue: 2000 }],
                "largest-contentful-paint": [
                    "error",
                    { maxNumericValue: 2500 },
                ],
                "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
                "total-blocking-time": ["error", { maxNumericValue: 300 }],
                "speed-index": ["error", { maxNumericValue: 3000 }],

                // Performance budgets
                "resource-summary:script:size": [
                    "error",
                    { maxNumericValue: 200000 },
                ],
                "resource-summary:stylesheet:size": [
                    "error",
                    { maxNumericValue: 75000 },
                ],
                "resource-summary:image:size": [
                    "error",
                    { maxNumericValue: 500000 },
                ],
                "resource-summary:font:size": [
                    "error",
                    { maxNumericValue: 150000 },
                ],

                // Accessibility
                "aria-allowed-attr": "error",
                "aria-required-attr": "error",
                "button-name": "error",
                "heading-order": "warn",
                "image-alt": "error",
                "link-name": "error",

                // SEO
                "meta-description": "error",
                "document-title": "error",
                "crawlable-anchors": "error",
                canonical: "error",
            },
        },
        upload: {
            target: "temporary-public-storage",
        },
    },
};
