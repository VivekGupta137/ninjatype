import { describe, expect, test } from "bun:test";
import { DEFAULT_PROFILE_AVATAR, nextVariant, parseProfileAvatar } from "./profileAvatar";
import { MAX_AVATAR_VARIANT } from "./shareAvatar";

describe("profile avatar", () => {
    test("accepts a valid choice", () => {
        expect(parseProfileAvatar({ style: "bottts", variant: 12 })).toEqual({ style: "bottts", variant: 12 });
    });
    test("falls back to the animated default for anything invalid", () => {
        for (const bad of [null, "x", {}, 5]) expect(parseProfileAvatar(bad)).toEqual(DEFAULT_PROFILE_AVATAR);
        expect(parseProfileAvatar({ style: "nope", variant: 3 })).toEqual({ style: "gaze", variant: 3 });
        for (const variant of [-1, 1.5, MAX_AVATAR_VARIANT + 1, "2"]) expect(parseProfileAvatar({ style: "bottts", variant })).toEqual({ style: "bottts", variant: 0 });
        expect(DEFAULT_PROFILE_AVATAR.style).toBe("gaze");
    });
    test("shuffling wraps around", () => {
        expect(nextVariant(0)).toBe(1);
        expect(nextVariant(MAX_AVATAR_VARIANT)).toBe(0);
    });
});
