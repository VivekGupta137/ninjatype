import { afterEach, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import PracticeCelebration from "./PracticeCelebration";
import { celebrate, dismissCelebration } from "@/store/celebrations";

afterEach(() => dismissCelebration());

test("SSR mounts a quiet live region, never a popup or moving confetti", () => {
    celebrate({ id: "pending", createdAt: Date.now(), streak: 2, record: { previousWpm: 60, wpm: 70 } });
    const html = renderToStaticMarkup(<PracticeCelebration />);
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).not.toContain("practice-confetti");
    expect(html).not.toContain("practice-celebration-close");
    expect(html).not.toContain("New personal best");
});
