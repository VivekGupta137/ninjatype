import { atom } from "nanostores";
import type { Celebration } from "@/lib/celebrations";

/** Transient UI only. Reading saved history never replays a celebration. */
export const $celebration = atom<Celebration | null>(null);

export function celebrate(event: Celebration | null) {
    if (event && (event.streak !== undefined || event.record)) $celebration.set(event);
}

export function dismissCelebration(id?: string) {
    if (!id || $celebration.get()?.id === id) $celebration.set(null);
}
