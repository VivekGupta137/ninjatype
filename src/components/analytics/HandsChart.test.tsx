import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import HandsChart from "./HandsChart";
import type { FingerLoad } from "@/lib/advancedStats";

const fingers: FingerLoad[] = [
    { finger: "L2", presses: 75, share: 0.75, errors: 3, errorRate: 4, avgLatencyMs: 120 },
    { finger: "thumb", presses: 25, share: 0.25, errors: 0, errorRate: 0, avgLatencyMs: 90 },
];

describe("HandsChart", () => {
    test("renders two named SVGs and a text alternative with exact statistics", () => {
        const html = renderToStaticMarkup(<HandsChart fingers={fingers} locale="en" />);
        expect(html.match(/role="img"/g)).toHaveLength(2);
        expect(html).toContain("Left hand</p>");
        expect(html).toContain("Right hand</p>");
        expect(html).toContain("Left index: 75%, 4% errors, 120 ms.");
        expect(html).toContain("Thumbs: 25%, 0% errors, 90 ms.");
        expect(html).not.toContain("NaN");
    });

    test("keeps existing German labels and handles an empty dataset", () => {
        const html = renderToStaticMarkup(<HandsChart fingers={[]} locale="de" />);
        expect(html).toContain("Linke Hand</p>");
        expect(html).toContain("Rechte Hand</p>");
        expect(html).toContain("Fehlerrate");
        expect(html).not.toContain("NaN");
        expect(html).not.toContain("Infinity");
        expect(html.match(/fill-opacity="0"/g)).toHaveLength(10);
    });

    test("uses contour-matched flat fills instead of shadow gradients or rotated rectangles", () => {
        const html = renderToStaticMarkup(<HandsChart fingers={fingers} locale="en" />);
        expect(html.match(/class="adv-hand-fill"/g)).toHaveLength(10);
        expect(html).toContain('fill-opacity="0.65"');
        expect(html).not.toContain("linearGradient");
        expect(html).not.toContain("<rect");
        expect(html).not.toContain("<filter");
    });

    test("maps error rate to success/error theme colors, independently of workload", () => {
        const cases = [
            { rate: 0, mix: 0 },
            { rate: 4, mix: 20 },
            { rate: 10, mix: 50 },
            { rate: 20, mix: 100 },
            { rate: 80, mix: 100 },
        ];
        for (const { rate, mix } of cases) {
            const html = renderToStaticMarkup(<HandsChart fingers={[{ ...fingers[0], errorRate: rate }]} locale="en" />);
            expect(html).toContain(                `fill="color-mix(in srgb, var(--error-color) ${mix}%, var(--success-color))" fill-opacity="0.65"`,
            );
        }
        const omitted = renderToStaticMarkup(<HandsChart fingers={[{ ...fingers[0], presses: 0, errors: 3, errorRate: 100 }]} locale="en" />);
        expect(omitted).toContain('fill="color-mix(in srgb, var(--error-color) 100%, var(--success-color))" fill-opacity="0.65"');
    });

    test("gives every clip path and label a unique ID across chart instances", () => {
        const html = renderToStaticMarkup(<><HandsChart fingers={fingers} locale="en" /><HandsChart fingers={fingers} locale="en" /></>);
        const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
        expect(new Set(ids).size).toBe(ids.length);
        const references = [...html.matchAll(/url\(#([^)]+)\)|aria-labelledby="([^"]+)"/g)].map((match) => match[1] ?? match[2]);
        expect(references.every((id) => ids.includes(id))).toBe(true);
    });
});
