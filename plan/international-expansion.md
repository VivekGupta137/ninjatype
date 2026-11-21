# International expansion plan — high-CPM countries

Date: 21 November 2026. Companion research: `../research/international-keywords-2026-11-21/analysis.md` (keyword bands, market prioritization) and `../research/international-keywords-2026-11-21/deep-dive.md` (**live-data deep-dive with corrections** — read it first; several keyword and competitor assumptions were revised there, e.g. Swedish/Danish "blindskrift" means Braille, and Italy is an ATA-certification market). Keyword volumes in analysis.md are unverified estimate bands — validate with Keyword Planner before building each phase.

Target markets: US, AU, CH, NO, CA, UK, DE, DK, NZ, SE, NL, JP, SG, UAE.

---

## 1. Architecture

Astro 5 i18n routing, **English stays at the root** so existing rankings are untouched:

```js
// astro.config.mjs
i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de', 'fr', 'it', 'nl', 'no', 'da', 'sv', 'ja'],
    prefixDefaultLocale: false,
    routing: { redirectToDefaultLocale: false },
}
```

Locales live at `src/pages/de/…`, `src/pages/ja/…`, etc. `trailingSlash: 'always'` and the sitemap plugin continue to work as-is.

**Phased content depth per locale:**

- **Phase A (landing + content, app stays English):** localized marketing home + blog + comparison pages. The interactive app remains English; localized landing pages set expectations and drive to the app. Low risk, indexable immediately.
- **Phase B (localized app):** localized UI strings, locale word lists (top-1k words per language), localized test-result copy. Requires an i18n string layer in the React islands (`src/components/*`), so do it after Phase A proves a locale has traffic.
- **Phase C (special input modes):** Japanese romaji→kana test mode (blocker for Japan). Only after Phase B.

**Word lists** (Phase B): add `src/data/words-de-1k.json`, `words-fr-1k.json`, etc. German/French/Dutch/Italian/Nordic are simple frequency lists. Japanese needs the romaji input mode (Phase C).

**Fonts:** confirm the UI font covers Latin-ext (Nordic å/ø/æ/ö), then a JP font (e.g. Noto Sans JP) for `/ja/`.

**Hreflang:** every localized page declares the full alternate set including `x-default → en`. English-market alternates (`en-GB`, `en-CA`, `en-AU`, `en-NZ`, `en-SG`, `en-US`) point at the root English pages — no duplicate English trees.

**GDPR (DE, CH, NO, DK, SE, NL, UK, CA, AU):** consent-gated analytics/ads for EU/EEA visitors before any monetization work. Check current `src/components/analytics` against a CMP before launching German pages.

**Sitemap/GSC:** sitemap already auto-includes new routes; add hreflang entries via the sitemap plugin's i18n support. Then GSC → add the target countries' coverage; watch per-country impressions by locale folder.

## 2. Page routes per locale (Phase A)

One consistent template set per locale, localized slugs:

| English route | de | fr | it | nl | no | da | sv | ja |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| (home) | `/de/` | `/fr/` | `/it/` | `/nl/` | `/no/` | `/da/` | `/sv/` | `/ja/` |
| typing-test keyword page | `/de/tippgeschwindigkeitstest/` | `/fr/test-de-vitesse-de-frappe/` | `/it/test-di-battitura/` | `/nl/typsnelheid-test/` | `/no/skrivetest/` | `/da/skrivehastighedstest/` | `/sv/skrivhastighetstest/` | `/ja/typing-test/` |
| learn keyword page | `/de/tippen-lernen/` | `/fr/apprendre-a-taper-au-clavier/` | `/it/dattilografia/` | `/nl/blind-typen/` | `/no/touch-typing/` | `/da/maskinskrivning/` | `/sv/tangentbordstraning/` | `/ja/typing-practice/` |
| blog index + posts | `/de/blog/` | `/fr/blog/` | `/it/blog/` | `/nl/blog/` | `/no/blogg/` | `/da/blog/` | `/sv/blogg/` | `/ja/blog/` |
| comparison pages | `/de/lp/…` | `/fr/lp/…` | `/it/lp/…` | `/nl/lp/…` | `/no/lp/…` | `/da/lp/…` | `/sv/lp/…` | `/ja/lp/…` |
| 404 | `/de/404/` etc. (or one localized 404 per locale) |

