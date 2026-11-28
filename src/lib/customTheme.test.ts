import { expect, test } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { CUSTOM_COLOR_FIELDS, contrastRatio, contrastWarnings, DEFAULT_CUSTOM_COLORS, exportTheme, normalizeHex, parseImport, sanitizeList, toCss, validateTheme } from "./customTheme";
import { THEME, PRO_THEME_KEYS, availableTheme, isProTheme } from "../constants/themes";

const theme = { id: "ct-1", name: "Mine", colors: DEFAULT_CUSTOM_COLORS };

test("Pro themes have complete CSS, readable colors, and require entitlement", () => {
    expect(PRO_THEME_KEYS.length).toBeGreaterThan(1);
    expect(new Set(Object.values(THEME).map(t => t.colors.main.toLowerCase())).size).toBe(Object.keys(THEME).length);
    for (const key of PRO_THEME_KEYS) {
        const theme = THEME[key];
        const css = readFileSync(`public${theme.path}`, "utf8");
        const colors = Object.fromEntries(CUSTOM_COLOR_FIELDS.map(f => [f.key, css.match(new RegExp(`${f.cssVar}:\\s*(#[0-9a-f]{6})`, "i"))?.[1]]));
        const validated = validateTheme({ id: "ct-preset", name: theme.label, colors });
        expect(validated).not.toBeNull();
        expect(contrastWarnings(validated!.colors)).toEqual([]);
        expect(validated!.colors.main).toBe(theme.colors.main);
        expect(isProTheme(key)).toBe(true);
        expect(availableTheme(key, false)).toBe("amoled");
        expect(availableTheme(key, true)).toBe(key);
    }
    expect(availableTheme("gruvbox", false)).toBe("gruvbox");
});

test("normalizeHex accepts #rgb and #rrggbb only", () => {
    expect(normalizeHex("#ABC")).toBe("#aabbcc");
    expect(normalizeHex(" #A1B2C3 ")).toBe("#a1b2c3");
    for (const bad of ["red", "#12", "#1234567", "rgb(0,0,0)", "#zzzzzz", "url(x)", 5, null]) expect(normalizeHex(bad)).toBeNull();
});

test("contrastRatio matches WCAG extremes", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 0);
    expect(contrastRatio("#777777", "#777777")).toBeCloseTo(1, 5);
});

test("contrastWarnings flags unreadable text and passes the default", () => {
    expect(contrastWarnings(DEFAULT_CUSTOM_COLORS)).toEqual([]);
    expect(contrastWarnings({ ...DEFAULT_CUSTOM_COLORS, text: "#101010" }).length).toBeGreaterThan(0);
    const warnings = contrastWarnings({ ...DEFAULT_CUSTOM_COLORS, subText: "#202020", success: "#101010" });
    expect(warnings.some(w => w.startsWith("Muted text on background"))).toBe(true);
    expect(warnings.some(w => w.startsWith("Muted text on surface"))).toBe(true);
    expect(warnings.some(w => w.startsWith("Success on background"))).toBe(true);
});

test("validateTheme rejects bad names and colors, cleans control characters", () => {
    expect(validateTheme({ ...theme, name: "   " })).toBeNull();
    expect(validateTheme({ ...theme, colors: { ...theme.colors, main: "red" } })).toBeNull();
    expect(validateTheme({ ...theme, colors: { bg: "#000" } })).toBeNull();
    expect(validateTheme({ ...theme, name: "A\u0000B" })?.name).toBe("AB");
    expect(validateTheme({ ...theme, id: "bad id!" })?.id).toMatch(/^ct-/);
});

test("custom colors cover every built-in theme variable", () => {
    const variables = new Set(readdirSync("public/themes").filter(name => name.endsWith(".css")).flatMap(name =>
        [...readFileSync(`public/themes/${name}`, "utf8").matchAll(/(--[a-z-]+)\s*:/g)].map(match => match[1]),
    ));
    expect(new Set<string>(CUSTOM_COLOR_FIELDS.map(field => field.cssVar))).toEqual(variables);
});

test("toCss only emits validated hex values", () => {
    const css = toCss(theme);
    expect(css).toMatch(/^:root\{--bg-color:#0f1115;/);
    expect(css).not.toMatch(/[<>{}]\s*[<>]/);
    expect(css.match(/--[a-z-]+:#[0-9a-f]{6}/g)).toHaveLength(19);
    expect(css).toContain("--doc-text-color:#f1f5f9");
    expect(css).toContain("--star-yellow:#fbbf24");
});

test("export then import round-trips; hostile input is rejected", () => {
    const back = parseImport(exportTheme(theme));
    expect("theme" in back && back.theme.colors).toEqual(theme.colors);
    expect("error" in parseImport("{")).toBe(true);
    expect("error" in parseImport(JSON.stringify({ format: "other" }))).toBe(true);
    expect("error" in parseImport(JSON.stringify({ format: "ninjatype-theme", name: "x", colors: { ...theme.colors, bg: "red;} body{display:none" } }))).toBe(true);
    expect("error" in parseImport("x".repeat(5000))).toBe(true);
});

test("legacy eight-color themes migrate without losing their colors", () => {
    const legacy = { bg: "#111", altBg: "#222", main: "#abc", text: "#fff", subText: "#aaa", subAltText: "#333", error: "#f00", success: "#0f0" };
    const migrated = validateTheme({ id: "ct-legacy", name: "Old", colors: legacy });
    expect(migrated?.colors.pipe).toBe("#aabbcc");
    expect(migrated?.colors.docText).toBe("#ffffff");
    expect(migrated?.colors.errorExtra).toBe("#ff0000");
    expect(migrated?.colors.starYellow).toBe(DEFAULT_CUSTOM_COLORS.starYellow);
    expect("theme" in parseImport(JSON.stringify({ format: "ninjatype-theme", name: "Old", colors: legacy }))).toBe(true);
    expect(validateTheme({ id: "ct-legacy", name: "Old", colors: { ...legacy, pipe: "red" } })).toBeNull();
});

test("sanitizeList drops invalid entries and caps the count", () => {
    const list = sanitizeList([theme, { nope: 1 }, ...Array.from({ length: 10 }, (_, i) => ({ ...theme, id: `ct-${i}` }))]);
    expect(list).toHaveLength(5);
    expect(sanitizeList("x")).toEqual([]);
});
