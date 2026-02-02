# NinjaType SEO Implementation Plan

## Step-by-Step Execution Guide

**Project**: NinjaType - Minimalist Typing Practice  
**Current Status**: Basic SEO foundation in place  
**Goal**: Achieve 90+ Lighthouse scores across all categories

---

## 📊 Current State Assessment

### ✅ Already Implemented

- Basic SEO component with meta tags
- Sitemap integration (@astrojs/sitemap)
- Canonical URLs
- robots.txt
- Open Graph tags
- Twitter cards
- Google Analytics
- SimpleAnalytics
- Custom 404 page
- FAQ schema components
- Breadcrumb schema components
- Article schema components

### ❌ Missing / Needs Improvement

- No astro-seo library (custom implementation)
- No TypeScript schema types (schema-dts)
- No structured data on main pages
- No performance optimization (compression, critical CSS)
- No font optimization
- No OG image generation
- No RSS feed
- No PWA manifest
- No resource hints (preconnect, dns-prefetch)
- No image optimization strategy
- Analytics not optimized with Partytown
- No automated SEO auditing in CI/CD
- Missing Web Manifest configuration

---

## 🎯 Implementation Phases

### **Phase 1: Foundation & Schema Enhancement (Week 1)**

**Priority**: High  
**Effort**: Low  
**Impact**: High

#### Step 1.1: Install Core Dependencies

```bash
npm install schema-dts
npm install -D @types/schema-org
```

**Action Items:**

- [ ] Run installation command
- [ ] Verify packages in package.json
- [ ] Test build still works

---

#### Step 1.2: Create Schema Templates Library

**File**: `src/lib/schema-templates.ts`

**Tasks:**

- [ ] Create new file with organization schema
- [ ] Add website schema with search action
- [ ] Create WebPage schema template
- [ ] Add FAQ page schema
- [ ] Create typing test activity schema (custom for your use case)

**Schema to implement:**

```typescript
// src/lib/schema-templates.ts
import type {
    WebSite,
    Organization,
    WebPage,
    FAQPage,
    SoftwareApplication,
    WebApplication,
} from "schema-dts";

export const getOrganizationSchema = (): Organization => ({
    "@type": "Organization",
    "@id": "https://ninjatype.com/#organization",
    name: "NinjaType",
    url: "https://ninjatype.com",
    logo: "https://ninjatype.com/favicon/favicon-192x192.png",
    sameAs: [
        "https://twitter.com/realninjatype",
        "https://github.com/your-github-org",
    ],
});

export const getWebsiteSchema = (): WebSite => ({
    "@type": "WebSite",
    "@id": "https://ninjatype.com/#website",
    url: "https://ninjatype.com",
    name: "NinjaType",
    description: "Minimalist typing practice platform",
    publisher: { "@id": "https://ninjatype.com/#organization" },
});

export const getWebApplicationSchema = (): WebApplication => ({
    "@type": "WebApplication",
    name: "NinjaType",
    url: "https://ninjatype.com",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web Browser",
    offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
    },
    featureList: [
        "Real-time WPM tracking",
        "Performance analytics",
        "Customizable themes",
        "Touch typing practice",
    ],
});
```

**Validation:**

- [ ] Test schemas at https://validator.schema.org/
- [ ] Check in Google Rich Results Test

---

#### Step 1.3: Add Structured Data to Main Pages

**File**: Update `src/pages/index.astro`

**Tasks:**

- [ ] Import schema templates
- [ ] Add Organization schema
- [ ] Add Website schema
- [ ] Add WebApplication schema
- [ ] Test structured data appears in page source

**Implementation:**

```astro
---
// At top of index.astro
import {
  getOrganizationSchema,
  getWebsiteSchema,
  getWebApplicationSchema
} from '@/lib/schema-templates';

const schemas = {
  "@context": "https://schema.org",
  "@graph": [
    getOrganizationSchema(),
    getWebsiteSchema(),
    getWebApplicationSchema()
  ]
};
---

<BaseLayout ...>
  <script type="application/ld+json" set:html={JSON.stringify(schemas)} />
  <!-- rest of page -->
</BaseLayout>
```

