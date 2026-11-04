# NinjaType visibility and returning-user improvement plan

Created: 2026-11-03
Status: Partially implemented — post-test guidance, continuation, and daily practice approved by the user. Other phases still require approval.

## Pending-practice flame reminder

- The navbar flame uses the theme’s danger color with an 18% soft fill and a subtle flicker while today’s practice is pending, even when a prior streak is already active.
- Completion immediately removes the animation and soft fill, restoring the ordinary icon; the day count and tooltip are unchanged. The existing local-midnight progress refresh re-enables the reminder the next day.
- Reduced motion keeps the pending color but disables animation. Browser checks confirmed pending → completed styling, reduced-motion behavior, and the completed state after reload.

## Completion celebrations — current behavior

- First completed practice of the local day triggers confetti and “+1 added to your daily streak”, including a first lesson completion.
- A strictly higher saved all-time WPM across tests/races triggers “New personal best!” with congratulations and the previous/new speeds. This matches the existing Ghost Race best-pace benchmark; it is not a per-dictionary or per-mode record. First-ever scores establish a baseline, and ties do not break records.
- Daily and record achievements from one result combine into one notice and burst. The shared completion path covers solo, Ghost Race, multiplayer friend rooms, and quick races. Spectators and incomplete/invalid results do not publish scored sessions.
- Global UI is non-modal and does not take focus: 44 non-interactive confetti pieces finish within 3.3 seconds; the notice expires after 8 seconds, pauses on hover/focus, and supports close, Escape, navigation, or new typing. Reduced motion suppresses the animation, not the message. A persistent polite live region announces achievements.
- History loading/migration does not replay notices. Repeated session IDs are ignored, and the retained personal-best session prevents false records after history trimming. Ghost Race continues to use that retained best as its shadow. Cross-tab history updates synchronize without publishing celebrations.
- Browser smoke tests covered combined solo achievements, record-only reduced-motion output, 390px sizing, dismissal, Ghost Race completion, reload without replay, and quick multiplayer completion. Test runs used local fixture history and accelerated/synthetic input, not performance benchmarks.
- Final validation: 124 source tests passed; multiplayer checks passed (66 tests plus Cloudflare runtime checks); Astro check reported zero errors/warnings; build and SEO checks passed. README updated. No deployment or commit performed.

## Two-row navigation — current layout

- Top row: logo, subtle separator, and inline practice streak on the left; History and Settings on the right. The streak is no longer fixed to the screen corner, and its tooltip remains available.
- Second row: labeled Practice, Learn, Typing race, Ghost race, Blog, and Hacker Typer links. They stay on one horizontally scrollable line on narrow screens instead of wrapping.
- Kept existing active states, theme styling, and typing-focus behavior. All navigation labels remain visible; compact utility links omit their icons rather than their names.
- Direct navigation reveals the active tool horizontally without moving the page vertically; native Tab focus also exposes off-screen links.
- Browser checks covered desktop, 768px, 390px, and 320px layouts, touch scrolling without page overflow, keyboard navigation, active Blog positioning, and the inline streak tooltip within the mobile viewport.
- Validation: 105 source tests passed; Astro check reported zero errors/warnings; production build and SEO checks passed. Not deployed.

## Automatic daily practice streak — current behavior

The user requested removing the separate daily challenge while retaining the streak. This supersedes all challenge-specific behavior in the historical implementation notes below.

- Removed the challenge start/retry/leave controls, rotating prompts, opt-in state, result completion label, and challenge-only tests.
- Per the follow-up request, also removed “resume last test”. The homepage keeps a quiet “last attempt · N wpm” readout with optional details, including legacy saved attempts without exact settings.
- Any completed, scored time/word/quote test, Ghost Race, or multiplayer race credits its local completion date automatically. No one-minute/dictionary restriction. Visits, unfinished attempts, invalid scores, and simulator activity do not count.
- Completed finger lessons also credit the streak, without adding lesson scores to solo/race history. No lesson mastery requirement beyond a valid completed attempt with some correct output.
- The existing flame counter and tooltip now describe a practice streak. One credit per local day; yesterday’s streak remains active through today, and a fully missed day resets the count.
- Existing ordinary history is backfilled, legacy challenge dates and the compact date ledger are preserved, and clearing history clears the streak.
- Retained exact-setting comparisons and evidence-based post-test recommendations, without a homepage resume action.

