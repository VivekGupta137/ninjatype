# Custom material practice (`/my-material/`)

Status: implemented 2026-11-27 (v4.2.0).

Type your own text (medical, legal, study notes). Text stays in `localStorage` only (`custom-material:items`); nothing is uploaded.

## Decisions (signed off)
- Route `/my-material/`, `noindex`, excluded from sitemap, English only.
- Library list -> Add/Edit (big textarea) -> Start panel -> typing (same keyboard/results as practice).
- Default is section-by-section (~25 words); "whole text" is an option.
- Per-material "continue where I left off" position.
- Limits: 50,000 characters per item, 20 items.
- Text is cleaned to printable ASCII on save (smart quotes/dashes, accents, symbols) with a preview and a count of dropped characters.
- Completed runs are saved to `/history/` with `mode: "custom"`, `source: "custom"` (never the text).

## Implementation
- [x] `src/lib/customMaterial.ts` (clean, split, validate, limits) + tests
- [x] `src/store/customMaterial.ts` (storage, progress) + `src/store/customRun.ts` (active run)
- [x] keyboard store aware of custom run (sentence, completion, no timer)
- [x] `/my-material/` page + components + styles
- [x] history mode filter / label, streak counts custom
- [x] README, sitemap filter, navbar link, version bump
