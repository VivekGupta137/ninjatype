import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import ProFeatures from "./ProFeatures";

describe("Pro feature navigation", () => {
    test("each feature card has a descriptive native link to its app in static HTML", () => {
        const html = renderToStaticMarkup(<ProFeatures />);
        const cards = html.split(/class="(?:[^" ]+ )*pro-cat(?: [^" ]+)*"/).slice(1);
        expect(cards).toHaveLength(3);
        for (const [index, href, label] of [
            [0, "/history/", "Open history"],
            [1, "/training/", "Open training"],
            [2, "/custom-themes/", "Open custom themes"],
        ] as const) {
            expect(cards[index]).toContain(`href="${href}"`);
            expect(cards[index]).toContain(`>${label}</a>`);
            expect(cards[index]).toContain("key-btn");
        }
    });
});
