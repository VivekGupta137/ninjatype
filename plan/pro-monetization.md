# NinjaType Pro monetization plan

Date: 2026-11-11  
Status: Pro remains proposed; free key-pair instrumentation implemented 2026-11-27 (no account or billing changes). Error-type and key-pair panels were subsequently removed from history/results at user request; local measurements remain compatible.

## Recommendation

Keep NinjaType's existing typing tools free. Sell **NinjaType Pro: a personal typing training program that adapts to your weak spots and follows you across devices.**

The primary customer is someone who already practises regularly and wants to improve: a student, professional, or programmer who has reached a plateau. Casual visitors still get a complete free experience and can become repeat users before considering Pro.

The recurring value must come from updated training and useful progress reviews. Cloud storage and cosmetic upgrades support that offer but are unlikely to justify a subscription on their own. Do not promise a particular WPM improvement or describe the current recommendation feature as a new paid feature.

## What exists today

Repository review, rather than live traffic or competitor research, informs this plan:

- Free tests, twelve finger-lesson levels, per-key feedback, themes, streaks, result sharing, Ghost Race, and multiplayer already exist.
- `src/components/analytics/PracticeRecommendation.tsx` already offers an evidence-based next step after a test. Pro needs substantially more than this recommendation.
- `src/store/history.ts` saves results in browser storage. `src/constants/history.ts` caps detailed local history at 1,000 sessions; storage pressure can trim it further.
- Settings, learning progress, and key statistics are also local. There is no account or billing system in the reviewed application setup.
- Astro/React runs on Cloudflare Pages; multiplayer has a separate Worker with Durable Objects. Its documentation explicitly targets Workers Free.
- GitHub Sponsors is an existing revenue channel. The README describes the project as free and GPLv3 open source.
- Analytics scripts exist, but traffic, retention, geography, operating costs, and willingness to pay have not been established here.

Prices, targets, timelines, and revenue examples below are planning assumptions, not measured forecasts or current competitor benchmarks.

## Free versus Pro

| Capability | Free | Pro |
| --- | --- | --- |
| Tests, dictionaries, quotes, finger lessons | All existing options | Everything in Free |
| Current key analytics and next-step recommendation | Keep available; key-pair and error-type panels omitted from history/results at user request | Adds adaptive training, not an analysis paywall |
| History and streaks | Existing browser storage and limits | Cross-device sync and cloud history |
| Ghost Race, multiplayer, sharing | Keep existing functionality | No paid competitive advantage |
| Training program | Choose your own practice | Adaptive daily routine with weekly reassessment |
| Weak-key practice | Existing lessons and feedback | Automatically generated drills for recurring weak keys and, once supported by measurement, key pairs |
| Progress reports | Existing charts and statistics | Comparable weekly trends, plateau detection, and recommended changes |
| Personal practice material | Existing supplied collections | Saved custom passages and reusable practice sets |
| Appearance | All existing themes | Optional new theme packs and Pro badge later |

Do not reduce existing free history, lock current themes, charge for streak preservation, or introduce interruptions during typing. Sharing and race invitations remain free acquisition channels.

## First paid release

Ship three connected benefits:

1. **My training:** choose a target and a daily time budget, take a baseline, and receive a short routine combining accuracy work, weak-key drills, and a comparable benchmark. Recalculate using completed sessions; show the evidence behind each change. Start with deterministic rules and minimum sample thresholds, so sparse data does not generate confident diagnoses. Use existing key-level data and the free key-pair measurements. Pair capture now runs before frame batching; do not put the existing analysis behind a paywall.
2. **My progress everywhere:** sign in, explicitly import local progress, and sync results, settings, lesson progress, and training state across devices. Keep practice usable offline. Offer up to 12 months of detailed cloud session summaries at launch; retain compact lifetime and weekly aggregates while subscribed. Publish a storage/session cap before launch instead of promising unlimited storage.
3. **My weekly review:** an in-app report comparing tests with matching mode, duration, and dictionary. Show speed and accuracy together, identify persistent weak keys, and explain next week's focus. Show insufficient evidence when appropriate. Email delivery is a later opt-in addition.

Defer custom passage libraries until the core loop works. Defer AI chat, mobile apps, team dashboards, certificates, expanded race capacity, tournaments, and premium cosmetics. The first paid release should prove people repeatedly use the training program.

## Pricing and purchase experience

- **Free:** $0; no account needed for existing practice.
- **Pro monthly:** test $4.99/month.
- **Pro annual:** test $39/year, explicitly billed annually; approximately 35% below twelve monthly payments.
- **Trial:** seven days without a card after account verification, starting when the first training plan is created. Explain that payment is required to continue Pro after the trial; there is no automatic charge.
- Keep sponsorship available as voluntary support, distinct from buying Pro. Avoid a lifetime offer that creates indefinite cloud obligations for one payment.

