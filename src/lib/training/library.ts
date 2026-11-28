import { hashSeed, mulberry32 } from "./drills";

/** Ready-made practice routines for any day, independent of your history. Text is built from the seed, so a day's drill is stable. */
export interface WordPools { words: string[]; long: string[] }
export type LibraryGroup = "Accuracy" | "Speed" | "Keys" | "Symbols";
export interface LibraryDrill { id: string; title: string; group: LibraryGroup; blurb: string; minutes: number; build(pools: WordPools, seed: string): string }

const LENGTH = 40;
const pick = <T,>(items: T[], rand: () => number, count: number, noRepeat = true): T[] => {
    const out: T[] = [];
    if (!items.length || (noRepeat && items.length < 2)) return out;
    while (out.length < count) {
        const bag = [...items];
        for (let i = bag.length - 1; i > 0; i--) {
            const j = Math.floor(rand() * (i + 1));
            [bag[i], bag[j]] = [bag[j], bag[i]];
        }
        if (noRepeat && bag[0] === out[out.length - 1]) [bag[0], bag[1]] = [bag[1], bag[0]];
        out.push(...bag.slice(0, count - out.length));
    }
    return out;
};
const wordsFrom = (pools: WordPools, seed: string, ok: (w: string) => boolean, count = LENGTH): string => {
    const set = [...new Set(pools.words.filter(ok))];
    return set.length >= 8 ? pick(set, mulberry32(hashSeed(seed)), count).join(" ") : "";
};
const letters = (w: string) => /^[a-z]+$/.test(w);
const only = (allowed: string) => (w: string) => letters(w) && w.length >= 3 && [...w].every(c => allowed.includes(c));
const BIGRAMS = "th he in er an re on at en nd ti es or te of ed is it al ar st to nt ng se ha as ou io le ve co me de hi ri ro ic ne ea ra ce li ch ll be ma si om ur".split(" ");

export const LIBRARY: LibraryDrill[] = [
    { id: "home-row", title: "Home row", group: "Keys", minutes: 1, blurb: "Words typed only with A S D F G H J K L. Keeps your fingers on the home position.", build: (p, s) => wordsFrom(p, s, only("asdfghjkl")) },
    { id: "top-row", title: "Top row", group: "Keys", minutes: 1, blurb: "Words from Q W E R T Y U I O P alone, for the reach up from the home row.", build: (p, s) => wordsFrom(p, s, only("qwertyuiop")) },
    { id: "bottom-row", title: "Bottom row", group: "Keys", minutes: 1, blurb: "Words from Z X C V B N M plus the home row, for the reach down.", build: (p, s) => wordsFrom(p, s, only("zxcvbnmasdfghjkl")) },
    { id: "bigrams", title: "Common letter pairs", group: "Speed", minutes: 1, blurb: "Practise common pairs like TH, HE, IN and ER to build a smoother rhythm.", build: (_p, s) => pick(BIGRAMS, mulberry32(hashSeed(s)), 60).join(" ") },
    { id: "short-words", title: "Short words, fast", group: "Speed", minutes: 1, blurb: "Four letters or fewer. Aim for rhythm and let accuracy follow.", build: (p, s) => wordsFrom(p, s, w => letters(w) && w.length <= 4 && w.length >= 2, 60) },
    { id: "long-words", title: "Long words", group: "Accuracy", minutes: 2, blurb: "Nine letters and up, for staying steady through a whole word.", build: (p, s) => { const set = [...new Set(p.long.filter(w => letters(w) && w.length >= 9))]; return set.length >= 8 ? pick(set, mulberry32(hashSeed(s)), 25).join(" ") : ""; } },
    { id: "capitals", title: "Capital letters", group: "Symbols", minutes: 1, blurb: "Names and sentence starts, to practise Shift without losing your rhythm.", build: (p, s) => wordsFrom(p, s, w => letters(w) && w.length >= 3, 30).split(" ").map((w, i) => (i % 2 === 0 ? (w[0]?.toUpperCase() ?? "") + w.slice(1) : w)).join(" ") },
    { id: "numbers", title: "Numbers", group: "Symbols", minutes: 1, blurb: "Groups of digits like phone numbers, dates and prices, on the number row.", build: (_p, s) => { const r = mulberry32(hashSeed(s)); return Array.from({ length: 20 }, () => String(Math.floor(r() * 10 ** (2 + Math.floor(r() * 4)))).padStart(2, "0")).join(" "); } },
    { id: "punctuation", title: "Punctuation", group: "Symbols", minutes: 1, blurb: "Commas, full stops, quotes and brackets woven into ordinary words.", build: (p, s) => { const r = mulberry32(hashSeed(s + "p")); const marks = [(w: string) => `${w},`, (w: string) => `${w}.`, (w: string) => `"${w}"`, (w: string) => `(${w})`, (w: string) => `${w};`, (w: string) => `${w}?`, (w: string) => `${w}!`, (w: string) => `${w}-${w.slice(0, 2)}`]; const words = wordsFrom(p, s, w => letters(w) && w.length >= 3, 24); return words ? words.split(" ").map(w => marks[Math.floor(r() * marks.length)](w)).join(" ") : ""; } },
];

export const GROUPS: LibraryGroup[] = ["Keys", "Speed", "Accuracy", "Symbols"];

/** Text for one library drill; null when the word lists have too little to build it. */
export function buildLibraryDrill(id: string, pools: WordPools, day: string): string | null {
    const drill = LIBRARY.find(d => d.id === id);
    if (!drill) return null;
    const text = drill.build(pools, `${day}:${id}`).trim();
    return text.split(/\s+/).length >= 8 ? text : null;
}
