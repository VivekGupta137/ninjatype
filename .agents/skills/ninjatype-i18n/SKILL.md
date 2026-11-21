---
name: ninjatype-i18n
description: Implement or extend internationalization (locales like /de/, /fr/, /it/, /nl/, /no/, /da/, /sv/, /ja/, /ar/) in the NinjaType Astro app. Use when adding a new locale, localizing a page, blog post, comparison (/lp/) page, word list, keyboard layout, UI strings, hreflang/SEO alternates, or the navbar language switch, or when asked to "do what we did for German" for another language.
---

# NinjaType internationalization

The German tree (`/de/…`) is the template. Read `plan/international-expansion.md` (route table §2, keyword notes §4, rollout §6, and **Implementation status**) before starting; it overrides anything here if they disagree. Research in `research/international-keywords-2026-11-21/` (`deep-dive.md` wins over `analysis.md`).

## 0. Decide the phase first

| Phase | What ships | Gate |
| --- | --- | --- |
| **A** content | `/<l>/` home, typing-test keyword page, learn keyword page, blog index + posts, `/<l>/lp/…` comparisons, 404. App chrome may stay English. | Keyword Planner check of the shortlist (plan §6 step 1) |
| **B** localized app | Word list (already shipped for all locales, see §3.1), locale keyboard layout + finger lessons, **full UI strings including game modes** (practice, learn, multiplayer, solo), locale-aware stores | Search Console shows ≥1k impressions/week after ~8 weeks (plan §6 step 7). Do not start B speculatively. German is the only complete Phase B locale. |
| **C** special input | Japanese romaji→kana (spike first), Arabic RTL (`dir="rtl"`, logical CSS properties) | Spike proves the engine handles it |

Locales currently shipped: **en (root), de (full Phase A+B incl. game modes), fr (Phase A content only)**. `astro.config.mjs` already lists all ten planned locales; only create a folder for a locale whose pages you are actually building, and mark it done in the plan.

Never claim certifications or recognition (e.g. MIUR). Only name a competitor after the verification in the research docs. Avoid contaminated terms from §3.4 of `AGENTS.md` (e.g. *schreibgeschwindigkeit* alone, *blindskrift* in Nordic markets, **„tippspiel/Tippspiel“ alone in German = football betting pools** — use the exact suggest queries from `deep-dive.md` instead).

## 1. Phase A: content tree (what `/de/` consists of)

Files that exist for German, and what each one needs for a new locale `<l>`:

1. **Strings** — `src/i18n/<l>.ts` exporting an object shaped like `LocaleStrings` (`src/i18n/index.ts`): `brand`, `tagline`, `appLanguageNote`, `nav`, `footer` (links, appLinks, finePrint), `blog` (index copy, CTAs, `publishedOn`, `relatedTitle`…). Then register it in `src/i18n/index.ts`:
   - add `<l>` to the `LocaleCode` union
   - add to `LOCALE_STRINGS`, `OG_LOCALES` (e.g. `de_DE`), `EXTRA_HREFLANG` (e.g. `fr: ["fr-CA","fr-CH"]`), `BLOG_CONFIG` (`collection: "blog<L>"`, `dateLocale`).
