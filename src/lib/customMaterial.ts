/** Pure helpers for user-supplied practice material (stored only in the browser). */

export const MAX_MATERIAL_CHARS = 50_000;
export const MAX_MATERIALS = 20;
export const SECTION_WORDS = 25;
export const MAX_TITLE_CHARS = 80;

export type Material = {
    id: string;
    title: string;
    /** Cleaned, printable-ASCII, single-spaced text. */
    text: string;
    createdAt: number;
    updatedAt: number;
    /** Section the learner should continue from (0-based, sections mode). */
    nextSection: number;
    lastPracticedAt?: number;
    bestWpm?: number;
    bestAccuracy?: number;
};

export type CleanResult = {
    text: string;
    /** Characters swapped for an ASCII equivalent (curly quotes, accents, ...). */
    replaced: number;
    /** Characters with no ASCII equivalent that were dropped. */
    removed: number;
};

const REPLACEMENTS: Record<string, string> = {
    "\u2018": "'", "\u2019": "'", "\u201A": "'", "\u2032": "'", "\u00B4": "'", "`": "'",
    "\u201C": '"', "\u201D": '"', "\u201E": '"', "\u2033": '"', "\u00AB": '"', "\u00BB": '"',
    "\u2010": "-", "\u2011": "-", "\u2012": "-", "\u2013": "-", "\u2014": "-", "\u2015": "-", "\u2212": "-",
    "\u2026": "...", "\u2022": "-", "\u00B7": "-", "\u25CF": "-", "\u2023": "-",
    "\u00A0": " ", "\u2009": " ", "\u200A": " ", "\u202F": " ", "\u2007": " ", "\u2002": " ", "\u2003": " ",
    "\u00DF": "ss", "\u00E6": "ae", "\u00C6": "AE", "\u0153": "oe", "\u0152": "OE", "\u00F8": "o", "\u00D8": "O",
    "\u00F0": "d", "\u00D0": "D", "\u00FE": "th", "\u00DE": "Th", "\u0142": "l", "\u0141": "L", "\u0111": "d", "\u0110": "D",
    "\u00A9": "(c)", "\u00AE": "(R)", "\u2122": "(TM)", "\u00A7": "S.", "\u00B6": " ",
    "\u00B5": "u", "\u03BC": "u", "\u00B1": "+/-", "\u00D7": "x", "\u00F7": "/", "\u2264": "<=", "\u2265": ">=", "\u2260": "!=",
    "\u2192": "->", "\u2190": "<-", "\u00B0": " deg", "\u20AC": "EUR", "\u00A3": "GBP", "\u00A5": "JPY", "\u00A2": "c",
    "\u00BD": "1/2", "\u00BC": "1/4", "\u00BE": "3/4", "\u00B2": "2", "\u00B3": "3", "\u00B9": "1",
};

/** Clean pasted text down to single-spaced printable ASCII the keyboard can type. */
export function cleanMaterialText(raw: string): CleanResult {
    let replaced = 0;
    let removed = 0;
    let out = "";
    for (const char of String(raw ?? "").normalize("NFC")) {
        const code = char.codePointAt(0) ?? 0;
        if (code >= 0x20 && code <= 0x7e) { out += char; continue; }
        if (char === "\n" || char === "\r" || char === "\t") { out += " "; continue; }
        if (code < 0x20 || code === 0x7f || (code >= 0x200b && code <= 0x200f) || code === 0xfeff || code === 0xad) {
            continue; // control and zero-width characters are invisible, not "lost" content
        }
        const mapped = REPLACEMENTS[char];
        if (mapped !== undefined) { out += mapped; replaced++; continue; }
        // Accents: decompose and keep the base letters (e + combining acute -> e).
        const base = char.normalize("NFD").replace(/[^\x20-\x7e]/g, "");
        if (base && base !== char) { out += base; replaced++; continue; }
        removed++;
    }
    return { text: out.replace(/ {2,}/g, " ").trim(), replaced, removed };
}

export function countWords(text: string): number {
    const trimmed = text.trim();
    return trimmed ? trimmed.split(" ").length : 0;
}

/** Split into ~size-word sections; a short tail joins the previous section. */
export function splitSections(text: string, size = SECTION_WORDS): string[] {
    const words = text.trim() ? text.trim().split(" ") : [];
    if (words.length === 0) return [];
    const sections: string[] = [];
    for (let i = 0; i < words.length; i += size) sections.push(words.slice(i, i + size).join(" "));
    if (sections.length > 1) {
        const last = sections[sections.length - 1].split(" ").length;
        if (last < size / 2) {
            const tail = sections.pop() as string;
            sections[sections.length - 1] += " " + tail;
        }
    }
    return sections;
}

export function defaultTitle(text: string): string {
    const words = text.trim().split(" ").slice(0, 6).join(" ");
    const title = words.length > 40 ? words.slice(0, 40).trimEnd() : words;
    return (title || "Untitled") + (text.trim().length > title.length ? "..." : "");
}

export function cleanTitle(title: string, text: string): string {
    const cleaned = cleanMaterialText(title).text.slice(0, MAX_TITLE_CHARS).trim();
    return cleaned || defaultTitle(text);
}

