# Keyword analysis for NinjaType's four app pages

25 October 2026 · English search strings · global audience

The practical targets are **typing test** for the homepage, **multiplayer typing race / multiplayer typing games** for live racing, **solo typing game** with personal-best WPM wording for Ghost Race, and **touch typing / typing lessons** for Learn. Each page answers a separate task; broad popularity alone is not a reason to make every title target “typing test.”

## Evidence and limitations

This analysis builds on the [saved keyword research](analysis.md), [comparison settings](comparisons.json), and raw weekly CSVs. Their calculated averages agree with the recorded rounded Google Trends averages. It also adds [five fresh autocomplete checks](landing-page-suggestions.json).

Google Trends measures relative search interest, not monthly searches. The values below are only comparable inside their own comparison. No Google Ads Keyword Planner, paid volume/difficulty dataset, or Search Console data was available. Supporting terms and exact long-tail priorities are intent recommendations, not measured volume rankings. Autocomplete is wording evidence and may reflect location/personalization; the order is not a volume ranking.

## Which measured terms are most popular?

Worldwide, Web Search, all categories, 19 October 2025–18 October 2026, 53 weekly observations:

| Shared core comparison | Mean relative index | Rounded chart average |
| --- | ---: | ---: |
| typing test | 79.77 | 80 |
| typing practice | 14.34 | 14 |
| typing games | 7.92 | 8 |
| touch typing | 2.06 | 2 |
| typing race | 1.00 | 1 |

The saved five-year comparison shows the same ordering. This supports a broad testing/practice homepage with more specific lesson and game entry points.

The **separate** training comparison puts touch typing at 75, how to type faster at 45, typing lessons at 35, typing accuracy at 20, and how to improve typing speed at 3. The **separate** games comparison puts typing games at 82, TypeRacer at 39, and typing race at 10. These values must not be compared numerically with the core table. TypeRacer is branded competitor demand; it is not NinjaType's primary target.

## Page targets and implemented metadata

| Page | Primary intent / target | Supporting terms | Demand evidence |
| --- | --- | --- | --- |
| `/` | Free typing test; online typing practice | typing speed test, WPM test, typing test free, typing accuracy | Typing test and typing practice lead the shared core comparison; autocomplete confirms free, online, WPM and practice variants. |
| `/multiplayer-typing-race/` | Multiplayer typing race; multiplayer typing games with friends | online typing race, typing games free, multiplayer typing test | Typing games exceeds typing race in the games comparison; related queries and autocomplete support online/free/with-friends wording. Exact multiplayer phrase volume was not measured. |
| `/ghost-race/` | Solo typing game; personal-best typing challenge | typing practice game, WPM challenge, race your shadow | Broader typing-games demand supports the category. Exact solo and personal-best phrase volume was not measured. “Ghost race” suggestions are dominated by unrelated entertainment; “ghost typing race” returned no suggestions. |
| `/learn/` | Free touch typing lessons for beginners | typing lessons online, home row typing, finger placement, typing practice for beginners | Touch typing and typing lessons have measured interest in the training comparison. Fresh autocomplete confirms free, online and beginner lesson wording. |

### Homepage

Title: **Free Typing Test & Online Typing Practice | NinjaType**

Description: Take a free typing test to measure WPM and accuracy. Practise with words or timed tests, track your progress, and try typing games. No sign-up needed.

H1: **Free typing test**. The static help section explains test settings, speed/accuracy review, history, and next exercises. The page owns broad testing intent; lesson and race links lead to those specialized tasks.

### Multiplayer

Title: **Multiplayer Typing Race: Play With Friends | NinjaType**

Description: Play a free multiplayer typing game with friends or join a public room. Choose a timed or word race, compare WPM and accuracy, and rematch. No sign-up.

H1: **Multiplayer typing race.** The existing static room instructions and FAQ explain invites, readiness, shared passages, Words/Time modes, and rematches. Updated FAQ copy accurately distinguishes the two race endings. The room setup guide is a supporting article rather than a duplicate tool landing page.

### Ghost Race

Title: **Ghost Race: Solo Typing Game & WPM Challenge | NinjaType**

Description: Play a free solo typing game against your best saved WPM. Race your shadow over 15, 30, or 50 words, track accuracy, and aim for a new personal best.

H1: **Ghost typing race.** This keeps the product name while identifying typing explicitly. Static copy explains the projected average pace, first-run benchmark, local history, and word correction. It does not describe exact keystroke replay or a live opponent. Do not chase entertainment searches for “ghost race” simply because that phrase has suggestions.

### Learn

Title: **Free Touch Typing Lessons for Beginners | NinjaType**

Description: Learn touch typing with free finger exercises and a QWERTY key guide. Practise home row placement, track accuracy, and build your typing skills at your pace.

H1: **Learn touch typing.** Four crawlable lesson links and a key guide show what users can actually practise. Static instructions and FAQs cover QWERTY home keys, paired-finger exercises, practice routines, and local progress. Avoid unsupported promises of a specific WPM or learning timeline.

## Search intent boundaries

Keep the homepage about taking a test, Learn about finger lessons, Multiplayer about live shared races, and Ghost Race about solo personal-best pacing. Use informational articles for “how to type faster,” accuracy methods, and beginner routines. Link articles and their relevant app pages contextually; avoid repeating the same broad keywords in every title or adding thin pages for synonyms.

These recommendations are implemented in page copy, titles, descriptions, headings, schema, and links. A meta-keywords tag was removed because Google does not use it for ranking.

## After deployment

1. Inspect all four `https://www.ninjatype.com/` URLs in Search Console and submit the canonical sitemap.
2. Track impressions, clicks, CTR, average position, and query intent per canonical page. Compare equivalent periods and allow for indexing and seasonality.
3. Use actual queries to refine title wording and identify overlap between pages. Retain the distinct task each page serves.
4. Use Keyword Planner or a comparable volume dataset if monthly volume, country-specific targeting, or keyword difficulty is required. The saved Trends indices cannot supply those numbers.

Sources: [saved Google Trends settings](comparisons.json), core/training/games CSVs in this directory, [earlier autocomplete](google-suggestions.json), [fresh landing-page autocomplete](landing-page-suggestions.json), and [Google's explanation of Trends data](https://support.google.com/trends/answer/4365533?hl=en).
