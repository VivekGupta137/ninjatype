// Harvest Google Trends API data per market: 5-keyword relative interest + related queries.
// Usage: node scripts/research-i18n-harvest-trends.mjs
// Output: research/international-keywords-2026-11-21/trends/<market>.json

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = resolve(ROOT, 'research/international-keywords-2026-11-21/trends');
mkdirSync(OUT_DIR, { recursive: true });

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let cookieJar = '';
async function initCookies() {
    const res = await fetch('https://trends.google.com/trends/?geo=US', { headers: { 'User-Agent': UA } });
    const setCookies = res.headers.getSetCookie?.() ?? [];
    cookieJar = setCookies.map((c) => c.split(';')[0]).join('; ');
    console.log('cookies:', cookieJar.slice(0, 60) + '...');
}

async function trendsApi(path, params) {
    const url = `https://trends.google.com${path}?hl=en-US&tz=0&${new URLSearchParams(params).toString()}`;
    const res = await fetch(url, { headers: { 'User-Agent': UA, Cookie: cookieJar } });
    const text = await res.text();
    if (!res.ok) return { error: res.status, text: text.slice(0, 200) };
    const json = text.startsWith(")]}'") ? text.slice(text.indexOf('{')) : text;
    try { return JSON.parse(json); } catch { return { error: 'parse', text: text.slice(0, 200) }; }
}

// explore: returns widgets for a comparison request
async function explore(keywords, geo) {
    const comparisonItem = keywords.map((keyword) => ({ keyword, geo, time: 'today 5-y' }));
    const req = JSON.stringify({ comparisonItem, category: 0, property: '' });
    const data = await trendsApi('/trends/api/explore', { req });
    return data;
}

function widgetByName(widgets, name) {
    return widgets?.find((w) => w.id === name || w.title?.includes?.(name)) ?? null;
}

async function timeseries(widget) {
    return trendsApi('/trends/api/widgetdata/multiline', { req: JSON.stringify(widget.request), token: widget.token });
}

async function relatedQueries(widget) {
    return trendsApi('/trends/api/widgetdata/relatedsearches', { req: JSON.stringify(widget.request), token: widget.token });
}

const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

const MARKETS = [
    {
        market: 'de-DE', geo: 'DE',
        compare: ['tippen lernen', 'tippgeschwindigkeit', 'tipptest', 'schreibgeschwindigkeit', 'tastaturschreiben'],
        relatedFor: ['tippen lernen', 'tippgeschwindigkeit', 'tippspiel'],
    },
    {
        market: 'fr-FR', geo: 'FR',
        compare: ['test de frappe', 'dactylographie', 'cours de dactylo', 'vitesse de frappe', 'dactylo'],
        relatedFor: ['test de frappe', 'dactylographie'],
    },
    {
        market: 'it-IT', geo: 'IT',
        compare: ['test di battitura', 'dattilografia', 'corso di dattilografia', 'velocità di battitura', 'giochi di battitura'],
        relatedFor: ['test di battitura', 'dattilografia'],
    },
    {
        market: 'nl-NL', geo: 'NL',
        compare: ['typsnelheid', 'blind typen', 'typcursus', 'typtoets', 'typen leren'],
        relatedFor: ['typsnelheid', 'blind typen', 'typcursus'],
    },
    {
        market: 'nb-NO', geo: 'NO',
        compare: ['skrivetest', 'skrivehastighet', 'blindskrift', 'tastaturskriving'],
        relatedFor: ['skrivetest', 'blindskrift'],
    },
    {
        market: 'da-DK', geo: 'DK',
        compare: ['skrivehastighed', 'blindskrift', 'skrivetest', 'skrivetræning'],
        relatedFor: ['blindskrift', 'skrivehastighed'],
    },
    {
        market: 'sv-SE', geo: 'SE',
        compare: ['skrivhastighet', 'blindskrift', 'tangentbordsträning', 'snabbskrivning'],
        relatedFor: ['blindskrift', 'skrivhastighet'],
    },
    {
        market: 'ja-JP', geo: 'JP',
        compare: ['タイピング練習', 'タイピングゲーム', 'タイピング速度', 'ローマ字入力', 'タイピング検定'],
        relatedFor: ['タイピング練習', 'タイピング速度', 'タイピングゲーム'],
    },
    {
        market: 'ar-AE', geo: 'AE',
        compare: ['اختبار سرعة الكتابة', 'تعلم الكتابة', 'لعبة الكتابة', 'الكتابة السريعة'],
        relatedFor: ['اختبار سرعة الكتابة'],
    },
    {
        market: 'en-AE', geo: 'AE',
        compare: ['typing test', 'typing practice'],
        relatedFor: ['typing test'],
    },
    {
        market: 'en-US', geo: 'US',
        compare: ['typing test', 'typing practice', 'typing games', 'learn touch typing', 'typing speed test'],
        relatedFor: ['typing test', 'typing games'],
    },
    // same keyword compared across English markets (one keyword per geo entry)
    {
        market: 'en-cross-geo', geo: 'US',
        crossGeo: ['US', 'GB', 'CA', 'AU', 'SG', 'NZ'],
        compare: ['typing test'],
    },
];

