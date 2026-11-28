import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import Navbar from "./Navbar";

const links = (html: string) => [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];

describe("two-row navigation", () => {
    test("the tool row renders every name, with history after Hacker Typer, and no settings", () => {
        const html = renderToStaticMarkup(<Navbar pathname="/" section="primary" />);
        expect(links(html)).toHaveLength(9);
        for (const label of ["Practice", "Learn", "Typing race", "Ghost race", "Blog", "Hacker Typer", "My material", "History", "My training"]) {
            expect(html).toContain(`<span class="navbar-label">${label}</span>`);
        }
        expect(html).toContain('aria-label="Typing tools"');
        expect(html).toContain("navbar-primary-links");
        expect(html.indexOf('href="/history/"')).toBeGreaterThan(html.indexOf('href="/hacker-typer/"'));
        expect(html).not.toContain('href="/pro/"');
        expect(html).not.toContain('href="/settings/"');
        expect(html).not.toContain("sr-only");
    });

    test("the utility row contains Pro and settings, with Pro active on its page", () => {
        const html = renderToStaticMarkup(<Navbar pathname="/pro/" section="utility" />);
        expect(links(html)).toHaveLength(2);
        expect(html).not.toContain('href="/history/"');
        expect(html).toContain('<span class="navbar-label">Pro</span>');
        expect(html).toContain('<span class="navbar-label">Settings</span>');
        expect(html).toContain("navbar-secondary-links");
        expect(html).toContain('aria-label="Pro, settings and language"');
        expect(html).not.toContain('href="/learn/"');
        const pro = links(html).find(link => link[1].includes('href="/pro/"'))!;
        expect(pro[1]).toContain('aria-current="page"');
        expect(renderToStaticMarkup(<Navbar pathname="/de/" section="utility" locale="de" />)).not.toContain('href="/pro/"');
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

import NavProfile from "./NavProfile";
import { $account } from "@/store/account";

describe("signed-in profile in the top row", () => {
    const user = { id: "u1", name: "Vivek", email: "v@example.com" };
    test("shows nothing until the account is signed in, so the Pro link stays for everyone else", () => {
        for (const state of [{ status: "loading" }, { status: "out" }, { status: "error", message: "x" }] as const) {
            $account.set(state);
            expect(renderToStaticMarkup(<NavProfile currentPath="/" />)).toBe("");
        }
        $account.set({ status: "out" });
        expect(renderToStaticMarkup(<Navbar pathname="/" section="utility" />)).toContain('href="/pro/"');
    });
    test("a Pro member gets the picture with the PRO pill and no Upgrade pill", () => {
        $account.set({ status: "in", user, pro: true, proUntil: null, source: null });
        const html = renderToStaticMarkup(<NavProfile currentPath="/" />);
        expect(html).toContain('href="/account/"');
        expect(html).toContain("Pro)");
        expect(html).toContain("navbar-profile-pill");
        expect(html).not.toContain("Upgrade");
        $account.set({ status: "loading" });
    });
    test("a free member gets the picture with an Upgrade pill linking to Pro", () => {
        $account.set({ status: "in", user, pro: false, proUntil: null, source: null });
        const html = renderToStaticMarkup(<NavProfile currentPath="/account/" />);
        expect(html).toContain('href="/pro/"');
        expect(html).toContain(">Upgrade<");
        expect(html).toContain('href="/pro/"');
        expect(html).toContain('aria-current="page"');
        $account.set({ status: "loading" });
    });
    test("the German navbar never shows the profile", () => {
        $account.set({ status: "in", user, pro: false, proUntil: null, source: null });
        expect(renderToStaticMarkup(<Navbar pathname="/de/" section="utility" locale="de" />)).not.toContain('navbar-profile');
        $account.set({ status: "loading" });
    });
});
