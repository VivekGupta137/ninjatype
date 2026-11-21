import { describe, expect, test } from "bun:test";
import { parsePreview, safeHttpUrl, validatePreview, wantsPreview } from "./adPreview";

const logo = "data:image/png;base64,iVBORw0KGgo=";
const base = { pkg: "results" as const, name: "Acme", logo, url: "acme.com", description: "Great keyboards" };

describe("safeHttpUrl", () => {
    test("adds https and accepts http(s) only", () => {
        expect(safeHttpUrl("acme.com")).toBe("https://acme.com/");
        expect(safeHttpUrl("http://acme.com/x")).toBe("http://acme.com/x");
        expect(safeHttpUrl("javascript:alert(1)")).toBeNull();
        expect(safeHttpUrl("data:text/html,hi")).toBeNull();
        expect(safeHttpUrl("localhost")).toBeNull();
        expect(safeHttpUrl("a b.com")).toBeNull();
        expect(safeHttpUrl("")).toBeNull();
    });
});

describe("validatePreview", () => {
    test("accepts a complete results preview", () => expect(validatePreview(base)).toEqual({}));
    test("brand package does not need a description", () => expect(validatePreview({ ...base, pkg: "brand", description: "" })).toEqual({}));
    test("rejects missing and unsafe fields", () => {
        const e = validatePreview({ ...base, name: " ", logo: "https://x.com/a.png", url: "javascript:1", description: "" });
        expect(Object.keys(e).sort()).toEqual(["description", "logo", "name", "url"]);
    });
    test("rejects non-image data URLs", () => expect(validatePreview({ ...base, logo: "data:text/html;base64,AAAA" }).logo).toBeDefined());
});

describe("parsePreview", () => {
    test("round-trips valid data and rejects bad data", () => {
        expect(parsePreview(JSON.stringify(base))?.url).toBe("https://acme.com/");
        expect(parsePreview(JSON.stringify({ ...base, url: "javascript:1" }))).toBeNull();
        expect(parsePreview("not json")).toBeNull();
        expect(parsePreview(null)).toBeNull();
    });
});

test("wantsPreview", () => {
    expect(wantsPreview("?preview=ads")).toBe(true);
    expect(wantsPreview("?a=1&preview=ads")).toBe(true);
    expect(wantsPreview("?preview=x")).toBe(false);
    expect(wantsPreview("")).toBe(false);
});