2. **Blog collection** — in `src/content.config.ts`, copy `blogDe` to `blog<L>` with `base: './src/content/blog-<l>/'`, and add it to the `collections` export. Posts go in `src/content/blog-<l>/*.md` with the same frontmatter as `blog-de` (title, description, publishDate, category, readTime, tags, app, image). `app` must map to a guide group in `src/lib/guideApps.ts`.
3. **Pages** — `src/pages/<l>/`:
   - `index.astro` — uses `LocaleLayout` (`src/layouts/LocaleLayout.astro`, props `locale`, `title`, `description`, `englishPath`). It builds the alternates from `EXTRA_HREFLANG` and adds `en`.
   - Keyword pages (slug = the locale's keyword, from the plan §2 route table) — `typing-test` pages use the **app** pattern, see §2 below.
   - `blog/index.astro` and `blog/[slug].astro` are **shared** under `src/pages/[locale]/blog/` and driven by `BLOG_CONFIG`. Do not copy them.
   - `lp/<competitor>-alternative.astro` — copy `src/pages/de/lp/keybr-alternative.astro`: `LocaleLayout` + `BreadcrumbSchema` + `getFAQPageSchema`. FAQ text in the schema must equal the visible FAQ.
4. **Reverse hreflang on English pages** — every English counterpart must add the new locale to its `alternates` prop (e.g. `src/pages/index.astro` lists `{ lang: "de", href: ".../de/" }`). Alternates must be reciprocal or Google ignores them. Add it to `/`, `/learn/`, `/blog/`, and the `/lp/` counterparts you link.
5. **Copy, don't translate** — write for the market with native keywords and metrics (DE: Anschläge pro Minute/APM; JA: KPM; FR: mots/minute). Titles 50–65 chars, descriptions 100–170 chars, one H1, unique per locale.
6. **Sitemap** — `astro.config.mjs` `sitemap({ i18n })` already maps every locale; check the generated `dist/sitemap-*.xml` includes the new pages.

## 2. Phase A/B: the app pages (typing test, learn)

Reference implementations: `src/pages/de/tippgeschwindigkeitstest.astro`, `src/pages/de/tippen-lernen.astro`, `src/pages/de/tippen-lernen/[finger].astro`.

- Use `BaseLayout` with explicit `lang`, `ogLocale`, `canonical`, and `alternates` (`en` → English URL, self → canonical). Keep `includeApplicationSchema={false}` and build the schema graph with `createSchemaGraph` (`src/lib/schema-templates.ts`).
- Pass `locale="<l>"` to **every** island and component: `Header`, `Footer`, `LocalePracticeInit`, `ConfigToolbar`, `KeyboardContainer`, `AnalyticsContainer`, `PracticeJourney`, `BottomToolbar`, `FingerPractice`, `FingerSelection`, `FingerCard`, `KeySelector`, `LessonKeyboard`, and (game pages, §3b) `MultiplayerContainer`, `HowToRace`, `OnlineKeyboardContainer`.
- Gotcha: each app page's inline `<script>` hard-codes its pathname (e.g. `window.location.pathname !== "/de/tippgeschwindigkeitstest/"`). Update it for every copied page.
- Learn pages: `getStaticPaths` returns `pointer | middle | ring | pinky`, redirects invalid fingers to the locale learn hub, and `canonical` points at `/<l>/<learn-slug>/<finger>/`.
- Put the practice/learn/hub URLs into `src/lib/learnLocale.ts` (`practiceHrefFor`, `learnHrefFor`, `fingerHrefFor`) and into the **counterpart map** in §4.

## 3. Phase B: localize the app (only after the gate)

1. **Word lists (all 9 already shipped — do not refetch)** — `src/data/words-<l>-1k.json` in `{ "words": [...] }` format (lowercased, deduplicated). Sources and license notes: `research/international-keywords-2026-11-21/dictionaries.md`. The process, if a new locale is added:
   - Fetch from the Monkeytype repo: `https://raw.githubusercontent.com/monkeytypegame/monkeytype/master/frontend/static/languages/<name>.json` (Leipzig Wortschatz corpus — the de-facto typing-site standard). Pick `<lang>_1k`; list available files via the git tree API. German came from `german_1k` (899 words) after the user rejected an OpenSubtitles-derived list — do not fall back to subtitle corpora.
   - **License traps**: Danish `danish_1k`/`danish_10k` are **DSL-licensed (permission required) — never use**; the unrestricted Monkeytype base `danish` list (196 words) was used instead. Check the `_comment` field of every file before adopting it.
   - **Transforms**: Arabic = `arabic_10k` with harakat stripped (`[\u064B-\u0652\u0640]` removed, filtered to `^[\u0621-\u064A]+$`, top 1000 — typists don't type diacritics; `arabic_egypt_1k` was rejected as Egyptian dialect). Japanese = `japanese_romaji_1k` (plain latin letters — types without an IME; kana lists exist for a future Phase C).
   - Then wire it: `src/pages/api/words/[count].ts` `getStaticPaths` entry `count: "<l>-1k"`; `src/constants/wordTypes.ts` label; `LOCALE_DICTIONARY_KEYS` + `dictionaryKeysFor` (per-locale toolbar allowlist).
2. **Dictionary UX rule (user decision — do not regress)**: **no dictionary selector is shown on the practice screen for any language.** `src/components/settings/WordSettings.tsx` stays **unmounted**. The dictionary follows the page locale silently: `LocalePracticeInit` (mounted on `/` and every localized practice page) switches to `dictionaryFor(locale)` whenever the persisted dictionary is outside `dictionaryKeysFor(locale)`. Each page shows only its own supported lists (`LOCALE_DICTIONARY_KEYS` in `wordTypes.ts`).
3. **Keyboard layout** — create `src/constants/<layout>Layout.ts` (like `qwertzLayout.ts`: `…_LETTER_ROWS`, `…_HOME_KEYS`). Then add `fingerKeys<L>.ts`, `fingerLessons<L>.ts`, and `lessonDetails<L>.ts` modelled on the `…De` files. Do not patch QWERTY. France: AZERTY; Switzerland: keep QWERTZ separate; Japan/Arabic: dictionaries per §3.1 (romaji, harakat-stripped MSA), fonts per §3.8.
4. **Locale switch points in code** — `src/lib/learnLocale.ts` branches on `locale === "de"` in `fingerKeysFor`, `fingerNamesFor`, `fingerHeadingFor`, `fingerShortLabelFor`, `fingerLevelFor`, `fingerLevelsFor`, `generateDrillSentence`, `lessonDetailsFor`, `keyboardRowsFor`, `fingerHrefFor`, `learnHrefFor`, `practiceHrefFor`. Add a branch for each new locale in each helper. Do not leave a silent English fallback for a shipped locale.
5. **UI strings** — `tr(locale, en, de)` (`learnLocale.ts`) is a two-language helper and does not scale. In big components the established pattern is a local alias: `const T = (en, de) => tr(locale, en, de);` (see `MultiplayerContainer`, `OnlineKeyboardContainer`). For a third locale, add a strings object rather than chaining `tr`. Migrating existing `tr` call sites is a separate, explicit refactor; say so in the plan.
6. **Stores** — `clientLocale()` in `src/lib/learnLocale.ts` only detects `/de/`. Extend it to every shipped locale **before** any client store uses it (`src/store/learnKeyboard.ts`, `startLearnPractice`, `src/lib/raceWords.ts`), or Phase B silently falls back to English.
7. **Solo game text** — Ghost Race passages come from `src/lib/raceWords.ts` (`raceWordsFor(locale)`): a static `RACE_WORDS` map (en → `words1k`, de → `words-de-1k.words`). Add the locale's list there when Phase B ships — otherwise the localized ghost-race page types English words.
8. **Fonts** — Latin-ext for Nordic characters; a local JP font for `/ja/`; a local Arabic font for `/ar/`. No external font CSS (CSP and `check:seo`).

## 3b. Phase B: game modes (multiplayer race + solo ghost race)

Reference implementations: `src/pages/de/tipp-rennen.astro` (multiplayer), `src/pages/de/tippgeschwindigkeit-ueben.astro` (ghost race).

- **Routes are locale keywords, not English product names**: ghost race lives at `/de/tippgeschwindigkeit-ueben/` (the real German suggest query „tippgeschwindigkeit üben“), *not* `/de/ghost-race/`. The product name („Ghost Race“) stays in the eyebrow/copy. Pick the route from `deep-dive.md`'s verified suggest data.
- **Multiplayer**: `MultiplayerContainer` takes `locale` (with a local `T = (en, de) => tr(locale, en, de)` alias) and threads it into `HowToRace`, `RaceLeaderboard`, `RematchPrompt`, `RaceTrendChart`, `AvatarCustomizer`; `lobbyReadiness(room, selfId, connected, locale)` translates the readiness engine. Invite links are locale-aware inside the component (`/de/tipp-rennen/?room=…`).
- **Friend-room dictionaries**: the race dictionary list lives in the multiplayer protocol — `DICTIONARIES` in `src/lib/multiplayer/protocol.ts` (`{ id: 'de-1k', label: 'Deutsch 1k' }`) **and** the worker's `workers/multiplayer/dictionaries.ts` map (it builds passages from `src/data/`). Both sides must list the locale's dictionary or the worker rejects it.
- **Quick races stay English 1k** (server-side standard) — the German UI says so honestly („English 1k · 30 Wörter“); do not claim German quick races.
- **Solo**: `OnlineKeyboardContainer` + `OnlineLobby` take `locale`; the passage pool comes from `raceWordsFor` (§3.6).
- `raceHrefFor` / `ghostHrefFor` in `learnLocale.ts` hold the locale routes; Navbar, footer, blog links, lp pages, and both English game pages' hreflang must point at them.

## 4. Navbar language switch (touch on every new locale)

The switch (`src/components/common/LanguageSwitch.tsx`, `src/lib/localeSwitch.ts`) keeps its own tables:

- `LANGUAGE_OPTIONS` in `src/lib/localeSwitch.ts`: add `{ locale, label (native name), home: "/<l>/" }`.
- `ROUTE_ROWS`: add the locale's column to each equivalent-page row (typing test, learn, blog). Add a finger-lesson rule if the locale has lessons.
- `Flag` in `LanguageSwitch.tsx`: add an inline SVG flag. Flags are the exception to the theme-only colour rule (like brand logos). Do not use flag emoji (letters on Windows).
- Add test cases to `src/lib/localeSwitch.test.ts`.
- Navbar hard-codes German in places (`primaryLinks` Blog link `locale === "de" ? "/de/blog/" : "/blog/"`; `Header.astro` tagline; `Footer.tsx` blog link). Replace each with a lookup, not another `=== "<l>"` check.

## 5. Gotchas found in this repo

- Three locale types coexist: `LocaleCode` (`src/i18n/index.ts`, content), `LearnLocale` (`src/lib/learnLocale.ts`, app), `SwitchLocale` (`src/lib/localeSwitch.ts`, navbar). Keep them in sync when adding a locale.
- `=== "de"` appears in ~23 places across components, `words1k.ts`, `wordTypes.ts`, `protocol.ts` (multiplayer), `OnlineKeyboardContainer.tsx`, `MultiplayerContainer.tsx`, `LessonKeyboard.tsx`, `SEO.astro`, `index.astro`, `learn/index.astro`. Grep for `"de"`/`'de/'`/`de-1k` before you finish: `rg -n "=== ['\"]de['\"]|/de/|de-1k" src`.
- English pages must stay **byte-identical** in the built HTML. Snapshot before you start: `cp -R dist /tmp/dist-before` (build first), then after the change diff the English HTML files.
- Only `dist/` is checked by `check:seo` and `check-alternative-pages.mjs`. Run them against a fresh build.
- `ß` must not be uppercased: `keyDisplayLabel` (`src/lib/keypressStats.ts`) special-cases `ß` because `"ß".toUpperCase()` widens to `SS` and breaks the lesson keyboards.
- `@nanostores/persistent` maps store each key separately as `config:<name>` — used for the dictionary-default checks.
- Relative CSS import depths from nested pages: `src/pages/[locale]/blog/*.astro` need `../../../styles/blog.css`; `src/pages/<l>/*.astro` need `../../styles/…`. Build failures of the form "Could not resolve … styles …" are almost always a depth error.
- `dist/` can be rebuilt by other processes between your commands — **rebuild before verifying** anything in `dist/`, and never trust a stale chunk name.
- `npm run check:multiplayer` shows 3 pre-existing tsc errors in `functions/share.ts` (resvg/JSX config) — the baseline is 3; only investigate if it grows.

## 6. Validation (a change is not done until these pass)

```sh
bun test src                      # includes localeSwitch + Navbar tests
bun test workers/multiplayer src/lib/multiplayer   # when multiplayer protocol/dictionaries change (72+ tests)
bun run check                     # astro check (or npx tsc --noEmit -p .)
bun run build                     # 100+ pages; watch for missing collection/import errors
bun run check:seo
node scripts/check-alternative-pages.mjs   # when /lp pages change
bun run check:stories             # only if Web Stories changed
```

Then, against `npx astro preview --port 4399` (production build, not `dev`):
- Check the new locale's home, typing test, learn, blog, and one lp page at **1280px and 390px** (no horizontal scroll). Use headless Chrome via `puppeteer-core` with `executablePath` set to the installed Chrome. Delete temporary screenshot scripts before finishing.
- Click the navbar language switch from each page type and confirm the target URL resolves (200) and the menu's `aria-current` shows the right language.
- Confirm reciprocal hreflang: the new page links back to English, and the English counterpart links to it.

## 7. Docs to update in the same change

Per `AGENTS.md` and `plan/plan-execution-process.md`:
- `plan/international-expansion.md` → *Implementation status*: what shipped, validation results, follow-ups (e.g. "app chrome still English", "RSS feed `rss-<l>.xml` pending").
- `README.md` if user-visible behaviour changed (e.g. a new selectable locale).
- Bump the minor version (`bun run version:minor`) for plan-driven releases.
- Don't touch `/lp/*`, `/hacker-typer/*`, or `/stories/*` styling unless the task explicitly includes them (AGENTS.md scope exclusions).

## 8. Checklist (copy into your plan)

- [ ] Phase and gate confirmed (keyword check or GSC data)
- [ ] `src/i18n/<l>.ts` + registered in `src/i18n/index.ts` (LocaleCode, LOCALE_STRINGS, OG_LOCALES, EXTRA_HREFLANG, BLOG_CONFIG)
- [ ] `blog<L>` collection in `src/content.config.ts`; posts in `src/content/blog-<l>/`
- [ ] `src/pages/<l>/` home, typing test, learn (+ fingers), lp pages; one H1 each
- [ ] Unique title/description per page within length limits; FAQ schema matches visible FAQ
- [ ] Reverse hreflang added to the English counterparts; alternates reciprocal incl. `x-default`
- [ ] Navbar switch: `LANGUAGE_OPTIONS`, `ROUTE_ROWS`, flag SVG, tests
- [ ] Phase B only: word list wired (`api/words`, `wordTypes`, `LOCALE_DICTIONARY_KEYS`) — **no visible dictionary selector**; keyboard layout + finger lessons; `learnLocale.ts` branches; `clientLocale()`; `raceWordsFor` map
- [ ] Phase B games: keyword routes in `raceHrefFor`/`ghostHrefFor`, `locale` props on game components, protocol + worker `DICTIONARIES` if the locale's dictionary should be raceable
- [ ] English build output unchanged (diff against snapshot)
- [ ] All §6 validation commands pass; screenshots at 1280 and 390 checked
- [ ] `plan/international-expansion.md` updated; README and version bump if applicable
