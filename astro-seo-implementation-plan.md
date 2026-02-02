# Complete Astro SEO Implementation Plan

A comprehensive guide to implementing SEO best practices in any Astro application using modern libraries and tools.

---

## 📋 Table of Contents

1. [Foundation Setup](#1-foundation-setup)
2. [Metadata & Schema Management](#2-metadata--schema-management)
3. [Performance Optimization](#3-performance-optimization)
4. [Content Discovery](#4-content-discovery)
5. [Technical SEO](#5-technical-seo)
6. [Image Optimization](#6-image-optimization)
7. [Accessibility](#7-accessibility)
8. [Monitoring & Auditing](#8-monitoring--auditing)
9. [Advanced Optimizations](#9-advanced-optimizations)
10. [Implementation Checklist](#10-implementation-checklist)

---

## 1. Foundation Setup

### Core Dependencies

```bash
npm install astro-seo @astrojs/sitemap
npm install -D schema-dts
```

**Libraries:**

- **astro-seo** - Comprehensive meta tag management
- **@astrojs/sitemap** - XML sitemap generation
- **schema-dts** - Type-safe Schema.org structured data

**Implementation Steps:**

1. **Configure Astro Config**

```javascript
// astro.config.mjs
export default defineConfig({
    site: "https://yourdomain.com",
    integrations: [
        sitemap({
            filter: (page) => !page.includes("/admin/"),
            customPages: ["https://yourdomain.com/custom-page"],
        }),
    ],
});
```

2. **Create BaseHead Component**

```astro
---
// src/components/BaseHead.astro
import { SEO } from 'astro-seo';

interface Props {
  title: string;
  description: string;
  image?: string;
  canonical?: string;
  noindex?: boolean;
}
---

<SEO
  title={title}
  description={description}
  canonical={canonical || Astro.url.href}
  openGraph={{
    basic: {
      title: title,
      type: 'website',
      image: image || '/og-image.png',
    }
  }}
  twitter={{
    card: 'summary_large_image',
  }}
  extend={{
    meta: [
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ...(noindex ? [{ name: 'robots', content: 'noindex, nofollow' }] : []),
    ],
  }}
/>
```

3. **Create Structured Data Component**

```typescript
// src/components/StructuredData.astro
---
import type { WebSite, WebPage, Article, Organization } from 'schema-dts';

interface Props {
  schema: WebSite | WebPage | Article | Organization;
}

const { schema } = Astro.props;
---

<script type="application/ld+json" set:html={JSON.stringify(schema)} />
```

---

## 2. Metadata & Schema Management

### Additional Dependencies

```bash
npm install astro-og-canvas
npm install -D @types/schema-org
```

**Libraries:**

- **astro-og-canvas** - Dynamic Open Graph image generation
- **@types/schema-org** - Alternative Schema.org types

**Implementation Steps:**

1. **Setup OG Image Generation**

```typescript
// src/pages/open-graph/[...route].ts
import { OGImageRoute } from "astro-og-canvas";

export const { getStaticPaths, GET } = OGImageRoute({
    param: "route",
    pages: await glob("./src/pages/**/*.astro"),
    getImageOptions: (path, page) => ({
        title: page.frontmatter.title,
        description: page.frontmatter.description,
        bgGradient: [[24, 24, 27]],
        font: {
            title: { size: 72 },
            description: { size: 42 },
        },
    }),
});
```

2. **Create Common Schema Templates**

```typescript
// src/lib/schema-templates.ts
import type { WebSite, Organization, BreadcrumbList } from "schema-dts";

export const getOrganizationSchema = (site: string): Organization => ({
    "@type": "Organization",
    "@id": `${site}/#organization`,
    name: "Your Company Name",
    url: site,
    logo: `${site}/logo.png`,
    sameAs: ["https://twitter.com/yourhandle", "https://github.com/yourorg"],
});

export const getWebsiteSchema = (site: string): WebSite => ({
    "@type": "WebSite",
    "@id": `${site}/#website`,
    url: site,
    name: "Your Site Name",
    publisher: { "@id": `${site}/#organization` },
    potentialAction: {
        "@type": "SearchAction",
        target: {
            "@type": "EntryPoint",
            urlTemplate: `${site}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
    },
});
```

---

## 3. Performance Optimization

### Core Performance Dependencies

```bash
npm install @playform/compress astro-critters astro-font
npm install -D astro-compress
```

**Libraries:**

- **@playform/compress** - HTML/CSS/JS/Image compression
- **astro-critters** - Critical CSS inlining
- **astro-font** - Font optimization and preloading

**Implementation Steps:**

1. **Configure Compression**

```javascript
// astro.config.mjs
import compress from "@playform/compress";

export default defineConfig({
    integrations: [
        compress({
            CSS: true,
            HTML: true,
            Image: true,
            JavaScript: true,
            SVG: true,
        }),
    ],
});
```

2. **Optimize Font Loading**

```astro
---
// src/layouts/BaseLayout.astro
import { AstroFont } from 'astro-font';
---

<AstroFont
  config={[
    {
      name: 'Inter',
      src: [],
      googleFontsURL: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
      preload: true,
      display: 'swap',
      selector: 'body',
      fallback: 'sans-serif',
    },
  ]}
/>
```

3. **Add Resource Hints**

```astro
<!-- src/components/BaseHead.astro -->
<link rel="dns-prefetch" href="https://fonts.googleapis.com" />
<link rel="dns-prefetch" href="https://www.google-analytics.com" />
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />
```

4. **Critical CSS Inlining**

```javascript
// astro.config.mjs
import critters from "astro-critters";

export default defineConfig({
    integrations: [
        critters({
            preload: "swap",
        }),
    ],
});
```

---

## 4. Content Discovery

### Content & Feed Dependencies

```bash
npm install @astrojs/rss reading-time
npm install rehype-external-links rehype-slug
```

**Libraries:**

- **@astrojs/rss** - RSS/Atom feed generation
- **reading-time** - Calculate reading time for articles
- **rehype-external-links** - Auto-configure external links

**Implementation Steps:**

1. **Create RSS Feed**

```typescript
// src/pages/rss.xml.ts
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
    const posts = await getCollection("blog");

    return rss({
        title: "Your Blog Title",
        description: "Your blog description",
        site: context.site,
        items: posts.map((post) => ({
            title: post.data.title,
            pubDate: post.data.publishDate,
            description: post.data.description,
            link: `/blog/${post.slug}/`,
        })),
        customData: "<language>en-us</language>",
    });
}
```

2. **Add Reading Time to Posts**

```typescript
// src/lib/reading-time.ts
import readingTime from "reading-time";

export function getReadingTime(content: string) {
    const stats = readingTime(content);
    return {
        text: stats.text,
        minutes: Math.ceil(stats.minutes),
        words: stats.words,
    };
}
```

3. **Configure External Links**

```javascript
// astro.config.mjs
import rehypeExternalLinks from "rehype-external-links";

export default defineConfig({
    markdown: {
        rehypePlugins: [
            [
                rehypeExternalLinks,
                {
                    target: "_blank",
                    rel: ["noopener", "noreferrer"],
                },
            ],
        ],
    },
});
```

4. **Add RSS Discovery**

```astro
<!-- src/components/BaseHead.astro -->
<link
  rel="alternate"
  type="application/rss+xml"
  title="RSS Feed"
  href="/rss.xml"
/>
```

---

## 5. Technical SEO

### Technical SEO Dependencies

```bash
npm install astro-robots-txt astro-redirects
npm install -D astro-webmanifest
```

**Libraries:**

- **astro-robots-txt** - Dynamic robots.txt generation
- **astro-redirects** - Manage 301/302 redirects
- **astro-webmanifest** - PWA manifest generation

**Implementation Steps:**

1. **Configure Robots.txt**

```javascript
// astro.config.mjs
import robotsTxt from "astro-robots-txt";

export default defineConfig({
    integrations: [
        robotsTxt({
            policy: [
                {
                    userAgent: "*",
                    allow: "/",
                    disallow: ["/admin/", "/api/"],
                },
            ],
            sitemap: true,
        }),
    ],
});
```

2. **Setup Redirects**

```javascript
// astro.config.mjs
import redirects from "astro-redirects";

export default defineConfig({
    integrations: [
        redirects({
            config: [
                { from: "/old-page", to: "/new-page", status: 301 },
                { from: "/blog/:slug", to: "/articles/:slug", status: 301 },
            ],
        }),
    ],
});
```

3. **Create Web Manifest**

```javascript
// astro.config.mjs
import webmanifest from "astro-webmanifest";

export default defineConfig({
    integrations: [
        webmanifest({
            name: "Your App Name",
            short_name: "App",
            description: "Your app description",
            start_url: "/",
            theme_color: "#ffffff",
            background_color: "#ffffff",
            display: "standalone",
            icons: [
                {
                    src: "/icon-192.png",
                    sizes: "192x192",
                    type: "image/png",
                },
                {
                    src: "/icon-512.png",
                    sizes: "512x512",
                    type: "image/png",
                },
            ],
        }),
    ],
});
```

4. **Add Breadcrumbs Schema**

```typescript
// src/lib/breadcrumbs.ts
import type { BreadcrumbList } from "schema-dts";

export function getBreadcrumbSchema(
    items: Array<{ name: string; url: string }>,
): BreadcrumbList {
    return {
        "@type": "BreadcrumbList",
        "@context": "https://schema.org",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}
```

---

## 6. Image Optimization

### Image Dependencies

```bash
npm install sharp
# Astro includes built-in Image component
```

**Libraries:**

- **sharp** - Image processing (already in your project)
- Built-in **astro:assets** - Native image optimization

**Implementation Steps:**

1. **Use Astro Image Component**

```astro
---
import { Image } from 'astro:assets';
import myImage from '../assets/image.png';
---

<Image
  src={myImage}
  alt="Descriptive alt text"
  width={800}
  height={600}
  format="webp"
  loading="lazy"
/>
```

2. **Configure Image Optimization**

```javascript
// astro.config.mjs
export default defineConfig({
    image: {
        domains: ["images.example.com"],
        remotePatterns: [{ protocol: "https" }],
    },
});
```

3. **Create Image Helper**

```typescript
// src/lib/image-helpers.ts
export function getOptimizedImage(src: string, width: number) {
    return {
        src,
        width,
        height: Math.floor(width * 0.75), // 4:3 aspect ratio
        format: "webp" as const,
        quality: 80,
    };
}
```

4. **Add Image Sitemap**

```typescript
// Extend sitemap to include images
import { getImage } from "astro:assets";

// In your sitemap generation
const images = await glob("./src/assets/**/*.{png,jpg,jpeg,webp}");
```

---

## 7. Accessibility

### Accessibility Dependencies

```bash
npm install -D astro-accessibility eslint-plugin-jsx-a11y
```

**Libraries:**

- **astro-accessibility** - Runtime accessibility audits
- **eslint-plugin-jsx-a11y** - Linting for React components

**Implementation Steps:**

1. **Configure Accessibility Plugin**

```javascript
// astro.config.mjs
import accessibility from "astro-accessibility";

export default defineConfig({
    integrations: [
        accessibility({
            // Run checks in development
            environment: "development",
        }),
    ],
});
```

2. **Setup ESLint for A11y**

```json
// .eslintrc.json
{
    "extends": ["plugin:jsx-a11y/recommended"],
    "plugins": ["jsx-a11y"],
    "rules": {
        "jsx-a11y/anchor-is-valid": "error",
        "jsx-a11y/img-redundant-alt": "error"
    }
}
```

3. **Create Skip Link Component**

```astro
<!-- src/components/SkipLink.astro -->
<a href="#main-content" class="skip-link">
  Skip to main content
</a>

<style>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: white;
  padding: 8px;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
</style>
```

---

## 8. Monitoring & Auditing

### Audit Dependencies

```bash
npm install -D lighthouse unlighthouse
npm install -D @lhci/cli
```

**Libraries:**

- **lighthouse** - Automated audits
- **unlighthouse** - Full site scanning
- **@lhci/cli** - Lighthouse CI integration

**Implementation Steps:**

1. **Setup Unlighthouse**

```javascript
// unlighthouse.config.ts
export default {
    site: "https://yourdomain.com",
    scanner: {
        samples: 3,
        throttle: true,
    },
    outputPath: "./unlighthouse-reports",
};
```

2. **Add npm Scripts**

```json
// package.json
{
    "scripts": {
        "audit": "unlighthouse --site http://localhost:4321",
        "audit:ci": "lhci autorun",
        "lighthouse": "lighthouse http://localhost:4321 --view"
    }
}
```

3. **Configure Lighthouse CI**

```javascript
// lighthouserc.js
module.exports = {
    ci: {
        collect: {
            startServerCommand: "npm run preview",
            url: ["http://localhost:4321/"],
            numberOfRuns: 3,
        },
        assert: {
            assertions: {
                "categories:performance": ["error", { minScore: 0.9 }],
                "categories:accessibility": ["error", { minScore: 0.9 }],
                "categories:seo": ["error", { minScore: 0.9 }],
            },
        },
        upload: {
            target: "temporary-public-storage",
        },
    },
};
```

4. **GitHub Actions Workflow**

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [pull_request]

jobs:
    lighthouse:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3
            - uses: actions/setup-node@v3
            - run: npm ci
            - run: npm run build
            - run: npm run audit:ci
```

---

## 9. Advanced Optimizations

### Advanced Dependencies

```bash
npm install astro-embed
npm install -D astro-compress vite-plugin-pwa
```

**Libraries:**

- **astro-embed** - Lazy-loaded embeds
- **vite-plugin-pwa** - Progressive Web App support

**Implementation Steps:**

1. **Lazy Load Embeds**

```astro
---
import { YouTube, Tweet } from 'astro-embed';
---

<!-- Automatically lazy loads and optimizes -->
<YouTube id="dQw4w9WgXcQ" />
<Tweet id="1234567890" />
```

2. **Configure PWA**

```javascript
// astro.config.mjs
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
    vite: {
        plugins: [
            VitePWA({
                registerType: "autoUpdate",
                workbox: {
                    globPatterns: ["**/*.{js,css,html,png,jpg,svg,woff2}"],
                    runtimeCaching: [
                        {
                            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
                            handler: "CacheFirst",
                            options: {
                                cacheName: "google-fonts",
                                expiration: {
                                    maxEntries: 10,
                                    maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                                },
                            },
                        },
                    ],
                },
            }),
        ],
    },
});
```

3. **Implement Partytown for Scripts**

```javascript
// astro.config.mjs
import partytown from "@astrojs/partytown";

export default defineConfig({
    integrations: [
        partytown({
            config: {
                forward: ["dataLayer.push"],
            },
        }),
    ],
});
```

```astro
<!-- Move analytics to web worker -->
<script type="text/partytown" src="https://www.googletagmanager.com/gtag/js"></script>
```

4. **Add Prefetching**

```astro
---
// Enable view transitions prefetch
import { ViewTransitions } from 'astro:transitions';
---

<ViewTransitions />

<!-- Prefetch important pages -->
<link rel="prefetch" href="/about" />
<link rel="prefetch" href="/contact" />
```

---

## 10. Implementation Checklist

### Phase 1: Foundation (Week 1)

- [ ] Install core dependencies (astro-seo, sitemap, schema-dts)
- [ ] Configure site URL in astro.config.mjs
- [ ] Create BaseHead component with meta tags
- [ ] Implement structured data component
- [ ] Setup sitemap generation
- [ ] Create robots.txt

### Phase 2: Performance (Week 2)

- [ ] Install compression library
- [ ] Configure font optimization
- [ ] Add resource hints (dns-prefetch, preconnect)
- [ ] Implement critical CSS inlining
- [ ] Optimize images with astro:assets
- [ ] Configure Partytown for third-party scripts

### Phase 3: Content (Week 3)

- [ ] Create RSS feed
- [ ] Add reading time to blog posts
- [ ] Configure external links (noopener, noreferrer)
- [ ] Implement breadcrumbs
- [ ] Add social sharing meta tags
- [ ] Create OG image generation

### Phase 4: Technical SEO (Week 4)

- [ ] Setup redirects configuration
- [ ] Create web manifest for PWA
- [ ] Add breadcrumb schema
- [ ] Implement canonical URLs
- [ ] Configure hreflang (if multilingual)
- [ ] Add pagination meta tags

### Phase 5: Accessibility (Week 5)

- [ ] Install accessibility audit tools
- [ ] Add skip links
- [ ] Ensure proper heading hierarchy
- [ ] Add ARIA labels where needed
- [ ] Test keyboard navigation
- [ ] Run automated a11y tests

### Phase 6: Monitoring (Week 6)

- [ ] Setup Lighthouse CI
- [ ] Configure Unlighthouse
- [ ] Create performance budgets
- [ ] Setup GitHub Actions for audits
- [ ] Monitor Core Web Vitals
- [ ] Create SEO dashboard

---

## Quick Command Reference

```bash
# Install all essential SEO packages
npm install astro-seo @astrojs/sitemap @astrojs/rss astro-og-canvas
npm install @playform/compress astro-font astro-robots-txt
npm install -D schema-dts unlighthouse lighthouse

# Run audits
npm run audit              # Full site audit
npm run lighthouse         # Single page audit
npm run build              # Check for build warnings

# Development checks
npm run dev                # Check console for a11y warnings
npx unlighthouse --build   # Build-time SEO scan
```

---

## Performance Targets

### Core Web Vitals Goals

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Lighthouse Scores

- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

### Technical Metrics

- First Contentful Paint: < 1.8s
- Time to Interactive: < 3.5s
- Speed Index: < 3.0s
- Total Blocking Time: < 200ms

---

## Common Pitfalls to Avoid

1. **Don't block render with fonts** - Use font-display: swap
2. **Don't skip alt text** - Every image needs descriptive alt text
3. **Don't forget mobile viewport** - Always include viewport meta tag
4. **Don't use generic descriptions** - Each page needs unique meta description
5. **Don't ignore 404 pages** - Create custom 404 with helpful links
6. **Don't forget canonical URLs** - Prevent duplicate content issues
7. **Don't skip structured data** - Rich results improve CTR
8. **Don't ignore Core Web Vitals** - They're ranking factors
9. **Don't forget RSS feed** - Important for content discovery
10. **Don't skip accessibility** - It's SEO and UX combined

---

## Resources

### Official Documentation

- [Astro SEO Guide](https://docs.astro.build/en/guides/seo/)
- [Schema.org Documentation](https://schema.org/)
- [Web.dev Performance Guide](https://web.dev/performance/)

### Tools

- [Google Search Console](https://search.google.com/search-console)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Schema Markup Validator](https://validator.schema.org/)
- [Rich Results Test](https://search.google.com/test/rich-results)

### Testing

- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [GTmetrix](https://gtmetrix.com/)

---

## Maintenance Schedule

### Daily

- Monitor Core Web Vitals
- Check for build errors

### Weekly

- Review Search Console reports
- Check for broken links
- Monitor sitemap indexing

### Monthly

- Run full site audit
- Update structured data
- Review page speed trends
- Check mobile usability

### Quarterly

- Content audit and updates
- Refresh meta descriptions
- Update schema markup
- Review redirect chains
- Competitor SEO analysis

---

## License

This plan is free to use and modify for any Astro project.

**Last Updated:** February 2026
