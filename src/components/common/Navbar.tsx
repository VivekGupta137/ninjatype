import {
    BookOpen,
    Crown,
    Dumbbell,
    FileText,
    Ghost,
    GraduationCap,
    Keyboard,
    Settings,
    SquareTerminal,
} from "lucide-react";
import { Fragment, useEffect, useRef, useState, type CSSProperties, type SVGProps } from "react";
import "@/styles/navbar.css";
import ThemeSwatchPicker from "./ThemeSwatchPicker";
import LanguageSwitch from "./LanguageSwitch";
import { ProBadge } from "@/components/ui/ProBadge";
import KeyLink from "@/components/ui/KeyLink";
import NavProfile from "./NavProfile";
import { useStore } from "@nanostores/react";
import { $account } from "@/store/account";
import { Hint } from "@/components/ui/InfoTip";
import { tr, practiceHrefFor, learnHrefFor, raceHrefFor, ghostHrefFor, type LearnLocale } from "@/lib/learnLocale";

export const RunningIcon = ({ size = 19, strokeWidth = 1.75, ...props }: SVGProps<SVGSVGElement> & { size?: number | string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="16" cy="4" r="1.75" />
        <path d="m14 8-3 5" />
        <g className="navbar-runner-arms"><path d="m14 8 3 4 4-1M12 10l-5-1-3 4" /></g>
        <g className="navbar-runner-legs"><path d="m11 13 4 3 4 2M11 13l-2 5-4 3" /></g>
        <path d="M6 4H3M5 7H2" />
    </svg>
);

/** Analytics bar chart; the bars rise one after another on hover and on the idle nudge. */
export const AnalyticsIcon = ({ size = 19, strokeWidth = 1.75, ...props }: SVGProps<SVGSVGElement> & { size?: number | string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3 3v18h18" />
        <path className="navbar-bar navbar-bar-1" d="M8 17v-5" />
        <path className="navbar-bar navbar-bar-2" d="M13 17V8" />
        <path className="navbar-bar navbar-bar-3" d="M18 17v-9" />
    </svg>
);

const primaryLinks = (locale: LearnLocale) => [
    { href: practiceHrefFor(locale), label: tr(locale, "Practice", "Üben"), icon: Keyboard, motion: "typing" },
    { href: learnHrefFor(locale), label: tr(locale, "Learn", "Lernen"), icon: GraduationCap, motion: "learn" },
    { href: raceHrefFor(locale), label: tr(locale, "Typing race", "Tipp-Rennen"), icon: RunningIcon, motion: "race" },
    { href: ghostHrefFor(locale), label: tr(locale, "Ghost race", "Ghost Race"), icon: Ghost, motion: "ghost" },
    { href: locale === "en" ? "/blog/" : `/${locale}/blog/`, label: "Blog", icon: BookOpen, motion: "book" },
    { href: "/hacker-typer/", label: "Hacker Typer", icon: SquareTerminal, motion: "terminal" },
    ...(locale === "en" ? [{ href: "/my-material/", label: "My material", icon: FileText, motion: "book" }] : []),
    { href: "/history/", label: tr(locale, "History", "Verlauf"), icon: AnalyticsIcon, motion: "analytics" },
    ...(locale === "en" ? [{ href: "/training/", label: "My training", icon: Dumbbell, motion: "typing", pro: true }] : []),
];

const utilityLinks = (locale: LearnLocale) => [
    { href: "/settings/", label: tr(locale, "Settings", "Einstellungen"), icon: Settings, motion: "settings" },
];

interface Props { pathname: string; section: "primary" | "utility"; locale?: LearnLocale }

const Navbar = ({ pathname, section, locale = "en" }: Props) => {
    const currentPath = `${pathname.replace(/\/+$/, "")}/`;
    const navRef = useRef<HTMLElement>(null);
    const links = section === "primary" ? primaryLinks(locale) : utilityLinks(locale);

    useEffect(() => {
        const nav = navRef.current;
        const active = nav?.querySelector<HTMLElement>("[aria-current]");
        if (section !== "primary" || !nav || !active || nav.scrollWidth <= nav.clientWidth) return;
        // Reveal the selected tool on mobile without scrolling the page vertically.
        nav.scrollLeft += active.getBoundingClientRect().left - nav.getBoundingClientRect().left
            - (nav.clientWidth - active.offsetWidth) / 2;
    }, [currentPath, section]);

    const isUtility = section === "utility";
    const account = useStore($account);
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);
    const signedIn = mounted && account.status === "in";
    return (
        <nav ref={navRef} className={`navbar ${section === "primary" ? "navbar-primary-links" : "navbar-secondary-links"}`}
            aria-label={section === "primary" ? "Typing tools" : locale === "en" ? "Pro, settings and language" : "Settings and language"}>
            {isUtility && locale === "en" && !signedIn && <KeyLink href="/pro/" variant="ghost" size="md"
                isActive={currentPath.startsWith("/pro/")} className="navbar-link navbar-tool-link"
                aria-current={currentPath === "/pro/" ? "page" : currentPath.startsWith("/pro/") ? "location" : undefined}
                data-active={currentPath.startsWith("/pro/")}>
                <span className="navbar-icon navbar-motion-learn" aria-hidden="true"><Crown size={19} strokeWidth={1.75} /></span>
                <span className="navbar-label">Pro</span>
            </KeyLink>}
            {isUtility && locale === "en" && mounted && <NavProfile currentPath={currentPath} />}
            {isUtility && <ThemeSwatchPicker />}
            {isUtility && <LanguageSwitch pathname={pathname} locale={locale} />}
            {links.map(({ href, label, icon: Icon, motion, ...rest }, index) => {
                const active = currentPath === href || (href !== "/" && currentPath.startsWith(href));
                const link = (
                    <KeyLink href={href} variant="ghost" size={isUtility ? "md" : "sm"} isIconOnly={isUtility} isActive={active}
                        className={`navbar-link ${isUtility ? "navbar-utility-link" : "navbar-tool-link"}`}
                        aria-current={active ? (currentPath === href ? "page" : "location") : undefined} data-active={active}>
                        <span className={`navbar-icon navbar-motion-${motion}`} style={{ "--navbar-nudge-delay": `${8 + (index + (isUtility ? primaryLinks.length : 0)) * 8}s` } as CSSProperties} aria-hidden="true">
                            <Icon size={19} strokeWidth={1.75} aria-hidden="true" />
                        </span>
                        <span className="navbar-label">{label}</span>
                        {"pro" in rest && rest.pro && <ProBadge className="navbar-pro-pill" />}
                    </KeyLink>
                );
                return isUtility ? <Hint key={href} text={label}>{link}</Hint> : <Fragment key={href}>{link}</Fragment>;
            })}
        </nav>
    );
};

export default Navbar;
