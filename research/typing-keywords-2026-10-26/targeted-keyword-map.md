# Targeted keyword optimization — October 26, 2026

## Search intent and primary destinations

| Target terms | Primary page | Supporting content |
| --- | --- | --- |
| typing ninja | `/` | Descriptive training copy, homepage FAQ, typing test and improvement guides |
| hacker typer, hacking prank, fake hacking | `/hacker-typer/` | `/blog/hacking-prank-fake-hacking/`, existing controls and fake-screen guides |
| geek typer, geektyper | `/hacker-typer/blog/geektyper-vs-hacker-typer/` | Comparison link and FAQ on Hacker Typer; independent-service clarification |
| touch typing, learn touch practice | `/learn/` | Natural wording: “learn touch typing through practice”; existing definition, beginner and home-row guides |
| typing race, typing game | `/multiplayer-typing-race/` | TypeRacer alternative and games-with-friends guides; `/ghost-race/` retains solo-game intent |
| typeracer, type racer | `/blog/typeracer-alternative/` | Comparison-oriented multiplayer FAQ and internal links |

Use competitor names for accurate comparison intent. Do not alias NinjaType to TypeRacer or GeekTyper in organization data. “Typing ninja” is used descriptively; the brand remains NinjaType, with the existing “Ninja Type” rendering as an alternate name. No duplicate routes or misspelling-only landing pages were created.

## Evidence and changes

The prior Google Trends research is in `../typing-keywords-2026-10-25/analysis.md`. No new keyword-volume figures, ranking positions or Search Console data were measured in this update.

Public competitor pages fetched directly on October 26, 2026, all HTTP 200:

- `https://play.typeracer.com/`: “TypeRacer - Play Typing Games and Race Friends”; describes racing live opponents while typing quotes from books, films, songs and other sources.
- `https://geektyper.com/`: “GEEKTyper.com - Hacking Simulator”; explicitly describes a novelty parody with keyboard-driven simulated code, themes and Tab hotkey help.
- `https://hackertyper.net/`: “Hacker Typer”; public settings show color, speed, font and source-file options, and Help describes code produced through typing and modifier-key effects.

The legacy comparison was rewritten around those descriptions. Removed unverified claims about competitors’ ads, latency, mobile performance and lack of customization, plus unsupported statements about real exploits or telemetry. No comparative benchmark was performed.

Main-page titles and descriptions now match their keyword groups. FAQs and internal links connect the relevant guides to the apps. Hacker Typer’s hidden duplicate H1 and keyword-heavy section were replaced with a user-accessible guides and FAQ disclosure; its existing application heading now names Hacker Typer. FAQ data and visible answers share the same source. The legacy Hacker article layout no longer inherits the generic application schema.

## Validation and measurement

Validate Astro, the production build and the existing SEO script. Check Hacker Typer as well as the standard app pages for one H1, concise metadata, canonical and social URL consistency, visible FAQ/schema parity, and resolving links. Verify the new guides in the blog, RSS and sitemap. Inspect Hacker Typer’s disclosure on desktop and mobile.

After deployment, use Google Search Console to inspect the updated canonical pages and new guides. Compare impressions, clicks and query positions by keyword group and page over comparable periods. Rankings depend on indexing, competition, usefulness and external signals; this repository update is not proof of higher positions.

Completed validation: Astro check reported zero errors and warnings; the final static build produced 48 pages. The extended SEO script passed all five app pages. Generated-HTML checks passed the two new guides and revised comparison for metadata, canonical URLs, one H1, article schema without application schema, local links and anchors, blog inclusion, RSS and sitemap entries. Browser checks confirmed that Hacker Typer's help opens within desktop and mobile viewports without horizontal overflow; the mobile control was moved above the toolbar and its close interaction was verified. `git diff --check` passed.
