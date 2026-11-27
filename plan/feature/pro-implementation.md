# Pro implementation plan

Scope: the five Pro features in `plan/pro-monetization.md`. Each phase ships on its own and keeps English/free behaviour unchanged.

## Current state
- Themes: static CSS in `public/themes/*.css` (13 files), registered in `src/constants/themes.ts` (`THEME`), selected via `theme` in `src/store/config.ts` (zod enum of `THEME` keys).
- History and settings are local only (`src/store/history.ts`, `config.ts`). No accounts, no billing, no database.
- Footer strip is fed from `/sponsor.json` (`SponsorStripRotator.astro`).
- Hosting: Cloudflare Pages (+ `functions/`), and a multiplayer Worker in `workers/multiplayer`.

## Phase 0: Decisions (1 to 2 days)
- Auth: email magic link vs OAuth (Google/GitHub). Recommended: magic link plus Google.
- Billing: merchant-of-record provider (Lemon Squeezy / Paddle / Stripe). Check seller-country eligibility first.
- Store: Cloudflare Worker + D1 in a new `workers/account` (kept separate from multiplayer).
- Open questions from `pro-footer-recognition.md`.

## Phase 1: Accounts and entitlement
- `workers/account`: sessions (httpOnly cookie), sign-in, sign-out, delete account, rate limits.
- D1 tables: `users`, `sessions`, `subscriptions`, `billing_events` (idempotency), `deletion_markers`.
- `GET /api/me` returns `{ user, pro: boolean, proUntil }`; entitlement is only decided server-side.
- Client: `src/store/account.ts` (nanostore, loaded after mount), sign-in modal, account page `/account/` (noindex).
- Tests: session handling, entitlement logic, deletion.

## Phase 2: Billing
- Server-created checkout, hosted customer portal, signed webhook handler (dedupe, out-of-order safe), 7-day trial.
- `/pro/` page (pricing, Free/Pro table, FAQ with matching schema); SEO and sitemap checks.
- Tests: payment, failure, renewal, cancel, refund, duplicate webhook, trial expiry.

## Phase 3: History sync
- Add stable session IDs and a schema version to local records (`src/store/history.ts`).
- D1 tables `sessions_summary`, `settings`, `progress`; `POST /api/sync` (idempotent, ownership checked) and `GET /api/sync?since=`.
- Explicit "Import local history" step with dedupe; no silent attach on shared browsers.
- Merge rules: results append-only by ID; settings and progress last-write-wins per key; deletion markers.
- 12-month detail retention plus compact aggregates; export (JSON) for 30 days after expiry.
- Local practice works offline with an outbox queue.

## Phase 4: Pro themes and custom theme builder
- New Pro themes: add CSS files in `public/themes/` plus entries flagged `pro: true` in `src/constants/themes.ts` (add a `pro` field). Update `config.ts` enum handling so a missing or Pro theme falls back safely.
- Theme picker: Pro badge, preview allowed, apply requires Pro.
- Custom themes: data model `{ id, name, vars: {8 color vars} }`, stored locally and synced via Phase 3. Applied by injecting a `<style>` with `:root` variables; derived vars via `color-mix`.
- Builder UI (`src/components/themes/ThemeBuilder.tsx`): color inputs, live preview, WCAG contrast warning, save/rename/delete, JSON import/export with strict validation (hex only, length limits, no free-form CSS).
- Lapse behaviour: fall back to last free theme; keep custom themes stored read-only for 30 days.
- Showcase new components on `/components/`.
- Tests: validation, contrast helper, fallback, import rejection.

## Phase 5: Adaptive training and weekly review
- `src/lib/training/`: pure functions for weak-key scoring (minimum sample thresholds), drill generation, plan builder; reuse `keypressStats.ts` and `sessionInsights.ts`.
- UI: "My training" page with today's routine and the evidence for each change; sync training state via Phase 3.
- Weekly review: aggregate comparable tests (same mode, duration, dictionary), plateau detection, "insufficient evidence" state.
- Tests for scoring and edge cases (sparse data).

## Phase 6: Footer recognition and public profile
- Follow `plan/feature/pro-footer-recognition.md`: `profiles` table, `/api/pro-members`, Pro strip, `/u/[handle]/` (noindex), moderation flag.

## Cross-cutting
- Privacy policy, terms, and support updates; the CSP in `public/_headers` for the account API origin.
- Analytics events without emails, passages, or payment data.
- Mobile at 390px; keycap UI kit components; theme-only colors.
- Each phase: `bun run build`, `bun run check`, `bun test src`, `bun run check:seo`, then `bun run version:minor` and a README update.

## Order and rough size
| Phase | Depends on | Size |
| --- | --- | --- |
| 0 Decisions | none | 1 to 2 days |
| 1 Accounts | 0 | 1 week |
| 2 Billing | 1 | 1 week |
| 3 History sync | 1 | 1 to 2 weeks |
| 4 Themes and builder | 1 (sync uses 3) | 1 week |
| 5 Training and review | 3 | 2 weeks |
| 6 Footer and profile | 1, 2 | 3 to 5 days |

Estimates are for one developer and need revisiting after Phase 0. Launch to a small paid beta after Phases 1 to 4, with training following.
