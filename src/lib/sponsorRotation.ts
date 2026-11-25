/**
 * Fair, stateless sponsor rotation for a static site.
 *
 * - Wall-clock schedule: the sponsor on screen is `schedule[floor(now / slotMs) % length]`,
 *   so every visitor sees the same sponsor at the same moment and each gets an equal share.
 * - Seeded daily shuffle: order is by hash(id + UTC day), independent of the order in sponsor.json.
 * - Weights: `weight: 2` puts a sponsor in the schedule twice, spread out rather than back to back.
 */

export const SLOT_MS = 30_000;
export const MAX_WEIGHT = 10;

export interface Schedulable { id?: string; name: string; weight?: number }

/** UTC day, YYYY-MM-DD: the seed for the daily shuffle. */
export const dayKey = (now: number = Date.now()): string => new Date(now).toISOString().slice(0, 10);

/** FNV-1a, 32-bit. Small, deterministic, good enough for ordering. */
export function hash32(text: string): number {
    let h = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
}

const weightOf = (s: Schedulable): number => (Number.isInteger(s.weight) && s.weight! >= 1 ? Math.min(s.weight!, MAX_WEIGHT) : 1);

/**
 * Indices into `items`, in display order for the given day. Round 1 lists everyone once in
 * shuffled order, round 2 lists those with weight >= 2, and so on, so repeats are spread out.
 */
export function buildSchedule(items: Schedulable[], day: string): number[] {
    const order = items
        .map((s, i) => ({ i, w: weightOf(s), h: hash32(`${s.id ?? s.name}|${day}`) }))
        .sort((a, b) => a.h - b.h || a.i - b.i);
    const out: number[] = [];
    const rounds = order.reduce((m, o) => Math.max(m, o.w), 0);
    for (let r = 1; r <= rounds; r++) for (const o of order) if (o.w >= r) out.push(o.i);
    return separateRepeats(out);
}

/** Best effort: swaps entries so the same sponsor is never on screen twice in a row, wrap-around included. */
function separateRepeats(seq: number[]): number[] {
    const n = seq.length;
    if (n < 3) return seq;
    const clash = (k: number) => seq[k] === seq[(k + 1) % n];
    const bad = () => seq.some((_, k) => clash(k));
    for (let pass = 0; pass < n && bad(); pass++) {
        for (let k = 0; k < n; k++) {
            if (!clash(k)) continue;
            const at = (k + 1) % n;
            for (let step = 1; step < n; step++) {
                const j = (at + step) % n;
                if (seq[j] === seq[at]) continue;
                [seq[at], seq[j]] = [seq[j], seq[at]];
                if (!seq.some((_, m) => clash(m)) || !clash(at) && !clash((at + n - 1) % n) && !clash(j) && !clash((j + n - 1) % n)) break;
                [seq[at], seq[j]] = [seq[j], seq[at]];
            }
        }
    }
    return seq;
}

/** Index (into the original list) of the sponsor to show at `now`. */
export function activeAt(schedule: number[], now: number = Date.now(), slotMs: number = SLOT_MS): number {
    if (schedule.length === 0) return 0;
    return schedule[Math.floor(now / slotMs) % schedule.length];
}

/** Milliseconds until the next slot boundary (always > 0). */
export const msToNextSlot = (now: number = Date.now(), slotMs: number = SLOT_MS): number => slotMs - (now % slotMs);

/** Appends UTM tags without overwriting any the advertiser already set. */
export function withUtm(url: string, slot: string): string {
    try {
        const u = new URL(url);
        if (!u.searchParams.has("utm_source")) u.searchParams.set("utm_source", "ninjatype");
        if (!u.searchParams.has("utm_medium")) u.searchParams.set("utm_medium", "sponsor");
        if (!u.searchParams.has("utm_campaign")) u.searchParams.set("utm_campaign", slot);
        return u.href;
    } catch {
        return url;
    }
}
