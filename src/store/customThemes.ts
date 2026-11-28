import { persistentAtom } from "@nanostores/persistent";
import { sanitizeList, toCss, type CustomTheme } from "@/lib/customTheme";

/** Custom themes live on this device. Applying one requires Pro; a lapsed account falls back to its built-in theme. */
export const $customThemes = persistentAtom<CustomTheme[]>("customThemes", [], {
    encode: JSON.stringify,
    decode: raw => { try { return sanitizeList(JSON.parse(raw)); } catch { return []; } },
});
/** Id of the applied custom theme, or "" when a built-in theme is in use. */
export const $activeCustomId = persistentAtom<string>("customThemeActive", "");

const PRO_CACHE = "account:pro";
/** Last Pro state the server reported (cosmetic gate only; the server still decides entitlement for synced data). */
export const cachedPro = (): boolean => { try { return localStorage.getItem(PRO_CACHE) === "1"; } catch { return false; } };
export const cachePro = (pro: boolean) => {
    try { localStorage.setItem(PRO_CACHE, pro ? "1" : "0"); } catch { /* private mode */ }
    if (typeof document !== "undefined") applyCustomTheme();
};

export function activeCustomTheme(): CustomTheme | null {
    const id = $activeCustomId.get();
    if (!id || !cachedPro()) return null;
    return $customThemes.get().find(t => t.id === id) ?? null;
}

/** Injects (or removes) the override stylesheet after the base theme link. */
export function applyCustomTheme(doc: Document = document): void {
    const theme = activeCustomTheme();
    let el = doc.getElementById("customThemeStyle");
    if (!theme) { el?.remove(); return; }
    if (!el) { el = doc.createElement("style"); el.id = "customThemeStyle"; doc.head.appendChild(el); }
    const css = toCss(theme);
    if (el.textContent !== css) el.textContent = css;
}