Validation for this revision: 102 source tests passed, including automatic credit, same-day deduplication, legacy migration, ledger retention/clearing, and completed-versus-started lesson behavior. Calendar tests also passed in America/New_York. Astro check reported zero errors/warnings; build and SEO checks passed. Browser verification on a clean local origin confirmed 0-day → 1-day credit from a normal 25-second test, no challenge or resume controls, previous WPM after retry/reload, and no horizontal overflow at 390px. Not deployed.

## Minimalist UI and streak revision — 2026-11-04

The user requested a quieter interface and an actual daily streak after reviewing the first implementation.

- Replaced prominent cards, headings, filled CTAs, and always-visible explanation paragraphs with compact inline resume/daily controls and a one-line post-test recommendation.
- Moved explanations and comparison details behind keyboard-accessible info disclosures; Escape closes them.
- Added a theme-aware outline flame and real `N day` count in the top-right corner of pages using the shared header. No badge background or animation. The counter now uses the app’s HeroUI tooltip on hover or keyboard focus to explain today’s completion and streak rules; Escape dismisses it. Keyboard focus, tooltip placement, and Escape dismissal were verified in the browser.
- Streaks count consecutive completed local calendar days. Today's completion extends yesterday's streak; before today's completion, yesterday's count remains active. Missing a whole day resets the count, not saved results. Replays do not increment it.
- Added a compact date ledger alongside history so trimming detailed sessions cannot erase a streak. Existing daily completions are merged into the ledger; clearing history clears both.
- Daily date refresh happens at local midnight and when returning to a suspended tab. Tests cover date boundaries, daylight-saving dates, grace through today, gaps, duplicates, malformed dates, history trimming, and clearing.

This revision supersedes the initial card layout and seven-day-count-only presentation below. The release remains 3.1.0; retention impact is still unmeasured.

Final validation: `bun test src` passed (108 tests); `bun run check` reported zero errors and warnings (54 existing hints); `bun run build` and `bun run check:seo` passed. Calendar/persistence tests also passed with `TZ=America/New_York`, covering spring and autumn daylight-saving dates. Browser checks verified the compact desktop and 390px mobile layouts, top-right streak display, hidden details, Escape dismissal, ordinary test completion, and native Tab navigation. No deployment or git commit was performed.

## Implementation update — 2026-11-04

Implemented Phase 2's core product flow and selected Phase 3 Option A (daily practice), rather than recurring friend races:

- Post-test recommendation based on repeated per-key errors (at least five observations and two errors), an accuracy-practice suggestion, or Ghost Race. Attempts shorter than ten seconds suggest a longer baseline.
- Last ordinary solo test settings, WPM/accuracy, and up to five matching prior tests shown on return. New optional history metadata captures exact settings without guessing legacy test lengths or changing appearance preferences.
- Explicit one-minute, 1K Common daily challenge with three rotating practice cues and fresh passages. First completion today and distinct completed days in the last seven local calendar days are derived from existing history.
- Daily opt-in is in memory only. Full completion with correct output is required; aborted tests, ordinary retries, and settings changes cannot inherit credit. Date freezes at the first keystroke. Clearing history also clears daily records.
- Native Tab navigation preserved on results; Enter retry and focused control actions remain available. Theme-aware cards fit desktop and mobile layouts.
- Logic is separated into `src/lib/practiceJourney.ts`, `src/hooks/usePracticeJourney.ts`, and `src/store/dailyPractice.ts`, with presentational components for results and the homepage.

