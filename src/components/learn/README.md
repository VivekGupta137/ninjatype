# Finger training

The `/learn/` hub contains four finger pairs. Each has three cumulative levels:

| Pair | Level 1 | Level 2 adds | Level 3 adds |
| --- | --- | --- | --- |
| Index | F, J | G, H, R, U, T, Y | V, B, N, M |
| Middle | D, K | E, I | C, comma |
| Ring | S, L | W, O | X, period |
| Pinky | A, semicolon | Q, P | Z, slash |

A completed drill needs **10 stars and at least 95% accuracy in the same session** to unlock the next level. Stars use the existing speed and accuracy rating, and show the best rating for the active level; they do not accumulate across attempts. Every new level starts with zero stars and its own best speed/accuracy. Earlier keys remain in later levels. All twelve levels are required for TypeNinja.

## State and scoring

- `constants/fingerLessons.ts` defines the compact curriculum, targets, and balanced ten-word drills. Every drill includes every key in the active level.
- `store/learn.ts` persists all four learning paths in `learn-progress`. Each finger has `currentLevel`, three `levels` with best WPM/accuracy, stars and completion, and all-time bests.
- Legacy records (including the old `index` key) retain their all-time speed and accuracy. They start the new curriculum at level one because the previous records cannot prove level mastery.
- `store/learnKeyboardState.ts` contains only learn-specific atoms. The current drill level stays fixed until a new drill starts, even when completion unlocks the next level.
- `store/learnKeyboard.ts` owns starting, restarting, and committing one completed attempt. It snapshots final metrics and the unlock outcome. Any unlocked level can be retaken without regressing the saved learning path; locked levels cannot start or receive results.
- `store/learnAnalytics.ts` computes accuracy from the current text and speed from elapsed time. Final results include the last keystroke, not just the last one-second sample.
- `hooks/useLearnTypedText.tsx` commits input synchronously. The typing input blocks paste and drop so a pasted drill cannot unlock levels.

Learn stores remain separate from the main typing test stores.

## UI

`FingerSelection` and `FingerCard` show current levels, stars, and twelve-level progress. `LessonKeyboard` previews the saved level's keys. `FingerPractice` shows a three-step path, mastery target, live statistics, saved outcome, and next-level action. `KeySelector` now serves as a fixed key guide: required keys cannot be disabled to bypass a level.

The result stays visible after an unlock. Starting the next drill loads the saved next level with zero stars. Reloading or revisiting a finger resumes that saved level. Click an unlocked level in the three-step path to retake it. Restart repeats that selected level, and the replay result offers a resume action for the furthest unlocked level.

The keyboard has two minimal feedback views: **Key latency** and **Accuracy**. Measurements color each practiced key's border and fill using the existing `--error-color` and `--success-color` variables, softened against `--bg-color`. Hover or focus a key to inspect its actual readings and sample counts. Unmeasured keys remain neutral. Completed-drill feedback is saved per finger and level, and combined with the current drill without double-counting completion.

`lib/learnKeyFeedback.ts` tracks attempts against the intended key, retaining mistakes after corrections. Latency is the average interval before a correct character press. First presses, pauses longer than five seconds, and zero-time batched inserts do not invent latency samples. The timing scale runs from green at 200 ms or less to red at 1000 ms or more; accuracy runs from green at 100% to red at 80% or less.

Styles are in `styles/learn.css`; shared typing and star styles are in `styles/global.css`. User-facing requirements are documented in `content/stars.mdx` and the learning FAQ.

## Verification

Run `bun test src/store/learn.test.ts src/lib/learnKeyFeedback.test.ts`, `bun run check`, and `bun run build`. Browser checks should cover unlocks, fresh stars, replay/resume, key feedback and tooltips, final mastery, mobile layout, and the existing typing input.