Notes:

- Slugs use the locale's own keyword (that IS the ranking asset). Japanese slugs stay romaji for maintainability; the H1/title carries タイピング練習 etc.
- The localized home IS the landing page (no separate /lp/ home per locale initially).
- Reuse the existing `[mdid]` markdown template and the blog `[slug]` template via locale collections (`src/content/blog-de/`, `blog-fr/`, …) — same build pipeline, sitemap and RSS pick them up.
- `/ja/` needs the KPM metric mentioned even in Phase A marketing copy (Japanese audience expects keys-per-minute).

## 3. Competitors → `/lp/` comparison pages per locale

Extend the existing `/lp/` pattern (already 14 English pages) with locale-localized comparisons. Only name a competitor after the verification checklist in the research doc.

| Locale | Comparison pages (`/lp/…`) |
| --- | --- |
| de | `10fastfingers-alternative`, `maschinenschreiben-alternative` (TypingClub DE, verify), `typingclub-alternative`, `keybr-alternative` |
| fr | `typingclub-alternative`, `10fastfingers-alternative`, `ratatype-alternative` (Key Hero verified English-only on 21 Nov 2026 — dropped as a French incumbent) |
| it | `typingclub-alternative`, `10fastfingers-alternative`, `keybr-alternative` |
| nl | `typingclub-alternative`, `10fastfingers-alternative`, `typcursus-alternative` (verify local incumbent) |
| no / da / sv | `monkeytype-alternative`, `10fastfingers-alternative`, `typingclub-alternative` (one shared Nordic playbook translated per locale; note 10FastFingers has **no Norwegian interface** — NO comparisons emphasize the Norwegian-language gap) |
| ja | `e-typing-alternative` (highest-value: e-typing is the dominant JP test), `sushida-alternative` (寿司打), `typewell-alternative` (タイプウェル, verify externally — blocked by corporate proxy) |
| en (existing + adds) | existing 14 pages cover this; keep adding only where a competitor has real branded volume |

Each page: honest feature comparison (rules from `plan/ninjatype-seo-implementation.md` — no unverifiable competitor claims), localized `SoftwareApplication` + FAQ schema, internal links to that locale's test page and blog.

## 4. Web Stories per locale

The existing story engine (`src/data/web-stories.ts`, `/stories/[slug]`) gets locale variants. Google Web Stories rank in Discover per country+language, so:

- Phase A: translate the top 4 performing English stories per locale (measure GSC first; candidates: typing-practice, learn-touch-typing, typing-posture, ghost-race).
- Localized original stories (not translations):
  - **de:** "In 5 Tagen schneller tippen — so geht's", "Blind schreiben lernen: Der 10-Finger-Test", "Tippgeschwindigkeit: Was ist ein guter Wert?"
  - **fr:** "Le test de vitesse de frappe expliqué en 60 secondes", "Tape sans regarder ton clavier — la méthode"
  - **ja:** "タイピング速度が1週間で変わる練習法", "タイピング速度測定のやり方", "初心者ローマ字タイピング練習"
- Routes: `/de/stories/[slug]/`, `/ja/stories/[slug]/`, etc. Same image pipeline; story text must be locale-language (English stories will not surface in de/ja Discover feeds).
- Add `WebSite`/`publisher` locale consistency and per-locale RSS feeds optional.

## 5. Blog titles per locale (target keywords in the title)

6 starter posts per locale, prioritized by the keyword bands in the research doc. Each gets a unique locale collection so RSS/sitemap per locale stay coherent.

