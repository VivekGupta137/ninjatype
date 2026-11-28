/** Seeded PRNG so a day's drill is stable across reloads. */
export function mulberry32(seed: number) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export const hashSeed = (text: string): number => {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
    return h >>> 0;
};

export interface Drill { text: string; words: number; /** How many times each focus key appears in the drill. */ coverage: Record<string, number> }

const MAX_WORD = 8;
const TARGET_WORDS = 30;
const MIN_CANDIDATES = 8;

/** Builds practice text from common words that contain the focus keys. Returns null when the word pool has too few matches. */
export function buildDrill(focus: string[], pool: string[], seed: string, length = TARGET_WORDS): Drill | null {
    const keys = [...new Set(focus.filter(k => /^[a-z]$/.test(k)))];
    if (!keys.length || !Number.isSafeInteger(length) || length < 1) return null;
    // Keep all matching words: a global top-N can exclude a rare focus key entirely.
    const candidates = [...new Set(pool.filter(w => /^[a-z]+$/.test(w) && w.length >= 2 && w.length <= MAX_WORD && keys.some(k => w.includes(k))))].sort();
    if (candidates.length < MIN_CANDIDATES) return null;
    const byKey = keys.map(key => candidates.filter(word => word.includes(key))).filter(words => words.length);
    const rand = mulberry32(hashSeed(seed));
    const uses = new Map<string, number>();
    const picked: string[] = [];
    for (let i = 0; i < length; i++) {
        // Rotate through supported keys and favour least-used words for variety.
        const options = byKey[i % byKey.length];
        const nonAdjacent = options.filter(word => word !== picked[picked.length - 1]);
        const available = nonAdjacent.length ? nonAdjacent : options;
        const minUses = Math.min(...available.map(word => uses.get(word) ?? 0));
        const leastUsed = available.filter(word => (uses.get(word) ?? 0) === minUses);
        const word = leastUsed[Math.floor(rand() * leastUsed.length)];
        picked.push(word);
        uses.set(word, (uses.get(word) ?? 0) + 1);
    }
    const text = picked.join(" ");
    const coverage = Object.fromEntries(keys.map(k => [k, [...text].filter(c => c === k).length]));
    return { text, words: picked.length, coverage };
}

/** A stable single-key drill for a priority-key card. */
export function buildKeyDrill(key: string, pool: string[], day: string): Drill | null {
    return buildDrill([key], pool, `${day}:key:${key}`);
}
