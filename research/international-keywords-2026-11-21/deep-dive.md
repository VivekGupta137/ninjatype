# Deep-dive: live keyword research — international expansion

Research date: 21 November 2026. This deepens and **corrects** `analysis.md` in this folder using live data. Companion plan: `../../../plan/international-expansion.md`.

## Method — real data sources

Unlike the initial pass (knowledge-based bands), this analysis is built from three live sources, all harvested 21 November 2026:

1. **Google Suggest API** (`suggestqueries.google.com`), tuned per market with `hl`/`gl`. ~600 queries across 14 markets including alphabet/kana/Arabic-letter expansions. Raw JSON: `suggest/` (per market), `suggest/round2.json`, `suggest/round3.json`. Suggestion order approximates popularity.
2. **Google Trends API** (`trends.google.com/trends/api`, cookie-authenticated): 5-year average interest (0–100, normalized within each comparison) and **related queries — top and rising** — per keyword and geo. Raw JSON: `trends/`. These are relative values, not absolute volumes; absolute volumes still require Google Keyword Planner.
3. **Direct site fetches** to verify every claimed competitor (title + HTTP status). Results below. Corporate network (Zscaler) blocked some sites; those are marked "blocked — verify externally" and must not be referenced on published pages until verified.

Harvest scripts: `scripts/research-i18n-harvest-suggest.mjs`, `scripts/research-i18n-harvest-trends.mjs` (re-runnable).

Limits: no absolute volumes (GKP required), no live Google SERP composition per country (SERP scraping blocked; prior SERP research was US-only). Trends "avg interest" values are comparable **only within one comparison set** (they are normalized to the strongest keyword in that set).

---

## Strategic discoveries that change the plan

### 1. "Blindskrift" in Danish/Swedish means Braille — the initial analysis was wrong

The Trends related queries for "blindskrift" (DK) are `blindskrift alfabet`, `hvem opfandt blindskrift`, `blindskrift braille` — and in Swedish `lära sig punktskrift`. Suggest expansions for the term are dominated by Braille, wine labels, medicine packaging. The real touch-typing vocabulary, confirmed in suggest data:

| Market | Verified touch-typing terms (from suggest) | Wrong/ambiguous terms to avoid |
| --- | --- | --- |
| Denmark | **maskinskrivning** (test, kursus, gratis, i skolen), skrivehastighed(stest), skrivetest, blindskrift (dual-use: `lær blindskrift på pc`, `blindskrift 10 finger system` — typing courses do market with it), touch typing | fingersætning (= instrument fingering only) |
| Sweden | **tangentbordsträning** (nybörjare, barn, spel, gratis, elevspel/skolplus brand searches), fingersättning tangentbord, skrivhastighet test (partly), skrivtest | blindskrift (= Braille), skrivhastighet (ambiguous: SSD/HDD/sd-kort write speed suggests), skrivkurs (= creative writing courses: skrivarkurs folkhögskola) |
| Norway | **skrivetest** (norsk, tastatur, hastighet, jobbintervju, engelsk, dansk, ord i minuttet), skrivehastighetstest, touch typing (used as-is in Norwegian), tastaturtrening (weak) | blindskrift/blindeskrift (= Braille) |