**German** (`/de/blog/…`)
1. Tippgeschwindigkeit erhöhen: 10 Tipps für schnelleres Tippen *(tippgeschwindigkeit)*
2. Wie schnell tippt der Durchschnitt? Tippgeschwindigkeit im Vergleich *(tippgeschwindigkeit, durchschnitt)*
3. 10-Finger-Schreiben lernen: Anleitung für Anfänger *(10 finger schreiben lernen)*
4. Tippen lernen für Erwachsene: Die besten kostenlosen Übungen *(tippen lernen für erwachsene)*
5. Tipp-Test: So misst du deine Schreibgeschwindigkeit richtig *(tipptest, schreibgeschwindigkeit testen)*
6. Tippgeschwindigkeitstest: Was ist ein gutes Ergebnis in WPM? *(tippgeschwindigkeitstest)*

**French** (`/fr/blog/…`)
1. Test de vitesse de frappe : comment mesurer votre vitesse (WPM) *(test de vitesse de frappe)*
2. Comment taper plus vite au clavier : 10 méthodes qui marchent *(comment taper plus vite)*
3. Quelle est la vitesse de frappe moyenne ? Étude et repères *(vitesse de frappe moyenne)*
4. Apprendre à taper sans regarder le clavier : la méthode complète *(taper sans regarder le clavier)*
5. Cours de dactylographie gratuit : de zéro à 60 mots/minute *(cours de dactylographie)*
6. Jeux de dactylographie : les meilleurs pour progresser en s'amusant *(jeux de dactylographie)*

**Italian** (`/it/blog/…` — revised: Italy is an ATA-certification market, "test di battitura" has near-zero interest)
1. Test di dattilografia: come misurare la tua velocità di scrittura *(test di dattilografia)*
2. Corso dattilografia ATA: cosa serve per il punteggio (senza promettere certificazioni) *(corso dattilografia ata)*
3. Dattilografia: corsi riconosciuti MIUR spiegati *(corso dattilografia riconosciuto miur)* — name EIPASS only after external verification
4. Simulazione test di dattilografia: preparati gratuitamente *(simulazione test dattilografia)*
5. Velocità media di battitura: qual è un buon risultato? *(velocità di battitura media)*
6. Scrivere senza guardare la tastiera: esercizi progressivi *(scrivere senza guardare la tastiera)*

**Dutch** (`/nl/blog/…`)
1. Typsnelheid test: meet jouw woorden per minuut *(typsnelheid test)*
2. Wat is een goede typsnelheid? Gemiddelden en doelen *(wat is een goede typsnelheid)*
3. Blind typen leren: complete stappenplan voor volwassenen *(blind typen leren)*
4. Typcursus gratis: de beste oefeningen van beginner tot gevorderd *(typcursus)*
5. Sneller typen: 10 tips die direct werken *(sneller typen)*
6. Typspel voor volwassenen en kinderen: leuk én effectief *(typspel)*

**Swedish** (corrected per deep-dive — "blindskrift" means Braille in Swedish)
1. Skrivhastighetstest: testa hur snabbt du skriver *(skrivhastighetstest)*
2. Tangentbordsträning: steg-för-steg för nybörjare *(tangentbordsträning)*
3. Fingersättning tangentbord: rätt teknik från början *(fingersättning tangentbord)*
4. Tangentbordsträning spel: träna på ett roligt sätt *(tangentbordsträning spel)*
5. Hur skriver man snabbare? 10 beprövade tips *(hur skriver man snabbare)*
6. Medelhastighet vid skrivning — vad är normalt? *(medelhastighet skrivning)*

(Norwegian equivalents per deep-dive: "Skrivetest: test skrivehastigheten din", "Skrivehastighetstest: ord i minuttet forklart", "Touch typing på norsk: lær å skrive uten å se", "Skrivetest til jobbintervju: hva du kan forvente". Danish equivalents: "Skrivehastighedstest: sådan måler du din skrivehastighed", "Maskinskrivning: lær teknikken trin for trin", "Lær blindskrift på pc: 10-finger-systemet", "Skrivetest dansk: øv dig gratis".)

