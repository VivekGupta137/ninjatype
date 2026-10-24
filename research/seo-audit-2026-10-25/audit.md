# NinjaType SEO audit

25 October 2026 · `/`, `/multiplayer-typing-race/`, `/ghost-race/`, `/learn/`

The four pages now have distinct search intents, crawlable explanations and FAQs, consistent canonical metadata, and truthful structured data. The generated HTML passes the SEO regression check. Each page scored **100/100 for Lighthouse SEO** in the final local run; mobile lab performance scored **96–98/100** after locally serving the existing fonts.

The changes are in the workspace and built output. They have not been deployed. The live RSS stylesheet still returned 404 during this audit; the new local asset returns 200. Top rankings depend on competition, search intent, content quality, authority, and actual user experience; neither metadata changes nor a Lighthouse score guarantee them.

## Keyword targets

See the [landing-page keyword analysis](../typing-keywords-2026-10-25/landing-page-analysis.md) for comparison settings, saved weekly data, autocomplete evidence, and implemented titles/descriptions.

| Page | Main target | Supporting intent |
| --- | --- | --- |
| `/` | free typing test, online typing practice | WPM, typing speed test, accuracy, history |
| `/multiplayer-typing-race/` | multiplayer typing race, multiplayer typing games | friends, public rooms, timed races, rematches |
| `/ghost-race/` | solo typing game, personal-best WPM challenge | typing practice games, race your shadow |
| `/learn/` | free touch typing lessons, typing lessons for beginners | home row, QWERTY finger placement, finger exercises |

“Typing test” leads the shared worldwide Trends comparison, followed by “typing practice” and “typing games.” The exact multiplayer and solo phrases do not have measured monthly volumes here. “Ghost race” autocomplete was dominated by unrelated entertainment; adding typing and solo-game wording clarifies this page. The recommendations distinguish relative demand from editorial choices rather than inventing monthly search volumes or keyword difficulty.

## Confirmed live issues

Public requests succeeded for the four canonical page destinations, robots.txt, and the sitemap index. The [saved HTTP observations](live-responses.json) and [old metadata](live-metadata-before-deployment.json) capture the deployment before these fixes.

- `https://ninjatype.com/` redirected permanently to `https://www.ninjatype.com/`, which returned 200. Canonicals, site configuration, sitemap references, and schema IDs nevertheless used non-www. Learn also used `/learn` without the final slash.
- Homepage H1 was only “Ninja Type.” Learn had two H1s: the logo and “Make yourself at home.” Ghost Race's heading did not identify typing.
- The homepage emitted two WebApplication definitions. Shared schemas advertised unsupported ratings with inconsistent counts and stale application versions/theme counts.
- Homepage and Learn FAQs depended on a client modal rather than providing all answers in the initial page HTML. Several claims overstated mobile support, privacy, learning timelines, and actual lesson options.
- The feed requested `/rss/styles.xsl`, which did not exist. The reported `https://ninjatype.pages.dev/rss/styles.xsl` returned 404; the feed itself returned 200.
- Google Fonts stylesheets blocked rendering, including a large Bagel Fat One stylesheet and unused Material Icons request. Nunito also had duplicate stylesheet/preload markup.
- The additional post-build HTML minifier damaged React hydration. Initial local Lighthouse runs logged React error 418; these errors disappeared after retaining Astro's native HTML minification and disabling the extra step.
- The Cloudflare Pages `_headers` file used escaped wildcards and unindented header declarations, so the intended rules did not have the documented syntax.

## Implemented fixes

### Metadata, crawling, and indexing

