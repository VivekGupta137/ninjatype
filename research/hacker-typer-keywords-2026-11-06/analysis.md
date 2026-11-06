# Hacker Typer / Geek Typer keyword cluster research

Research date: 6 November 2026 (live web collection). Audience: global, English search terms.
Scope: the fake-hacking / simulator keyword cluster that feeds `/hacker-typer/` and its guides —
hacker typer, hackertyper, geek typer, geektyper, hacker simulator, fake hacker screen,
fake coding (screen), hacker prank, fake hacking, and adjacent long-tails.

Builds on `research/typing-keywords-2026-10-25/` (which measured hacker typer = 59 in its own
comparison) and `research/typing-keywords-2026-10-26/targeted-keyword-map.md`.

## What was actually collected (all live, 6 Nov 2026)

| Source | Method | Result |
| --- | --- | --- |
| Google autocomplete | 46 English prefixes via suggest API, en-US | 339 unique suggestions → `evidence/autocomplete.json` |
| Google SERPs (en, gl=us, pws=0) | Real Chrome via CDP for 6 queries | top-10 organic with domains → `evidence/google-serp-extra.json` |
| Bing SERPs | Direct HTML for "hacker typer" (2 clean captures); all scripted bulk attempts served degenerate junk and were discarded → `evidence/bing-clean-serps.json` |
| Google Trends | explore + multiline widget endpoints fetched inside the live Trends page | 4 comparisons → `evidence/trends-browser.json` |
| Competitor pages | Direct fetch: title/description/H1 for 7 of 11 targets (pranx.com, geekprank.com, hackingames.com and ninjatype.com 403'd at the edge) → `evidence/competitors.json` |

Not obtained: Trends related-queries panels (Google soft-limited the related-queries widget after
several explore calls) and Bing bulk SERPs. Autocomplete covers query wording instead. No paid
keyword-volume data, no Search Console data, no difficulty scores.

## Trends findings

All values are relative indices within a single comparison — never rank numbers across comparisons.

| Comparison (worldwide, web) | Terms and 12-month averages |
| --- | --- |
| cluster-12m | hacker typer **62**, geektyper **13**, hackertyper **10**, geek typer **4**, fake hacker screen **2** |
| context-12m | hacker typer **62**, hacker simulator **26**, code typer **3**, fake coding screen **1**, matrix code typing **0** |
| prank-12m | hacker prank **70**, fake hacking **49**, fake coding **48**, fake hacker screen **8**, typing prank **3** |
| cluster-5y | hacker typer **47**, hackertyper **8**, geek typer **3** (262 weekly points, Oct 2021 → Nov 2026) |

1. **"hacker typer" is the only high-volume head term.** It is ~5× geektyper and ~26× fake
   hacker screen in the same comparison. The other terms are modifiers, not pillars.
2. **The prank cluster is bigger than the brand cluster.** In the prank comparison, hacker prank
   (70), fake hacking (49) and fake coding (48) all sit near the head term's own level. These are
   intent words, not brand words — exactly what `/blog/hacking-prank-fake-hacking/` and
   `/blog/fake-hacker-screen/` target.
3. **"hacker simulator" (26) is the second-strongest adjacent term** and the guide's title already
   says "Simulator". "code typer" is mixed-intent (dominated by CodeTyper brands) — do not chase.
4. **"geektyper" (13) beats "geek typer" (4).** Searchers type the brand concatenated. All
   geek-typer copy should read "GeekTyper" and use the concatenated form in FAQ/anchors.
5. **Long-term decline, evergreen floor.** hacker typer averaged 72 in 2022, 62 in 2023, 33 in
   2024, 36 in 2025, 27 in 2026 so far. Interest fell after the 2022 spike but holds a stable
   baseline — it is not a dead fad.
6. **Reliable October–November surge.** On the 5-year scale, October averaged 56.6 and November
   55.4 versus 31.8–38.3 in June–August — a Halloween-and-back-to-school seasonality that repeats
   every year (October average was 57 in all six years). Refresh the cluster's pages every
   September; expect the best external-linking window in October.

## Google SERP findings (en-US, 6 Nov 2026)

| Query | Our rank | Top competitors |
| --- | --- | --- |
| hacker typer | **#7** | hackertyper.net, hackertyper.com, App Store, Play Store, whitescreen.online, geekprank.com |
| hacker typer simulator | **#4** | hackertyper.net, Play Store, geekprank.com, whitescreen.online |
| fake coding screen | **#5** | hackertyper.net, screenbg.com, whitescreen.online, codepen.io |
| fake hacker screen | absent | hackertyper.net, whitescreen.online, hackertyping.com, YouTube, ghostscreen.app, pranx.com |
| geektyper | absent | geektyper.com, Play Store, APK mirrors, Facebook (only 4 organic results — thin tail) |
| code typer | absent | thecodetyper.com, codetyper.in, hackertyper.net, programmer-practice tools |

Bing's clean capture for "hacker typer" ranked our app page tenth; Google ranks the
**blog guide** seventh — both exist, so both surfaces are visible.

- The ranking URLs are `/blog/hacker-typer-guide/` and `/blog/fake-hacker-screen/`, not the app
  page. The app page should funnel to the guides (it already links; keep anchors keyword-specific).
- New mid-tier competitors beyond the 2026-10-25 review: whitescreen.online / whitescreen.digital,
  hackertyping.com, screenbg.com, ghostscreen.app, vinish.dev, hackertyper.app. None has domain
  authority that the SERP layout suggests is unassailable; most are thin single-purpose tools.
- "fake hacker screen" includes YouTube green-screen videos at #4 — video intent exists; a static
  site cannot chase it, but the blog post can embed/link its own demo.
- The "geektyper" SERP is brand-owned with a thin, spammy tail (APK mirrors, ebook spam) — an
  accurate, honest comparison page is the only realistic entry, which is what the plan already
  chose.

## Autocomplete intent map (339 suggestions, evidence file)

- **hacker typer …**: simulator, 2, screen, game, app, prank, access granted, controls, commands,
  fake coding, vscode — support intent dominates; the guide already covers controls/access screens.
- **geektyper …**: app, nasa, official, apk, facebook, download — pure brand/app intent;
  "geektyper nasa" refers to a GeekTyper theme. No article angle beyond the comparison.
- **hackertyper …**: "hackertyper.net reddit", auto, cli, shortcuts, fullscreen — support intent;
  the guide's controls section can serve it.
- **fake coding screen …**: python, auto, video, online, vs code, prank, app, website, javascript —
  concrete content checklist for the fake-hacker-screen post (language variants, auto-type,
  video capture, VS Code look).
- **fake hacker …**: website troll, games, typer, typing screen, app, code, terminal, website free —
  troll/prank framing words worth using in the hacking-prank post.
- **hacker prank …**: simulator, for friends, video, cmd, code free, real, call — the prank page
  can answer "how do I prank my friends" directly.
- **hacker typer down-load / app**: download apk, app download, mobile apk — answer with
  "no app needed, runs in the browser" FAQ (we have no app; do not imply one).

## Competitor snapshot (evidence/competitors.json)

- hackertyper.net — "The original… since 2011", minimal page, title is just "Hacker Typer".
- hackertyper.com — heavier content page, "How To Use" H1, positions itself as prank tool.
- geektyper.com — "HACK LIKE A PROGRAMMER IN MOVIES AND GAMES!", themes with hotkeys.
- hackertyper.app — self-branded "2.0", "6 languages" angle.
- vinish.dev and ghostscreen.app — newer content-style landing pages (269 KB and 116 KB HTML).
- fakeupdate.net — adjacent prank screen (Windows updates), not a typing tool.

## Recommendations (ranked)

1. **Defend and push "hacker typer" (already #7 / #4).** Refresh `/blog/hacker-typer-guide/`
   (controls, access-granted/denied, shortcuts, FAQ using autocomplete wording), keep the app page
   interlinked with exact anchors. Top-5 on Google is realistic; page-one Bing too.
2. **Cover the prank cluster inside existing pages, not new pages.** hacker prank / fake hacking /
   fake coding are high-demand intent words already assigned to two posts — weave them into H1-adjacent
   copy and FAQs and verify positions in Search Console after the next cycle.
3. **Expand `/blog/fake-hacker-screen/` with the autocomplete checklist**: Python / VS Code /
   JavaScript variants, auto-type, video capture, "fake hacker terminal", "fake hacker website
   troll". It already ranks #5 for fake coding screen and is the natural vehicle.
4. **Unify the GeekTyper spelling to "GeekTyper"** and prefer the concatenated form in copy and
   anchors. Three pages currently share the intent (vs-hacker-typer, vs-ninjatype, alternative) —
   check Search Console for query cannibalization; keep the comparison page as head target and keep
   the alternative page on "alternatives" intent only.
5. **Add a short "hacker simulator" section/FAQ** to the guide (26 avg) without promising game
   features other simulators have (pranx/geektyper-style desktop pranks).
6. **September refresh ritual**: the cluster spikes every October–November; update posts, verify
   schema and internal links before late September.
7. **Skip**: code typer (brand-owned, mixed intent), matrix code typing (≈0), typing prank (off
   product), hacker typer 2 / app / apk (we ship no app).

## Measurement limits

- Trends values are relative indices normalized per comparison; cross-comparison ranking is invalid.
  "fake hacker screen" reads 2 in cluster-12m and 8 in prank-12m for this reason.
- Autocomplete order is not volume rank and reflects en-US personalization-free suggestions only.
- Google SERPs were captured with pws=0, gl=us, but positions vary by day, country and
  personalization; treat ranks as directional.
- Bing bulk collection failed (degenerate bot-walled SERPs); only one clean Bing capture is saved.
- No keyword volumes, CPC, or difficulty metrics were used. All priority calls are editorial
  judgments from the evidence above.