async function handleStandardMarket(m, out) {
    // 1) 5-keyword relative comparison in one geo
    const exp = await explore(m.compare, m.geo);
    if (exp.error || !exp.widgets) { out.compare = { error: exp.error ?? 'no widgets', text: exp.text }; return; }
    const tsWidget = exp.widgets.find((w) => w.id === 'TIMESERIES');
    if (tsWidget) {
        const ts = await timeseries(tsWidget);
        if (ts.error) out.compare = { error: ts.error, text: ts.text };
        else {
            const lines = ts.default?.timelineData ?? [];
            const perKeyword = m.compare.map((kw, i) => {
                const values = lines.map((pt) => Number(pt.value[i] ?? 0)).filter((v) => !Number.isNaN(v));
                return { keyword: kw, avgInterest: Math.round(avg(values) * 10) / 10, maxInterest: Math.max(...values, 0) };
            });
            out.compare = { timeRange: 'today 5-y', points: lines.length, perKeyword };
        }
    }
    await sleep(700);
    // 2) related queries per primary keyword
    out.related = {};
    for (const kw of m.relatedFor) {
        const exp2 = await explore([kw], m.geo);
        const rqWidget = exp2.widgets?.find((w) => w.id === 'RELATED_QUERIES');
        if (!rqWidget) { out.related[kw] = { error: 'no related-queries widget' }; await sleep(700); continue; }
        const rq = await relatedQueries(rqWidget);
        const ranked = rq.default?.rankedList?.[0]?.rankedKeyword ?? [];
        const rising = rq.default?.rankedList?.[1]?.rankedKeyword ?? [];
        out.related[kw] = {
            top: ranked.slice(0, 25).map((r) => ({ query: r.query, value: Number(r.value) })),
            risingCount: rising.length,
            risingSample: rising.slice(0, 8).map((r) => ({ query: r.query, value: r.formattedValue })),
        };
        await sleep(700);
    }
}

await initCookies();
for (const m of MARKETS) {
    const out = { market: m.market, geo: m.geo, harvested: new Date().toISOString() };
    if (m.crossGeo) {
        // one keyword across several geos in a single comparison
        const comparisonItem = m.crossGeo.map((geo) => ({ keyword: m.compare[0], geo, time: 'today 5-y' }));
        const req = JSON.stringify({ comparisonItem, category: 0, property: '' });
        const exp = await trendsApi('/trends/api/explore', { req });
        const tsWidget = exp.widgets?.find((w) => w.id === 'TIMESERIES');
        if (tsWidget) {
            const ts = await timeseries(tsWidget);
            const lines = ts.default?.timelineData ?? [];
            out.crossGeo = m.crossGeo.map((geo, i) => {
                const values = lines.map((pt) => Number(pt.value[i] ?? 0)).filter((v) => !Number.isNaN(v));
                return { geo, keyword: m.compare[0], avgInterest: Math.round(avg(values) * 10) / 10 };
            });
        } else { out.crossGeo = { error: 'no timeseries widget' }; }
    } else {
        await handleStandardMarket(m, out);
    }
    writeFileSync(resolve(OUT_DIR, `${m.market}.json`), JSON.stringify(out, null, 2));
    console.log(`${m.market}: done`, JSON.stringify(out.compare?.perKeyword ?? out.crossGeo ?? out.compare?.error ?? '').slice(0, 300));
    await sleep(900);
}
console.log('done');