- Set `Astro.site` to `https://www.ninjatype.com` and `trailingSlash` to `always`.
- Normalize canonical page URLs, strip query strings/fragments, and align Open Graph/Twitter page URLs. Invitation links retain their application behavior while canonicalizing to the base race page.
- Give each page a unique, descriptive title and description reflecting its task. Actual built titles are 51–56 characters and descriptions 149–157 characters; these are editorial lengths, not Google ranking rules or guaranteed snippet lengths.
- Keep robots index/follow on the four pages, point robots.txt to the www sitemap, and disallow non-content `/api/` endpoints with an explicit `/api/words/` exception so dictionary resources remain available to search renderers.
- Verify all four canonical URLs appear in the generated sitemap. Deprecated `/online/` and `/multiplayer/` redirect pages remain excluded.
- Use one descriptive H1 per page; the shared brand logo is a span. Learn's finger-lesson canonicals and lesson links also use trailing slashes.
- Add contextual links between the four app pages, preserving their distinct purposes and the multiplayer setup guide.
- Remove the generic meta-keywords tag. Google does not use it for ranking.

### Content and structured data

- Render homepage and Learn FAQs with native Astro disclosures so questions and full answers are present without client hydration. Added concise static practice instructions below the main app experience.
- Clarify Ghost Race as average-WPM projection from the fastest valid saved attempt, not exact keystroke replay or a live rival.
- Correct multiplayer Words/Time race-ending explanations and describe the actual four paired-finger lessons. Remove unsupported improvement promises, ratings, theme counts, and “no tracking” claims.
- Emit one page-specific WebApplication, WebPage, WebSite, Organization, and FAQPage graph on each audited page. Application features and URLs match that page, and version comes from package.json.
- Remove build-time `dateModified` on Learn: rebuilding is not evidence of editorial revision.
- Retain schema.org FAQPage semantics with matching visible answers. **Google removed FAQ rich results in 2026**; this markup is not represented as a rich-result or ranking boost.
- Do not fabricate ratings to qualify for software-app rich results. Truthful schema can be valid without meeting every Google rich-result feature's eligibility requirements.

### Social previews, RSS, and delivery

- Keep absolute social image URLs, alt text, and large-image Twitter cards. Declare the actual 1200×630 PNG dimensions/type and verify the image file.
- Fix the missing Microsoft tile icon path and duplicate unconditional theme-color metadata.
- Add `public/rss/styles.xsl`. XML parsing and an actual `xsltproc` transformation succeeded; the local preview returns 200. Feed URLs use www and consistent page paths.
- Serve the existing Latin Bagel Fat One and Nunito WOFF2 fonts locally, with `font-display: swap` and a preload for the logo font. Preserve the original fonts and include their SIL Open Font licenses. Remove external render-blocking font stylesheets and the unused Material Icons load.
- Correct Cloudflare header syntax, add immutable caching for hashed `/_astro/*` assets and local fonts, fix the manifest path, and declare the RSS stylesheet MIME type. Ensure the preserved CSP allows the app's existing Iconify endpoints and Partytown blob worker.
- Update Lighthouse's page list to include both race pages and use a dedicated preview port. This audit ran locally and did not upload reports to Lighthouse temporary public storage.

### Accessibility checks

- Add accessible names to the main typing input and the increase/decrease test-length buttons.
- Give the Learn progress illustration a role that supports its accessible label.
- Keep semantic headings, accessible disclosure controls, image alternatives, the English document language, and the skip-to-content link.

## Verification

- `npx astro check`: **0 errors, 0 warnings**, 56 hints at the final source check. Hints are mostly existing unused imports/suggestions.
- `npm run build`: successful. Other guide work was being edited concurrently, so verification used an isolated copy of the completed static build to avoid output-directory collisions.
- `node scripts/check-seo.mjs /tmp/ninjatype-seo-dist`: passed for all four pages. Use `npm run build` then `npm run check:seo` for the normal project output.
- Regression coverage: unique metadata; one descriptive H1; canonical/OG/Twitter consistency; valid and non-duplicated page schemas; no unsupported ratings; complete FAQ answers outside script tags; local internal link resolution; sitemap inclusion/exclusions; robots sitemap; image dimensions; local font assets; RSS stylesheet existence/reference.
- Parsed RSS, stylesheet, sitemap, and sitemap index as XML. Transformed the feed with `xsltproc`; the expected title and items rendered. Local stylesheet HTTP response: **200**.
- `git diff --check`: passed for the workspace at verification.

