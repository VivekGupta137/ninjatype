import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import amphtmlValidator from 'amphtml-validator';
import sharp from 'sharp';

// Validate production output: dev-mode Astro scripts are not AMP-compatible.
// AMP_VALIDATOR_JS can point at a downloaded official validator for offline runs.
const root = resolve(process.argv[2] || 'dist');
const origin = 'https://www.ninjatype.com';
const validator = await amphtmlValidator.getInstance(process.env.AMP_VALIDATOR_JS);
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g)]
    .map(([, key, double, single, unquoted]) => [key, double ?? single ?? unquoted]));
const tags = (html, tag) => [...html.matchAll(new RegExp(`<${tag}(?=\\s|/?>)[^>]*>`, 'gi'))].map(match => attrs(match[0]));
const sitemap = readdirSync(root).filter(name => /^sitemap.*\.xml$/.test(name)).map(name => readFileSync(join(root, name), 'utf8')).join('');
const index = readFileSync(join(root, 'stories/index.html'), 'utf8');
const storyFiles = readdirSync(join(root, 'stories'), { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => join(root, 'stories', entry.name, 'index.html'));
assert(storyFiles.length >= 3, 'Initial stories exist');
const assetPath = url => {
    const parsed = new URL(url, origin);
    assert.equal(parsed.origin, origin, 'Story assets are hosted on NinjaType');
    const path = join(root, decodeURIComponent(parsed.pathname));
    assert(existsSync(path), `Asset exists: ${parsed.pathname}`);
    return path;
};

for (const file of storyFiles) {
    const html = readFileSync(file, 'utf8');
    const result = validator.validateString(html);
    for (const error of result.errors) console.error(`${file}:${error.line}:${error.col}: ${error.severity}: ${error.message}`);
    assert.equal(result.status, 'PASS', `${file}: valid AMP`);
    const [story] = tags(html, 'amp-story');
    const slug = file.split('/').at(-2);
    const url = `${origin}/stories/${slug}/`;
    assert.deepEqual(tags(html, 'link').filter(tag => tag.rel === 'canonical').map(tag => tag.href), [url], 'Self-canonical story');
    assert(story.title && story.title.length <= 70, 'Concise story title');
    assert.equal(story.publisher, 'NinjaType');
    const poster = await sharp(assetPath(story['poster-portrait-src'])).metadata();
    assert(poster.width >= 640 && poster.height >= 853 && poster.width / poster.height === 3 / 4, 'Portrait poster meets AMP guidance');
    assert(['jpeg', 'png'].includes(poster.format), 'Raster poster');
    const logo = await sharp(assetPath(story['publisher-logo-src'])).metadata();
    assert(logo.width >= 96 && logo.width === logo.height && !logo.hasAlpha, 'Square, opaque publisher logo');
    assert.equal(tags(html, 'amp-img')[0].src, new URL(story['poster-portrait-src']).pathname, 'Cover illustration matches poster');
    const pages = tags(html, 'amp-story-page');
    assert(pages.length >= 4 && pages.length <= 30, 'Multi-page story');
    assert.equal(new Set(pages.map(page => page.id)).size, pages.length, 'Unique slide IDs');
    assert.equal(tags(html, 'h1').length, 1, 'One main heading');
    for (const img of tags(html, 'amp-img')) {
        assert(img.alt, 'Illustrations have alt text');
        assetPath(img.src);
    }
    for (const { href } of tags(html, 'a')) {
        const link = new URL(href, origin);
        assert.equal(link.origin, origin);
        assert(existsSync(join(root, link.pathname, 'index.html')), `CTA resolves: ${href}`);
    }
    const schema = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
        .filter(([, attributes]) => attrs(attributes).type === 'application/ld+json').map(([, , body]) => JSON.parse(body));
    assert(schema.some(node => node['@type'] === 'Article' && node.url === url), 'Story structured data');
    assert(!/<astro-island\b|type="module"|rel="stylesheet"/.test(html), 'No incompatible app runtime or CSS');
    assert(!tags(html, 'meta').some(tag => tag.name === 'robots' && tag.content?.includes('noindex')), 'Story is indexable');
    assert(sitemap.includes(`<loc>${url}</loc>`), 'Story is in the sitemap');
    assert(tags(index, 'a').some(tag => tag.href === `/stories/${slug}/`), 'Story is linked from the index');
    assert(new RegExp(`<a[^>]*href="/stories/${slug}/"[^>]*data-astro-reload`).test(index), 'Story link triggers a full document load');
    console.log(`/stories/${slug}/ ✓ AMP, metadata, artwork, links, structured data, and sitemap (${pages.length} pages)`);
}
const headers = readFileSync(join(root, '_headers'), 'utf8');
assert(/script-src[^;]*https:\/\/cdn\.ampproject\.org/.test(headers), 'CSP permits AMP scripts');
assert(/connect-src[^;]*https:\/\/cdn\.ampproject\.org/.test(headers), 'CSP permits AMP runtime requests');
console.log('Web Stories checks passed.');