Validation: 100 source tests passed, including recommendation, legacy metadata, matching-settings comparison, calendar boundary, retry deduplication, and settings-reset cases. Browser checks covered a full daily timer, an ordinary word test, persisted completion on reload, settings-change cancellation, exact continuation, result Tab navigation, and 390px layout. Astro check and production build passed during implementation; final checks are recorded below.

Not yet done: acquisition/retention baselines, analytics event instrumentation, a controlled retention experiment, optional user-selected goals, recurring friend-race enhancements, SEO/distribution phases, or deployment. No retention lift has been measured. Legacy sessions remain in History but do not receive invented settings for continuation.


## Objective

Attract more visitors who want ongoing typing practice, help them complete a useful first session, and give them a specific reason to return.

Improve qualified acquisition and meaningful retention together. Do not optimize returning-user percentage in isolation: an influx of new visitors can lower that percentage even when the number of returning users grows.

## Evidence and limitations

The user supplied a Google Search Console query report. Its date range, filters, and comparison period have not been provided. Selected rows, interpreted as clicks, impressions, CTR, and average position:

| Query | Clicks | Impressions | CTR | Average position |
| --- | ---: | ---: | ---: | ---: |
| ninja type | 712 | 1,586 | 44.9% | 1.4 |
| typing ninja | 253 | 4,825 | 5.2% | 4.0 |
| ninjatype | 186 | 307 | 60.6% | 1.1 |
| hacker typer | 174 | 6,828 | 2.5% | 9.2 |
| ninja typing | 171 | 705 | 24.3% | 2.0 |
| geektyper | 15 | 777 | 1.9% | 4.6 |
| typing test | 1 | 99 | 1% | 12.1 |

Interpretation:

- NinjaType-related searches already generate meaningful clicks. Hacker Typer has more impressions than these individual queries, but not the most clicks.
- Not every “ninja” query is branded intent. References to Keyboard Ninja, TypingClub, and ninja-versus-zombies games suggest some visitors may expect a different product.
- Hacker Typer and prank visitors may successfully finish their task in a single visit. Their retention expectations should differ from those of deliberate typing learners.
- Generic practice and learning queries contribute relatively few clicks in the supplied report.
- Search Console measures search acquisition, not new-versus-returning users or cohort retention. These observations are hypotheses, not proof of why users leave.

## Priorities

1. Measure first-test completion and improve the post-test recommendation and continuation experience.
2. Grow acquisition around lessons, accuracy, and multiplayer, rather than relying on hacking queries or ambiguous “ninja” searches.
3. Test one repeat-use mechanism: a daily practice challenge or recurring friend races.

NinjaType already has history, lessons, Ghost Race, and multiplayer. Connect and improve these before adding unrelated modes or requiring accounts.

## Phase 1 — Establish the baseline and find friction

### Measurement

- [ ] Obtain the GSC date range and filters, plus two comparable analytics periods.
- [ ] Clarify whether “fewer returning users” means a lower count, lower percentage, or worse same-age cohort retention.
- [ ] Audit existing analytics before introducing new instrumentation.
- [ ] Define and validate events for landing, test start, test completion, recommended-action selection, lesson completion, and race completion where applicable.
- [ ] Track the funnel: landing → test started → test completed → next exercise started → meaningful return.
- [ ] Define a meaningful return as completing a test, lesson, or race on a later day, not just opening a page.
- [ ] Define a seven-day return window explicitly, such as at least one meaningful return on days 1–7 after the first visit. Do not mix this with exact-day-7 retention.
- [ ] Segment by first landing page, device, acquisition source, and first-session test completion.
- [ ] Compare only cohorts old enough to complete the selected return window.
- [ ] Check consent, cookie/storage loss, browser/device changes, and analytics configuration as possible measurement explanations. Avoid fingerprinting or collecting typed content for this analysis.