**Japanese** (`/ja/blog/…`)
1. タイピング速度測定のやり方：WPMとKPMの違いを解説 *(タイピング速度測定)*
2. タイピング速度の平均は？年代別・レベル別データ *(タイピング速度 平均)*
3. タイピング練習の正しい方法：初心者向け完全ガイド *(タイピング 練習 初心者)*
4. タイピングが早い人の共通点と練習法 *(タイピング 早い)*
5. ローマ字タイピング練習：毎日10分の上達メニュー *(ローマ字タイピング練習)*
6. 無料タイピングゲームで楽しく速度アップ *(タイピングゲーム 無料)*

**English-market additions (no new locale):**
- US/UK/AU/CA/NZ/SG: continue the existing `/blog/` plan; country-specific angles where GSC shows them (e.g., "Is 60 WPM a good typing speed for a job in the UK?"). Canada: publish the FR content under `fr-CA` hreflang on the `/fr/` pages.
- UAE (English): "Typing test for job interviews and call-center hiring" — the verified UAE money intent (`live chat typing test`, expat segments) needs no translation.

## 5b. Opportunities surfaced by the live deep-dive (`research/international-keywords-2026-11-21/deep-dive.md`)

1. **Metric localization** — show native metrics per locale: German **Anschläge pro Minute (APM)**, French mots/minute + caractères, Japanese **KPM + 文字/秒**, Dutch woorden per minuut. English-only tools don't do this.
2. **Kids pages** for DE/FR/NL (kinder/kinderen/enfant segments verified in suggest data); the `/learn/` finger-lessons structure translates well.
3. **Italy = ATA-certification hub**: `/it/dattilografia/` landing + certification-explainer series; free practice positioned as exam prep. Never claim MIUR recognition; name EIPASS only after external verification.
4. **French product differentiators**: accent-free test (`sans accent`), dictation test (`audio dictée`), medical-secretary hiring content (`secrétaire médicale`), Swiss keyboard page (`clavier suisse`).
5. **Japan**: multiplayer race marketed as 対戦型タイピングゲーム (rising +1,800%); 小学生 page; タイピング検定 level explainers; find and verify タイピングコロシアム (+850% rising).
6. **Swiss pages**: `/fr/test-de-frappe-clavier-suisse/` and a German QWERTZ-vs-AZERTY explainer — Switzerland's keyboard reality differs from FR/DE.
7. **Norwegian gap**: 10FastFingers has no Norwegian interface (verified 404) — lowest-competition market on the list; emphasize Norwegian-language test in NO pages.
8. **GB emphasis**: "typing speed test" over-indexes in the UK (Trends 18.4 vs 12.7 AU) — carry that exact phrase in UK-facing metadata.

## 6. Rollout order (matching research prioritization)

| Step | Deliverable | Gate |
| --- | --- | --- |
| 0 | hreflang for English markets (en-US/GB/CA/AU/NZ/SG + x-default), GSC country coverage, consent mode for EU/EEA | none — do immediately |
| 1 | `/de/` Phase A (landing, test page, blog ×6, lp ×3) | Keyword Planner validation of the DE shortlist |
| 2 | `/fr/` Phase A (also tags fr-CA) | — |
| 3 | Japanese input-mode prototype (Phase C pulled forward as a spike) + `/ja/` Phase A | Spike proves romaji mode in the existing engine |
| 4 | `/nl/`, `/it/` Phase A | — |
| 5 | `/sv/`, `/da/`, `/no/` Phase A (shared Nordic template) | — |
| 6 | Phase B per locale (word lists + UI strings) only where GSC shows ≥1k impressions/week after ~8 weeks | GSC data |
| 7 | Web stories per locale, after each locale has ranking content to link them to | — |

### Implementation status

