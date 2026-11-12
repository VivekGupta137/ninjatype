# Web Stories

The story library is at `/stories/`. Core product stories cover typing practice,
multiplayer races with friends, touch typing lessons, and Ghost Race. Additional
stories cover Hacker Typer, the GeekTyper alternative, typing ninja practice, and
typing posture.
Each has six slides and a final link to the relevant app.

## Architecture

- `src/data/web-stories.ts` owns story copy, metadata, article associations,
  artwork references, and app links.
- `src/pages/stories/[slug].astro` renders standalone AMP documents. It must
  not use `BaseLayout`, React islands, Astro client scripts, or external app CSS.
  Its `partial` export prevents Astro from injecting prefetch and integration
  scripts; the template supplies a complete HTML document itself. AMP supplies
  the navigation and sharing interface.
- `src/pages/stories/index.astro` uses the normal site layout. Links into the
  AMP documents use `data-astro-reload` to bypass Astro client navigation.
- The blog index, corresponding articles, and footer link to the stories.
  Astro's existing sitemap integration includes the generated routes.
- Stories are self-canonical documents, not AMP copies of the blog articles.
  Do not add `rel="amphtml"` to the articles or canonicalize stories to them.
- `public/_headers` permits the official AMP CDN in the existing script and
  connection policies. Keep that permission when changing the site's CSP.

No new React island or client-side data fetch is needed. The only JavaScript
on the story documents is the AMP runtime and the AMP Story component.

## Artwork and new stories

Add a `WebStory` entry with a unique slug, concise title, description,
publication date, related article, app destination, and short slide copy.
Provide a complete story instead of withholding the explanation behind a link.
Keep each slide to one idea, with roughly 40 words or fewer when possible.

The original illustrations are defined in `scripts/generate-story-art.mjs`.
Run `bun run stories:art` after editing them and commit the generated files in
`public/images/stories/`. The first slide's image also supplies the portrait
poster. Posters are 720 × 960 JPEGs; the publisher logo is an opaque 192 × 192
PNG. Titles and explanations remain accessible HTML rather than image text.

The development tools `sharp` and `amphtml-validator` generate artwork and
validate output; neither is shipped as a story client dependency.

## Checks

Use Node 24:

```sh
source ~/.nvm/nvm.sh --no-use
nvm use 24
bun run check
bun run build
bun run check:stories
bun run check:seo
```

`check:stories` uses the official AMP validator, then checks metadata, image
dimensions, slide IDs, internal destinations, sitemap inclusion, and CSP.
It downloads the current validator by default. To reuse an official downloaded
copy, set `AMP_VALIDATOR_JS=/absolute/path/to/validator.js`.

Validate the production build, not the dev server: Astro injects development
scripts that are incompatible with AMP. For a visual check, run `bun run preview`
and open the stories in Arc through Browser MCP. Check a narrow phone viewport,
desktop, next/previous navigation, the final app link, and navigation from the blog.

## After deployment

Use Google's Web Stories test and Search Console URL Inspection on each live
story URL. The existing `/sitemap-index.xml` includes the stories automatically.
Valid AMP and metadata make the pages eligible for relevant Google surfaces;
Google controls indexing, ranking, and whether a story appears.

References:

- https://developers.google.com/search/docs/appearance/enable-web-stories
- https://amp.dev/documentation/components/amp-story/
- https://amp.dev/documentation/components/amp-story-page-outlink/
