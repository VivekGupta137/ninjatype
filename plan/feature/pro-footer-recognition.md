# Pro mode: footer recognition and public profile

Date: 2026-11-27  
Status: Proposed. Depends on the accounts and billing foundation in `plan/pro-monetization.md` (not built yet).

## Goal
Pro members can opt in to appear on the footer strip (name plus a link to their public NinjaType profile). The setting is controlled from their account and defaults to **off**.

## Existing pieces
- The footer strip is filled client-side by `src/components/ui/SponsorStripRotator.astro` (`[data-sponsor-strip="footer"]`) from `/sponsor.json` through `src/lib/sponsorClient.ts` and `src/lib/sponsorStrip.ts`. Sponsors are labelled "Sponsored".
- Accounts, entitlements and billing do **not** exist. Nothing here ships before the account foundation.

## Behaviour
- Eligible: users with an active server-side Pro entitlement (trial excluded unless decided otherwise).
- Account setting "Show me in the footer" (default off) plus "Public profile" (default off). Footer listing requires the public profile to be on, because the name links to it.
- Footer strip: a separate, clearly labelled **"NinjaType Pro"** strip, never mixed into the "Sponsored" strip. Display name only, with a link to `/u/<handle>/`. Rotation and pause behaviour reuse the sponsor strip.
- Removal is immediate: turning the toggle off, cancelling Pro, or deleting the account removes the entry on the next list refresh. Expiry removes it after the paid period ends.

## Public profile `/u/<handle>/`
- Static shell with client data fetch; `noindex` by default (user content, thin pages). Revisit if indexing is wanted.
- Shows: display name, optional short bio (plain text, 160 chars), Pro badge, optional stats the user chooses to share (best WPM, average accuracy, streak, member since).
- Per-field visibility toggles. Nothing is shown by default except the display name and the badge.
- Links from the profile: only to NinjaType pages; no user-supplied URLs in v1 (avoids spam and SEO abuse). If external links are added later use `rel="nofollow ugc noopener"`.

## Data and API (account worker, D1 candidate)
- `profiles(user_id, handle UNIQUE, display_name, bio, public, show_in_footer, show_stats_json, moderation_status, updated_at)`.
- `GET /api/pro-members` returns `[{name, handle}]` for rows with `public=1 AND show_in_footer=1 AND moderation_status='ok'` and an active entitlement. Cacheable (60s edge cache), capped, randomised order.
- `PUT /api/profile` is authenticated, validates input, and rate limits.
- Entitlement is checked server-side when the list is built; the client never decides who is Pro.

## Safety and compliance
- Handle rules: 3 to 20 chars, `[a-z0-9_-]`, reserved-word list, case-insensitive uniqueness.
- Display name and bio: length limits, plain text only, escaped on output, blocklist plus report link; `moderation_status` lets you hide a profile without deleting it.
- Name publicly displayed is personal data: explicit opt-in copy, easy opt-out, covered in the privacy policy, removed on account deletion. No email addresses ever exposed.
- Accessibility: strip is text links with focus rings, pausable, reduced-motion safe.
- CSP: no new third-party origins if the API lives under the same domain; otherwise add the API origin to `connect-src` in `public/_headers`.

## Implementation steps
1. Account foundation and Pro entitlement (prerequisite).
2. `profiles` table, handle and name validation (shared `lib/` module with unit tests).
3. Account settings UI: public profile toggle, footer toggle, display name, handle, bio, stat toggles.
4. `/api/pro-members` plus `src/lib/proMembers.ts` client and a Pro strip mounted in the footer via the existing strip code.
5. `/u/[handle]/` page (noindex) with the stats fetch and 404 state for private or unknown handles.
6. Update `/pro/` page, privacy policy, `public/_headers`, `check-seo` noindex rules, the sitemap filter, and the `/components/` showcase.
7. Tests: validation, entitlement gating, opt-out and expiry removal, XSS escaping; screenshots at 1280px and 390px.

## Open questions
- Should the trial period count for the footer listing, or only paid Pro?
- Is the profile a minimal "supporter card" (name and badge) or a stats page?
- Should listing be allowed with a custom link (for example a personal site)? It is a reason to join Pro, but it raises spam, moderation and SEO issues.
- Does the Pro strip share the footer row with sponsors or have its own row?
- Free users: do they get a profile at all, or is it Pro only?
