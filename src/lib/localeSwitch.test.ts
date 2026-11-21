import { describe, expect, test } from "bun:test";
import { localeHrefFor } from "./localeSwitch";

describe("localeHrefFor", () => {
    test("maps the typing test, learn and blog pages to their counterparts", () => {
        expect(localeHrefFor("/", "de")).toBe("/de/tippgeschwindigkeitstest/");
        expect(localeHrefFor("/de/tippgeschwindigkeitstest/", "en")).toBe("/");
        expect(localeHrefFor("/", "fr")).toBe("/fr/test-de-vitesse-de-frappe/");
        expect(localeHrefFor("/learn/", "de")).toBe("/de/tippen-lernen/");
        expect(localeHrefFor("/de/tippen-lernen/", "en")).toBe("/learn/");
        expect(localeHrefFor("/blog", "de")).toBe("/de/blog/");
        expect(localeHrefFor("/fr/blog/", "en")).toBe("/blog/");
    });

    test("keeps finger lessons on the same finger", () => {
        expect(localeHrefFor("/learn/fingers/pointer/", "de")).toBe("/de/tippen-lernen/pointer/");
        expect(localeHrefFor("/de/tippen-lernen/pinky/", "en")).toBe("/learn/fingers/pinky/");
        expect(localeHrefFor("/learn/fingers/pinky/", "fr")).toBe("/fr/apprendre-a-taper-au-clavier/pinky/");
        expect(localeHrefFor("/fr/apprendre-a-taper-au-clavier/pinky/", "it")).toBe("/it/dattilografia/pinky/");
        expect(localeHrefFor("/no/touch-typing/ring/", "en")).toBe("/learn/fingers/ring/");
        expect(localeHrefFor("/ja/typing-practice/middle/", "sv")).toBe("/sv/tangentbordstraning/middle/");
    });

    test("maps game pages (ghost race, multiplayer) across every locale", () => {
        expect(localeHrefFor("/ghost-race/", "fr")).toBe("/fr/exercices-de-dactylographie/");
        expect(localeHrefFor("/fr/defi-dactylo/", "en")).toBe("/multiplayer-typing-race/");
        expect(localeHrefFor("/no/ord-i-minuttet/", "da")).toBe("/da/skrivetest-spil/");
        expect(localeHrefFor("/ja/taisen-taipingu/", "de")).toBe("/de/tipp-rennen/");
    });

    test("opens a blog post's locale blog index when no counterpart exists", () => {
        expect(localeHrefFor("/blog/some-post/", "de")).toBe("/de/blog/");
        expect(localeHrefFor("/de/blog/some-post/", "en")).toBe("/blog/");
    });

    test("falls back to the target home for unmatched pages", () => {
        expect(localeHrefFor("/settings/", "de")).toBe("/de/");
        expect(localeHrefFor("/de/", "en")).toBe("/");
        expect(localeHrefFor("/history/", "fr")).toBe("/fr/");
    });

    test("maps the Japanese keyword pages to their counterparts", () => {
        expect(localeHrefFor("/", "ja")).toBe("/ja/typing-test/");
        expect(localeHrefFor("/ja/typing-test/", "en")).toBe("/");
        expect(localeHrefFor("/learn/", "ja")).toBe("/ja/typing-practice/");
        expect(localeHrefFor("/blog/some-post/", "ja")).toBe("/ja/blog/");
        expect(localeHrefFor("/ja/blog/some-post/", "en")).toBe("/blog/");
        expect(localeHrefFor("/ja/typing-practice/", "de")).toBe("/de/tippen-lernen/");
        expect(localeHrefFor("/history/", "ja")).toBe("/ja/");
    });

    test("maps the Dutch keyword pages to their counterparts", () => {
        expect(localeHrefFor("/", "nl")).toBe("/nl/typsnelheid-test/");
        expect(localeHrefFor("/nl/typsnelheid-test/", "en")).toBe("/");
        expect(localeHrefFor("/learn/", "nl")).toBe("/nl/blind-typen/");
        expect(localeHrefFor("/nl/blind-typen/", "de")).toBe("/de/tippen-lernen/");
        expect(localeHrefFor("/blog/some-post/", "nl")).toBe("/nl/blog/");
        expect(localeHrefFor("/nl/blog/some-post/", "en")).toBe("/blog/");
        expect(localeHrefFor("/settings/", "nl")).toBe("/nl/");
    });

    test("maps the Italian keyword pages to their counterparts", () => {
        expect(localeHrefFor("/", "it")).toBe("/it/test-di-dattilografia/");
        expect(localeHrefFor("/it/test-di-dattilografia/", "en")).toBe("/");
        expect(localeHrefFor("/learn/", "it")).toBe("/it/dattilografia/");
        expect(localeHrefFor("/it/dattilografia/", "de")).toBe("/de/tippen-lernen/");
        expect(localeHrefFor("/blog/some-post/", "it")).toBe("/it/blog/");
        expect(localeHrefFor("/it/blog/some-post/", "en")).toBe("/blog/");
        expect(localeHrefFor("/history/", "it")).toBe("/it/");
    });

    test("maps the Swedish keyword pages to their counterparts", () => {
        expect(localeHrefFor("/", "sv")).toBe("/sv/skrivhastighetstest/");
        expect(localeHrefFor("/sv/skrivhastighetstest/", "en")).toBe("/");
        expect(localeHrefFor("/learn/", "sv")).toBe("/sv/tangentbordstraning/");
        expect(localeHrefFor("/sv/tangentbordstraning/", "de")).toBe("/de/tippen-lernen/");
        expect(localeHrefFor("/blog/some-post/", "sv")).toBe("/sv/blog/");
        expect(localeHrefFor("/sv/blog/some-post/", "en")).toBe("/blog/");
        expect(localeHrefFor("/settings/", "sv")).toBe("/sv/");
    });

    test("maps the Danish keyword pages to their counterparts", () => {
        expect(localeHrefFor("/", "da")).toBe("/da/skrivehastighedstest/");
        expect(localeHrefFor("/da/skrivehastighedstest/", "en")).toBe("/");
        expect(localeHrefFor("/learn/", "da")).toBe("/da/maskinskrivning/");
        expect(localeHrefFor("/da/maskinskrivning/", "de")).toBe("/de/tippen-lernen/");
        expect(localeHrefFor("/blog/some-post/", "da")).toBe("/da/blog/");
        expect(localeHrefFor("/da/blog/some-post/", "en")).toBe("/blog/");
        expect(localeHrefFor("/history/", "da")).toBe("/da/");
    });

    test("maps the Norwegian keyword pages to their counterparts", () => {
        expect(localeHrefFor("/", "no")).toBe("/no/skrivetest/");
        expect(localeHrefFor("/no/skrivetest/", "en")).toBe("/");
        expect(localeHrefFor("/learn/", "no")).toBe("/no/touch-typing/");
        expect(localeHrefFor("/no/touch-typing/", "de")).toBe("/de/tippen-lernen/");
        expect(localeHrefFor("/blog/some-post/", "no")).toBe("/no/blog/");
        expect(localeHrefFor("/no/blog/some-post/", "en")).toBe("/blog/");
        expect(localeHrefFor("/settings/", "no")).toBe("/no/");
    });
});