Do not assume individual GSC search queries can be joined to analytics users. Use query clusters for acquisition analysis and landing-page cohorts for retention analysis.

### First-session usability

- [ ] Test keyboard focus, first-keystroke behavior, settings clarity, and result readability on desktop and mobile.
- [ ] Identify start-to-completion drop-offs and technical failures.
- [ ] Check whether the first screen clearly communicates the product and the next action.

### Diagnostic rules

| Observation | Investigate first |
| --- | --- |
| Few test starts | Intent mismatch, unclear entry point, interaction problems |
| Many starts but few completions | Usability, test friction, technical failures |
| Many completions but few follow-up exercises | Weak recommendation or unclear next-step value |
| Strong first-session engagement but poor later returns | Continuity, progress visibility, recurring value |

**Completion criteria:** a documented baseline, verified funnel events, and a prioritized list of observed friction. Set numerical experiment targets after establishing the baseline, not arbitrarily beforehand.

## Phase 2 — Connect the practice loop

Target flow:

**First test → useful feedback → specific exercise → visible progress → reason to return.**

### Actionable results

- [x] Review what the existing result screen and key analytics already support.
- [x] Show one primary next action appropriate to the result, with alternatives available but secondary.
- [x] Recommend a relevant finger lesson only when recorded errors support that recommendation.
- [x] Consider controlled practice for repeated errors, Ghost Race for a pacing challenge, and multiplayer for users seeking competition.
- [x] Explain the recommendation briefly and avoid presenting one short test as a definitive skill diagnosis.
- [ ] Measure recommendation selection and subsequent exercise completion, not clicks alone.

### Returning-user continuation

- [x] Audit how prominently saved history and previous settings are currently surfaced.
- [x] For browsers with captured test settings, show previous settings, recent comparable results, and a “Continue practice” action.
- [ ] Consider an optional user-selected practice goal.
- [x] Keep a clear first-use state for visitors without history.
- [x] Explain that history is saved in the current browser and may not persist across devices or cleared storage.
- [x] Defer account-based sync unless cross-device continuity becomes a demonstrated need; keep initial practice available without signup.

**Completion criteria:** users can identify one useful next step after a test and continue a previous practice setup on return. Verify that changes do not harm first-test completion or accessibility.

## Phase 3 — Test one repeat-use mechanism

Select one experiment after reviewing the baseline. Do not launch both simultaneously unless measurement can distinguish their effects.

### Option A: Short daily practice challenge

- [x] Offer a manageable duration and one clear focus, such as accuracy or punctuation.
- [x] Save completion and show meaningful progress using comparable exercises/settings.
- [x] Clearly distinguish a daily exercise from existing ordinary practice.
- [x] Make the exercise itself valuable rather than relying on a streak counter.
- [x] Allow missed days without punitive progress loss.
- [ ] Measure challenge completion and meaningful return against an appropriate baseline or control.

### Option B: Recurring friend races

- [ ] Audit existing invitation, rematch, and settings-reuse flows before adding anything.
- [ ] Reduce friction in sharing invitations and joining rooms.
- [ ] Make rematching and reusing preferred settings straightforward.
- [ ] Give a group a clear next-round action after results.
- [ ] Test a repeatable group routine, such as a weekly race.
- [ ] Measure completed races, repeat participation, and invitation-to-race completion.

**Completion criteria:** retain, revise, or remove the experiment based on mature cohorts and adequate sample size. A four-week schedule may not generate enough evidence for a firm retention conclusion.

## Phase 4 — Improve qualified search visibility

### Intent-to-destination map

| Search intent | Destination | Rationale |
| --- | --- | --- |
| Practise with friends | `/multiplayer-typing-race/` and relevant guides | Social reason to return |
| Improve accuracy | Accuracy guide → relevant practice | Recurring learning need |
| Learn touch typing | `/learn/` and beginner guides | Multi-session progression |
| Beat a previous score | `/ghost-race/` and pacing guides | Visible personal challenge |
| Free typing test | `/` | Core acquisition, competitive search space |
| Fake hacking screen | `/hacker-typer/` and simulator guides | Separate entertainment intent |