Use one paid tier initially. Validate local currencies and regional pricing against actual audience geography and payment completion, rather than assuming the audience is based in the maintainer's country. Display currency, total charge, tax treatment, renewal terms, and cancellation behavior clearly.

Choose a hosted checkout and customer portal. Evaluate a merchant-of-record provider first to simplify indirect-tax administration; confirm seller-country eligibility, recurring payments, payout support, fees, and product approval before committing. Direct processing is an alternative if those requirements fit better. No specific provider's availability or current terms have been verified in this plan.

Cancellation stops renewal and leaves access through the paid period. After Pro expires, keep a proposed 30-day read/export window for cloud practice data, then remove detailed cloud records under a published retention policy. Local free practice continues. Account deletion and necessary billing-record retention need separate, explicit behavior.

## Where upgrades appear

- Add a public `/pro/` page with an actual training example, a Free/Pro comparison, pricing, trial terms, and concise billing answers.
- Offer one quiet inline upgrade after a user has completed at least five tests across three practice days. Present it after results, never during typing, and suppress repeated prompts after dismissal.
- In History, show a clearly labeled example of a Pro weekly review beside the existing free analytics. Do not blur or lock the user's existing information.
- Put the cloud-sync offer in Settings, where the benefit is relevant.
- After trial activation, lead the user to today's routine. At expiry, offer monthly and annual checkout alongside continued free practice.
- Use existing improvement and plateau guides to introduce relevant training examples. Preserve the accuracy of pages promising free tests and lessons.

Suggested copy: **“Know what to practise next. Get a daily plan built around your weak keys, and see your progress across devices.”**

## Validate demand before the full build

Spend the first two weeks establishing a baseline and testing the proposition:

- Measure completed tests, return practice days, lesson use, History visits, and entry channels. Separate Hacker Typer entertainment visits from repeat typing-practice users.
- Show a clearly labeled “Pro is coming” page with the proposed price and an optional beta signup. Do not imply unavailable features are ready or collect payment for them.
- Recruit 10–15 repeat users who opt in. Learn what improvement they want, what they do after seeing weak-key feedback, and whether a daily routine would change their behavior.
- Run a small manual training pilot using participants' voluntarily supplied score summaries. Look for repeated use across at least two weeks and explicit willingness to purchase at the displayed price.

Suggested decision gate: at least 10 participants, six using their routine on three or more days in week two, and five explicitly willing to pay. These small-sample signals justify a limited beta, not a revenue forecast. Signups alone are insufficient evidence. If traffic is too low to recruit the cohort, focus on retention and distribution before a full billing build.

## Technical work needed

Maintain the existing Astro/React app and isolate the new account services from multiplayer. This proposal does not change the current multiplayer hosting tier.

| Area | Planned work |
| --- | --- |
| Accounts | Verified sign-in, secure server sessions, account recovery, logout, deletion, and abuse limits |
| Persistence | A separate account API and relational store; Cloudflare Worker + D1 is a candidate pending cost and operational validation |
| Data model | Users, sessions, learning progress, aggregate key metrics, training plans, subscriptions, processed billing events, and deletion markers |
| Local migration | Versioned records, stable session IDs, explicit import, deduplication, and no silent attachment of shared-browser history |
| Sync | Retry-safe writes, offline queue, ownership checks, merge rules for settings/progress, and deletion markers that prevent removed data returning |
| Billing | Server-created checkout, verified webhook signatures, duplicate/out-of-order event handling, entitlement reconciliation, and portal access |
| Access | Server-authoritative trial/subscription entitlements for cloud and training APIs; a client flag never authorizes paid requests |
| Training | Separate scoring/drill-generation logic from React UI; minimum evidence requirements, explainable recommendations, comparable benchmarks |
| Reporting | Weekly aggregates from completed sessions; no raw typed passages in analytics or billing metadata |
| Operations | Storage budgets, rate limits, backups and restore checks, error monitoring, billing reconciliation, and support workflow |

Collect only the training data needed. Sync session summaries and aggregate key metrics first, not a continuous raw keystroke stream. If custom passages ship later, make their storage behavior explicit and exclude them from analytics.

Before charging, test successful payment, failed payment, renewal, cancellation, refund, duplicate/delayed webhooks, account mismatch, and trial expiry. Test importing existing history, repeated imports, offline recovery, multi-device conflicts, account switching on shared browsers, and deletion without data resurrection. A checkout redirect alone must never grant Pro.

Update privacy, terms, support, and relevant free/open-source copy to describe the actual hosted service and billing behavior. Preserve GPL obligations for distributed code; revenue comes from the hosted service and convenience. Do not rely on hiding client-side algorithms to enforce payment.

## Rollout sequence

Indicative schedule for one experienced developer; re-estimate after demand validation and provider selection.

