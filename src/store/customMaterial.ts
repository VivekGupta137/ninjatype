import { atom } from "nanostores";
import {
    MAX_MATERIALS, checkDraft, cleanTitle, parseActiveRun, parseMaterials, nextSectionIndex,
    type ActiveRun, type CustomRun, type Material,
} from "@/lib/customMaterial";

export const CUSTOM_MATERIAL_KEY = "custom-material:items";

export const ACTIVE_RUN_KEY = "custom-material:active";
export const LOWERCASE_KEY = "custom-material:lowercase";

/** "Lowercase only" preference for all material (read after mount). */
export const $lowercase = atom<boolean>(false);

export function setLowercase(value: boolean) {
    $lowercase.set(value);
    try { localStorage.setItem(LOWERCASE_KEY, value ? "1" : "0"); } catch { /* storage blocked */ }
}

/** The last practised run (material, mode and section); null until read after mount. */
export const $activeRun = atom<ActiveRun | null>(null);

export type SaveError = "empty" | "too-long" | "limit" | "storage" | "missing";
export type SaveResult = { ok: true; material: Material } | { ok: false; error: SaveError };

/** null until read after mount so server and client markup match. */
export const $materials = atom<Material[] | null>(null);

function read(): Material[] {
    try {
        const raw = localStorage.getItem(CUSTOM_MATERIAL_KEY);
        return raw ? parseMaterials(JSON.parse(raw)) : [];
    } catch {
        return [];
    }
}

function write(items: Material[]): boolean {
    try {
        localStorage.setItem(CUSTOM_MATERIAL_KEY, JSON.stringify(items));
        $materials.set(items);
        return true;
    } catch {
        return false; // quota exceeded or storage blocked
    }
}

export function loadMaterials(): Material[] {
    const items = read();
    $materials.set(items);
    try { $lowercase.set(localStorage.getItem(LOWERCASE_KEY) === "1"); } catch { $lowercase.set(false); }
    try {
        const active = parseActiveRun(JSON.parse(localStorage.getItem(ACTIVE_RUN_KEY) ?? "null"));
        $activeRun.set(active && items.some(item => item.id === active.materialId) ? active : null);
    } catch {
        $activeRun.set(null);
    }
    return items;
}

/** Remember which run to offer under "Continue practice". */
export function saveActiveRun(run: ActiveRun | null) {
    $activeRun.set(run);
    try {
        if (run) localStorage.setItem(ACTIVE_RUN_KEY, JSON.stringify(run));
        else localStorage.removeItem(ACTIVE_RUN_KEY);
    } catch { /* storage blocked: continue works for this visit only */ }
}

export function saveMaterial(draft: { id?: string; title: string; text: string }): SaveResult {
    const check = checkDraft(draft.text);
    if (!check.ok) return { ok: false, error: check.error };
    const items = read();
    const now = Date.now();
    const existing = draft.id ? items.find(item => item.id === draft.id) : undefined;
    if (draft.id && !existing) return { ok: false, error: "missing" };
    if (!existing && items.length >= MAX_MATERIALS) return { ok: false, error: "limit" };
    const title = cleanTitle(draft.title, check.text);
    const material: Material = existing
        ? {
            ...existing, title, text: check.text, updatedAt: now,
            // New text invalidates the saved position.
            ...(existing.text !== check.text ? { nextSection: 0 } : {}),
        }
        : { id: `${now}-${Math.random().toString(36).slice(2, 9)}`, title, text: check.text, createdAt: now, updatedAt: now, nextSection: 0 };
    const next = existing ? items.map(item => (item.id === material.id ? material : item)) : [material, ...items];
    return write(next) ? { ok: true, material } : { ok: false, error: "storage" };
}

export function deleteMaterial(id: string): boolean {
    if ($activeRun.get()?.materialId === id) saveActiveRun(null);
    return write(read().filter(item => item.id !== id));
}

/** Save the resume position and personal best after a completed run. */
export function recordRun(run: CustomRun, result: { wpm: number; accuracy: number }): void {
    const items = read();
    const item = items.find(entry => entry.id === run.materialId);
    if (!item) return;
    // A finished section moves the continue point to the next one.
    saveActiveRun({ materialId: run.materialId, mode: run.mode, section: nextSectionIndex(run) });
    const better = !item.bestWpm || result.wpm > item.bestWpm;
    write(items.map(entry => entry.id !== item.id ? entry : {
        ...entry,
        lastPracticedAt: Date.now(),
        nextSection: nextSectionIndex(run),
        ...(better ? { bestWpm: result.wpm, bestAccuracy: result.accuracy } : {}),
    }));
}
