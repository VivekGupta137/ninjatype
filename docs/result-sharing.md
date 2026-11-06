# Result sharing

Completed solo practice, Ghost Race, multiplayer and touch typing sessions offer **Share result**. A native dialog collects a public display name and opens `/share/?result=x1.<base64url>`. The shared page needs no account or database. It renders its own snapshot, without loading the visitor's history or changing any scores.

Every saved attempt in the History table also has a Share action, including the mobile attempt layout. It uses that row's recorded speed, accuracy, duration, and available settings, so older results can be shared later without substituting the latest attempt or personal best. Legacy records without dictionary/settings metadata remain shareable with the fields they actually saved.

History and completed daily practice also offer **Share streak**. These cards pair the current practice streak with the retained all-time raw WPM record, explicitly labeled as an all-time best. The optional compact tag `[sk:7]` carries a positive integer streak (1–36,500); normal result links are unchanged. This snapshot does not include accuracy, dictionary, or duration from an unrelated attempt. Users with lesson-only history can view their streak and add a scored typing test before sharing it with a best speed.

Streaks are rebuilt from the existing local practice-date ledger: each completed calendar day adds one, and each fully missed day subtracts one, with a floor of zero. Today remains available until local midnight. The best streak is the highest balance reached, so it survives missed days and detailed-history trimming. Repeated sessions on the same day count once. Clearing typing history clears both streaks and the retained speed record. Share links remain historical snapshots; opening one never awards practice credit.

## Components

| Component | Rendering | State |
| --- | --- | --- |
| `share.astro` | Static Astro route, noindex | Layout and generic social metadata |
| `ShareResultButton` | Part of the existing React result island | Native dialog, display name, accuracy inclusion, validation |
| `SharedResult` | React `client:load`, deterministic loading fallback | Decoded result, theme, avatar, accuracy visibility, image format, share status |
| `ResultCard` | Static SVG elements inside the island | Pure props; escaped text only |

## Compact payload

New links encode bracketed tags as UTF-8 bytes, XOR each byte with the repeating ASCII key `dontcheatpls`, then encode the bytes as unpadded URL-safe Base64. The `x1.` prefix identifies this format and adds only three characters. Decoding reverses these steps before applying all existing validation. Keep the key stable for `x1` links; any future key change needs a new format prefix. Old plain Base64 compact and JSON links remain readable and are rewritten to the new format when opened.

Example text before XOR:

```text
[n:Ninja][s:87][a:98.5][t:0][dk:1k][d:60][th:2]
```

| Tag | Value |
| --- | --- |
| `n` | Required display name: NFC-normalized, trimmed, 1–40 Unicode code points; allowlisted letters, marks, numbers, spaces, dots, underscores, apostrophes and hyphens. The input also caps entry at 40 UTF-16 units. |
| `s` | Required WPM, 0–500; at most one decimal in generated links. |
| `a` | Optional accuracy, 0–100; at most two decimals. Omitted when hidden. |
| `t` | Optional activity (omitted when practice type is hidden): `0` practice, `1` multiplayer, `2` learn. |
| `st` | Speed type: omitted for raw; `c` for correct WPM. Decoder also accepts `raw`, `r`, and `correct`. |
| `dk` | Optional allowlisted dictionary/quote key, e.g. `1k`. Labels are looked up locally. |
| `d` | Optional elapsed seconds, 0.1–3600; at most one decimal in generated links. |
| `m` | Optional practice variant: `w` words, `q` quotes, `g` Ghost Race. Omitted for timed practice; `t` also accepted. Only valid with activity `0`. |
| `th` | Optional stable theme index (`0`–`b`), preserving the chosen card theme. |
| `av` | Optional avatar ID: base36 of `styleIndex + 16 × variant`, with stable style IDs (Gaze=0, Moods=1, Pixel Art=2) and variant 0–1295. Default Gaze/variant 0 is omitted. For styles numbered 16 or higher, this tag carries only `16 × variant` and `as` selects the style. |
| `as` | Optional base36 style ID for catalog entries 16–60. Unknown IDs and conflicting packed style IDs are rejected. |
| `x` | Optional 1–48 character plain-text context (e.g. lesson name) when no dictionary key is available. |

