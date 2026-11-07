import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
const root = process.argv[2] || join(process.cwd(), 'dist');
const origin = 'https://www.ninjatype.com';
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

for (const [slug,variant,product] of [
    ['', 'directory', '/'],
    ['monkeytype-alternative','monkey','/'],
    ['typing-com-alternative','typingcom','/learn/'],
    ['typingclub-alternative','club','/learn/'],
    ['keybr-alternative','keybr','/learn/'],
    ['ratatype-alternative','rata','/'],
    ['typingcat-alternative','cat','/'],
    ['10fastfingers-alternative','fastfingers','/'],
    ['nitro-type-alternative','nitro','/multiplayer-typing-race/'],
    ['typing-speed-test','speed','/'],
    ['typingtest-com-alternative','typingtest','/'],
    ['ztype-alternative','ztype','/ghost-race/'],
    ['keyhero-alternative','keyhero','/'],
    ['typeracer-alternative','race','/multiplayer-typing-race/'],
    ['geektyper-alternative','geek','/hacker-typer/'],
    ['hackertyper-alternative','hacker','/hacker-typer/'],
]) {
    const route = slug ? `/lp/${slug}/` : "/lp/";
    const html = readFileSync(join(root, route, 'index.html'), 'utf8');
    const title = text(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '');
    const meta = tags(html, 'meta');
    const description = meta.find(tag => tag.name === 'description')?.content;
    const canonical = tags(html, 'link').filter(tag => tag.rel === 'canonical');
    assert((title.includes('Alternative') || slug === 'typing-speed-test') && title.includes('NinjaType') && title.length <= 65, `${route}: concise title with search intent`);
    assert(description?.length >= 100 && description.length <= 170, `${route}: useful description`);
    assert(!titles.has(title) && !descriptions.has(description), `${route}: unique metadata`);
    titles.add(title); descriptions.add(description);
    assert.deepEqual(canonical.map(tag=>tag.href), [origin + route], `${route}: one production canonical`);
    assert.equal(meta.find(tag => tag.property === 'og:url')?.content, origin + route);
    assert.equal(meta.find(tag => tag.property === 'og:title')?.content, title);
    assert.equal(meta.find(tag => tag.property === 'og:description')?.content, description);
    const image = `/images/alternatives/${variant}.png`;
    assert.equal(meta.find(tag => tag.property === 'og:image')?.content, origin + image);
    assert.equal(meta.find(tag => tag.name === 'twitter:image')?.content, origin + image);
    const dimensions = await sharp(join(root,image)).metadata();
    assert.equal(dimensions.width,1200); assert.equal(dimensions.height,630);
    assert(!meta.find(tag=>tag.name==='robots')?.content.includes('noindex'), `${route}: indexable`);
    assert.equal([...html.matchAll(/<h1\b[^>]*>/g)].length,1, `${route}: one heading`);
    const nodes = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
        .filter(([,attributes])=>attrs(attributes).type==='application/ld+json')
        .flatMap(([, ,body])=>graphNodes(JSON.parse(body)));
    for (const type of ['Organization','WebSite','WebPage','FAQPage','BreadcrumbList']) assert.equal(nodes.filter(n=>n['@type']===type).length,1, `${route}: one ${type}`);
    assert(!JSON.stringify(nodes).includes('aggregateRating'), `${route}: no invented ratings`);
    const rendered = text(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,''));
    for (const faq of nodes.find(n=>n['@type']==='FAQPage').mainEntity) {
        assert(rendered.includes(faq.name),`${route}: visible FAQ question`);
        assert(rendered.includes(faq.acceptedAnswer.text),`${route}: visible FAQ answer`);
    }
    const countdowns = tags(html,'button').filter(tag => tag.class?.includes('guide-countdown'));
    assert.equal(countdowns.length,1, `${route}: one automatic navigation countdown`);
    assert.equal(countdowns[0]['data-href'],product, `${route}: countdown follows the primary activity`);
    const links = tags(html,'a');
    assert(links.filter(a=>a.href===product).length>=3, `${route}: relevant product CTAs`);
    for (const href of [...links.map(a=>a.href), ...['img','source','track','video'].flatMap(tag=>tags(html,tag).map(a=>a.src || a.poster))]) {
        if (!href?.startsWith('/') || href.startsWith('//')) continue;
        const path = decodeURIComponent(new URL(href,origin).pathname);
        assert(existsSync(join(root,path)) || existsSync(join(root,path,'index.html')),`${route}: local link or asset ${href}`);
    }
    assert(sitemap.includes(`<loc>${origin + route}</loc>`),`${route}: sitemap entry`);
    console.log(`PASS ${route}: metadata, schema, FAQs, assets, CTAs and sitemap`);
}

// Catch competitor links in older guides as well as the new landing pages.
const competitorDomains = ['monkeytype.com','typing.com','typingclub.com','keybr.com','ratatype.com','thetypingcat.com','10fastfingers.com','typeracer.com','nitrotype.com','typingtest.com','zty.pe','keyhero.com','geektyper.com','hackertyper.net'];
function auditOutbound(directory) {
    for (const entry of readdirSync(directory, {withFileTypes:true})) {
        const path = join(directory,entry.name);
        if (entry.isDirectory()) { auditOutbound(path); continue; }
        if (!entry.name.endsWith('.html')) continue;
        for (const link of tags(readFileSync(path,'utf8'),'a')) {
            if (!link.href) continue;
            const host = new URL(link.href,origin).hostname;
            assert(!competitorDomains.some(domain=>host===domain || host.endsWith('.'+domain)), `${path}: outgoing competitor link ${link.href}`);
        }
    }
}
auditOutbound(root);
console.log('PASS: no outgoing competitor links in the rendered site');