- **Step 0 (technical hreflang): DONE 21 Nov 2026.** Astro i18n config (`routing.prefixDefaultLocale: false`), sitemap i18n alternates, `alternates`/`ogLocale`/`lang` support in `SEO.astro`/`BaseLayout.astro`. Every English page now declares en/en-US/en-GB/en-CA/en-AU/en-NZ/en-SG + x-default; consent-mode/GSC configuration still pending (needs GTM-side work, outside this repo).
- **Step 1 (German Phase A): DONE 21 Nov 2026.** 13 pages shipped: `/de/`, `/de/tippgeschwindigkeitstest/`, `/de/tippen-lernen/`, `/de/blog/` + 6 posts (`blogDe` collection), `/de/lp/{10fastfingers,typingclub,keybr}-alternative/`. Reverse hreflang wired on `/`, `/learn/`, `/blog/`, and the three English lp counterparts. Template to copy for FR/NL/IT/Nordics: `src/layouts/LocaleLayout.astro` + `src/i18n/de.ts` pattern. Validated: `astro check` 0 errors, full build, `check-seo.mjs`, `check-alternative-pages.mjs`, 576 internal links resolve, one H1 per page.
- **German Phase B (localized app) — DONE 21 Nov 2026, pulled forward per user request.** The German routes now run the real app instead of redirecting to English:
  - **Dictionary**: `de-1k` word list at `/api/words/de-1k/`, selectable as **„1K Deutsch“** in the toolbar. First-time visitors on the German practice page default to it (`LocalePracticeInit`; returning users keep their saved choice). Source corrected on 21 Nov 2026: replaced the initial OpenSubtitles-derived list with **Monkeytype's `german_1k`** (Leipzig University Wortschatz corpus; 899 unique words) — the established typing-practice dictionary.
  - **Practice at the keyword route**: `/de/tippgeschwindigkeitstest/` is now the practice screen (ConfigToolbar + typing test + analytics + journey), German metadata/FAQ schema, full hreflang set (en → `/`).
  - **Learn with German keyboards**: `/de/tippen-lernen/` + `/de/tippen-lernen/{pointer,middle,ring,pinky}/` run the finger lessons with a **QWERTZ** layout — ü/ö/ä/ß keys, Y/Z swapped, A/Ö pinky anchors — German lesson names/cues (`fingerKeysDe`, `fingerLessonsDe`, `lessonDetailsDe`, `qwertzLayout`) via locale-aware components (`lib/learnLocale.ts`; `FingerSelection`/`FingerPractice`/`FingerCard`/`KeySelector`/`LessonKeyboard` take a `locale` prop; client stores use URL-based `clientLocale()`).
  - **Routes follow keywords, not English slugs**: practice = `tippgeschwindigkeitstest`, learn = `tippen-lernen` (per the live keyword research).
  - All German CTAs (marketing pages, blog posts, lp pages, footer) now route to the German app screens. App chrome (toolbar labels, lesson buttons) remains English in this pass — documented follow-up.
  - **Full German chrome (21 Nov 2026, per user request)**: all user-visible text on the German practice and learn pages is German — toolbar (Zeit/Wörter/Zitate, Testlängen, Zitat-Sets), typing overlay, countdown/word count, reset, results panel (Tempo/Genauigkeit/Fehler/Dauer, „Nochmal tippen“, „Ergebnis teilen“), streak insights, practice recommendations (incl. German finger names + German lesson links in the recommendation engine), header nav (Üben/Lernen/Tipp-Rennen/Verlauf/Einstellungen, German hrefs), footer, and the complete learn-app chrome (lesson cards, level buttons, session toolbar, result screens, key-feedback panel). English pages byte-identical (verified against the built `dist`).
  - Validated: `astro check` 0 errors, unit tests pass (incl. the refactored drill-sentence generator), full build, `check-seo.mjs`, `check-alternative-pages.mjs`, 763 internal links resolve across 17 de pages, one H1 per page, English QWERTY lessons unchanged (A/; anchors confirmed).
- **Follow-ups:** German RSS feed (separate `rss-de.xml`, not mixed into the English feed), APM display in results UI (Phase B), German word list (Phase B), `maschinenschreiben.de` still unverified — the planned `/de/lp/maschinenschreiben-alternative/` is on hold until verified.