Raw speed and timed practice omit redundant tags. Dictionary keys replace verbose settings labels. Theme indices follow the append-only list in `shareThemes.ts`; existing links must retain their original meanings. Old JSON version-1 links remain readable and are converted to compact links on the share page.

The decoder bounds encoded input to 1024 characters before decoding and rejects duplicate result parameters, malformed UTF-8, duplicate/unknown tags, delimiter injection, invalid numbers and unknown dictionary/theme keys. Legacy JSON is validated too. It creates a fresh allowlisted object. Result values are never interpreted as HTML, SVG markup, links, styles, scripts or image sources. Challenge destinations come from a fixed map. Invalid links show a recovery action.

Accuracy can be excluded in the initial dialog or hidden on the share page. Dictionary and practice type can also be toggled independently. Hidden dictionaries and their verbose context are removed from links; hidden practice types omit the activity/mode tags. The same exclusions apply to the visible card and its accessible description. Hiding it removes its value from the URL, card, accessible description and social caption. It can be restored locally while editing an original result containing accuracy. Recipients of a link without accuracy cannot recover it using the toggle.

XOR with a hardcoded client key and Base64 are obfuscation, not secure encryption or score verification. Anyone can edit a link. The share page and accessible card description identify results as player-shared and unverified; they never write to history, leaderboards or achievements. Only the chosen display name is remembered locally for convenience. The shared fields are public in the URL; don't include private information. Existing site analytics and ordinary server logs may see the share URL.

## Social images

The same SVG template renders the preview and is rasterized locally to PNG using browser canvas. It places a customizable DiceBear avatar and prominent name beside a subtle domain credit, then centers the typing-speed headline over a faded Learn keyboard. The compact footer combines accuracy, duration/dictionary, and practice type. Portrait stories use “Hi I can now type at”, the landscape-style faded keyboard backdrop and compact metrics row, plus a bottom domain credit. Home-key highlights are decorative position markers, not per-key performance data. It uses no external images, HTML foreign objects, remote font requests or new dependencies. All 61 installed DiceBear styles are available in a HeroUI v3 Dropdown with image previews and shuffle. Backgrounds are always transparent. Style definitions load on demand; dropdown thumbnails load when visible. Avatars are generated locally from allowlisted bundled styles and embedded as SVG data images. PNG export waits for the chosen avatar to load, preventing stale or missing-avatar downloads. Gaze animates in the preview and respects reduced motion. The exporter substitutes its still frame before PNG rendering. Avatar artwork credits are in `/avatar-credits.txt`. Formats: landscape 1200×630, square 1080×1080, story 1080×1920. Names scale to fit, and the story layout leaves room for social app chrome. The username is prominent; accuracy, duration and challenge are secondary metrics.

Cards initially use the creator’s app theme. HeroUI v3 ColorSwatch buttons show the main color of all 12 app themes, loaded from the actual theme CSS at build time. Changes affect the card, copied URL and PNG without changing the visitor’s global app preference. Old links without a theme use the visitor’s app theme.

Save/share actions sit directly below the title, with Keep practicing at the top right. Users can copy the result link, download a PNG, use the native share sheet when available, or open an X post composer. Nothing is posted automatically. Native file sharing is used when supported; other browsers can share the link or download the image. Clipboard failure leaves a selectable link. Image export failure leaves link sharing available.

Because hosting remains static, social crawlers see the generic NinjaType image rather than a personalized preview. Attach the downloaded PNG to a social post for the personalized card. Per-result crawler previews would require a separate server-rendered metadata/image endpoint.

## Verification

`bun test src/lib/shareResult.test.ts src/lib/shareAvatarImage.test.ts src/components/share/ResultCard.test.tsx`

Also run `bun run check`, `bun run build` and `bun run check:seo`. Browser checks cover the result dialog, direct shared links, invalid links, narrow layouts, image downloads, clipboard fallbacks and challenge navigation. Social posting should not be submitted during verification.
