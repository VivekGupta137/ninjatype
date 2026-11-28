import { cleanTitle } from "@/lib/customMaterial";
import { deleteMaterial, loadMaterials, saveMaterial } from "./customMaterial";

export const DRILL_PREFIX = "Training drill";
/** Dated drills kept in My material; older ones are removed so the 20-item library never fills up. */
export const KEEP_DRILLS = 7;

/** "Training drill · E, T · 28 Nov 2026" for a local day key like "2026-11-28". */
export function drillTitle(day: string, keys: string[], label?: string): string {
    const [y, m, d] = day.split("-").map(Number);
    const date = new Date(y, m - 1, d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    return `${DRILL_PREFIX} · ${label ?? keys.map(k => k.toUpperCase()).join(", ")} · ${date}`;
}

/** Saves the day's drill under a dated title (the same day and keys reuse one entry), prunes old drills, returns the id. */
export function saveDrill(text: string, day: string, keys: string[], label?: string): string | null {
    const title = drillTitle(day, keys, label);
    // Material titles are normalized to printable ASCII before saving.
    const savedTitle = cleanTitle(title, text);
    const existing = loadMaterials().find(m => m.title === savedTitle);
    const result = saveMaterial({ id: existing?.id, title, text });
    if (!result.ok) return null;
    const old = loadMaterials().filter(m => m.title.startsWith(DRILL_PREFIX) && m.id !== result.material.id).sort((a, b) => b.createdAt - a.createdAt);
    for (const m of old.slice(KEEP_DRILLS - 1)) deleteMaterial(m.id);
    return result.material.id;
}