**Dictionaries for all planned locales — DONE 21 Nov 2026** (sources: `research/international-keywords-2026-11-21/dictionaries.md`). Monkeytype/Leipzig-Wortschatz 1k lists adopted for fr (1394), it (1159), nl (1000), no-bokmal (1000), sv (994), ja-romaji (987, types as latin letters — no IME needed),. Danish: `danish_1k` is **DSL-licensed (permission required) — not used**; the unrestricted Monkeytype base Danish list (196 words) adopted instead. All served at `/api/words/<locale>-1k/`, selectable in the toolbar, and `dictionaryFor(locale)` defaults them per locale. Locale app pages (practice/learn + full chrome + keyboard layouts) for fr/it/nl/no/da/sv/ja remain the next rollout steps (German pattern is the template).

**Norwegian Phase A — DONE 21 Nov 2026.** 14 pages shipped (final Nordic): `/no/` home, `/no/skrivetest/` (the strongest Norwegian keyword; long-tails `jobbintervju`, `ord i minuttet`, `nynorsk` used in copy), `/no/touch-typing/` (the loan-word used as-is, per the research), `/no/lp/{monkeytype,10fastfingers,typingclub}-alternative/`, `/no/blog/` + 7 posts (`blogNo`, incl. `skrivetest-jobbintervju`). **The 10FastFingers page states the verified gap honestly: no Norwegian interface** (the lp page says so; the claim traces to the verified `/no` 404 from the 21 Nov research). `blindskrift` (Braille) is never used. Registered: `no.ts`, OG_LOCALES `nb_NO`, BLOG_CONFIG `blogNo`/`nb-NO`, navbar switch (Norsk + Norwegian flag + ROUTE_ROWS + tests). Reverse hreflang on `/`, `/learn/`, `/blog/`. Verification surfaced and fixed Danish/Swedish residue (breadcrumb labels and CTA text) that a first scan missed; a final built-HTML scan of the da and no trees is now clean.

**Danish Phase A — DONE 21 Nov 2026.** 13 pages shipped via the i18n skill: `/da/` home, `/da/skrivehastighedstest/`, `/da/maskinskrivning/` (the verified touch-typing term; Danish home row A-S-D-F / J-K-L-Æ documented), `/da/lp/{monkeytype,10fastfingers,typingclub}-alternative/`, `/da/blog/` + 6 posts (`blogDa`). Keyword traps held: `fingersætning` (instrument fingering) is never used; „blindskrift“ is never used as a target (dual-use with Braille — the copy prefers „skrive blindt“ and „10-fingersystemet“; grep-verified over dist/da). Registered: `da.ts`, OG_LOCALES `da_DK`, BLOG_CONFIG, navbar switch (Dansk + Dannebrog + ROUTE_ROWS + tests). Reverse hreflang on `/`, `/learn/`, `/blog/`. The Danish dictionary (`da-1k`) is the unrestricted 196-word Monkeytype base list — the DSL-licensed `danish_1k` was never used. Follow-ups: da Phase B gated on GSC.

**Swedish Phase A — DONE 21 Nov 2026.** 13 pages shipped via the i18n skill (first of the Nordic trio): `/sv/` home, `/sv/skrivhastighetstest/`, `/sv/tangentbordstraning/` (the verified school term `tangentbordsträning`; the school-portal competitors Elevspel/Kunskapsstjärnan/Skolplus appear in its suggests), `/sv/lp/{monkeytype,10fastfingers,typingclub}-alternative/`, `/sv/blog/` + 6 posts (`blogSv`). Keyword traps held: **„blindskrift“ (Braille) does not appear** in the sv tree (grep-verified) and `skrivhastighet` is never used standalone (SSD/HDD contamination) — always as `skrivhastighetstest`. Registered: `sv.ts`, OG_LOCALES `sv_SE`, BLOG_CONFIG, navbar switch (Svenska + Swedish flag + ROUTE_ROWS + tests). Reverse hreflang on `/`, `/learn/`, `/blog/`. Follow-ups: sv Phase B gated on GSC.

