# AGENTS.md — NinjaType

Guidance for AI coding agents (and humans) working in this repo. Read it before changing UI, metadata, or locale content. Keep it current: when a rule changes, change it here in the same PR.

- **Stack:** Astro 5 (static output, `trailingSlash: "always"`), React 19 islands, HeroUI v3 (`@heroui/react`, `@heroui/styles`), Tailwind CSS v4, nanostores, Cloudflare Pages (+ a multiplayer worker in `workers/`).
- **Package manager:** `bun`. Do not add a second lockfile.
- **Live reference for the UI kit:** the `/components/` page (`src/pages/components.astro`, `src/components/ui/ComponentsShowcase.tsx`). It is `noindex`. Add new shared components there.

## Commands

| Task | Command |
| --- | --- |
| Dev server | `bun run dev` (http://127.0.0.1:4347) |
| Production build | `bun run build` (also generates the sitemap) |
| Type / Astro check | `bun run check` (`astro check`) or `npx tsc --noEmit -p .` |
| Unit tests | `bun test src` |
| SEO validation (needs a build in `dist/`) | `bun run check:seo` and `node scripts/check-alternative-pages.mjs` |
| Web Stories validation | `bun run check:stories` |

A change is **not done** until build, type check, tests, and (for any page/metadata change) `check:seo` pass. Do not leave the build broken; if another in-progress change breaks it, say so rather than hiding it.

Note on dev: `astro dev` logs "Invalid hook call" during SSR. This pre-dates the UI kit and is not a regression; judge UI work from the production build/preview.

## Scope exclusions

Unless a task explicitly includes them, do **not** restyle or refactor: `/lp/*` (comparison landing pages), `/hacker-typer/*`, `/stories/*` (Web Stories). They have their own layouts and validation scripts.

---

## 1. Styling conventions

### 1.1 Principles

1. **Theme-only colors.** Every color comes from the active theme variables (`public/themes/*.css`): `--bg-color`, `--alt-bg-color`, `--main-color`, `--text-color`, `--sub-text-color`, `--sub-alt-text-color`, `--error-color`, `--success-color`, `--star-yellow`. Never hard-code hex/rgb in components or CSS (brand logos such as Gmail/Cloudflare marks are the only exception). Derive tints with `color-mix(in srgb, var(--x) N%, var(--y))`.
2. **HeroUI tokens are mapped to the theme** in `src/styles/global.css` (`--accent`, `--surface`, `--border`, `--foreground`, …). HeroUI components therefore follow the theme automatically — don't re-theme them.
3. **Reuse before you build.** Use the shared kit (below) instead of styling `Button`, `<a>`, `<details>`, or `<dialog>` by hand.
4. **Keyboard identity.** Interactive controls look like keycaps: monospace label, 1px border, **3px bottom border**, 6px radius, pressed state drops 2px. This matches the typing keyboard.
5. **Mobile first-class.** Every change must work at 390px wide. No horizontal page scroll; stack or wrap groups; keep tap targets ≥ 36–40px.
6. **Accessibility.** Icon-only controls need `aria-label`; tooltips name icon-only controls but never carry essential info; status is never color-only (a text label accompanies the chip color); keep visible focus rings (`outline: 2px solid var(--main-color)`); respect `prefers-reduced-motion` for animation.

### 1.2 Shared UI kit — `src/components/ui/`

| Need | Use | Notes |
| --- | --- | --- |
| Action button | `KeyButton` | `variant`: `primary` (accent), `secondary` (default), `ghost`, `danger`; `isActive` = filled/selected; `isIconOnly` = square key; `size` sm/md/lg. Use `onPress`, not `onClick`. |
| Navigation link that looks like a button | `KeyLink` | A real `<a>`; same props as `KeyButton` for look. Use for navigation, `KeyButton` for actions. |
| Text link | `TextLink` | `variant`: `accent` (default), `muted` (footers/lists), `text`, `underline` (prose). `http(s)` links auto-open in a new tab with ↗. |
| Segmented / toggle choices | HeroUI `ToggleButtonGroup` + `ToggleButton` with classes `key-group` (group) and `key-btn key-btn--ghost` (items) | Single choice: `selectionMode="single" disallowEmptySelection`. The selected item fills automatically. Use `key-btn` (not `Button`). |
| Status / metadata label | HeroUI `Chip` (`size="sm"`, `variant="soft"`) | Colors map to meaning (below). |
| Tooltip | `Hint` (`InfoTip.tsx`) | Wrap the focusable control. |
| Explanatory text ("How X works") | `InfoTip` | Popover containing a mini `Alert`. |
| FAQ / help | `FaqList`, `FaqSection`, `HelpTrigger`, `LinkAccordion` (`Faq.tsx`) | `HelpTrigger floating` pins the round "?" key; it hides while typing. |
| Cards / metrics | HeroUI `Card`; `MetricCard` (`components/analytics/ResultOverview.tsx`) | Metric tone: `success`, `primary`, `warning`, `error`. |
| Switches, inputs, modals, accordions | HeroUI `Switch`, `TextField`/`Input`, `Modal`, `Accordion` | Compose with the compound API (`Modal.Header`, …). No `HeroUIProvider` (v3). |
| Video | `YouTubeEmbed` | Click-to-load, `youtube-nocookie.com`. |

Import `@/styles/ui.css` from any component that uses `key-*` classes (the kit components already do).

### 1.3 Chip color semantics

`success` = done / good / practised today · `warning` = needs attention / not yet / at risk · `danger` = error / weak · `accent` = recommended / current · default = neutral metadata. Key ratings (key-delay map): **Great → success, Good → accent, Okay → warning, Weak → danger** (`keyStatus()` in `lib/keypressStats.ts`).

### 1.4 CSS organization

| File | Purpose |
| --- | --- |
| `src/styles/ui.css` | The kit: keycaps, `key-group`, text links, FAQ block, footer, toolbar, tooltips, YouTube embed. **Put shared styles here.** |
| `src/styles/results.css` | Result/metric cards and `/history/` layout. |
| `src/styles/advertise.css`, `components-page.css`, `learn.css`, `blog.css`, `static-pages.css`, `online.css`/`shadow-race.css`/`multiplayer.css`, … | Page-specific styles. |
| `src/styles/global.css` | Base, HeroUI token mapping, header/navbar layout. Avoid adding page styling here. |

Rules:
- **Prefix page/component classes** (`adv-`, `res-`, `faq-block`, …). Generic names collide with legacy global CSS — e.g. the old global `.faq-section` is `position: fixed`; the kit uses `faq-block` for that reason. Grep `src/styles/` before naming a class.
- **Legacy `.btn`**, `.icon-btn`, `.large-btn` and the old `button` resets in `multiplayer.css`/`learn.css` still exist. New UI must not use them; when a legacy rule fights a kit component, scope or delete the legacy rule (see the `:where(:not(…, .key-btn, .accordion__trigger))` exclusion in `multiplayer.css`).
- **HeroUI class names differ from what you expect** (e.g. `toggle-button-group`, not `button-group`). Inspect the rendered DOM before writing overrides. Use doubled-class specificity (`.key-btn.key-btn`) to beat HeroUI defaults instead of `!important`.
- Remove dead CSS when you replace a component; don't leave old rules "just in case".

### 1.5 Astro + React gotchas

- Passing `class` to a React component from `.astro` is **ignored** — use `className`.
- A React component without a `client:*` directive renders HTML but **does not hydrate** (fine for static `KeyLink`/`TextLink`/`Chip`; wrong for anything with state).
- Use `client:visible` for below-the-fold islands (FAQs, accordions), `client:load` for first-paint interactivity.
- Anything reading `localStorage` (theme, config, history) must read **after mount** (`useState(null)` + `useEffect`) so server and client markup match.
- Icons: `lucide-react` for UI icons, `~icons/<set>/<name>` (unplugin-icons, bundled) for brand/color logos. Don't fetch icons at runtime.

### 1.6 Page layouts

Content width is 960px (`max-width: 960px; margin: 0 auto`) with `3rem` between sections; headers/footers come from `Header.astro` / `Footer.tsx` — never re-implement them. Four layouts: **tool page** (full-width workspace), **information page** (title, lede, section cards), **marketing page** (hero, stats row, cards, FAQ), **article page** (sidebar + prose). Static markdown pages share `StaticPage.astro`.

### 1.7 Verifying UI work

Check the production build, not dev: `bun run build && npx astro preview --port 4399`, then screenshot at **1280px and 390px** (headless Chromium via `puppeteer-core` works; the words API needs the trailing-slash path, `/api/words/<dict>/`, under preview). Look at the real states — idle, active, disabled, empty, error — not just the first render. Stray `shot.tmp.mjs`-style scripts must be deleted before finishing.

---

## 2. SEO rules

Source of truth: `plan/ninjatype-seo-implementation.md`, `astro-seo-implementation-plan.md`, `research/seo-audit-2026-10-25/audit.md`, and the validators `scripts/check-seo.mjs` + `scripts/check-alternative-pages.mjs`. These rules mirror what those scripts assert — if you change a rule, change the script too.

### 2.1 Every indexable page

- **Metadata comes from `BaseLayout` → `SEO.astro`.** Always pass `title`, `description`, `canonical`. Don't hand-write `<title>`/meta tags.
- **Title:** must contain "NinjaType", ≤ 65 characters, descriptive of the search intent, **unique** site-wide.
- **Description:** 100–170 characters, useful (not keyword stuffing), **unique** site-wide.
- **Canonical:** exactly one, absolute `https://www.ninjatype.com/<path>/` — HTTPS, `www`, **trailing slash**, no query/hash. `og:url` and `twitter:url` equal the canonical; `og:title`/`og:description` equal the page title/description.
- **Social image:** `/images/og-image.png` (1200×630) unless the page has its own 1200×630 image; `og:image:width/height` set; `twitter:image` matches.
- **One `<h1>` per page**, and it names the page's intent (typing pages mention "typing"; Hacker Typer pages mention "Hacker Typer").
- **Indexability:** utility/state pages (`/share`, `/components`, `/history`, `/settings`, `/multiplayer` and `/online` redirects, error states) are `noindex` and **excluded from the sitemap** (filter in `astro.config.mjs`). Never `noindex` a page that is meant to rank.
- **Internal links:** root-relative, with trailing slash, never to moved routes (`/online/`, `/multiplayer/` → use `/ghost-race/`, `/multiplayer-typing-race/`). Every internal link must resolve in `dist/`. Don't link to competitor domains from `/lp/` pages.
- **Assets:** local fonts only (no render-blocking `fonts.googleapis.com` CSS); images have `alt` text and explicit dimensions or aspect ratio.

### 2.2 Structured data (`src/lib/schema-templates.ts`)

Build with `createSchemaGraph(...)`. Per page type:

| Page | Required nodes (exactly one each) |
| --- | --- |
| App pages (`/`, `/learn/`, `/ghost-race/`, `/multiplayer-typing-race/`, `/hacker-typer/`) | `Organization`, `WebSite`, `WebPage`, `WebApplication`, `FAQPage` |
| `/lp/*` alternative pages | `Organization`, `WebSite`, `WebPage`, `FAQPage`, `BreadcrumbList` |
| Blog posts | `BlogPosting` + `BreadcrumbList`; blog index uses `Blog` |

- **FAQ schema must match visible content.** Every FAQ question and answer in the JSON-LD must appear in the initial rendered HTML (collapsed accordion panels count; client-only rendering does not).
- **No invented data:** never emit `aggregateRating`/`review`; no claims you can't verify. Use the production domain `https://www.ninjatype.com` everywhere (no bare `https://ninjatype.com`).
- `WebApplication.url` equals the page's canonical URL.

### 2.3 Content rules

- **Honest comparisons.** Competitor claims must be verifiable; follow the verification checklist in `plan/ninjatype-seo-implementation.md` and `research/competitors-*`. If a site couldn't be verified (e.g. blocked by the corporate proxy), don't reference it on a published page.
- **Intent-matched pages.** One primary keyword intent per page; answer it above the fold. Titles/H1s use the researched phrasing (see `research/typing-keywords-*`, `research/hacker-typer-keywords-*`).
- **Sponsored content** (advertising, reviews) is clearly labelled as sponsored and links with appropriate `rel`.
- **Blog:** each post needs `title`, `description`, `publishDate`, `category`, `readTime`, `tags`, `app` (maps to a guide group in `lib/guideApps.ts`), and an image; related-guide links via `TrainingGuides`.

### 2.4 Crawling, feeds, performance

- `robots.txt` must reference `https://www.ninjatype.com/sitemap-index.xml` and keep `Allow: /api/words/` (word lists must stay crawlable for rendering).
- RSS (`rss.xml`) uses the production host and its XSL stylesheet; `llms.txt`/`llms-full.txt` stay in sync with major content changes (`src/lib/llms.ts`).
- Performance budget: Lighthouse ≥ 90 across categories (`lighthouserc.cjs`). Lazy-load below-the-fold media (use click-to-load embeds), avoid large client bundles on content pages, keep analytics behind Partytown.
- **Security headers / CSP** live in `public/_headers`. Adding a third-party origin (iframe, script, font, image host) requires adding it to the right CSP directive in the same change (e.g. `frame-src` for YouTube).

### 2.5 Validate before finishing

```sh
bun run build
bun run check:seo
node scripts/check-alternative-pages.mjs   # when /lp pages changed
bun run check:stories                      # when Web Stories changed
```

---

## 3. Internationalization (i18n) rules

Full plan: `plan/international-expansion.md` (architecture, route table, rollout order, **implementation status** — read it first). Research: `research/international-keywords-2026-11-21/analysis.md` (keyword bands, markets) and **`deep-dive.md`** (live data with corrections — it overrides `analysis.md` where they differ). Re-runnable harvest scripts: `scripts/research-i18n-harvest-suggest.mjs`, `scripts/research-i18n-harvest-trends.mjs`.

**Implementation skill:** for any new locale or localized page, app feature, or navbar language change, follow the project skill `.agents/skills/ninjatype-i18n/SKILL.md` (phase gates, file-by-file steps, the `/de/` reference implementation, gotchas, and validation). Use it instead of re-deriving the steps from the German code.

### 3.1 Architecture

- **English stays at the root** (`prefixDefaultLocale: false`) so existing rankings are untouched. Other locales live under `src/pages/<locale>/…`.
- Configured locales (`astro.config.mjs`): `en, de, fr, it, nl, no, da, sv, ja, ar`. Only those listed as done in the plan's *Implementation status* actually ship; don't create a locale folder for an unstarted market.
- **Phases:** A = localized landing/content/blog/comparison pages (app UI still English); B = localized app (UI strings, locale word list, locale keyboard layout); C = special input modes (Japanese romaji→kana, Arabic RTL). Don't build Phase B for a locale until Search Console shows the locale has traffic.
- Reuse existing templates: `src/layouts/LocaleLayout.astro` + `src/i18n/<locale>.ts` strings, per-locale content collections (`blog-de`, `blog-fr`, … in `src/content.config.ts`), and the existing `/lp/` pattern. Copy the German implementation for new locales.
- Locale-aware app code uses `src/lib/learnLocale.ts` and a `locale` prop on `FingerSelection`/`FingerPractice`/`FingerCard`/`KeySelector`/`LessonKeyboard`; client stores derive locale from the URL (`clientLocale()`). English behavior must remain byte-identical.

### 3.2 Routes and slugs

- **Slugs follow the locale's keyword, not the English slug** (that is the ranking asset): e.g. `/de/tippgeschwindigkeitstest/`, `/de/tippen-lernen/`, `/fr/test-de-vitesse-de-frappe/`. Canonical route table: plan §2.
- Japanese and Arabic slugs stay latinized (romaji / `typing-test`); the H1/title carries the native script.
- Each locale has: home, typing-test keyword page, learn keyword page, blog index + posts, comparison (`/lp/`) pages, 404. Trailing slashes everywhere.

### 3.3 hreflang and SEO per locale

- Every localized page declares the **full alternate set** via the `alternates` prop (`LocaleLayout` does this) **including `x-default` → English**; the English counterpart must declare the reverse alternate. Alternates must be reciprocal or Google ignores them.
- English pages emit `en`, `en-US`, `en-GB`, `en-CA`, `en-AU`, `en-NZ`, `en-SG` + `x-default` pointing at the same English URL — **no duplicate English trees**. French also tags `fr-CA`/`fr-CH` where noted in the plan.
- Per locale: `<html lang>` and `og:locale` set (`OG_LOCALES`), unique localized title/description (same length limits as §2.1), localized `WebPage`/`FAQPage` schema, internal links stay inside the locale tree, sitemap picks pages up via the sitemap i18n config.
- `scripts/check-seo.mjs` and the link checker must still pass with locale pages (one H1, resolving links, one canonical).

### 3.4 Content rules (from the research — these are verified corrections)

- **Native phrasing and native metrics.** Use the market's real search vocabulary and show native metrics: German **Anschläge pro Minute (APM)**, Japanese **KPM** (+ 文字/秒), French mots/minute + caractères.
- **Avoid contaminated terms:** German *schreibgeschwindigkeit* alone (SSD/HDD speeds) and *Tippspiel(e)* alone (football pools); French *vitesse de frappe* alone (football shot speed) → add "au clavier"; Swedish/Danish/Norwegian *blindskrift* = **Braille** — use *tangentbordsträning* (SV), *maskinskrivning* (DA), *skrivetest* (NO).
- **Italy is a certification market** (ATA/EIPASS). Frame Italian content as free exam practice; **never claim MIUR recognition**, and name EIPASS only after external verification.
- **Competitors:** only name one after verifying it (research marks blocked sites "verify externally"). Key Hero is English-only — not a French incumbent. 10FastFingers has no Norwegian interface (emphasise that gap in `/no/`).
- Keyword volumes in `analysis.md` are unverified bands — validate with Keyword Planner before investing in a locale.
- Write for the locale; don't machine-translate English pages 1:1. Blog starter titles per locale are in plan §5.

### 3.5 Localizing the app (Phase B)

- **Word lists:** `src/data/words-<locale>-1k.json` (top-1k frequency list, filtered to the locale alphabet), exposed at `/api/words/<locale>-1k/` and selectable in the dictionary setting; first-time visitors on a locale route default to it (`LocalePracticeInit`), returning users keep their saved choice.
- **Keyboard layouts:** locale layouts (`qwertzLayout`, `fingerKeys<Locale>`, `fingerLessons<Locale>`, `lessonDetails<Locale>`) rather than patching QWERTY. German: Y/Z swapped, ü/ö/ä/ß keys, A/Ö pinky anchors.
- **UI strings:** a strings layer for React islands (don't hard-code English in new shared components — accept labels as props so locale wrappers can supply translations). App chrome may remain English per phase; document it as a follow-up in the plan.
- **RTL (Arabic):** `dir="rtl"` on `<html>`, CSS logical properties (`margin-inline`, `padding-inline`, `inset-inline`) in new styles, optional mirrored keyboard visual. Prefer logical properties everywhere in the UI kit so RTL needs no rewrite.
- **Fonts:** confirm Latin-ext coverage for Nordic characters; add a JP font for `/ja/` and an Arabic font for `/ar/` (local, no external font CSS).
- **Japan:** romaji→kana input is a prerequisite for the app; marketing pages must mention KPM; market the multiplayer race as 対戦型タイピングゲーム.

### 3.6 Privacy / consent

EU/EEA, UK, CH, CA and AU visitors require **consent-gated analytics/ads before any monetization work** on those locales. Check `src/components/analytics` and the GTM setup against a CMP before launching a new market; no ad revenue claims without real data.

### 3.7 Web Stories and feeds per locale

Web Stories surface in Discover per country+language: translate/adapt the top performing stories per locale, use locale slugs (`/de/stories/<slug>/`), and write story text in the locale language. Per-locale RSS feeds are separate files (`rss-<locale>.xml`), never mixed into the English feed.

### 3.8 Checklist for a new locale page

1. Strings in `src/i18n/<locale>.ts`; page under `src/pages/<locale>/` using `LocaleLayout`.
2. Keyword-based slug; unique title/description within limits; one H1.
3. Reciprocal hreflang incl. `x-default`; reverse alternate added on the English page.
4. FAQ schema matches visible FAQ; localized breadcrumbs.
5. Internal links stay in-locale and resolve; CTAs point to the localized app screens.
6. `bun run build && bun run check:seo` pass; update `plan/international-expansion.md` → *Implementation status*.

---

## 4. Change workflow

Per `plan/plan-execution-process.md`: plan the actions for any unfinished plan step, keep new files modular (presentational logic in components, business logic in hooks/`lib/`), execute, then update `README.md`, mark the plan file, and bump the minor version (`bun run version:minor`) for plan-driven releases. Add or update tests under `src/**/*.test.ts(x)` for logic (`bun test src`).