**Apply to other pages:**

- [ ] Update `/history` page with WebPage schema
- [ ] Update `/learn` pages with educational content schema
- [ ] Update content pages (about, contact, etc.)

---

#### Step 1.4: Enhance robots.txt

**File**: `public/robots.txt`

**Tasks:**

- [ ] Verify sitemap URL is correct
- [ ] Add crawl-delay if needed
- [ ] Add disallow for any API routes

**Current status**: ✅ Already well-configured

---

### **Phase 2: Performance Optimization (Week 2)**

**Priority**: High  
**Effort**: Medium  
**Impact**: Very High

#### Step 2.1: Install Performance Dependencies

```bash
npm install @playform/compress astro-font
npm install -D astro-critters
```

**Action Items:**

- [ ] Install packages
- [ ] Verify compatibility with Cloudflare adapter
- [ ] Test build

---

#### Step 2.2: Configure Compression

**File**: `astro.config.mjs`

**Tasks:**

- [ ] Import @playform/compress
- [ ] Add to integrations array
- [ ] Configure compression options
- [ ] Test build output is compressed

**Implementation:**

```javascript
import compress from "@playform/compress";

export default defineConfig({
    site: "https://ninjatype.com",
    integrations: [
        react(),
        mdx(),
        sitemap(),
        compress({
            CSS: true,
            HTML: true,
            Image: true,
            JavaScript: true,
            SVG: true,
        }),
    ],
    // ... rest of config
});
```

**Validation:**

- [ ] Check build output file sizes
- [ ] Verify gzip compression working
- [ ] Test page still functions correctly

---

#### Step 2.3: Add Resource Hints

**File**: `src/components/common/CommonHead.astro`

**Tasks:**

- [ ] Add dns-prefetch for Google Analytics
- [ ] Add dns-prefetch for SimpleAnalytics
- [ ] Add preconnect for fonts if using external fonts
- [ ] Test performance impact

**Implementation:**

```astro
<!-- Add to CommonHead.astro -->
<link rel="dns-prefetch" href="https://www.googletagmanager.com" />
<link rel="dns-prefetch" href="https://scripts.simpleanalyticscdn.com" />
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />
```

---

#### Step 2.4: Optimize Font Loading

**Current**: Using @fontsource/twinkle-star

**Tasks:**

- [ ] Audit font usage across site
- [ ] Add font-display: swap to @font-face declarations
- [ ] Preload critical fonts
- [ ] Consider subsetting if using limited characters

**File**: `src/styles/global.css`

**Implementation:**

```css
@font-face {
    font-family: "Twinkle Star";
    font-display: swap; /* Add this */
    /* ... rest of declaration */
}
```

**In CommonHead.astro:**

```astro
<link
  rel="preload"
  href="/fonts/twinkle-star.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

---

#### Step 2.5: Implement Partytown for Analytics

```bash
npm install @astrojs/partytown
```

**File**: `astro.config.mjs`

**Tasks:**

- [ ] Install Partytown
- [ ] Add to integrations
- [ ] Configure for Google Analytics
- [ ] Update script tags in BaseLayout

**Configuration:**

```javascript
import partytown from "@astrojs/partytown";

export default defineConfig({
    integrations: [
        // ... other integrations
        partytown({
            config: {
                forward: ["dataLayer.push", "sa_event"],
            },
        }),
    ],
});
```

**File**: `src/layouts/BaseLayout.astro`

**Update analytics scripts:**

```astro
<!-- Change from: -->
<script async src="...gtag.js"></script>

<!-- To: -->
<script type="text/partytown" src="...gtag.js"></script>
<script type="text/partytown" is:inline>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', googleAnalyticsId);
</script>

