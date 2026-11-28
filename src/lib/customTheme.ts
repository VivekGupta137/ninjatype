/** Pure helpers for Pro custom themes: strict validation, CSS generation, contrast checks. No free-form CSS is ever accepted. */

export const CUSTOM_COLOR_FIELDS = [
    { key: "bg", cssVar: "--bg-color", label: "Background" },
    { key: "altBg", cssVar: "--alt-bg-color", label: "Surface" },
    { key: "main", cssVar: "--main-color", label: "Accent" },
    { key: "pipe", cssVar: "--pipe-color", label: "Caret and secondary accent" },
    { key: "text", cssVar: "--text-color", label: "Text" },
    { key: "docText", cssVar: "--doc-text-color", label: "Document text" },
    { key: "subText", cssVar: "--sub-text-color", label: "Muted text" },
    { key: "subAltText", cssVar: "--sub-alt-text-color", label: "Borders" },
    { key: "error", cssVar: "--error-color", label: "Error" },
    { key: "errorExtra", cssVar: "--error-extra-color", label: "Error emphasis" },
    { key: "colorfulError", cssVar: "--colorful-error-color", label: "Colorful error" },
    { key: "colorfulErrorExtra", cssVar: "--colorful-error-extra-color", label: "Colorful error emphasis" },
    { key: "success", cssVar: "--success-color", label: "Success" },
    { key: "successExtra", cssVar: "--success-extra-color", label: "Success emphasis" },
    { key: "starWhite", cssVar: "--star-white", label: "White star" },
    { key: "starGreen", cssVar: "--star-green", label: "Green star" },
    { key: "starYellow", cssVar: "--star-yellow", label: "Yellow star" },
    { key: "starOrange", cssVar: "--star-orange", label: "Orange star" },
    { key: "starRed", cssVar: "--star-red", label: "Red star" },
] as const;

export type CustomColorKey = (typeof CUSTOM_COLOR_FIELDS)[number]["key"];
export type CustomColors = Record<CustomColorKey, string>;
export interface CustomTheme { id: string; name: string; colors: CustomColors }

export const MAX_CUSTOM_THEMES = 5;
export const MAX_NAME = 24;
export const EXPORT_FORMAT = "ninjatype-theme";

export const DEFAULT_CUSTOM_COLORS: CustomColors = {
    bg: "#0f1115", altBg: "#181b22", main: "#7dd3fc", pipe: "#7dd3fc", text: "#f1f5f9", docText: "#f1f5f9",
    subText: "#94a3b8", subAltText: "#334155", error: "#f87171", errorExtra: "#f87171",
    colorfulError: "#f87171", colorfulErrorExtra: "#f87171", success: "#4ade80", successExtra: "#4ade80",
    starWhite: "#ffffff", starGreen: "#10b981", starYellow: "#fbbf24", starOrange: "#f97316", starRed: "#ef4444",
};

/** Accepts #rgb or #rrggbb and returns lowercase #rrggbb, or null. */
export function normalizeHex(value: unknown): string | null {
    if (typeof value !== "string") return null;
    const v = value.trim().toLowerCase();
    if (/^#[0-9a-f]{6}$/.test(v)) return v;
    const m = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(v);
    return m ? `#${m[1]}${m[1]}${m[2]}${m[2]}${m[3]}${m[3]}` : null;
}

function luminance(hex: string): number {
    const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two #rrggbb colors (1 to 21). */
export function contrastRatio(a: string, b: string): number {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
}

/** Human-readable warnings for combinations that are hard to read. Never blocks saving. */
export function contrastWarnings(colors: CustomColors): string[] {
    const checks: [string, string, number, string][] = [
        [colors.text, colors.bg, 4.5, "Text on background"],
        [colors.main, colors.bg, 3, "Accent on background"],
        [colors.subText, colors.bg, 4.5, "Muted text on background"],
        [colors.text, colors.altBg, 4.5, "Text on surface"],
        [colors.subText, colors.altBg, 4.5, "Muted text on surface"],
        [colors.error, colors.bg, 3, "Error on background"],
        [colors.success, colors.bg, 3, "Success on background"],
    ];
    return checks.filter(([fg, bg, min]) => contrastRatio(fg, bg) < min).map(([fg, bg, min, label]) => `${label} is hard to read (${contrastRatio(fg, bg).toFixed(1)}:1, aim for ${min}:1).`);
}

export function validateColors(input: unknown): CustomColors | null {
    if (!input || typeof input !== "object") return null;
    const values = input as Record<string, unknown>;
    const out = {} as CustomColors;
    // Older themes have only eight colors. Derive new variants from their original
    // colors, while still rejecting malformed values explicitly present in a file.
    const legacy: Partial<Record<CustomColorKey, unknown>> = {
        pipe: values.main, docText: values.text, errorExtra: values.error,
        colorfulError: values.error, colorfulErrorExtra: values.error, successExtra: values.success,
        starWhite: DEFAULT_CUSTOM_COLORS.starWhite, starGreen: DEFAULT_CUSTOM_COLORS.starGreen,
        starYellow: DEFAULT_CUSTOM_COLORS.starYellow, starOrange: DEFAULT_CUSTOM_COLORS.starOrange, starRed: DEFAULT_CUSTOM_COLORS.starRed,
    };
    for (const { key } of CUSTOM_COLOR_FIELDS) {
        const hex = normalizeHex(Object.hasOwn(values, key) ? values[key] : legacy[key]);
        if (!hex) return null;
        out[key] = hex;
    }
    return out;
}

export function cleanName(value: unknown): string | null {
    if (typeof value !== "string") return null;
    const name = value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, MAX_NAME);
    return name || null;
}

export const newThemeId = () => `ct-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;

/** Validates a stored or imported theme; returns null when anything is off. */
export function validateTheme(input: unknown): CustomTheme | null {
    if (!input || typeof input !== "object") return null;
    const t = input as Record<string, unknown>;
    const name = cleanName(t.name), colors = validateColors(t.colors);
    const id = typeof t.id === "string" && /^[a-z0-9-]{1,40}$/.test(t.id) ? t.id : newThemeId();
    return name && colors ? { id, name, colors } : null;
}

export function sanitizeList(input: unknown): CustomTheme[] {
    if (!Array.isArray(input)) return [];
    return input.map(validateTheme).filter((t): t is CustomTheme => !!t).slice(0, MAX_CUSTOM_THEMES);
}

export const exportTheme = (t: CustomTheme) => JSON.stringify({ format: EXPORT_FORMAT, version: 1, name: t.name, colors: t.colors }, null, 2);

/** Parses pasted JSON. Returns the theme (fresh id) or an error message. */
export function parseImport(text: string): { theme: CustomTheme } | { error: string } {
    if (text.length > 4000) return { error: "That file is too large to be a theme." };
    let data: unknown;
    try { data = JSON.parse(text); } catch { return { error: "That is not valid JSON." }; }
    if (!data || typeof data !== "object" || (data as Record<string, unknown>).format !== EXPORT_FORMAT) return { error: "This is not a NinjaType theme file." };
    const theme = validateTheme({ name: (data as Record<string, unknown>).name, colors: (data as Record<string, unknown>).colors, id: undefined });
    return theme ? { theme } : { error: "The theme needs a name and valid hex colors." };
}

/** CSS that overrides the base theme. Only validated hex values reach it. */
export function toCss(t: CustomTheme): string {
    return `:root{${CUSTOM_COLOR_FIELDS.map(f => `${f.cssVar}:${t.colors[f.key]}`).join(";")}}`;
}