| Phase | Estimate | Exit condition |
| --- | --- | --- |
| Demand validation | Weeks 1–2 | Baseline and manual-pilot evidence support a limited beta |
| Account and sync foundation | Weeks 3–4 | Verified accounts, safe local import, cross-device sync, export/deletion working |
| Training and weekly review | Weeks 5–6 | Beta users complete routines and understand report recommendations |
| Billing and paid beta | Weeks 7–8 | Payment lifecycle checks pass and first users buy at the intended price |
| Improve conversion and retention | Following 4–8 weeks | Review paid usage, renewals, refunds, cancellation reasons, and operating cost |

Launch initially to a small cohort. Expand only after sync and billing are reliable. Do not add a second paid tier until there is evidence of a distinct buyer, such as an instructor who needs group assignments and reports.

## Metrics and revenue model

Define **activated user** as someone who completes three practice sessions on at least two days within seven days of their first completed test. Measure activation per acquisition cohort and channel.

Track `practice_completed`, `pro_offer_viewed`, `pro_page_viewed`, `trial_started`, `training_day_completed`, `weekly_review_viewed`, `checkout_started`, `subscription_started`, `subscription_renewed`, and `subscription_canceled`. Subscription events come from reconciled server billing state. Deduplicate events and exclude email addresses, passages, and payment details from analytics.

Primary measures:

- Trial activation: first routine completed within 24 hours of trial start.
- Trial engagement: routines completed on at least three distinct trial days.
- Trial-to-paid conversion: purchases within 14 days of trial expiry divided by expired trials in the same cohort.
- Pro retention: paid subscribers practising on at least three days per week; monthly subscription renewals and cohort retention.
- Guardrails: free activation and return rates, typing responsiveness, refunds, billing failures, support load, and variable cost per paid user.

Initial hypotheses: 50% trial activation, 30% trial engagement, 10% trial-to-paid conversion, and under 8% monthly subscriber churn after enough renewal opportunities. These are internal diagnostic targets, not industry benchmarks. Investigate failures before buying traffic. Annual retention cannot be inferred from early annual purchases.

At a hypothetical 50/50 split of monthly and annual subscribers, gross normalized revenue per active subscriber is approximately **$4.12/month**: `0.5 × $4.99 + 0.5 × ($39 / 12)`.

| Active paying subscribers | Gross normalized monthly revenue |
| --- | ---: |
| 50 | $206 |
| 100 | $412 |
| 250 | $1,030 |
| 500 | $2,060 |
| 1,000 | $4,120 |

These figures exclude taxes, payment/provider fees, refunds, discounts, hosting, email, support, and development. Annual cash collection differs from normalized monthly revenue. For example, converting 2% of 5,000 eligible active free users produces 100 initial subscribers; it does not guarantee 100 new subscribers every month or continued retention.

Use actual costs to calculate contribution per subscriber and break-even: `fixed monthly costs / (net monthly revenue per subscriber − variable monthly cost per subscriber)`. Track developer time separately. Start with organic traffic, existing sharing, and relevant guides; do not fund paid acquisition before retention and contribution margins are established.

## Free key-pair analysis — implemented 2026-11-27, panels subsequently removed

Follow-up: the user requested removing the error-type and key-pair sections from both history and session results. Their renderers and unused styling were removed; capture, stored measurements and aggregation remain compatible. The checklist below records the original implementation, not the current visible UI.

Approved scope: available to every user, no login or Pro gate. New measurements only; do not invent pair data from older per-key totals.

- [x] Capture accepted native single-letter inputs before animation-frame text batching. Break adjacency on paste, replacement/composition, deletion/correction, spaces, punctuation and extra letters.
- [x] Store compact per-session intended-pair attempts, pair errors (either letter wrong), correct timing count and timing sum in local history. Do not persist raw input or passage text for this feature.
- [x] Show up to five slowest and most error-prone pairs in results and filtered history, with visible sample counts. Require five correct timed observations for speed and five attempts for errors; exclude timing gaps over 2 seconds.
- [x] Merge raw counts before calculating history rates/means; preserve old history and provide empty/insufficient-data states.
- [x] Add capture, reset, persistence/aggregation and rendering regression tests; update README.

Pro-generated pair drills remain a separate, unimplemented proposal.

## Execution checklist

- [ ] Establish audience, activation, retention, and current cost baseline.
- [ ] Validate the training proposition and price with repeat users.
- [ ] Confirm payment-provider eligibility and full fees.
- [ ] Finalize cloud caps, retention, trial rules, and support/refund terms.
- [ ] Build accounts, safe local import, and sync.
- [ ] Build adaptive routines and comparable weekly reviews.
- [ ] Implement and verify billing and entitlement lifecycle.
- [ ] Add Pro page and contextual upgrade placements.
- [ ] Update policies and verify data export/deletion.
- [ ] Run a limited paid beta; assess usage and renewals before expansion.

The first business milestone is **50 paying users who continue practising**, rather than a large feature catalogue.