<!-- SimpleAnalytics -->
<script type="text/partytown" src="https://scripts.simpleanalyticscdn.com/latest.js"></script>
```

**Validation:**

- [ ] Verify analytics still tracking
- [ ] Check main thread blocking time reduced
- [ ] Test in Lighthouse

---

### **Phase 3: Content & Discovery (Week 3)**

**Priority**: Medium  
**Effort**: Medium  
**Impact**: High

#### Step 3.1: Create RSS Feed

```bash
npm install @astrojs/rss
```

**File**: `src/pages/rss.xml.ts`

**Tasks:**

- [ ] Create RSS endpoint
- [ ] Include blog posts or updates
- [ ] Add typing tips content
- [ ] Configure feed metadata

**Implementation:**

```typescript
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
    // If you have blog posts/updates in content collections
    const posts = await getCollection("blog"); // Adjust collection name

    return rss({
        title: "NinjaType Updates & Tips",
        description:
            "Latest updates and typing improvement tips from NinjaType",
        site: context.site,
        items: posts.map((post) => ({
            title: post.data.title,
            pubDate: post.data.publishDate,
            description: post.data.description,
            link: `/blog/${post.slug}/`,
        })),
        customData: `<language>en-us</language>`,
    });
}
```

**If no blog yet:**

- [ ] Create static items for major features/updates
- [ ] Plan future content strategy

**Add RSS discovery:**
**File**: `src/components/common/CommonHead.astro`

```astro
<link rel="alternate" type="application/rss+xml" title="NinjaType RSS Feed" href="/rss.xml" />
```

---

#### Step 3.2: Add Reading Time (If Applicable)

```bash
npm install reading-time
```

**Tasks:**

- [ ] Add to blog/article pages
- [ ] Display in UI
- [ ] Include in schema markup

**File**: `src/lib/reading-time.ts`

```typescript
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

---

#### Step 3.3: Optimize External Links

**File**: `astro.config.mjs`

```bash
npm install rehype-external-links rehype-slug
```

**Tasks:**

- [ ] Install rehype plugins
- [ ] Configure external link behavior
- [ ] Add heading anchors

**Implementation:**

```javascript
import rehypeExternalLinks from "rehype-external-links";
import rehypeSlug from "rehype-slug";

export default defineConfig({
    markdown: {
        rehypePlugins: [
            rehypeSlug,
            [
                rehypeExternalLinks,
                {
                    target: "_blank",
                    rel: ["noopener", "noreferrer"],
                },
            ],
        ],
    },
    // ... rest
});
```

---

#### Step 3.4: Generate Dynamic OG Images

```bash
npm install astro-og-canvas
```

**File**: `src/pages/og-image/[...route].ts`

**Tasks:**

- [ ] Create OG image endpoint
- [ ] Design template matching NinjaType aesthetic
- [ ] Generate for all main pages
- [ ] Update SEO component to use dynamic images

**Implementation:**

```typescript
import { OGImageRoute } from "astro-og-canvas";

export const { getStaticPaths, GET } = OGImageRoute({
    param: "route",
    pages: import.meta.glob("/src/pages/**/*.astro", { eager: true }),
    getImageOptions: (_path, page) => {
        return {
            title: page.frontmatter?.title || "NinjaType",
            description:
                page.frontmatter?.description || "Minimalist Typing Practice",
            bgGradient: [[15, 23, 42]], // Dark blue gradient
            border: { color: [59, 130, 246], width: 20 }, // Blue border
            padding: 60,
            font: {
                title: {
                    size: 72,
                    weight: "Bold",
                    color: [255, 255, 255],
                    families: ["Inter"],
                },
                description: {
                    size: 42,
                    color: [203, 213, 225],
                    families: ["Inter"],
                },
            },
        };
    },
});
```

**Update SEO.astro:**

```astro
const ogImage = image || `/og-image/${Astro.url.pathname}.png`;
```

---

### **Phase 4: Technical SEO & PWA (Week 4)**

**Priority**: Medium  
**Effort**: Low-Medium  
**Impact**: Medium

#### Step 4.1: Create Web Manifest

**File**: `public/favicon/manifest.json` (already exists)

**Tasks:**

