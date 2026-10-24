import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

// Validate the generated static HTML so client-only metadata/content cannot pass.
const root = process.argv[2] || join(process.cwd(), 'dist');
const origin = 'https://www.ninjatype.com';
const routes = ['/', '/multiplayer-typing-race/', '/ghost-race/', '/learn/'];
const titles = new Set();
const descriptions = new Set();
const decode = value => value.replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (_, number) => String.fromCodePoint(number[0].toLowerCase() === 'x' ? parseInt(number.slice(1), 16) : Number(number))).replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#(?:39|x27);/g, "'").replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g)]
    .map(([, key, double, single, unquoted]) => [key, decode(double ?? single ?? unquoted)]));
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(match => attrs(match[0]));
const text = html => decode(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
const graphNodes = data => data['@graph'] ?? [data];
const sitemap = readdirSync(root).filter(name => /^sitemap.*\.xml$/.test(name)).map(name => readFileSync(join(root, name), 'utf8')).join('');

for (const route of routes) {
    const html = readFileSync(join(root, route.slice(1), 'index.html'), 'utf8');
    const title = text(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '');
    const meta = tags(html, 'meta');
    const description = meta.find(tag => tag.name === 'description')?.content;
    const canonical = tags(html, 'link').filter(tag => tag.rel === 'canonical');
    assert(title.includes('NinjaType') && title.length <= 65, `${route}: descriptive, concise title`);
    assert(description && description.length >= 100 && description.length <= 170, `${route}: useful description`);
    assert(!titles.has(title) && !descriptions.has(description), `${route}: unique metadata`);
    titles.add(title); descriptions.add(description);
    assert.equal(canonical.length, 1, `${route}: one canonical`);
    assert.equal(canonical[0].href, origin + route, `${route}: production canonical`);
    assert.equal(meta.find(tag => tag.property === 'og:url')?.content, origin + route);
    assert.equal(meta.find(tag => tag.name === 'twitter:url')?.content, origin + route);
    assert.equal(meta.find(tag => tag.property === 'og:title')?.content, title);
    assert.equal(meta.find(tag => tag.property === 'og:description')?.content, description);
    assert.equal(meta.find(tag => tag.property === 'og:image')?.content, origin + '/images/og-image.png');
    assert.equal(meta.find(tag => tag.property === 'og:image:width')?.content, '1200');
    assert.equal(meta.find(tag => tag.property === 'og:image:height')?.content, '630');
    assert(!tags(html, 'link').some(tag => tag.rel === 'stylesheet' && tag.href?.includes('fonts.googleapis.com')), `${route}: no external render-blocking font CSS`);
    assert(!meta.find(tag => tag.name === 'robots')?.content.includes('noindex'), `${route}: indexable`);
    assert.equal([...html.matchAll(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi)].length, 1, `${route}: one main heading`);
    const h1 = text(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)[1]);
    assert(/typing/i.test(h1), `${route}: heading identifies typing intent`);
    const jsonld = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
        .filter(([, attributes]) => attrs(attributes).type === 'application/ld+json').map(([, , body]) => JSON.parse(body));
    const nodes = jsonld.flatMap(graphNodes);
    for (const type of ['Organization', 'WebSite', 'WebPage', 'WebApplication', 'FAQPage']) {
        assert.equal(nodes.filter(node => node['@type'] === type).length, 1, `${route}: one ${type}`);
    }
    assert(!JSON.stringify(jsonld).includes('aggregateRating'), `${route}: no unsupported ratings`);
    assert(!JSON.stringify(jsonld).includes('https://ninjatype.com'), `${route}: consistent schema domain`);
    assert.equal(nodes.find(node => node['@type'] === 'WebApplication').url, origin + route);
    const renderedText = text(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ''));
    const faqs = nodes.find(node => node['@type'] === 'FAQPage').mainEntity;
    for (const faq of faqs) {
        assert(renderedText.includes(faq.name), `${route}: FAQ question in initial HTML`);
        assert(renderedText.includes(faq.acceptedAnswer.text), `${route}: FAQ answer in initial HTML`);
    }
    for (const { href } of tags(html, 'a')) {
        if (!href?.startsWith('/') || href.startsWith('//')) continue;
        const url = new URL(href, origin);
        const path = decodeURIComponent(url.pathname).replace(/^\//, '');
        assert(existsSync(join(root, path)) || existsSync(join(root, path, 'index.html')), `${route}: link resolves ${href}`);
    }
    assert(sitemap.includes(`<loc>${origin + route}</loc>`), `${route}: included in sitemap`);
    console.log(`${route} ✓ ${title.length}-character title, ${description.length}-character description, SSR content and schema`);
}
assert(!/<loc>[^<]*\/(?:online|multiplayer)\/?<\/loc>/.test(sitemap), 'Redirect aliases excluded from sitemap');
assert(readFileSync(join(root, 'robots.txt'), 'utf8').includes(`Sitemap: ${origin}/sitemap-index.xml`));
const png = readFileSync(join(root, 'images/og-image.png'));
assert.equal(png.readUInt32BE(16), 1200); assert.equal(png.readUInt32BE(20), 630);
const rss = readFileSync(join(root, 'rss.xml'), 'utf8');
assert(rss.includes('href="/rss/styles.xsl"'), 'RSS references its stylesheet');
const xsl = readFileSync(join(root, 'rss/styles.xsl'), 'utf8');
assert(xsl.includes('http://www.w3.org/1999/XSL/Transform') && xsl.includes('select="channel/item"'), 'RSS stylesheet exists with item rendering');
assert(!rss.includes('https://ninjatype.com'), 'RSS uses production host');
for (const font of ['bagel-fat-one-latin-400.woff2', 'nunito-latin.woff2']) {
    assert.equal(readFileSync(join(root, 'fonts', font)).toString('ascii', 0, 4), 'wOF2');
}
console.log('Sitemap, robots, social image, local fonts, and RSS stylesheet ✓');
