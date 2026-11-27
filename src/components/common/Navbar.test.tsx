import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import Navbar from "./Navbar";

const links = (html: string) => [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];

describe("two-row navigation", () => {
    test("the tool row renders every name, with history after Hacker Typer, and no settings", () => {
        const html = renderToStaticMarkup(<Navbar pathname="/" section="primary" />);
        expect(links(html)).toHaveLength(8);
        for (const label of ["Practice", "Learn", "Typing race", "Ghost race", "Blog", "Hacker Typer", "My material", "History"]) {
            expect(html).toContain(`<span class="navbar-label">${label}</span>`);
        }
        expect(html).toContain('aria-label="Typing tools"');
        expect(html).toContain("navbar-primary-links");
        expect(html.indexOf('href="/history/"')).toBeGreaterThan(html.indexOf('href="/hacker-typer/"'));
        expect(html).not.toContain('href="/settings/"');
        expect(html).not.toContain("sr-only");
    });

    test("the utility row contains only the settings link", () => {
        const html = renderToStaticMarkup(<Navbar pathname="/history/" section="utility" />);
        expect(links(html)).toHaveLength(1);
        expect(html).not.toContain('href="/history/"');
        expect(html).toContain('<span class="navbar-label">Settings</span>');
        expect(html).toContain("navbar-secondary-links");
        expect(html).toContain('aria-label="Settings and language"');
        expect(html).not.toContain('href="/learn/"');
    });

    test("marks exactly the current page or section, including nested pages", () => {
        for (const [pathname, href, current] of [
            ["/", "/", "page"],
            ["/learn", "/learn/", "page"],
            ["/learn/fingers/pointer/", "/learn/", "location"],
            ["/blog/typing-ninja/", "/blog/", "location"],
            ["/hacker-typer/", "/hacker-typer/", "page"],
        ]) {
            const active = links(renderToStaticMarkup(<Navbar pathname={pathname} section="primary" />))
                .filter(link => link[1].includes("aria-current="));
            expect(active).toHaveLength(1);
            expect(active[0][1]).toContain(`href="${href}"`);
            expect(active[0][1]).toContain(`aria-current="${current}"`);
        }
        expect(renderToStaticMarkup(<Navbar pathname="/blogging/" section="primary" />)).not.toContain("aria-current=");
    });
});