- [ ] Review and enhance existing manifest
- [ ] Ensure all icon sizes are present
- [ ] Add screenshots for install prompt
- [ ] Test PWA installation

**Enhanced manifest.json:**

```json
{
    "name": "NinjaType - Typing Practice",
    "short_name": "NinjaType",
    "description": "Improve your typing speed with minimalist practice",
    "start_url": "/",
    "display": "standalone",
    "theme_color": "#0f172a",
    "background_color": "#0f172a",
    "icons": [
        {
            "src": "/favicon/favicon-192x192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "/favicon/favicon-512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any maskable"
        }
    ],
    "categories": ["education", "productivity"],
    "shortcuts": [
        {
            "name": "Start Typing Test",
            "url": "/",
            "description": "Begin typing practice"
        },
        {
            "name": "View History",
            "url": "/history",
            "description": "See your typing history"
        },
        {
            "name": "Learn Mode",
            "url": "/learn",
            "description": "Practice specific keys"
        }
    ]
}
```

**Add to CommonHead.astro:**

```astro
<link rel="manifest" href="/favicon/manifest.json" />
<meta name="theme-color" content="#0f172a" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

---

#### Step 4.2: Implement Service Worker (Optional PWA)

```bash
npm install -D vite-plugin-pwa
```

**File**: `astro.config.mjs`

**Tasks:**

- [ ] Install vite-plugin-pwa
- [ ] Configure workbox
- [ ] Add offline support
- [ ] Cache typing practice assets

**Configuration:**

```javascript
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
    vite: {
        plugins: [
            VitePWA({
                registerType: "autoUpdate",
                includeAssets: [
                    "favicon.ico",
                    "robots.txt",
                    "fonts/**",
                    "themes/**",
                ],
                manifest: false, // Use existing manifest.json
                workbox: {
                    globPatterns: ["**/*.{js,css,html,png,jpg,svg,woff2}"],
                    runtimeCaching: [
                        {
                            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
                            handler: "CacheFirst",
                            options: {
                                cacheName: "google-fonts-stylesheets",
                            },
                        },
                        {
                            urlPattern: /^https:\/\/www\.googletagmanager\.com/,
                            handler: "NetworkFirst",
                            options: {
                                cacheName: "google-analytics",
                            },
                        },
                    ],
                },
            }),
        ],
        // ... rest of vite config
    },
});
```

---

#### Step 4.3: Add Breadcrumb Navigation

**Use existing**: `src/components/seo/BreadcrumbSchema.astro`

**Tasks:**

- [ ] Add breadcrumbs to history page
- [ ] Add breadcrumbs to learn pages
- [ ] Add breadcrumbs to content pages
- [ ] Ensure schema is present

**Example for history page:**
**File**: `src/pages/history.astro`

```astro
import BreadcrumbSchema from '@/components/seo/BreadcrumbSchema.astro';

const breadcrumbs = [
  { name: 'Home', url: 'https://ninjatype.com' },
  { name: 'History', url: 'https://ninjatype.com/history' }
];

<BreadcrumbSchema items={breadcrumbs} />
```

---

#### Step 4.4: Configure Redirects (if needed)

**Tasks:**

- [ ] Identify any old URLs that need redirecting
- [ ] Create \_redirects file for Cloudflare Pages
- [ ] Test redirects work

**File**: `public/_redirects`

```
# Example redirects
/old-path /new-path 301
/typing-test / 301
```

**Alternative for Cloudflare:**
**File**: `wrangler.jsonc` (already exists)

```jsonc
{
    "routes": [
        {
            "pattern": "/old-path",
            "redirect": {
                "status_code": 301,
                "location": "/new-path",
            },
        },
    ],
}
```

---

### **Phase 5: Image Optimization (Week 5)**

**Priority**: High  
**Effort**: Low  
**Impact**: High

#### Step 5.1: Audit Current Images

**Tasks:**

- [ ] List all images in `public/images/`
- [ ] Check image formats (prefer WebP/AVIF)
- [ ] Identify large images (>100KB)
- [ ] Create image inventory

**Commands:**

```bash
# Find large images
Get-ChildItem -Path "public/images" -Recurse -File | Where-Object { $_.Length -gt 100KB } | Select-Object Name, Length
```

---

#### Step 5.2: Convert to Modern Formats

**Tool**: Use sharp (already in dependencies)

**Tasks:**

- [ ] Convert PNG/JPG to WebP
- [ ] Generate multiple sizes for responsive images
- [ ] Create placeholder images for lazy loading

**Script**: `scripts/optimize-images.js`

```javascript
import sharp from "sharp";
import { readdir } from "fs/promises";
import { join } from "path";