### Lighthouse mobile lab results

One cold-browser run per page, Chromium headless, default Lighthouse simulated mobile throttling, static preview from an isolated build. These are **lab measurements**, not live CrUX/Search Console Core Web Vitals. Raw local reports are in `/tmp/ninjatype-seo-lighthouse-final/`; a compact [result and failure summary](lighthouse-summary.json) is included here.

| Page | SEO | Performance | Accessibility | Best practices | FCP | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 100 | 96 | 96 | 79 | 1.65 s | 1.95 s | 0.093 | 8 ms |
| `/multiplayer-typing-race/` | 100 | 96 | 97 | 79 | 1.95 s | 2.40 s | 0.047 | 2 ms |
| `/ghost-race/` | 100 | 98 | 97 | 82 | 1.80 s | 2.10 s | 0.000 | 0 ms |
| `/learn/` | 100 | 98 | 96 | 82 | 1.82 s | 2.13 s | 0.000 | 0 ms |

The first SEO build still using Google-hosted fonts scored 71/85/85/86 for performance, with LCP 4.66/3.60/3.42/3.39 s respectively. The revised local-font build was faster in this environment; single runs are not a controlled statistical benchmark. Final runs contained no React hydration errors.

## Remaining actions, in priority order

1. **Deploy and inspect the public output.** Confirm the www canonicals, no redirect loops, all four sitemap entries, RSS stylesheet 200, font caching, and applied Cloudflare headers. Verify `/online/` redirects to Ghost Race with invitation/query behavior intact. The Cloudflare dashboard may separately control redirects or security policy.
2. **Search Console:** inspect/request indexing for the four www canonical pages, submit the sitemap, review Google's selected canonical and indexing exclusions, and check whether the pages.dev alias is indexed. If duplicate hosting persists, configure the alias redirect deliberately. No Search Console account was accessed in this task.
3. **Measure actual field performance:** assess LCP, INP, and CLS at the 75th percentile using CrUX/Search Console. TBT is a lab diagnostic and does not replace INP. Monitor the homepage's near-threshold lab CLS across repeated tests and returning-user settings. Shared CSS/JavaScript remain substantial and are candidates for a separate bundle audit.
4. **Contrast:** Lighthouse still flags the dim footer version on the default AMOLED theme and inactive homepage mode labels. Accessibility is 96–97 rather than 100; review readable muted text across all supported themes before a broad color change.
5. **Best-practice diagnostics:** the static preview does not run Cloudflare Functions or the multiplayer Worker, so `/api/words/1k` and `/api/multiplayer/config` return local 404s. Verify these through the deployed runtime; the local response is not proof of a production failure. Remaining diagnostics include the analytics/Partytown FencedFrame deprecation and missing source-map warnings. See the saved failure summary for exact observations.
6. **Content and authority:** maintain useful, distinct training guides and contextual app links. Evaluate query impressions, clicks, CTR, and average position by page after indexing. Use measured demand and intent to revise titles; avoid thin synonym pages and unsupported “best typing site” claims. Search volume/difficulty estimates require a suitable additional dataset.

No monthly traffic projections, current Google positions, backlink counts, Search Console indexing state, or live Core Web Vitals were fabricated.

## Official guidance

- [Google: consolidate duplicate URLs and canonicals](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google: title links](https://developers.google.com/search/docs/appearance/title-link)
- [Google: structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Google: Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals)
- [Google: removal of FAQ rich results](https://developers.google.com/search/updates#removing-faq-rich-result)
- [Google: meta-keywords are not used for ranking](https://developers.google.com/search/blog/2009/09/google-does-not-use-keywords-meta-tag)
- [Cloudflare Pages: custom headers](https://developers.cloudflare.com/pages/configuration/headers/)
