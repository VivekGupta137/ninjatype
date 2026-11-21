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
    locales: ['en', 'de', 'fr', 'it', 'nl', 'no', 'da', 'sv', 'ja', 'ar'],
    prefixDefaultLocale: false,
    routing: { redirectToDefaultLocale: false },
}
```

Locales live at `src/pages/de/…`, `src/pages/ja/…`, etc. `trailingSlash: 'always'` and the sitemap plugin continue to work as-is.

**Phased content depth per locale:**

- **Phase A (landing + content, app stays English):** localized marketing home + blog + comparison pages. The interactive app remains English; localized landing pages set expectations and drive to the app. Low risk, indexable immediately.
- **Phase B (localized app):** localized UI strings, locale word lists (top-1k words per language), localized test-result copy. Requires an i18n string layer in the React islands (`src/components/*`), so do it after Phase A proves a locale has traffic.
- **Phase C (special input modes):** Japanese romaji→kana test mode (blocker for Japan); Arabic RTL pages. Only after Phase B.

**Word lists** (Phase B): add `src/data/words-de-1k.json`, `words-fr-1k.json`, etc. German/French/Dutch/Italian/Nordic are simple frequency lists. Arabic needs RTL text handling in the typing engine. Japanese needs the romaji input mode (Phase C).

**RTL (Arabic):** `dir="rtl"` on `<html>` for `/ar/` pages, logical CSS properties where needed, mirrored keyboard visual optional.

**Fonts:** confirm the UI font covers Latin-ext (Nordic å/ø/æ/ö), then a JP font (e.g. Noto Sans JP) for `/ja/`, an Arabic font for `/ar/`.

**Hreflang:** every localized page declares the full alternate set including `x-default → en`. English-market alternates (`en-GB`, `en-CA`, `en-AU`, `en-NZ`, `en-SG`, `en-US`) point at the root English pages — no duplicate English trees.

**GDPR (DE, CH, NO, DK, SE, NL, UK, CA, AU):** consent-gated analytics/ads for EU/EEA visitors before any monetization work. Check current `src/components/analytics` against a CMP before launching German pages.

**Sitemap/GSC:** sitemap already auto-includes new routes; add hreflang entries via the sitemap plugin's i18n support. Then GSC → add the target countries' coverage; watch per-country impressions by locale folder.

## 2. Page routes per locale (Phase A)

One consistent template set per locale, localized slugs:

| English route | de | fr | it | nl | no | da | sv | ja | ar |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| (home) | `/de/` | `/fr/` | `/it/` | `/nl/` | `/no/` | `/da/` | `/sv/` | `/ja/` | `/ar/` |
| typing-test keyword page | `/de/tippgeschwindigkeitstest/` | `/fr/test-de-vitesse-de-frappe/` | `/it/test-di-battitura/` | `/nl/typsnelheid-test/` | `/no/skrivetest/` | `/da/skrivehastighedstest/` | `/sv/skrivhastighetstest/` | `/ja/typing-test/` | `/ar/typing-test/` |
| learn keyword page | `/de/tippen-lernen/` | `/fr/apprendre-a-taper-au-clavier/` | `/it/dattilografia/` | `/nl/blind-typen/` | `/no/touch-typing/` | `/da/maskinskrivning/` | `/sv/tangentbordstraning/` | `/ja/typing-practice/` | `/ar/learn-touch-typing/` |
| blog index + posts | `/de/blog/` | `/fr/blog/` | `/it/blog/` | `/nl/blog/` | `/no/blogg/` | `/da/blog/` | `/sv/blogg/` | `/ja/blog/` | `/ar/blog/` |
| comparison pages | `/de/lp/…` | `/fr/lp/…` | `/it/lp/…` | `/nl/lp/…` | `/no/lp/…` | `/da/lp/…` | `/sv/lp/…` | `/ja/lp/…` | `/ar/lp/…` |
| 404 | `/de/404/` etc. (or one localized 404 per locale) |

Notes:

- Slugs use the locale's own keyword (that IS the ranking asset). Japanese slugs stay romaji for maintainability; the H1/title carries タイピング練習 etc. Arabic slugs stay latinized for the same reason; H1 carries Arabic.
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
| ar | `ratatype-alternative`, `typingstudy-alternative` |
| en (existing + adds) | existing 14 pages cover this; keep adding only where a competitor has real branded volume |

Each page: honest feature comparison (rules from `plan/ninjatype-seo-implementation.md` — no unverifiable competitor claims), localized `SoftwareApplication` + FAQ schema, internal links to that locale's test page and blog.

## 4. Web Stories per locale

The existing story engine (`src/data/web-stories.ts`, `/stories/[slug]`) gets locale variants. Google Web Stories rank in Discover per country+language, so:

- Phase A: translate the top 4 performing English stories per locale (measure GSC first; candidates: typing-practice, learn-touch-typing, typing-posture, ghost-race).
- Localized original stories (not translations):
  - **de:** "In 5 Tagen schneller tippen — so geht's", "Blind schreiben lernen: Der 10-Finger-Test", "Tippgeschwindigkeit: Was ist ein guter Wert?"
  - **fr:** "Le test de vitesse de frappe expliqué en 60 secondes", "Tape sans regarder ton clavier — la méthode"
  - **ja:** "タイピング速度が1週間で変わる練習法", "タイピング速度測定のやり方", "初心者ローマ字タイピング練習"
  - **ar:** "اختبار سرعة الكتابة: كيف تُحسّن نتيجتك"
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

**Arabic** (`/ar/blog/…`)
1. اختبار سرعة الكتابة: كيف تقيس سرعتك بدقة *(اختبار سرعة الكتابة)*
2. متوسط سرعة الكتابة: ما هي النتيجة الجيدة؟ *(متوسط سرعة الكتابة)*
3. تعلم الكتابة بسرعة: خطة تدريب لأربعة أسابيع *(تعلم الكتابة بسرعة)*
4. الكتابة دون النظر إلى لوحة المفاتيح: الدليل الكامل *(الكتابة دون النظر إلى لوحة المفاتيح)*
5. كيف أكتب أسرع؟ ١٠ نصائح عملية *(كيف أكتب أسرع)*
6. لعبة الكتابة السريعة: التعلم باللعب *(لعبة الكتابة السريعة)*

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
| 6 | `/ar/` Phase A + RTL | — |
| 7 | Phase B per locale (word lists + UI strings) only where GSC shows ≥1k impressions/week after ~8 weeks | GSC data |
| 8 | Web stories per locale, after each locale has ranking content to link them to | — |

## 7. Measurement

- GSC: performance filtered by country × locale-folder; impressions are the early signal (months before clicks).
- Rank tracking per keyword group per country (validate bands first).
- Indexing checks: every localized page indexed in its target country's Google (site: search + URL inspection with country setting).
- Ads: per-country page-RPM tracking only after the consent/CMP work; no revenue claims before real data.
- Each phase follows the existing validation checklist pattern (Astro check, build, SEO script, generated-HTML checks) from `plan/plan-execution-process.md`.