**Italian Phase A — DONE 21 Nov 2026.** 13 pages shipped via the i18n skill, targeted at the certification market per the deep-dive: `/it/` home, `/it/test-di-dattilografia/` (not „test di battitura" — near-zero interest), `/it/dattilografia/` (method + an honest „corsi e certificazioni" section: verify the bando, distrust guaranteed-punteggio claims, NinjaType claims no recognition), `/it/lp/{10fastfingers,typingclub,keybr}-alternative/`, `/it/blog/` + 6 posts (`blogIt`): measurement, ATA-concourse guide, „corso riconosciuto" explained, free test simulation, average speed, touch-typing method. **EIPASS is not named anywhere** (still unverified behind the corporate proxy — verified via grep over dist/it). Registered: `it.ts` strings, OG_LOCALES `it_IT`, BLOG_CONFIG, navbar switch (Italiano + Italian flag + ROUTE_ROWS + tests). Reverse hreflang wired on `/`, `/learn/`, `/blog/`. Follow-ups: it Phase B gated on GSC; external EIPASS verification still pending before any content may name it.

**Dutch Phase A — DONE 21 Nov 2026.** 12 pages shipped via the i18n skill: `/nl/` home, `/nl/typsnelheid-test/`, `/nl/blind-typen/` (the verified `blind typen / leren blind typen` keyword — related-query rank 100; `typsnelheid` alone avoided as it is small/seasonal), `/nl/lp/{10fastfingers,typingclub}-alternative/` (the planned `typcursus-alternative` was skipped — no local incumbent was verified), `/nl/blog/` + 6 posts (`blogNl` collection). Registered: `nl.ts` strings, OG_LOCALES `nl_NL`, BLOG_CONFIG, navbar switch (Nederlands + Dutch flag + ROUTE_ROWS + tests). Reverse hreflang wired on `/`, `/learn/`, `/blog/`. Belgium spillover served by the same tree. Follow-ups: nl Phase B (app pages + full chrome) gated on GSC per plan §6 step 7; `raceWordsFor`/protocol dictionaries already ship `nl-1k`.

**Japanese Phase A — DONE 21 Nov 2026.** 12 pages shipped via the i18n skill (`/.agents/skills/ninjatype-i18n/SKILL.md`): `/ja/` home, `/ja/typing-test/` (タイピングテスト keyword page, WPM/KPM explained), `/ja/typing-practice/` (タイピング練習 keyword page), `/ja/lp/e-typing-alternative/` + `/ja/lp/sushida-alternative/` (both competitors live-verified on 21 Nov; typewell lp skipped — still unverified), `/ja/blog/` + 6 posts (`blogJa` collection; KPM-first honest content, no invented stats). Registered: `ja.ts` strings, OG_LOCALES `ja_JP`, BLOG_CONFIG, navbar switch (日本語 + Japan flag + ROUTE_ROWS + tests). Reverse hreflang added for **ja** and the missing **fr** alternates (gap found: `/`, `/learn/`, `/blog/` only listed de). Follow-ups: ja Phase B needs the romaji-input spike (`japanese_romaji_1k` dictionary already shipped and types as latin); ja app pages + Japanese UI chrome gated on GSC per plan §6 step 7.

**German Multiplayer + Ghost Race — DONE 21 Nov 2026.** Both game modes now run fully in German at keyword routes: `/de/tipp-rennen/` (multiplayer race) and `/de/tippgeschwindigkeit-ueben/` (Ghost Race — renamed from `/de/ghost-race/` on 21 Nov 2026 to match the real German suggest query „tippgeschwindigkeit üben“; „tippspiel“ alone was rejected as football-betting-contaminated; „Ghost Race“ stays as product mention in copy/eyebrow). The complete game UI is translated (lobby, room cards, ready-up flow, chat, race settings, standings, rematch, avatar customizer, readiness engine, ghost-race setup/results). Friend rooms can select **„Deutsch 1k“** as the race dictionary (added to the multiplayer protocol and the Cloudflare worker — `workers/multiplayer/dictionaries.ts` builds German passages from `words-de-1k.json`); quick races stay English 1k (server-side standard) and the UI says so honestly. Reverse hreflang wired on both English pages (`/ghost-race/` → `/de/tippgeschwindigkeit-ueben/`); nav/footer/blog/lp links on all de pages route to the German game pages; invite links generated on the German page point to `/de/tipp-rennen/?room=…`. Validated: 72 multiplayer unit tests pass, worker tsc baseline unchanged, build green, 19 de pages with 863 internal links resolve, SEO checks pass, English pages unchanged.

