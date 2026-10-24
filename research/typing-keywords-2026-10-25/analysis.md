# NinjaType keyword research and guide strategy

Research date: 25 October 2026. Audience: global, using English search terms. Scope: solo practice, touch typing lessons, multiplayer typing races, Ghost Race, and Hacker Typer. History is a supporting tool for the practice and progress guides.

## Decision

Build an evergreen training library around **typing test**, **typing practice**, **how to type faster**, **touch typing**, and **typing games**. Use multiplayer and personal-best racing as specific training methods inside that library. Give Hacker Typer its own simulator guides, with clear links into real typing practice. Do not present generated code as a measurement of typing skill.

Create twelve distinct guides: three for Practice, three for Learn, two for Multiplayer, two for Ghost Race, and two for Hacker Typer. The existing multiplayer setup article remains the room-entry guide, giving that mode three complementary articles. The four existing Hacker Typer posts retain their URLs.

## What was actually researched

- Google Trends: Worldwide, All categories, Web Search. Four 12-month comparisons and a five-year comparison. The 12-month series contain 53 weekly points from 19 October 2025 to 18 October 2026; the five-year series contains 261 points from 24 October 2021 to 18 October 2026.
- Google Trends Top and Rising related queries for typing games, typing race, and typeracer. Relevant rising queries were also inspected in the other comparisons.
- Google autocomplete: fifteen English prefixes, recorded with their returned suggestions. These indicate query wording and intent, not monthly volume or a ranking of all searches.
- Product audit: the current routes, word/time settings, finger lesson mappings, results/history metrics, Ghost Race pace projection, multiplayer lifecycle, and simulator controls.
- Training evidence: Aalto University's 2016 study of thirty typists, plus Google's explanation of Trends normalization. Aalto's study is observational; it does not establish that a particular routine guarantees a specified WPM improvement.

The direct Trends API request returned HTTP 429. The public browser interface and its chart responses were then successfully read. Some comparison screens loaded their labels before their data; only completed charts were recorded. Typing.com and TypingClub returned HTTP 403 during source retrieval and were not treated as reviewed evidence.

### Measurement limits

Trends values are **relative search-interest indices**, normalized for the selected geography, time, and comparison. They are not searches per month, keyword difficulty, or projected traffic. Values from separate comparisons cannot be ranked against each other. A value near zero is not proof of no demand. Exact English strings do not restrict the searcher's language or country. Autocomplete can reflect location and personalization; its order is not a search-volume ranking.

No paid keyword-volume dataset, live Search Console data, or systematic SERP difficulty analysis was available. The priorities below combine observed demand, product fit, and distinct intent; they are editorial judgments rather than numerical difficulty scores.

## Demand findings

### Core terms: same comparison, past twelve months

| Search term | Displayed average index | Implication |
| --- | ---: | --- |
| typing test | 80 | Largest observed entry point; explain testing and measuring progress. |
| typing practice | 14 | Stronger broad training demand than racing alone. |
| typing games | 8 | A useful bridge from learning into the race modes. |
| touch typing | 2 | Smaller than testing, with a close match to the lessons app. |
| typing race | 1 | Relevant play intent; support it with broader training guides. |

The same ordering holds in the five-year comparison: 73, 11, 7, 2, and 1 respectively. These terms appear throughout the period rather than as a single recent spike. On the shared five-year scale, annual average typing-practice interest was 8.3 in 2022, 9.1 in 2023, 11.7 in 2024, and 13.9 in 2025. The 2026 year-to-date average is 14.7; it is not a complete-year forecast. This supports an evergreen library, not articles that depend on a fleeting trend.

### Training terms: a separate twelve-month comparison

| Search term | Displayed average index |
| --- | ---: |
| touch typing | 75 |
| how to type faster | 45 |
| typing lessons | 35 |
| typing accuracy | 20 |
| how to improve typing speed | 3 |

