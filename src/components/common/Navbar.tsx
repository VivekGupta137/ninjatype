import {
    BookOpen,
    Ghost,
    GraduationCap,
    HistoryIcon,
    Keyboard,
    Settings,
    SquareTerminal,
} from "lucide-react";
import { useEffect, useRef, type CSSProperties, type SVGProps } from "react";
import "@/styles/navbar.css";

export const RunningIcon = ({ size = 19, strokeWidth = 1.75, ...props }: SVGProps<SVGSVGElement> & { size?: number | string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="16" cy="4" r="1.75" />
        <path d="m14 8-3 5" />
        <g className="navbar-runner-arms"><path d="m14 8 3 4 4-1M12 10l-5-1-3 4" /></g>
        <g className="navbar-runner-legs"><path d="m11 13 4 3 4 2M11 13l-2 5-4 3" /></g>
        <path d="M6 4H3M5 7H2" />
    </svg>
);

const primaryLinks = [
    { href: "/", label: "Practice", icon: Keyboard, motion: "typing" },
    { href: "/learn/", label: "Learn", icon: GraduationCap, motion: "learn" },
    { href: "/multiplayer-typing-race/", label: "Typing race", icon: RunningIcon, motion: "race" },
    { href: "/ghost-race/", label: "Ghost race", icon: Ghost, motion: "ghost" },
    { href: "/blog/", label: "Blog", icon: BookOpen, motion: "book" },
    { href: "/hacker-typer/", label: "Hacker Typer", icon: SquareTerminal, motion: "terminal" },
];

const utilityLinks = [
    { href: "/history/", label: "History", icon: HistoryIcon, motion: "history" },
    { href: "/settings/", label: "Settings", icon: Settings, motion: "settings" },
];

interface Props { pathname: string; section: "primary" | "utility" }

const Navbar = ({ pathname, section }: Props) => {
    const currentPath = `${pathname.replace(/\/+$/, "")}/`;
    const navRef = useRef<HTMLElement>(null);
    const links = section === "primary" ? primaryLinks : utilityLinks;

    useEffect(() => {
        const nav = navRef.current;
        const active = nav?.querySelector<HTMLElement>("[aria-current]");
        if (section !== "primary" || !nav || !active || nav.scrollWidth <= nav.clientWidth) return;
        // Reveal the selected tool on mobile without scrolling the page vertically.
        nav.scrollLeft += active.getBoundingClientRect().left - nav.getBoundingClientRect().left
            - (nav.clientWidth - active.offsetWidth) / 2;
    }, [currentPath, section]);

    return (
        <nav ref={navRef} className={`navbar ${section === "primary" ? "navbar-primary-links" : "navbar-secondary-links"}`}
            aria-label={section === "primary" ? "Typing tools" : "History and settings"}>
            {links.map(({ href, label, icon: Icon, motion }, index) => {
                const active = currentPath === href || (href !== "/" && currentPath.startsWith(href));
                return (
                    <a key={href} href={href} className={`navbar-link ${section === "utility" ? "navbar-utility-link" : "navbar-tool-link"}`}
                        aria-current={active ? (currentPath === href ? "page" : "location") : undefined} data-active={active}>
                        <span className={`navbar-icon navbar-motion-${motion}`} style={{ "--navbar-nudge-delay": `${8 + (index + (section === "utility" ? primaryLinks.length : 0)) * 8}s` } as CSSProperties} aria-hidden="true">
                            <Icon size={19} strokeWidth={1.75} aria-hidden="true" />
                        </span>
                        <span className="navbar-label">{label}</span>
                    </a>
                );
            })}
        </nav>
    );
};

export default Navbar;
