import { expect, test } from "bun:test";
import { contrastRatio, contrastWarnings, DEFAULT_CUSTOM_COLORS, exportTheme, normalizeHex, parseImport, sanitizeList, toCss, validateTheme } from "./customTheme";

const theme = { id: "ct-1", name: "Mine", colors: DEFAULT_CUSTOM_COLORS };

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
});

test("validateTheme rejects bad names and colors, cleans control characters", () => {
    expect(validateTheme({ ...theme, name: "   " })).toBeNull();
    expect(validateTheme({ ...theme, colors: { ...theme.colors, main: "red" } })).toBeNull();
    expect(validateTheme({ ...theme, colors: { bg: "#000" } })).toBeNull();
    expect(validateTheme({ ...theme, name: "A\u0000B" })?.name).toBe("AB");
    expect(validateTheme({ ...theme, id: "bad id!" })?.id).toMatch(/^ct-/);
});

test("toCss only emits validated hex values", () => {
    const css = toCss(theme);
    expect(css).toMatch(/^:root\{--bg-color:#0f1115;/);
    expect(css).not.toMatch(/[<>{}]\s*[<>]/);
    expect(css.match(/--[a-z-]+:#[0-9a-f]{6}/g)).toHaveLength(8);
});

test("export then import round-trips; hostile input is rejected", () => {
    const back = parseImport(exportTheme(theme));
    expect("theme" in back && back.theme.colors).toEqual(theme.colors);
    expect("error" in parseImport("{")).toBe(true);
    expect("error" in parseImport(JSON.stringify({ format: "other" }))).toBe(true);
    expect("error" in parseImport(JSON.stringify({ format: "ninjatype-theme", name: "x", colors: { ...theme.colors, bg: "red;} body{display:none" } }))).toBe(true);
    expect("error" in parseImport("x".repeat(5000))).toBe(true);
});

test("sanitizeList drops invalid entries and caps the count", () => {
    const list = sanitizeList([theme, { nope: 1 }, ...Array.from({ length: 10 }, (_, i) => ({ ...theme, id: `ct-${i}` }))]);
    expect(list).toHaveLength(5);
    expect(sanitizeList("x")).toEqual([]);
});
