#!/usr/bin/env node
/**
 * Post-build: make sitemap hreflang match the page itself.
 *
 * @astrojs/sitemap derives xhtml:link alternates from URL path structure, so any
 * localised slug (e.g. /fr/apprendre-a-taper-au-clavier/) gets none. This script
 * reads the hreflang <link> tags each built page declares and rewrites its
 * <url> entry so the sitemap and the HTML always agree.
 *
 * Run automatically by `bun run build`.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const DIST = join(process.cwd(), "dist");
const SITE = "https://www.ninjatype.com";

const escapeXml = (value) =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Parse `<link rel="alternate" hreflang=".." href="..">` tags from a built page. */
function alternatesFromHtml(html) {
    const found = new Map();
    for (const tag of html.match(/<link\b[^>]*>/g) ?? []) {
        const rel = /\brel="([^"]*)"/.exec(tag)?.[1];
        const lang = /\bhreflang="([^"]*)"/.exec(tag)?.[1];
        const href = /\bhref="([^"]*)"/.exec(tag)?.[1];
        if (rel === "alternate" && lang && href && !found.has(lang)) found.set(lang, href);
    }
    return [...found].map(([lang, href]) => ({ lang, href }));
}

/** Map a sitemap <loc> to its built HTML file. */
function htmlFileFor(loc) {
    const path = loc.replace(SITE, "");
    const file = path.endsWith("/") ? join(DIST, path, "index.html") : join(DIST, path);
    return existsSync(file) ? file : null;
}

const sitemaps = readdirSync(DIST).filter((name) => /^sitemap-\d+\.xml$/.test(name));
let rewritten = 0;
let withAlternates = 0;
let missing = 0;

for (const name of sitemaps) {
    const file = join(DIST, name);
    const xml = readFileSync(file, "utf8");

    const next = xml.replace(/<url>([\s\S]*?)<\/url>/g, (block) => {
        const loc = /<loc>([^<]+)<\/loc>/.exec(block)?.[1];
        if (!loc) return block;

        const htmlFile = htmlFileFor(loc);
        if (!htmlFile) {
            missing += 1;
            return block;
        }

        const alternates = alternatesFromHtml(readFileSync(htmlFile, "utf8"));
        // Drop whatever the integration generated, then write the page's own set.
        const stripped = block.replace(/<xhtml:link\b[^>]*\/>/g, "");
        const links = alternates
            .map(({ lang, href }) => `<xhtml:link rel="alternate" hreflang="${escapeXml(lang)}" href="${escapeXml(href)}"/>`)
            .join("");
        if (alternates.length) withAlternates += 1;
        rewritten += 1;
        return stripped.replace(/<\/loc>/, `</loc>${links}`);
    });

    writeFileSync(file, next);
}

console.log(
    `sitemap-hreflang: ${rewritten} URLs rewritten from page hreflang (${withAlternates} with alternates)` +
        (missing ? `, ${missing} without a built page (left unchanged)` : ""),
);
