# Typing-practice dictionaries per locale — sources from GitHub

Research date: 21 November 2026. Sources verified live via the Monkeytype repository (`monkeytypegame/monkeytype`, branch `master`, directory `frontend/static/languages/`) and its git tree API. Monkeytype's frequency lists derive from the **Leipzig University Wortschatz corpus** and are the de-facto standard dictionaries for typing-practice sites.

## Adopted dictionaries

| Locale | Source file | Words (unique) | Notes |
| --- | --- | ---: | --- |
| en | (existing NinjaType `words-1k.json`) | 1000 | unchanged |
| de | `german_1k` | 899 | Leipzig Wortschatz corpus; replaced the earlier OpenSubtitles-derived list on 21 Nov 2026 |
| fr | `french_1k` | 1394 | includes accents (é è à ç …) — matches the AZERTY/clavier-suisse keywords |
| it | `italian_1k` | 1159 | |
| nl | `dutch_1k` | 1000 | also serves Belgium spillover |
| no | `norwegian_bokmal_1k` | 1000 | bokmål; a nynorsk 1k list also exists (`norwegian_nynorsk_1k`) for a future nynorsk keyword page |
| da | `danish` (base list) | **196** | see license note below |
| sv | `swedish_1k` | 994 | includes å ä ö |
| ja | `japanese_romaji_1k` | 987 | **romaji only** — typed as plain latin letters, so it works in the existing typing engine without an IME. Hiragana/katakana lists also exist (`japanese_hiragana`, `japanese_katakana`) for a later kana mode |

All files saved as `src/data/words-<locale>-1k.json` in NinjaType's `{ "words": [...] }` format (lowercased, deduplicated), served at `/api/words/<locale>-1k/` and selectable in the practice toolbar.

## License notes

- **Danish**: Monkeytype's `danish_1k` and `danish_10k` are **licensed by Dansk Sprog- og Litteraturselskab (DSL) and "can only be used with their permission"** (verbatim comment in the source files). We therefore did NOT adopt them. The unrestricted Monkeytype base `danish` list (196 common words) is used instead — small but adequate for word-mode tests. If a larger list is needed, either request DSL permission or find a freely licensed corpus (none found on GitHub that is frequency-ordered for typing).
- **Japanese**: `japanese_romaji_1k` deliberately avoids the kana/kanji lists; a real Japanese typing mode (kana with IME-style conversion, KPM metrics) remains a Phase C product item.

## Other lists available in the same repo (for future expansion)

`french_2k/10k/600k`, `italian_7k/60k/280k`, `dutch_10k`, `norwegian_bokmal_5k/10k`, `swedish_diacritics`, `english_5k/10k/25k`, `spanish_1k`, `portuguese_1k`, plus layout definitions in `frontend/static/layouts/` (incl. `german_dvorak`, `swiss_german`) that may inform future keyboard-layout work.
