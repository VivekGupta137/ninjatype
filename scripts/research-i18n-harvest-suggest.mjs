// Harvest Google Suggest (autocomplete) keyword expansions per market.
// Usage: node scripts/research-i18n-harvest-suggest.mjs
// Output: research/international-keywords-2026-11-21/suggest/<market>.json

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = resolve(ROOT, 'research/international-keywords-2026-11-21/suggest');
mkdirSync(OUT_DIR, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');
const KANA_STARTS = ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ'];
const ARABIC_STARTS = ['ا', 'ب', 'ت', 'س', 'ع', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'];

const MARKETS = [
    {
        market: 'de-DE',
        hl: 'de', gl: 'DE',
        seeds: ['tippen lernen', 'tippgeschwindigkeit', 'tipptest', 'schreibgeschwindigkeit', 'maschinenschreiben', 'tastaturschreiben', 'tippspiele', '10 finger schreiben'],
        expand: ['tippen lernen', 'tippgeschwindigkeit', 'test tippgeschwindigkeit'],
        alphabet: ALPHABET,
    },
    {
        market: 'fr-FR',
        hl: 'fr', gl: 'FR',
        seeds: ['test de frappe', 'dactylographie', 'cours de dactylo', 'vitesse de frappe', 'apprendre à taper au clavier', 'jeux de frappe', 'dactylo', 'test de vitesse de frappe'],
        expand: ['test de frappe', 'dactylo'],
        alphabet: ALPHABET,
    },
    {
        market: 'it-IT',
        hl: 'it', gl: 'IT',
        seeds: ['test di battitura', 'dattilografia', 'corso di dattilografia', 'velocità di battitura', 'scrivere senza guardare la tastiera', 'giochi di battitura', 'test velocità di battitura'],
        expand: ['test di battitura'],
        alphabet: ALPHABET,
    },
    {
        market: 'nl-NL',
        hl: 'nl', gl: 'NL',
        seeds: ['typsnelheid', 'blind typen', 'typcursus', 'typtoets', 'typen leren', 'typen oefenen', 'typsnelheid test', 'typspel'],
        expand: ['blind typen', 'typsnelheid'],
        alphabet: ALPHABET,
    },
    {
        market: 'nb-NO',
        hl: 'no', gl: 'NO',
        seeds: ['skrivetest', 'skrivehastighet', 'blindskrift', 'tastaturskriving', 'skrivehastighet test', 'lære blindskrift'],
        expand: ['skrivetest'],
        alphabet: ALPHABET,
    },
    {
        market: 'da-DK',
        hl: 'da', gl: 'DK',
        seeds: ['skrivehastighed', 'blindskrift', 'skrivetest', 'skrivetræning', 'skrivehastighedstest', 'lær blindskrift'],
        expand: ['blindskrift'],
        alphabet: ALPHABET,
    },
    {
        market: 'sv-SE',
        hl: 'sv', gl: 'SE',
        seeds: ['skrivhastighet', 'blindskrift', 'tangentbordsträning', 'snabbskrivning', 'skrivhastighetstest', 'lära sig blindskrift'],
        expand: ['blindskrift'],
        alphabet: ALPHABET,
    },
    {
        market: 'ja-JP',
        hl: 'ja', gl: 'JP',
        seeds: ['タイピング練習', 'タイピングゲーム', 'タイピング速度', 'ローマ字入力 練習', 'タイピング検定', 'タイピングテスト', 'タイピング おすすめ', 'タイピング 早い'],
        expand: ['タイピング', 'タイピング練習'],
        alphabet: KANA_STARTS,
    },
    {
        market: 'ar-AE',
        hl: 'ar', gl: 'AE',
        seeds: ['اختبار سرعة الكتابة', 'تعلم الكتابة', 'لعبة الكتابة', 'الكتابة السريعة', 'الطباعة باللمس', 'اختبار الكتابة'],
        expand: ['اختبار الكتابة', 'تعلم الكتابة'],
        alphabet: ARABIC_STARTS,
    },
    {
        market: 'en-US',
        hl: 'en', gl: 'US',
        seeds: ['typing test', 'typing practice', 'typing games', 'learn touch typing', 'typing speed test'],
        expand: ['typing test'],
        alphabet: ALPHABET,
    },
    {
        market: 'en-GB',
        hl: 'en', gl: 'GB',
        seeds: ['typing test', 'typing practice', 'touch typing course', 'typing speed test'],
        expand: [],
        alphabet: [],
    },
    {
        market: 'en-CA',
        hl: 'en', gl: 'CA',
        seeds: ['typing test', 'typing practice', 'clavier dactylographie', 'test de dactylographie'],
        expand: [],
        alphabet: [],
    },
    {
        market: 'en-AU',
        hl: 'en', gl: 'AU',
        seeds: ['typing test', 'typing practice', 'typing speed test'],
        expand: [],
        alphabet: [],
    },
    {
        market: 'en-SG',
        hl: 'en', gl: 'SG',
        seeds: ['typing test', 'typing practice', 'typing speed test'],
        expand: [],
        alphabet: [],
    },
];

async function suggest(q, hl, gl) {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=${hl}&gl=${gl}&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } });
    if (!res.ok) return { error: res.status };
    const text = await res.text();
    try { return JSON.parse(text)[1] ?? []; } catch { return { error: 'parse', text: text.slice(0, 120) }; }
}

for (const m of MARKETS) {
    const queries = [...m.seeds];
    for (const seed of m.expand) {
        for (const letter of m.alphabet) queries.push(`${seed} ${letter}`);
        // also prefix expansions (letter + seed) for high-value head terms
        if (m.alphabet === ALPHABET) for (const letter of m.alphabet.slice(0, 13)) queries.push(`${letter} ${seed}`);
    }
    const out = { market: m.market, harvested: new Date().toISOString(), seeds: m.seeds, results: {} };
    let failures = 0;
    for (const q of queries) {
        const r = await suggest(q, m.hl, m.gl);
        if (Array.isArray(r)) out.results[q] = r;
        else { out.results[q] = r; failures++; }
        await sleep(250);
    }
    out.failureCount = failures;
    writeFileSync(resolve(OUT_DIR, `${m.market}.json`), JSON.stringify(out, null, 2));
    const unique = new Set(Object.values(out.results).flatMap(v => Array.isArray(v) ? v : [])).size;
    console.log(`${m.market}: ${queries.length} queries, ${unique} unique suggestions, ${failures} failures`);
}
console.log('done');
