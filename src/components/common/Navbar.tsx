import {
    BookOpen,
    Ghost,
    GraduationCap,
    HistoryIcon,
    Keyboard,
    Settings,
    SquareTerminal,
} from "lucide-react";
import type { CSSProperties, SVGProps } from "react";
import { Tooltip } from "@heroui/react";
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

interface Props { pathname: string }

const Navbar = ({ pathname }: Props) => {
    const currentPath = `${pathname.replace(/\/+$/, "")}/`;

    const renderLink = ({ href, label, icon: Icon, motion }: typeof primaryLinks[number], showLabel = false, index = 0) => {
        const active = currentPath === href || (href !== "/" && currentPath.startsWith(href));
        const linkProps = {
            href,
            className: `navbar-link ${showLabel ? "navbar-utility-link" : "navbar-icon-link"}`,
            "aria-current": active ? (currentPath === href ? "page" as const : "location" as const) : undefined,
            "data-active": active,
        };
        const content = <>
                <span className={`navbar-icon navbar-motion-${motion}`} style={{ "--navbar-nudge-delay": `${8 + index * 8}s` } as CSSProperties} aria-hidden="true">
                    <Icon size={19} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span className={showLabel ? "navbar-utility-label" : "sr-only"}>{label}</span>
            </>;

        if (showLabel) return <a key={href} {...linkProps}>{content}</a>;

        return (
            <Tooltip key={href} delay={150} closeDelay={80}>
                <Tooltip.Trigger<"a"> {...linkProps} role="link" render={props => <a {...props} />}>
                    {content}
                </Tooltip.Trigger>
                <Tooltip.Content className="navbar-heroui-tooltip" placement="bottom" offset={8}>
                    {label}
                </Tooltip.Content>
            </Tooltip>
        );
    };

    return (
        <nav className="navbar" aria-label="Site navigation">
            <div className="navbar-primary-links">{primaryLinks.map((link, index) => renderLink(link, false, index))}</div>
            <div className="navbar-secondary-links">{utilityLinks.map((link, index) => renderLink(link, true, index + primaryLinks.length))}</div>
        </nav>
    );
};

export default Navbar;
