import { atom } from "nanostores";
import type { CustomRun } from "@/lib/customMaterial";

/** The user-supplied passage currently being typed, or null for normal practice. */
export const $customRun = atom<CustomRun | null>(null);
