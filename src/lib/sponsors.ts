import { MAX_WEIGHT } from "./sponsorRotation";

/** Sponsor data model for `public/sponsor.json`: parsing, expiry, slot selection and `?preview=<id>`. Pure, no DOM. */

export interface Sponsor {
    name: string;
    url: string;
    /** One short line (the JSON field is `tagline`). */
    description: string;
    /** Optional logo; a local path such as /sponsors/acme.png. */
    logo?: string;
    /** Tag from sponsor.json; seeds the daily shuffle. */
    id?: string;
    /** Share of rotation time, 1 (default) to 10. */
    weight?: number;
}

export type SponsorSlot = "footer" | "results";
export const SLOTS: SponsorSlot[] = ["footer", "results"];

export interface SponsorEntry extends Sponsor {
    /** Unique tag, also the shareable preview key. */
    id: string;
    enabled: boolean;
    /** First day shown, YYYY-MM-DD (UTC). Empty = already started. */
    startDate?: string;
    /** Last day shown (inclusive), YYYY-MM-DD (UTC). Empty = no end. */
    endDate?: string;
    slots: SponsorSlot[];
}

const ID = /^[a-z0-9][a-z0-9-]{0,39}$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

const httpsUrl = (v: unknown): string | null => {
    if (typeof v !== "string") return null;
    try {
        const u = new URL(v.trim());
        return u.protocol === "https:" && u.hostname.includes(".") ? u.href : null;
    } catch { return null; }
};

/** Validates the JSON file. Invalid entries are dropped, never thrown on. */
export function parseSponsors(json: unknown): SponsorEntry[] {
    const list = (json as { sponsors?: unknown })?.sponsors;
    if (!Array.isArray(list)) return [];
    const seen = new Set<string>();
    const out: SponsorEntry[] = [];
    for (const raw of list) {
        const r = (raw ?? {}) as Record<string, unknown>;
        const id = typeof r.id === "string" ? r.id.trim().toLowerCase() : "";
        const name = typeof r.name === "string" ? r.name.trim() : "";
        const url = httpsUrl(r.url);
        if (!ID.test(id) || id === CUSTOM_TAG || id === SAMPLE_TAG || seen.has(id) || !name || !url) continue;
        const logo = typeof r.logo === "string" && /^\/[^/\\]/.test(r.logo) ? r.logo : undefined;
        const slots = Array.isArray(r.slots) ? SLOTS.filter(s => (r.slots as unknown[]).includes(s)) : SLOTS;
        const day = (v: unknown) => (typeof v === "string" && DAY.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`)) ? v : undefined);
        const w = typeof r.weight === "number" && Number.isInteger(r.weight) && r.weight >= 1 ? Math.min(r.weight, MAX_WEIGHT) : 1;
        seen.add(id);
        out.push({
            id, name, url, logo, slots, weight: w, startDate: day(r.startDate), endDate: day(r.endDate),
            description: typeof r.tagline === "string" ? r.tagline.trim() : "",
            enabled: r.enabled === true,
        });
    }
    return out;
}

/** Enabled, on or after startDate and on or before endDate (both days inclusive, UTC). */
export function isActive(e: SponsorEntry, now: number = Date.now()): boolean {
    if (!e.enabled) return false;
    if (e.startDate && now < Date.parse(`${e.startDate}T00:00:00Z`)) return false;
    if (e.endDate && now >= Date.parse(`${e.endDate}T00:00:00Z`) + 86_400_000) return false;
    return true;
}

const plain = ({ id, name, url, description, logo, weight }: SponsorEntry): Sponsor => ({ id, name, url, description, logo, weight });

export interface PreviewState {
    /** The `?preview=` value: a sponsor id, `custom`, or any other tag (shows the badge only). */
    tag: string;
    /** Sponsor built from the URL when tag is `custom`. */
    custom?: SponsorEntry;
    /** Seconds until the visitor is sent to /advertise/; null = no countdown. */
    countdown: number | null;
}

export const CUSTOM_TAG = "custom";
const DEFAULT_URL = "https://www.ninjatype.com/advertise/";

const clean = (v: string | null | undefined, max: number): string => (v ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

/** Builds the `?preview=custom&name=&tagline=&slots=footer,results&url=` sponsor. Null without a name. */
export function customSponsor(q: { name?: string | null; tagline?: string | null; slots?: string | null; url?: string | null }): SponsorEntry | null {
    const name = clean(q.name, 40);
    if (!name) return null;
    const asked = (q.slots ?? "").toLowerCase().split(",").map(s => s.trim());
    const slots = SLOTS.filter(s => asked.includes(s));
    return {
        id: CUSTOM_TAG, name, description: clean(q.tagline, 100), url: httpsUrl(q.url) ?? DEFAULT_URL,
        slots: slots.length ? slots : SLOTS, enabled: true, weight: 1,
    };
}

/**
 * Sponsors for a slot. In preview, only the previewed sponsor is shown (a listed id even when
 * disabled, not started or ended, or a `custom` one) as long as it has the slot; otherwise the active list.
 */
export function sponsorsForSlot(list: SponsorEntry[], slot: SponsorSlot, now: number = Date.now(), preview?: PreviewState | null): Sponsor[] {
    if (preview) {
        const hit = preview.custom ?? list.find(e => e.id === preview.tag);
        if (hit && hit.slots.includes(slot)) return [plain(hit)];
    }
    return list.filter(e => e.slots.includes(slot) && isActive(e, now)).map(plain);
}

export const DEFAULT_COUNTDOWN = 120;

/** `countdown=off|0|false` disables it; a number sets the seconds (10 to 1800); anything else keeps the default. */
export function parseCountdown(v: string | null): number | null {
    const x = v?.trim().toLowerCase();
    if (!x) return DEFAULT_COUNTDOWN;
    if (x === "off" || x === "false" || x === "no" || x === "0") return null;
    const n = Number(x);
    return Number.isFinite(n) ? Math.min(1800, Math.max(10, Math.round(n))) : DEFAULT_COUNTDOWN;
}

/** `?preview=ads`: a sample sponsor in both spots, linked from the advertise page. */
export const SAMPLE_TAG = "ads";

const toState = (tag: string, q: URLSearchParams): PreviewState => {
    const countdown = parseCountdown(q.get("countdown"));
    if (tag === SAMPLE_TAG) return { tag, countdown, custom: customSponsor({ name: "Your brand", tagline: "Your tagline goes here" })! };
    if (tag !== CUSTOM_TAG) return { tag, countdown };
    const custom = customSponsor({ name: q.get("name"), tagline: q.get("tagline"), slots: q.get("slots"), url: q.get("url") });
    return custom ? { tag, custom, countdown } : { tag, countdown };
};

/**
 * Preview exists only while the URL has `?preview=<value>`; no value is remembered between pages.
 * - `<id>` of a sponsor in sponsor.json shows it alone, even when disabled or outside its dates.
 * - `ads` shows a sample "Your brand" sponsor in both spots (the Preview button on /advertise/).
 * - `custom&name=&tagline=&slots=&url=` previews a sponsor that is not in sponsor.json.
 * - any other value (and `off` or empty means no preview) only turns on the "preview only" badge.
 * - a countdown (120s by default, `&countdown=<seconds>` or `&countdown=off`) sends the visitor to /advertise/.
 */
export function resolvePreview(search: string): PreviewState | null {
    const q = new URLSearchParams(search);
    const param = q.get("preview")?.trim().toLowerCase();
    if (!param || param === "off") return null;
    return toState(ID.test(param) ? param : "unknown", q);
}
