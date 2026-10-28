# NinjaType — Free Typing Test & Touch Typing Practice

[NinjaType](https://www.ninjatype.com/) is a free, open-source typing practice website for testing your typing speed, learning touch typing, and working on keyboard accuracy. Practise English words or quotes, follow progressive finger lessons, and race with friends in your browser.

**[Take a free typing test →](https://www.ninjatype.com/)**

[![NinjaType: free online typing tests, touch typing lessons, and typing games](https://www.ninjatype.com/images/og-image.png)](https://www.ninjatype.com/)

![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![GitHub Sponsors](https://img.shields.io/github/sponsors/VivekGupta137?label=Sponsor&logo=github&color=EA4AAA)](https://github.com/sponsors/VivekGupta137)

## Find your typing practice

| Your goal | Where to start |
| :--- | :--- |
| Measure typing speed and accuracy | [Free online typing test](https://www.ninjatype.com/) — practise words or quotes and see your WPM and accuracy. |
| Learn consistent finger placement | [Touch typing lessons](https://www.ninjatype.com/learn/) — start with home keys and unlock harder reaches. |
| Play a typing game with friends | [Multiplayer typing race](https://www.ninjatype.com/multiplayer-typing-race/) — create or join a room and compare results. |
| Challenge your personal best | [Ghost Race typing practice](https://www.ninjatype.com/ghost-race/) — practise against a benchmark from your saved typing history. |
| Review completed typing sessions | [Typing speed history and analytics](https://www.ninjatype.com/history/) — compare your saved speed, accuracy, and progress. |
| Try a playful code display | [Hacker Typer simulator](https://www.ninjatype.com/hacker-typer/) — turn keypresses into a simulated hacker screen. |

## Free online typing test

Use NinjaType to take a baseline typing speed test and repeat it with the same settings as you practise. The typing area gives immediate feedback on correct letters and mistakes, while the statistics show words per minute (WPM) and accuracy.

- **Words, timed tests, and quotes:** choose a word-count exercise, a timer, or a quote passage.
- **English word lists:** practise with 1,000-, 2,000-, or 5,000-word dictionaries, including focused word-length sets.
- **Quote collections:** choose programming, motivational, funny, and other passages.
- **Performance feedback:** inspect typing speed, accuracy, per-key errors, and key latency.
- **Saved progress:** keep settings and completed practice history in your browser.
- **Theme choices:** use AMOLED, Dracula, Nord, Tokyo Night, Catppuccin, and other themes.

Typing practice and finger lessons need no account. Shared multiplayer rooms use a security check before entry.

## Touch typing lessons for beginners

The learning path has **four finger pairs with three focused levels each**. Each pair starts with its home keys before adding upper and lower reaches:

| Finger pair | Starting keys | Progression |
| :--- | :--- | :--- |
| Index | `F` and `J` | Home anchors → inward and upper reaches → lower reaches |
| Middle | `D` and `K` | Home anchors → `E` and `I` → `C` and comma |
| Ring | `S` and `L` | Home anchors → `W` and `O` → `X` and period |
| Pinky | `A` and `;` | Home anchors → `Q` and `P` → `Z` and slash |

Earn **10 stars with at least 95% accuracy in one completed session** to unlock the next level. A new level starts at zero stars and keeps earlier keys in the drill. Retake any unlocked level to review difficult movements without losing your progress.

The keyboard guide includes **key latency and accuracy views**. Theme-based key colors highlight movements that need practice; hover over a key to see measured values and sample counts. Completed-drill feedback is saved separately for each level.

Master all twelve levels to unlock TypeNinja. [Start the touch typing lessons](https://www.ninjatype.com/learn/) and work at a pace that keeps your movements consistent.

## Typing guides and practice routines

The [NinjaType typing blog](https://www.ninjatype.com/blog/) explains finger placement, speed measurement, accuracy, and practice routines. Start with:

- [Touch typing for beginners](https://www.ninjatype.com/blog/touch-typing-for-beginners/) — learn the home position and build a repeatable practice routine.
- [Home row typing and finger placement](https://www.ninjatype.com/blog/home-row-typing-finger-placement/) — understand which fingers cover which QWERTY keys.
- [How to improve typing accuracy](https://www.ninjatype.com/blog/improve-typing-accuracy/) — identify recurring mistakes and practise difficult keys.

## Run NinjaType locally

Install [Bun](https://bun.sh/) and a supported Node.js version for Astro tooling; Node.js 22 LTS or newer is recommended.

```bash
git clone https://github.com/VivekGupta137/ninjatype.git
cd ninjatype
bun install
bun run dev
```

Open **http://127.0.0.1:4347/**. The port is configured in `astro.config.mjs`.

| Command | Purpose |
| :--- | :--- |
| `bun run dev` | Start the local Astro development server. |
| `bun run check` | Check Astro and TypeScript diagnostics. |
| `bun run build` | Build the production site into `dist/`. |
| `bun run preview` | Preview the production build locally. |
| `bun run check:seo` | Check generated SEO metadata and routes. |
| `bun test src/store/learn.test.ts src/lib/learnKeyFeedback.test.ts` | Verify lesson progression and per-key feedback. |
| `bun run dev:multiplayer` | Start the local multiplayer Worker. |
| `bun run test:multiplayer` | Run multiplayer checks. |
| `bun run version:sync` | Sync the README version badge with `package.json`. |

See the [multiplayer backend documentation](workers/multiplayer/README.md) for room setup, local configuration, and backend deployment.

### Stack and project layout

NinjaType uses [Astro](https://astro.build/), [React](https://react.dev/), TypeScript, [Nanostores](https://github.com/nanostores/nanostores), and [Apache ECharts](https://echarts.apache.org/). The site deploys to Cloudflare Pages; shared multiplayer rooms use a separate Cloudflare Worker with Durable Objects.

```text
src/pages/             Website routes and API endpoints
src/components/        Typing, lessons, analytics, and shared UI
src/store/             Typing state and saved browser progress
src/content/blog/      Typing guides and articles
src/styles/            Theme-aware application styles
public/themes/         Theme variables
public/images/         Site images
workers/multiplayer/   Shared typing-race backend
```

### Cloudflare Pages deployment

Cloudflare Pages installs dependencies before the build. Use the public npm registry configured in `.npmrc` and the committed Bun lockfile.

| Setting | Value |
| :--- | :--- |
| Build command | `bun run build` |
| Build output directory | `dist` |
| `BUN_VERSION` | `1.2.14` |

If automatic dependency installation is disabled with `SKIP_DEPENDENCY_INSTALL=true`, use `bun install --frozen-lockfile && bun run build`. Deploy the multiplayer Worker separately using its documentation.

## Contributing and support

Bug reports, accessibility improvements, typing exercises, and documentation contributions are welcome. Use [GitHub Issues](https://github.com/VivekGupta137/ninjatype/issues) for reproducible problems or feature proposals, and submit a pull request with relevant verification.

If you use NinjaType, you can support its development by starring this repository, [sponsoring on GitHub](https://github.com/sponsors/VivekGupta137), or [supporting on Patreon](https://patreon.com/VGupta).

## License

NinjaType is released under the [GNU General Public License v3.0](LICENSE). Created by [Vivek Gupta](https://github.com/VivekGupta137).
