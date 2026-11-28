import { describe, expect, test } from "bun:test";
import { nextLabel, safeNext } from "./accountNext";

describe("safeNext", () => {
    test("allows same-site paths", () => {
        expect(safeNext("/pro/")).toBe("/pro/");
        expect(safeNext(" /history/?x=1 ")).toBe("/history/?x=1");
    });
    test("rejects anything that could leave the site or loop", () => {
        for (const bad of [null, undefined, "", "pro", "//evil.com", "https://evil.com", "/\\evil.com", "/a\nb", "/account/", "javascript:alert(1)"]) expect(safeNext(bad)).toBeNull();
    });
    test("names known pages", () => {
        expect(nextLabel("/pro/")).toBe("Pro");
        expect(nextLabel("/unknown/")).toBe("where you were");
    });
});