### Strengthen existing pages first

- [ ] Review GSC query-to-page mappings and intent fit before creating additional articles.
- [ ] Improve existing guides with useful answers or exercises near the top, original product examples, and screenshots where helpful.
- [ ] Use descriptive titles and meta descriptions that match the actual product.
- [ ] Connect guides to relevant exercises rather than sending every CTA to an unconfigured homepage.
- [ ] Where practical, support links opening suitable practice settings; show the settings and allow users to change them.
- [ ] Strengthen internal paths such as weak-finger guide → finger lesson → fresh passage → progress review.
- [ ] Clarify that NinjaType offers typing tests, finger lessons, and races; do not imply an unrelated ninja-themed arcade game.
- [ ] Keep the homepage as the core typing-practice destination and use supporting articles for distinct informational intent. Review overlap before adding more keyword-targeted content.
- [ ] Investigate which pages receive unusual “empty star congratulations…” queries. Correct confusing or repeated indexed UI text without stripping useful accessibility labels.
- [ ] Validate canonical URLs, indexability, sitemap inclusion, internal links, and rendered content after changes.

The recently added GeekTyper comparison and “typing ninja” article support discovery. They are not, by themselves, retention interventions.

Keep Hacker Typer useful for its own audience. An optional link to test real typing speed is reasonable; do not force simulator visitors through lessons or signup.

## Phase 5 — Add repeat-friendly distribution

Choose one channel initially so its contribution can be evaluated.

- [ ] Shareable friend-race invitations leading directly to the relevant experience.
- [ ] Optional result cards linking to an appropriate challenge, without exposing private information.
- [ ] Simple, reusable practice plans for teachers, tutors, or study groups.
- [ ] Useful product demonstrations in typing/productivity communities where promotion is permitted.
- [ ] Measure first-session completion and later meaningful returns by channel, not traffic alone.

## Suggested four-week sequence

| Week | Focus | Primary measure |
| --- | --- | --- |
| 1 | Baseline, landing-page/device cohorts, usability and funnel audit | First-test completion rate |
| 2 | Results and recommended next exercise | Follow-up exercise starts and completions |
| 3 | Returning-user continuation; launch one repeat-use experiment if ready | Meaningful seven-day return rate once cohorts mature |
| 4 | Improve high-fit search pages and test one distribution channel | Qualified visits and retained users |

SEO and retention effects can take longer than this sequence to evaluate. Avoid attributing all changes to an experiment when traffic mix or other releases changed at the same time.

## Scorecard

Report absolute counts alongside rates and use consistent definitions and date ranges.

- Qualified organic visits: operationally track organic landing cohorts and their meaningful practice actions, not impressions alone.
- First-test activation: visitors completing a first test / eligible first-time visitors in the relevant cohort.
- Test completion: completed tests / started tests, with a consistent deduplication definition.
- Follow-up practice: first-test completers starting and completing another exercise.
- Meaningful seven-day return: eligible first-visit users completing a practice action on days 1–7 / first-visit users with a full observation window.
- Absolute meaningful returning users.
- Guardrails: errors, load/interaction performance, accessibility, first-test completion, and privacy.

Do not use overall returning-user percentage, raw page views, or the best WPM as the sole success measure.

## Approval and execution

- [ ] Review and approve the phase to implement before changing application behavior.
- [ ] Follow `plan/plan-execution-process.md` during execution.
- [ ] Keep business logic in hooks and presentation in components, consistent with project conventions.
- [ ] Validate each approved change and document results and limitations.
- [ ] Mark completed actions in this plan; do not mark planned or merely shipped experiments as proven improvements.
- [ ] Follow the project process for README and version updates when executing the approved work.
