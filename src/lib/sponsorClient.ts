import { parseSponsors, resolvePreview, sponsorsForSlot, type PreviewState, type Sponsor, type SponsorEntry, type SponsorSlot } from "./sponsors";

let cache: Promise<SponsorEntry[]> | null = null;

/** Loads /sponsor.json once per page load. Failures resolve to an empty list. */
export function loadSponsors(): Promise<SponsorEntry[]> {
    cache ??= fetch("/sponsor.json").then(r => (r.ok ? r.json() : null)).then(parseSponsors).catch(() => []);
    return cache;
}

/** Current preview, from `?preview=` in the URL only, or null. */
export function getPreview(): PreviewState | null {
    try { return resolvePreview(location.search); } catch { return null; }
}

/** Sponsors to show in a slot right now, honouring `?preview=`. */
export async function getSlotSponsors(slot: SponsorSlot): Promise<Sponsor[]> {
    const list = await loadSponsors();
    return sponsorsForSlot(list, slot, Date.now(), getPreview());
}
