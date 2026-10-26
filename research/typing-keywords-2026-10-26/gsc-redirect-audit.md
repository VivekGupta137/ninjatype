# Search Console redirect audit — October 26, 2026

The supplied report lists 23 redirecting URL variants. Each was fetched from production and followed one response at a time. All 23 reached a 200 response, declared the expected HTTPS www canonical URL, and had no HTML robots noindex directive. No redirect loops or broken final responses were found. This checks current technical signals, not whether Google has already indexed the final URLs.

## Why Search Console excludes these URLs

- HTTP addresses normalize to HTTPS.
- The naked ninjatype.com hostname normalizes to www.ninjatype.com.
- Extensionless page paths normalize to a trailing slash.
- The former /online route moves permanently to /ghost-race/.
- The Product Hunt referral query survives the domain redirect; the page canonical omits the tracking query.

Google should index the final canonical pages rather than these aliases. A correct redirect can remain listed as “Page with redirect”; removing it would create duplicate URL variants. Some combinations take two redirects for host and path normalization; all checked chains terminate successfully.

## Live results

| Reported URL | Redirects | Final URL | Final status |
| --- | --- | --- | --- |
| https://ninjatype.com/ | 1 | https://www.ninjatype.com/ | 200 |
| http://www.ninjatype.com/ | 1 | https://www.ninjatype.com/ | 200 |
| https://www.ninjatype.com/history | 1 | https://www.ninjatype.com/history/ | 200 |
| https://ninjatype.com/learn | 2 | https://www.ninjatype.com/learn/ | 200 |
| https://www.ninjatype.com/learn | 1 | https://www.ninjatype.com/learn/ | 200 |
| https://ninjatype.com/hacker-typer/ | 1 | https://www.ninjatype.com/hacker-typer/ | 200 |
| https://ninjatype.com/online | 2 | https://www.ninjatype.com/ghost-race/ | 200 |
| https://www.ninjatype.com/online | 1 | https://www.ninjatype.com/ghost-race/ | 200 |
| https://www.ninjatype.com/contact | 1 | https://www.ninjatype.com/contact/ | 200 |
| https://ninjatype.com/history | 2 | https://www.ninjatype.com/history/ | 200 |
| http://ninjatype.com/ | 2 | https://www.ninjatype.com/ | 200 |
| https://ninjatype.com/contact/ | 1 | https://www.ninjatype.com/contact/ | 200 |
| https://ninjatype.com/settings/ | 1 | https://www.ninjatype.com/settings/ | 200 |
| https://ninjatype.com/stars/ | 1 | https://www.ninjatype.com/stars/ | 200 |
| https://www.ninjatype.com/stars | 1 | https://www.ninjatype.com/stars/ | 200 |
| https://ninjatype.com/about/ | 1 | https://www.ninjatype.com/about/ | 200 |
| https://ninjatype.com/support/ | 1 | https://www.ninjatype.com/support/ | 200 |
| https://ninjatype.com/contributors/ | 1 | https://www.ninjatype.com/contributors/ | 200 |
| https://ninjatype.com/?ref=producthunt | 1 | https://www.ninjatype.com/?ref=producthunt | 200 |
| https://ninjatype.com/learn/fingers/pinky | 2 | https://www.ninjatype.com/learn/fingers/pinky/ | 200 |
| https://www.ninjatype.com/learn/fingers/pinky | 1 | https://www.ninjatype.com/learn/fingers/pinky/ | 200 |
| https://ninjatype.com/learn/fingers/pointer | 2 | https://www.ninjatype.com/learn/fingers/pointer/ | 200 |
| https://www.ninjatype.com/learn/fingers/pointer | 1 | https://www.ninjatype.com/learn/fingers/pointer/ | 200 |

## Repository fix

An audit of every generated HTML page found navigation links to /learn, /stars and the four finger-lesson paths without trailing slashes. Updated the lesson list, breadcrumb, lesson-switching links and completed-session next-lesson link to point directly to their canonical paths. The existing SEO script now checks navigation across all generated HTML files for HTTPS www URLs, moved aliases and missing trailing slashes.

Deploy these link updates to avoid generating fresh crawls of the redirect variants. They do not remove historical Search Console examples. In Search Console, inspect the final canonical URLs, confirm Google's selected canonical, and request indexing for final pages if needed. Keep the sitemap at https://www.ninjatype.com/sitemap-index.xml. The “Page with redirect” report is not itself a reason to request indexing for aliases or remove working redirects.

The live sitemap index and child sitemap returned 200 with a browser user agent. Its 42 page URLs all use HTTPS, www and trailing slashes, with moved aliases excluded. The final local build produced 48 pages; the existing SEO checks and the new navigation audit passed across all 48 HTML files. `git diff --check` passed. The navigation changes still require deployment.