Nordic insights: Norwegian `skrivetest jobbintervju` (job-interview typing test) and `ord i minuttet` (WPM in Norwegian); Danes also search `dinordbok skrivetest` (a Norwegian dictionary site's typing test — verify the actual page); `touch skrivetest` shows English terms leaking in.

### 2. Italy is a certification market, not a casual-typing market

Trends related queries for "dattilografia" (avg interest 19.9, the dominant Italian term — "test di battitura" is nearly flat at 0.7):

- `corso dattilografia ata`, `corso dattilografia riconosciuto miur`, `corso dattilografia punteggio ata`, `eipass dattilografia`, `dattilografia punteggio gps`, `certificato dattilografia`, `test dattilografia risposta multipla`, `simulazione test dattilografia` (rising: `certificazione dattilografia` +170%, `dattilografia punteggio gps` +2,650%)

ATA = the Italian school administrative staff profile. Typing certification (EIPASS etc., MIUR-recognized) scores points in ATA hiring competitions. This is the demand driver in Italy. **Italian strategy: certification-prep content** (what's recognized, how the test works, free practice) + a free speed test as the hook. Note 10FastFingers localizes Italian as "test di **digitazione**" — a competing term; suggest shows `test di digitazione italiano`, `live agent test di digitazione` (call-center hiring).

### 3. Japan: huge, brand-dominated, game-flavored — with school and hiring sub-markets

Trends 5-y averages (one comparison set): タイピング練習 **44.3**, タイピングゲーム **30.6**, ローマ字入力 7.5, タイピング検定 3.6, タイピング速度 1.0 (as a phrase; speed intent spreads across 速度測定/平均/検定).

Related queries reveal the market structure:

- **Brands own the space**: 寿司打 (Sushida — appears inside `タイピング練習`, `タイピングテスト`, `タイピングゲーム` suggests; confirmed live at sushida.net), e-typing (confirmed), ポップコーン (school typing drill), タイピングコロシアム **+850% rising** (domain not yet identified — verify), タイプウェル (blocked by corporate proxy).
- **Rising game intents**: `タイピングで敵を倒すゲーム` +2,450%, `対戦型タイピングゲーム` +1,800%, `タイピングゲーム 戦い` +1,450% — battle/RPG-style typing games. NinjaType's multiplayer race fits this demand.
- **Structured segments**: 小学生, `タイピング検定` level system (1級/2級/3級, 模擬試験), `タイピングテスト 面接` (job interviews), `ローマ字入力 練習` (romaji input practice incl. スマホ).
- **Metrics**: `タイピング速度 平均`, `平均 秒`, `速度測定 1分` — Japan measures KPM (keys per minute) and 秒/文字; results UI must show these.

### 4. Germany: "Schreibgeschwindigkeit" is contaminated; APM is the native metric

Trends (one set): tippen lernen **34.9**, schreibgeschwindigkeit 33.7 — **but** suggest shows schreibgeschwindigkeit expansions are SSD/HDD/SD-card/EKG write speeds. The pure typing terms are tippen lernen and tippgeschwindigkeit (7.3), tipptest (1.2, though "tipptest" suggest list is clean and rich: geschwindigkeit, deutsch, 10 finger, online, handy, app, 10 min).

- Related queries confirm **"10 finger tippen lernen"** is the top associated query (100), plus `tippen lernen online`, `schneller tippen lernen` (rising +50%), `tippgeschwindigkeit testen` (100 for the speed-seed; rising +120%).
- **Metric**: `maschinenschreiben anschläge pro minute` — German native metric is **Anschläge pro Minute (APM)**, not WPM. Results UI should show APM in German mode.
- **Kids segment is large**: `tippen lernen kinder`, `tippen lernen kinder kostenlos`, `tastaturschreiben lernen kinder kostenlos` — free-of-charge is a recurring modifier (kostenlos appears in nearly every seed's expansions).
- **10FastFingers is a German product** — its German site title is literally "10FastFingers - Tipptest, Wettbewerbe, Übung & Tippspiele". It sets the German keyword vocabulary (Tipptest, Tippspiele-in-typing-context). Its 21k-strong German-locale base means DE /lp/ comparisons vs 10FF are the highest-value German comparison pages.
- **Avoid**: "Tippspiel/Tippspiele" alone (football betting pools — `tippspiele bundesliga` dominate), "schreibgeschwindigkeit" alone (hardware), "schreibkurs" (writing courses: VHS, für Erwachsene, 10 finger variant exists but mixed).

### 5. France: "dactylographie" dominates; "vitesse de frappe" is football-contaminated

Trends (one set): dactylographie **44.8**, vitesse de frappe 13.6, test de frappe 5.6, dactylo (seeds into dactylographie variants), cours de dactylo ≈ 0.

- "vitesse de frappe" expands into `la plus rapide au foot`, `de roberto carlos` — football shot speed. Use "vitesse de frappe **au clavier**" or avoid.
- **Real demand pockets from suggest**: `test de frappe secrétaire médicale` (medical-secretary hiring tests), `test de frappe audio dictée` (dictation tests — a distinct product feature), `test de frappe sans accent` / `sans accent ni apostrophe` (AZERTY accent pain — a feature NinjaType can win with), `clavier suisse` / `cours de dactylographie clavier suisse gratuit` (**Swiss French market** — Swiss keyboards QWERTZ vs AZERTY!), `azerty` everywhere, `pour enfant`.
- Rising: `test de certification de dactylographie` (Breakout) — certification demand in French too; `test de vitesse de frappe mots/minute` +180%.
- Key Hero (keyhero.com) is **English-only** (verified: `lang="en"`, English title) — deprioritize as a French local incumbent; French comparisons should target 10FastFingers fr, TypingClub fr, typing.com fr instead.

### 6. Netherlands: "blind typen" is the market; course-intent and kids segments

Trends (one set): blind typen **18.2**, typen leren 13.9, typcursus 2.6, typsnelheid 0.2 (with sharp seasonal spikes to 46 — likely school terms; `typtoets` is the education-interval test word).

Related queries for "blind typen" rank: `leren blind typen` (100), `gratis blind typen` (76), `cursus blind typen` (69), `gratis blind leren typen` (34), `blind typen oefenen` (25), **kids**: `blind typen kind` (21), `blind typen kinderen` (9), `cursus blind typen kind` (8). Rising: Belgium-flavored query (Breakout) — NL content serves BE too.

### 7. Arabic/UAE: "كيبورد" vocabulary, Arabic-vs-English test distinction, and the English market is 40× bigger

- Arabic typing queries use transliterated **كيبورد** (keyboard), not لوحة المفاتيح: `اختبار كتابة كيبورد`, `تدريب الكتابة على الكيبورد بالعربي/بالانجليزي`, `العاب تعليم الكتابة على الكيبورد بسرعة`.
- Rising confirmed: `اختبار سرعة الكتابة بالعربي` (Breakout) — explicit demand for an Arabic-language test. Kids segment: `للاطفال`.
- The **English** side of UAE is much larger: "typing test" in AE averaged 44 interest vs ≤1 for the Arabic seeds. UAE English expansions are distinct: `monkey typing test` (Breakout — Monkeytype brand rising in UAE), `myanmar typing test`, `test typing indonesia` (expat-worker segments), `live chat typing test` / `livechat` (call-center hiring tests), `typing speed test 60 seconds`.
- Implication: for UAE, an Arabic tree captures low-competition traffic, but the money intent (hiring tests, English) is already on the English pages — a UAE angle page (e.g. "typing test for job interviews — UAE call centers") may convert better than full Arabic translation.

### 8. English markets: same language, different mixes

Per-geo Trends (4-keyword set, avg interest, 5y):

| Geo | typing test | typing practice | typing games | typing speed test |
| --- | --- | --- | --- | --- |
| GB | 63.4 | 12.7 | 14.1 | 18.4 |
| CA | 61.5 | 18.3 | 13.0 | 13.1 |
| AU | 57.5 | 12.2 | 18.0 | 14.4 |
| NZ | 51.1 | 3.8 | 13.1 | 6.5 |
| SG | 48.8 | 6.9 | 2.5 | 7.5 |

US (different set incl. learn touch typing): typing test 52.7, typing games 23.6, typing practice 12.2.

- "typing speed test" over-indexes in GB (18.4) — UK pages should carry that exact phrase.
- CA French (Quebec) suggest confirms `test vitesse clavier`, `test vitesse clavier francais`, `sans accent`, **azerty** queries — AZERTY matters to Quebeckers (vs the Swiss-French clavier suisse).
- US rising: `monkey type` +800%, `1 minute typing test` +80%, `keyboard test` +80%; games SERP rising includes Poki (game-portal distribution — worth a /lp/ or a games-portal-style section).
- US "learn touch typing" suggest is saturated with **TypingClub** brand strings (`learn touch typing free - typingclub`) — TypingClub owns that phrase; comparisons are the realistic entry.

---

## Competitor verification (live fetches, 21 Nov 2026)

| Site | Status | Title (verbatim) | Verdict |
| --- | --- | --- | --- |
| 10fastfingers.com/de | 200 | "10FastFingers - Tipptest, Wettbewerbe, Übung & Tippspiele" | Confirmed: full German product; defines DE vocabulary |
| 10fastfingers.com/{fr,nl,it,da,sv,ja,ar,pt} | 200 | e.g. FR "Test de frappe, concours, entraînement et jeux de frappe"; IT uses "test di digitazione" | Confirmed localized in all target languages **except Norwegian (/no = 404)** |
| e-typing.ne.jp | 200 | "インターネットでタイピング練習 イータイピング \| e-typing ローマ字タイピング" | Confirmed dominant JP incumbent |
| sushida.net | 200 | "寿司打" | Confirmed (Sushida) |
| keyhero.com | 200 | "Typing Test · Improve your WPM speed", `lang="en"` | **English-only** — not a French local incumbent; deprioritize in FR /lp/ |
| elevspel.se | 200 | "Elevspel • Gratis kunskapsspel för elever" | Confirmed: Swedish school-games portal; appears in `tangentbordsträning` suggests |
| kunskapsstjarnan.se | 200 | (JS shell; site live) | Swedish school-games portal; in suggests |
| skolplus.se | 200 | "Skolplus" | Confirmed; in `tangentbordsträning` suggests |
| typingstudy.com/ar | 200 | "تعلم الكتابة باللمس عبر الإنترنت" | Confirmed Arabic-localized learning site |
| monkeytype.com, keybr.com | 200 | English `lang="en"` only | Confirmed: global, English UI (localized word lists only) |
| ratatype.com | 403 Cloudflare | — | Blocked (same as prior research); verify externally |
| twsoft.com (タイプウェル) | 403 Zscaler | — | Blocked by corporate proxy — verify externally |
| eipass.it | 403 Zscaler | — | Blocked — verify externally before writing ATA content that names it |
| maschineschreiben.de | connection failed | — | Unverified this round (claimed TypingClub DE brand) — verify externally |
| tap-touche.com (Tap'Touche/Druide) | ENOTFOUND | — | Domain not found — verify product status externally before any FR/CA reference |
| dinordbok.no | 200 | "DinOrdbok - Flest Oppslag!" | Dictionary site; `dinordbok skrivetest` searched per suggest; specific page not located — verify path |

## Corrected keyword targets per market (replaces analysis.md bands)

Volume proxy = Trends avg interest (within-set, 5y) and suggest presence/order. Absolute volumes still require GKP validation.

| Market | Primary pages target | Secondary/intent targets | Avoid |
| --- | --- | --- | --- |
| DE | tippen lernen; 10 finger schreiben lernen; tippgeschwindigkeit testen; tipptest; tastaturschreiben lernen | kinder/kostenlos variants; schneller tippen lernen (+50% rising); APM (anschläge pro minute); handy/mobile | schreibgeschwindigkeit (hardware), tippspiel(e) alone, schreibkurs |
| FR | dactylographie (test, cours, exercices); test de frappe clavier; apprendre à taper au clavier | secrétaire médicale; audio dictée; sans accent; azerty; clavier suisse (CH!); certification (breakout) | vitesse de frappe alone (football), jeux de frappe alone (mixed) |
| IT | dattilografia (test, corso); corso dattilografia ATA riconosciuto miur; eipass dattilografia; test di digitazione | certificato dattilografia; simulazione test; risposta multipla; punteggio ATA | test di battitura alone (very low interest) |
| NL | blind typen / leren blind typen; typen leren; typcursus; typtoets | gratis/kind/kinderen variants; oefenen; cursus blind typen | typsnelheid alone (tiny, seasonal) |
| SE | tangentbordsträning; fingersättning tangentbord; skrivhastighet test | barn/spel/nybörjare; skrivtest | blindskrift (Braille), skrivhastighet alone (hardware) |
| DK | maskinskrivning; skrivehastighedstest; skrivetest; lær blindskrift (10 finger system context) | børn; kursus; gratis | fingersætning (instruments) |
| NO | skrivetest; skrivehastighetstest; touch typing (norsk) | jobbintervju; ord i minuttet; nynorsk; engelsk/dansk variants | blindskrift (Braille) |
| JA | タイピング練習; タイピングゲーム; タイピング速度測定; ローマ字入力 練習; タイピング検定 | 小学生; 面接; 寿司打/コロシアム comparisons; 対戦型 (battle games); KPM/秒 metrics; スマホ | — (market is huge; segment coverage matters) |
| AR (AE) | اختبار سرعة الكتابة بالعربي (breakout); تدريب الكتابة على الكيبورد بالعربي; العاب تعليم الكتابة للكيبورد | انجليزي variants; للاطفال | لوحة المفاتيح phrasing in titles (secondary in queries) |
| EN (all) | existing English set; per-geo emphasis: GB→typing speed test; AU→typing games; US→1-minute/keyboard test variants; AE/SG→hiring/live-chat tests | kids/adults free variants; monkeytype brand queries | — |

## Updated content opportunities not in the original plan

1. **Metric localization** — results UI per locale: DE = Anschläge pro Minute (APM), FR = mots/minute + caractères, IT = battute/minuto? (verify alongside "colpi"), JA = KPM + 文字/秒, NL = woorden per minuut. This is a differentiator against English-only tools.
2. **DE/FR/NL kids pages** — kinder/kinderen/enfant segments are large in all three; the existing `/learn/` finger-lessons structure translates well.
3. **IT ATA-certification hub** — `/it/dattilografia/` landing + `/it/blog/` certification-explainer series; free practice test positioned as exam prep (content must not claim MIUR recognition — only explain the ecosystem; EIPASS named only after external verification).
4. **FR accent-free + dictation test features** — `sans accent` and `audio dictée` are product-level differentiators for the French test.
5. **JP romaji mode + battle-game positioning** — multiplayer race = 対戦型タイピングゲーム (rising 1,800%); 小学生 page; kentei-style level explanation.
6. **UAE hiring-test angle** — English content for `live chat typing test`/job-interview typing tests targets the actual UAE money intent without translation.
7. **Swiss pages** — FR `clavier suisse` + DE Switzerland variants (QWERTZ for French-Swiss) — Switzerland is a target country with its own keyboard reality; a `/fr/test-de-frappe-clavier-suisse/` and `/de/tippgeschwindigkeitstest-schweiz/` style page captures it.
8. **Norwegian gap** — 10FastFingers lacks Norwegian; combined with no strong local incumbent, NO is the lowest-competition market on the list.

## Next validation steps (unchanged, plus additions)

- GKP volumes for the corrected target lists (country-filtered), before building any locale.
- External (non-corporate-network) verification of: maschineschreiben.de, twsoft.com/Typewell, eipass.it, Ratatype, Tap'Touche, dinordbok.no skrivetest page, and identification of タイピングコロシアム's domain.
- A live Google SERP check per market for the primary keyword of each market (e.g., from a local VPN or a SERP API) to confirm who actually ranks — the competitor table above proves who *exists*, not who ranks.