export type DraftCheck =
    | { ok: true; text: string; clean: CleanResult }
    | { ok: false; error: "empty" | "too-long"; clean: CleanResult };

export function checkDraft(raw: string): DraftCheck {
    const clean = cleanMaterialText(raw);
    if (!clean.text) return { ok: false, error: "empty", clean };
    if (clean.text.length > MAX_MATERIAL_CHARS) return { ok: false, error: "too-long", clean };
    return { ok: true, text: clean.text, clean };
}

const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

/** Validate browser storage; drop malformed items instead of trusting them. */
export function parseMaterials(raw: unknown): Material[] {
    if (!Array.isArray(raw)) return [];
    const seen = new Set<string>();
    const items: Material[] = [];
    for (const item of raw) {
        if (!item || typeof item !== "object") continue;
        const m = item as Record<string, unknown>;
        if (typeof m.id !== "string" || !m.id || seen.has(m.id) || typeof m.text !== "string") continue;
        const text = cleanMaterialText(m.text).text;
        if (!text || text.length > MAX_MATERIAL_CHARS) continue;
        const total = splitSections(text).length;
        seen.add(m.id);
        items.push({
            id: m.id,
            title: cleanTitle(typeof m.title === "string" ? m.title : "", text),
            text,
            createdAt: finite(m.createdAt) ? m.createdAt : 0,
            updatedAt: finite(m.updatedAt) ? m.updatedAt : 0,
            nextSection: finite(m.nextSection) ? Math.min(Math.max(0, Math.floor(m.nextSection)), Math.max(0, total - 1)) : 0,
            ...(finite(m.lastPracticedAt) ? { lastPracticedAt: m.lastPracticedAt } : {}),
            ...(finite(m.bestWpm) && m.bestWpm > 0 ? { bestWpm: m.bestWpm } : {}),
            ...(finite(m.bestAccuracy) && m.bestAccuracy >= 0 && m.bestAccuracy <= 100 ? { bestAccuracy: m.bestAccuracy } : {}),
        });
        if (items.length >= MAX_MATERIALS) break;
    }
    return items;
}

export type RunMode = "sections" | "whole";

export type CustomRun = {
    materialId: string;
    title: string;
    mode: RunMode;
    /** 0-based section index (always 0 for whole text). */
    section: number;
    totalSections: number;
    /** The full passage to type. The keyboard only renders a window of it (see windowedSentence). */
    sentence: string;
    /** Word count of `sentence`. */
    words: number;
    /** The passage was lowercased for the run. */
    lowercase: boolean;
};

/** Words rendered up front, and how far ahead of the cursor the window is kept. */
export const WINDOW_WORDS = 100;
export const WINDOW_MIN_AHEAD = 40;

/** The first `count` words of a passage (the part the keyboard renders). */
export function windowedSentence(full: string, count: number): string {
    return full.split(" ").slice(0, Math.max(1, count)).join(" ");
}

/** How many words to render now: grow only when the cursor nears the end of the window. */
export function nextWindowCount(total: number, current: number, typed: number): number {
    if (current >= total) return total;
    if (current - typed >= WINDOW_MIN_AHEAD) return current;
    return Math.min(total, typed + WINDOW_WORDS);
}

/** The window shown at the start of a run. */
export const initialWindowCount = (total: number) => Math.min(total, WINDOW_WORDS);

/** The last practised run, so the library can offer "Continue practice". */
export type ActiveRun = { materialId: string; mode: RunMode; section: number };

export function parseActiveRun(raw: unknown): ActiveRun | null {
    if (!raw || typeof raw !== "object") return null;
    const a = raw as Record<string, unknown>;
    if (typeof a.materialId !== "string" || !a.materialId) return null;
    if (a.mode !== "sections" && a.mode !== "whole") return null;
    if (typeof a.section !== "number" || !Number.isFinite(a.section) || a.section < 0) return null;
    return { materialId: a.materialId, mode: a.mode, section: Math.floor(a.section) };
}

/** Build the passage to type. `section` is the starting section, clamped into range. */
export function buildRun(material: Pick<Material, "id" | "title" | "text">, mode: RunMode, section = 0, lowercase = false): CustomRun {
    const sections = splitSections(material.text);
    if (sections.length <= 1) {
        return { materialId: material.id, title: material.title, mode: "whole", section: 0, totalSections: 1, sentence: lowercase ? material.text.toLowerCase() : material.text, words: countWords(material.text), lowercase };
    }
    const index = Math.min(Math.max(0, Math.floor(section)), sections.length - 1);
    const base = { materialId: material.id, title: material.title, section: index, totalSections: sections.length };
    // Whole text from a chosen section types everything from there to the end.
    const raw = mode === "whole" ? sections.slice(index).join(" ") : sections[index];
    const sentence = lowercase ? raw.toLowerCase() : raw;
    return { ...base, mode: mode === "whole" ? "whole" : "sections", sentence, words: countWords(sentence), lowercase };
}

/** Where "continue" should resume after finishing `run` (wraps to the start). */
export function nextSectionIndex(run: Pick<CustomRun, "mode" | "section" | "totalSections">): number {
    if (run.mode === "whole") return 0;
    return run.section + 1 >= run.totalSections ? 0 : run.section + 1;
}