Use **How to Type Faster** as the broad guide title, with improve-typing-speed variants naturally in the introduction. Keep speed improvement, accuracy, finger placement, and beginner practice as different tasks rather than publishing near-identical articles for every keyword synonym.

Relevant displayed Rising queries included **typing practice for beginners with fingers (+500%)**, **touch typing training (+140%)**, and **how to improve typing speed and accuracy (+80%)**. These are relative growth readings from their individual related-query panels, not growth forecasts or monthly totals. Their usefulness comes from matching the app's actual finger drills and accuracy tools.

### Games and races: a separate twelve-month comparison

| Search term | Displayed average index |
| --- | ---: |
| typing games | 82 |
| typeracer | 39 |
| typing race | 10 |

TypeRacer demonstrates established branded race interest; it is not a synonym for NinjaType. Do not make untested competitor superiority claims or use its name as the primary target of a generic guide.

In the **typing games** Top related-query panel, relevant readings included **typing test games (96)**, **typing games online (85)**, **typing games free (85)**, **typing practice games (31)**, and **typing speed games (30)**. These panel-specific indices support guides that explain how to use a game for practice. For **typing race**, relevant Top queries included **speed typing race (49)** and **online typing race (47)**; online typing race also appeared as a Rising query (+40%).

Autocomplete returned multiplayer typing games, multiplayer typing test, multiplayer typing race, typing games with friends online, typing games race with friends, and typing games for adults. The longer with-friends and adults phrases are intent targets, not independently measured volume leaders.

### Hacker Typer: a separate twelve-month comparison

| Search term | Displayed average index | Interpretation |
| --- | ---: | --- |
| hacker typer | 59 | Strongest clearly relevant simulator term in this set. |
| code typing | 53 | Ambiguous; related queries included jobs and unrelated services. |
| hacker simulator | 25 | Includes other games; avoid promising their features. |
| hackertyper | 10 | A useful spelling variant within the main simulator guide. |
| fake hacker screen | 2 | Smaller but directly aligned with the visual simulator. |

Autocomplete included hacker typer controls, hacker typer simulator, fake hacker screen terminal, fake hacker screen simulator, and fake hacker screen typing. Fake coding screen appeared as a relevant Rising query (+40%) in the fake-hacker-screen panel. Teach actual browser controls and appearance settings; then offer a separate measured exercise in Practice or Learn.

## Noise and exclusions

Related-query panels contained keyboard-not-typing troubleshooting, unrelated LLM quiz questions, unrelated games, employment queries, Hindi typing, and game-console/phone variants. Those are not automatically good content opportunities. They were excluded where the task or audience did not match NinjaType's current physical-keyboard training.

Do not create "best typing site" lists without testing the listed services, "40 WPM is the population average" claims without a suitable sample, guaranteed 100-WPM-in-a-week plans, or fake reviews. Legacy Hacker Typer articles contain strong productivity/benchmark claims that are not evidence for the new guides; those claims should receive a separate sourced editorial review.

## Guide map, completed before drafting

Priority 1 means broad demand plus a direct training-tool match. Priority 2 means a more focused intent or a smaller but useful product entry point. This is a publishing order, not a keyword-difficulty estimate.

