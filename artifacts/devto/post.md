A typing test can tell you your words per minute and overall accuracy. But those two numbers leave a useful question unanswered: **which keys should you practise next?**

I'm Vivek Gupta, the creator of [NinjaType](https://www.ninjatype.com/), a free, open-source typing practice app. It combines typing tests with focused finger lessons, per-key feedback, and ways to make practice more engaging.

For fellow developers, here's a look at the learning experience and the implementation choices behind it.

## Start with two keys, then expand

A large catalogue of drills can make it hard to choose where to start. NinjaType keeps the finger curriculum compact: four finger pairs, with three cumulative levels each.

The index-finger path starts with just **F and J**. Level two adds G, H, R, U, T, and Y; level three adds V, B, N, and M. The earlier keys stay in the later drills so progression still reinforces the basics.

The other paths follow the same pattern:

| Finger pair | Start with | Level two adds | Level three adds |
| --- | --- | --- | --- |
| Middle | D, K | E, I | C, comma |
| Ring | S, L | W, O | X, period |
| Pinky | A, semicolon | Q, P | Z, slash |

To unlock the next level, a completed session needs **10 stars and at least 95% accuracy**. Stars reflect the session's speed and accuracy rating; they aren't a currency accumulated by repeating easy attempts. Each new level starts with zero stars and its own records.

Previously unlocked levels remain available to retake. A replay can improve your results without moving your saved learning progress backwards.

You can explore the paths in the [touch typing lessons](https://www.ninjatype.com/learn/).

## Make the keyboard useful feedback

The learning keyboard has two views: **Key latency** and **Accuracy**. Practised keys get subtle border and fill colors, ranging from soft red to green. Hovering or focusing a key reveals the actual readings and sample counts.

The colors use the app's existing theme variables, including `--error-color`, `--success-color`, and `--bg-color`. That keeps the feedback consistent with the selected theme and avoids introducing a separate palette just for analytics.

Unmeasured keys stay neutral. Missing data shouldn't look like perfect accuracy or instant typing.

## Measuring a key is trickier than counting keystrokes

Each key's learning metrics track four values:

```ts
interface LearnKeyMetric {
  attempts: number;
  errors: number;
  latencySamples: number;
  totalLatencyMs: number;
}
```

The display reads them with explicit checks for missing samples:

```ts
const readLearnKeyMetric = (metric?: LearnKeyMetric) => ({
  accuracy: metric?.attempts
    ? (1 - metric.errors / metric.attempts) * 100
    : null,
  latency: metric?.latencySamples
    ? metric.totalLatencyMs / metric.latencySamples
    : null,
});
```

Mistakes are attributed to the **intended key**, and correcting the text doesn't erase those mistakes from the per-key feedback. Otherwise, backspacing could hide the very keys a learner needs to work on.

Latency is the average interval before a correct character press. It isn't a pure measurement of a finger's reaction time: the preceding key and typing rhythm also affect it. The first press has no interval to measure, pauses longer than five seconds are excluded, and zero-time batched inserts don't create timing samples.

Completed attempts contribute to saved feedback for that finger and level. The current drill can be shown alongside those records without counting a completed attempt twice.

## The stack and state boundaries

NinjaType uses **Astro, React, TypeScript, and Nanostores**, with Apache ECharts for charts. The site runs on Cloudflare Pages; multiplayer uses a separate Cloudflare Worker with Durable Objects.

Learning state stays separate from the main typing-test state. A lesson's active level is fixed for the duration of its drill, even when finishing it unlocks the next one. This lets the learner inspect their result before starting a new drill with a fresh target.

Learning progress and key feedback are saved in the browser. Normal typing practice and lessons don't require an account.

Beyond lessons, there are timed typing tests, [multiplayer typing races](https://www.ninjatype.com/multiplayer-typing-race/), and a Ghost Race mode based on a saved personal benchmark.

## Try it or inspect the code

If you're learning touch typing, start with one finger pair and use the feedback to choose what to repeat. If you're building a learning tool, the distinction between current input, completed-attempt metrics, and saved progression may be useful in your own app.

NinjaType is available under the GPLv3 license. The [source code is on GitHub](https://github.com/VivekGupta137/ninjatype), including the curriculum, learning stores, and per-key measurement logic.

What feedback would help you choose your next typing drill: individual keys, common letter pairs, or something else?

---

*Disclosure: I'm NinjaType's creator. This article was drafted with AI assistance using the project's documentation and source code.*