const inputDir = "./public/images";
const sizes = [640, 1024, 1920];

async function optimizeImages() {
    const files = await readdir(inputDir);

    for (const file of files) {
        if (file.match(/\.(jpg|jpeg|png)$/i)) {
            const input = join(inputDir, file);
            const name = file.replace(/\.[^.]+$/, "");

            // Generate WebP versions
            for (const size of sizes) {
                await sharp(input)
                    .resize(size, null, { withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toFile(join(inputDir, `${name}-${size}.webp`));
            }
        }
    }
}

optimizeImages();
```

**Add to package.json:**

```json
{
    "scripts": {
        "images:optimize": "node scripts/optimize-images.js"
    }
}
```

---

#### Step 5.3: Use Astro Image Component

**Tasks:**

- [ ] Replace `<img>` with `<Image>` from astro:assets
- [ ] Add proper alt text to all images
- [ ] Implement lazy loading
- [ ] Set explicit width/height

**Example:**

```astro
---
import { Image } from 'astro:assets';
import heroImage from '@/assets/hero.png';
---

<Image
  src={heroImage}
  alt="NinjaType typing interface"
  width={1920}
  height={1080}
  format="webp"
  loading="lazy"
  quality={80}
/>
```

---

#### Step 5.4: Add Image Sitemap

**File**: Enhance `astro.config.mjs` sitemap

**Tasks:**

- [ ] Include images in sitemap
- [ ] Add image metadata
- [ ] Verify in Google Search Console

**Note**: Standard sitemap may be sufficient; monitor indexing.

---

### **Phase 6: Accessibility Enhancements (Week 6)**

**Priority**: High  
**Effort**: Low-Medium  
**Impact**: High

#### Step 6.1: Install Accessibility Tools

```bash
npm install -D eslint-plugin-jsx-a11y
```

**Tasks:**

- [ ] Configure ESLint for accessibility
- [ ] Run initial audit
- [ ] Fix reported issues

**File**: `.eslintrc.json` or `.eslintrc.cjs`

```json
{
    "extends": ["plugin:jsx-a11y/recommended"],
    "plugins": ["jsx-a11y"],
    "rules": {
        "jsx-a11y/anchor-is-valid": "error",
        "jsx-a11y/img-redundant-alt": "error",
        "jsx-a11y/no-autofocus": "warn"
    }
}
```

---

#### Step 6.2: Add Skip Links

**File**: `src/layouts/BaseLayout.astro`

**Tasks:**

- [ ] Create skip link component
- [ ] Add to top of body
- [ ] Style for visibility on focus
- [ ] Test keyboard navigation

**Implementation:**

```astro
<body>
  <a href="#main-content" class="skip-link">
    Skip to main content
  </a>

  <div id="body-container">
    <Header />
    <main id="main-content">
      <slot />
    </main>
    <Footer />
  </div>
</body>

<style>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: white;
  padding: 8px 16px;
  text-decoration: none;
  z-index: 100;
  border-radius: 4px;
}

.skip-link:focus {
  top: 8px;
  left: 8px;
}
</style>
```

---

#### Step 6.3: Audit Heading Hierarchy

**Tasks:**

- [ ] Verify single h1 per page
- [ ] Check logical heading order (h1 → h2 → h3)
- [ ] Fix any skipped levels
- [ ] Add semantic HTML5 elements

**Tools:**

- Chrome DevTools Accessibility Tree
- axe DevTools extension
- Wave browser extension

**Check each page:**

- [ ] Home (index.astro)
- [ ] History page
- [ ] Learn pages
- [ ] Content pages (about, contact, etc.)

---

#### Step 6.4: Keyboard Navigation Audit

**Tasks:**

- [ ] Test tab order makes sense
- [ ] Verify all interactive elements are focusable
- [ ] Check focus indicators are visible
- [ ] Test keyboard shortcuts don't conflict
- [ ] Ensure typing test works with keyboard only

**Testing checklist:**

- [ ] Can navigate entire site with Tab/Shift+Tab
- [ ] Focus visible on all interactive elements
- [ ] Can start typing test without mouse
- [ ] Can access all settings via keyboard
- [ ] Escape key behaviors work correctly

---

#### Step 6.5: ARIA Labels & Semantic HTML

**Tasks:**

- [ ] Add ARIA labels to icon buttons
- [ ] Use semantic HTML (nav, main, aside, article)
- [ ] Add role attributes where needed
- [ ] Ensure form inputs have labels

**Example fixes:**

```tsx
// Icon buttons need labels
<button aria-label="Increase font size">
  <IconPlus />
</button>

// Theme switcher
<select aria-label="Select theme">
  <option>Dark</option>
  <option>Light</option>
</select>

// Keyboard display
<div role="region" aria-label="Virtual keyboard">
  {/* keyboard keys */}
</div>
```

---

### **Phase 7: Monitoring & Auditing (Week 7)**

**Priority**: Medium  
**Effort**: Medium  
**Impact**: Long-term High

#### Step 7.1: Setup Lighthouse CI

```bash
npm install -D @lhci/cli
```

**Tasks:**

- [ ] Install Lighthouse CI
- [ ] Create configuration file
- [ ] Setup GitHub Actions
- [ ] Configure performance budgets

**File**: `lighthouserc.js`

```javascript
module.exports = {
    ci: {
        collect: {
            startServerCommand: "npm run preview",
            url: [
                "http://localhost:4321/",
                "http://localhost:4321/history",
                "http://localhost:4321/learn",
            ],
            numberOfRuns: 3,
        },
        assert: {
            preset: "lighthouse:recommended",
            assertions: {
                "categories:performance": ["error", { minScore: 0.9 }],
                "categories:accessibility": ["error", { minScore: 0.95 }],
                "categories:best-practices": ["error", { minScore: 0.9 }],
                "categories:seo": ["error", { minScore: 0.95 }],
                // Specific metrics
                "first-contentful-paint": ["error", { maxNumericValue: 2000 }],
                "largest-contentful-paint": [
                    "error",
                    { maxNumericValue: 2500 },
                ],
                "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
                "total-blocking-time": ["error", { maxNumericValue: 300 }],
            },
        },
        upload: {
            target: "temporary-public-storage",
        },
    },
};
```

**Add to package.json:**

```json
{
    "scripts": {
        "lighthouse": "lighthouse http://localhost:4321 --view",
        "lighthouse:ci": "lhci autorun"
    }
}
```

---

#### Step 7.2: GitHub Actions Workflow

**File**: `.github/workflows/lighthouse.yml`

**Tasks:**

- [ ] Create workflow file
- [ ] Configure to run on PR
- [ ] Add status checks
- [ ] Setup automated comments

**Implementation:**

```yaml
name: Lighthouse CI

on:
    pull_request:
        branches: [main]
    push:
        branches: [main]

jobs:
    lighthouse:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4

            - uses: actions/setup-node@v4
              with:
                  node-version: "20"

            - name: Install dependencies
              run: npm ci

            - name: Build project
              run: npm run build

            - name: Run Lighthouse CI
              run: npm run lighthouse:ci
              env:
                  LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

---

#### Step 7.3: Setup Unlighthouse for Full Site Scans

```bash
npm install -D unlighthouse
```

**File**: `unlighthouse.config.ts`

**Tasks:**

- [ ] Install Unlighthouse
- [ ] Create configuration
- [ ] Run initial audit
- [ ] Fix major issues

**Configuration:**

```typescript
export default {
    site: "https://ninjatype.com",
    scanner: {
        // Run multiple samples for accuracy
        samples: 3,
        // Throttle like mobile
        throttle: true,
        // Include all routes
        sitemap: true,
    },
    outputPath: "./unlighthouse-reports",
    // Optional: Configure which routes to scan
    include: ["/", "/history", "/learn/*", "/about", "/contact"],
};
```

**Add to package.json:**

```json
{
    "scripts": {
        "audit:full": "unlighthouse --site http://localhost:4321",
        "audit:build": "npm run build && unlighthouse --build"
    }
}
```

---

#### Step 7.4: Setup Core Web Vitals Monitoring

**Tasks:**

- [ ] Add web-vitals library
- [ ] Send metrics to analytics
- [ ] Create monitoring dashboard
- [ ] Set up alerts for regressions

```bash
npm install web-vitals
```

**File**: `src/lib/web-vitals.ts`

```typescript
import { onCLS, onFID, onLCP, onFCP, onTTFB } from "web-vitals";

function sendToAnalytics(metric) {
    // Send to Google Analytics
    if (window.gtag) {
        window.gtag("event", metric.name, {
            value: Math.round(
                metric.name === "CLS" ? metric.value * 1000 : metric.value,
            ),
            event_category: "Web Vitals",
            event_label: metric.id,
            non_interaction: true,
        });
    }
}

export function initWebVitals() {
    onCLS(sendToAnalytics);
    onFID(sendToAnalytics);
    onLCP(sendToAnalytics);
    onFCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
}
```

**Add to BaseLayout.astro:**

```astro
<script>
  import { initWebVitals } from '@/lib/web-vitals';
  initWebVitals();
</script>
```

---

### **Phase 8: Final Optimizations & Polish (Week 8)**

**Priority**: Low-Medium  
**Effort**: Variable  
**Impact**: Cumulative

#### Step 8.1: Implement View Transitions (Already using prefetch)

**File**: `astro.config.mjs`

**Tasks:**

- [ ] Enable view transitions
- [ ] Add transition animations
- [ ] Test navigation smoothness
- [ ] Configure prefetch strategy

**Already have**: `prefetch: true` ✅

**Enhance with View Transitions:**

```astro
---
// In BaseLayout.astro
import { ViewTransitions } from 'astro:transitions';
---

<head>
  <!-- ... other head elements -->
  <ViewTransitions />
</head>
```

---

#### Step 8.2: Lazy Load Non-Critical Components

**Tasks:**

- [ ] Identify components below fold
- [ ] Add client:visible directive
- [ ] Lazy load heavy charts/visualizations
- [ ] Test loading performance

**Example:**

```astro
<!-- Only load when visible -->
<WPSLineChart client:visible />
<HistoryTable client:visible />
```

---

#### Step 8.3: Database Performance (IndexedDB)

**Tasks:**

- [ ] Audit IndexedDB usage for history
- [ ] Implement efficient querying
- [ ] Add pagination for large datasets
- [ ] Clean up old data strategy

**Note**: Already using nanostores - ensure efficient queries.

---

#### Step 8.4: Create Performance Budget

**File**: Add to `lighthouserc.js`

**Budgets:**

```javascript
resourceSummary: {
  javascript: 150000,  // 150KB
  css: 50000,          // 50KB
  image: 200000,       // 200KB
  font: 100000,        // 100KB
  total: 500000,       // 500KB total
}
```

---

#### Step 8.5: Security Headers

**File**: `public/_headers` (for Cloudflare Pages)

**Tasks:**

- [ ] Add security headers
- [ ] Configure CSP
- [ ] Set HSTS
- [ ] Add X-Frame-Options

**Implementation:**

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: accelerometer=(), camera=(), microphone=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**Note**: Test CSP carefully with analytics and external resources.

---

## 📝 Validation & Testing Checklist

### After Each Phase

- [ ] Run `npm run build` - verify build succeeds
- [ ] Test locally with `npm run preview`
- [ ] Check Chrome DevTools Lighthouse
- [ ] Verify no console errors
- [ ] Test on mobile device

### Before Production Deploy

- [ ] Full Lighthouse audit (all pages)
- [ ] Google Rich Results Test
- [ ] Schema.org validator
- [ ] PageSpeed Insights
- [ ] WebPageTest
- [ ] Mobile-friendly test
- [ ] Accessibility scan (axe, Wave)
- [ ] Cross-browser testing
- [ ] Performance monitoring setup

---

## 🎯 Success Metrics

### Target Lighthouse Scores (Desktop)

- Performance: 95+
- Accessibility: 98+
- Best Practices: 95+
- SEO: 100

### Target Lighthouse Scores (Mobile)

- Performance: 90+
- Accessibility: 98+
- Best Practices: 95+
- SEO: 100

### Core Web Vitals Targets

- LCP: < 2.0s
- FID: < 50ms
- CLS: < 0.05

### Technical Targets

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.0s
- Total Bundle Size: < 500KB
- Initial JavaScript: < 150KB

---

## 🚀 Deployment Strategy

### Pre-deployment

1. Run full test suite
2. Execute Lighthouse CI
3. Review bundle sizes
4. Check security headers
5. Verify redirects work

### Post-deployment

1. Submit sitemap to Google Search Console
2. Verify structured data in Rich Results Test
3. Monitor Core Web Vitals in GSC
4. Check analytics tracking
5. Monitor error logs
6. Test PWA installation

### Monitoring

- Daily: Check Search Console for errors
- Weekly: Review Core Web Vitals trends
- Monthly: Full Lighthouse audit
- Quarterly: Competitor analysis

---

## 🔧 Maintenance Tasks

### Weekly

- [ ] Check for broken links
- [ ] Monitor site speed
- [ ] Review Search Console insights
- [ ] Check error logs

### Monthly

- [ ] Update dependencies
- [ ] Run full SEO audit
- [ ] Review and update meta descriptions
- [ ] Check mobile usability
- [ ] Audit structured data

### Quarterly

- [ ] Content freshness review
- [ ] Competitor SEO analysis
- [ ] Update schema markup
- [ ] Review and optimize images
- [ ] Performance benchmark

---

## 📚 Resources & Tools

### Essential Tools

- [Google Search Console](https://search.google.com/search-console)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Schema Markup Validator](https://validator.schema.org/)
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)

### Browser Extensions

- Lighthouse (Chrome DevTools)
- axe DevTools (Accessibility)
- Wave (Accessibility)
- META SEO Inspector
- Detailed SEO Extension

### Monitoring

- Google Analytics
- Simple Analytics (already installed)
- Cloudflare Analytics
- Search Console Performance

---

## 🎉 Quick Wins (Do First)

These can be implemented immediately for quick SEO improvements:

1. **Add structured data to homepage** (30 min)
    - Organization schema
    - Website schema
    - WebApplication schema

2. **Install @playform/compress** (15 min)
    - Immediate performance boost

3. **Add resource hints** (10 min)
    - dns-prefetch for analytics
    - preconnect for fonts

4. **Move analytics to Partytown** (30 min)
    - Reduce main thread blocking

5. **Add skip link** (15 min)
    - Accessibility improvement

6. **Optimize images to WebP** (1 hour)
    - Significant size reduction

**Total Time for Quick Wins: ~3 hours**  
**Expected Impact: 5-10 point Lighthouse score increase**

---

## 📞 Support & Questions

For implementation help:

- Astro Discord: https://astro.build/chat
- GitHub Issues: Your repo
- SEO Documentation: https://docs.astro.build/en/guides/seo/

---

**Last Updated**: February 3, 2026  
**Project**: NinjaType  
**Estimated Total Time**: 8 weeks (part-time) or 4 weeks (full-time)  
**Priority**: High - SEO is crucial for organic traffic growth