| App | Priority | Guide / primary intent | Supporting query variants | Distinct training method |
| --- | --- | --- | --- | --- |
| Practice | 1 | How to Type Faster | improve typing speed, type faster and more accurately | Baseline → weak-key drill → steady timed practice → review. |
| Practice | 1 | Typing Speed Test: Measure WPM | typing test WPM, typing speed test online, WPM test | Repeat comparable tests; distinguish raw and correct WPM. |
| Practice | 1 | How to Improve Typing Accuracy | typing accuracy practice, typing accuracy test | Slow error-focused practice, then transfer to passages. |
| Learn | 1 | Touch Typing for Beginners | touch typing lessons, touch typing practice | Stable finger-to-key mapping and screen-focused practice. |
| Learn | 1 | Home Row Typing and Finger Placement | home row typing practice, touch typing finger chart | QWERTY home-key mapping and individual-finger drills. |
| Learn | 1 | Typing Practice for Beginners | typing practice for beginners with fingers | A progressive daily routine with simple completion checks. |
| Multiplayer | 2 | Typing Games With Friends | multiplayer typing games with friends, typing games online | Cooperative rounds with shared settings and accuracy goals. |
| Multiplayer | 2 | Typing Race: Improve Speed and Accuracy | speed typing race, online typing race | Pacing, countdown preparation, and post-race error review. |
| Ghost Race | 2 | How to Break a Typing Speed Plateau | typing speed plateau, why has my typing speed plateaued | Diagnose accuracy/rhythm/vocabulary, change one variable. |
| Ghost Race | 2 | Typing Games for Adults | typing practice games, typing speed games | Personal-best pace challenge plus lessons and steady tests. |
| Hacker Typer | 2 | Hacker Typer: How the Simulator Works | hacker typer controls, hackertyper, hacker typer simulator | Understand simulation, then practise reproducing real text. |
| Hacker Typer | 2 | Fake Hacker Screen: Browser Terminal Guide | fake hacker screen terminal, fake coding screen | Visual setup plus an explicit switch to measured typing practice. |

The existing multiplayer article owns room creation, invites, joins, and rematches. The new friends article owns a group training routine; the race article owns pacing and review. The beginner touch-typing article teaches the method, home-row article supplies the finger map, and beginner-practice article supplies a schedule. These boundaries reduce competing pages that answer the same question.

## Training and product accuracy rules

The Aalto study supports discussing consistent finger assignments and limited hand movement as characteristics associated with faster typing. It also found fast self-taught typists; do not claim ten fingers are a prerequisite for speed. The proposed session lengths and accuracy targets are practical suggestions, not experimental prescriptions or promises.

Practice exposes raw WPM and correct WPM through its analytics/history. Multiplayer derives WPM from correct characters and keeps corrected errors in attempt-based accuracy. Do not imply every mode or every website uses an identical accuracy definition. Ghost Race projects a saved average pace onto a fresh passage; it is not a playback of every historical keypress or a live human rival. Hacker Typer generates simulated code; it is not a coding test or actual intrusion tool.

Each guide should give an immediate answer, a concrete drill or decision process, an explanation of what to record, links to the relevant app, and next steps into another training method. Use a contents list and useful cross-references rather than keyword repetition. Give each article its own app-specific call to action and related guides.

## Delivery and measurement

Organize the shared blog by app, keep the existing canonical URLs, and add contents navigation to the guide template. New guides remain static pages: no added multiplayer messages, Worker requests, accounts, or server-side progress collection. Add app-to-guide links below the primary training experience, plus canonical metadata, BlogPosting schema, RSS entries, and sitemap inclusion.

After deployment, use Search Console to inspect indexing and query impressions by article. Compare like-length periods, allowing for newly indexed pages and seasonality. If available, measure guide-to-app clicks as a separate event; do not invent a conversion rate from page views. Adjust titles from real query evidence, merge overlapping pages where needed, and preserve canonical URLs.

## Sources and reproducibility

- [Google Trends comparison settings and observed averages](comparisons.json).
- Raw visible Trends text and weekly CSV files in this directory, including the five-year comparison.
- [Google Trends Top/Rising game-query readings](trends-games-related.json).
- [Recorded Google autocomplete responses](google-suggestions.json).
- [Google: FAQ about Google Trends data](https://support.google.com/trends/answer/4365533?hl=en).
- [Aalto University: Ten fingers not needed for fast typing](https://www.aalto.fi/en/news/ten-fingers-not-needed-for-fast-typing), published 9 February 2016; thirty participants, observational study. [Reviewed excerpt and source notes](training-source-notes.json).

The comparison URLs in the metadata are reproducible, but Google's samples and relative periods can change when rerun. The saved observations, not future readings, are the basis for this topic map.