**Ghost Race German dictionary — fixed 21 Nov 2026.** The solo race passages were hardcoded to the English `words1k` constant in `store/online.ts`. Now `lib/raceWords.ts` (`raceWordsFor(locale)`, URL-based like the other client stores) supplies the pool: German pages race with the `de-1k` list (same Leipzig-corpus file as the practice dictionary), English pages keep `words1k`. Verified in the built chunk graph: the German corpus is inlined in the exact chunk `/de/tippgeschwindigkeit-ueben/` loads, with the English list chunk imported for the `en` fallback.

**German dictionary integration on /de/ — fixed 21 Nov 2026.** No dictionary selector is shown on the practice screen (per user decision — none was ever visible before; `WordSettings` stays unmounted). Instead the dictionary follows the page locale silently via `LocalePracticeInit` on every visit: `/de/tippgeschwindigkeitstest/` **always** types the German list (`de-1k`), the English homepage keeps an English list. Each locale has a supported-dictionary allowlist (`dictionaryKeysFor` in `constants/wordTypes.ts`); an out-of-locale persisted dictionary is switched to the page default automatically.

**Phase B parity for fr, it, nl, no, da, sv, ja — DONE 21 Nov 2026 (Arabic excluded from scope).** Each locale now has the full German app tree: practice screen at its keyword route, learn hub + four finger lessons on its own keyboard layout (AZERTY for fr; QWERTY variants for it/no/da/sv; QWERTY for nl/ja romaji), solo Ghost Race and multiplayer race at keyword routes (`exercices-de-dactylographie`, `defi-dactylo`, `esercizi-di-dattilografia`, `gara-di-dattilografia`, `blind-typen-oefenen`, `blind-typen-wedstrijd`, `ord-i-minuttet`, `skrivekonkurranse`, `skrivetest-spil`, `skrivekonkurrence`, `ova-skrivhastighet`, `skrivtavling`, `taipingu-geemu`, `taisen-taipingu`). App chrome translated via `src/i18n/app-<l>.ts`, which `tr()` in `src/lib/learnLocale.ts` now reads for every locale (English fallback for missing keys). `LOCALE_CONFIG` in `learnLocale.ts` is the single registry for keys, names, lessons, layouts, routes and strings. Friend rooms can race the new `<l>-1k` dictionaries (protocol + worker). Navbar switch (`localeSwitch.ts`) maps game pages and finger lessons for every locale. Duplicate `/no/touch-typing/` route merged into one page (lesson island + Phase A SEO copy).

**SEO pass (same day).** Every locale page: one H1, title ≤65 chars, description 100–170, canonical + self hreflang, English alternate where a real counterpart exists, internal links resolving inside the locale tree. The Japanese competitor pages no longer claim the `/lp/` directory as their English counterpart (`LocaleLayout`'s `englishPath` is now optional). English pages gained reverse alternates for the locale finger lessons (`/learn/fingers/*`) and the da/no/sv Monkeytype comparisons. Blog listings break date ties by id so ordering is deterministic.

**Validation:** `bun test src` 191 pass; `astro check` 0 errors; full build green; `check:seo` and `check-alternative-pages.mjs` pass; locale audit script (title/description/H1/canonical/hreflang/internal links) run over all seven locales. Follow-ups: app-chrome translations are first-pass machine-quality and need a native-speaker review; Phase B is still gated on Search Console data per §6 step 7; the German `/de/` tree was not re-audited by this pass.

## 7. Measurement

- GSC: performance filtered by country × locale-folder; impressions are the early signal (months before clicks).
- Rank tracking per keyword group per country (validate bands first).
- Indexing checks: every localized page indexed in its target country's Google (site: search + URL inspection with country setting).
- Ads: per-country page-RPM tracking only after the consent/CMP work; no revenue claims before real data.
- Each phase follows the existing validation checklist pattern (Astro check, build, SEO script, generated-HTML checks) from `plan/plan-execution-process.md`.
