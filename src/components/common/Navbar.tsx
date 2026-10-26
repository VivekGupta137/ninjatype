import {
    BookOpen,
    Ghost,
    GraduationCap,
    HistoryIcon,
    Keyboard,
    Settings2,
    SquareTerminal,
    Users,
} from "lucide-react";

const primaryLinks = [
    { href: "/", label: "Practice", icon: Keyboard },
    { href: "/learn/", label: "Learn", icon: GraduationCap },
    { href: "/multiplayer-typing-race/", label: "Typing race", icon: Users },
    { href: "/ghost-race/", label: "Ghost race", icon: Ghost },
    { href: "/blog/", label: "Blog", icon: BookOpen },
    { href: "/hacker-typer/", label: "Hacker Typer", icon: SquareTerminal },
];

const utilityLinks = [
    { href: "/history/", label: "History", icon: HistoryIcon },
    { href: "/settings/", label: "Settings", icon: Settings2 },
];

interface Props { pathname: string }

const Navbar = ({ pathname }: Props) => {
    const currentPath = `${pathname.replace(/\/+$/, "")}/`;

    const renderLink = ({ href, label, icon: Icon }: typeof primaryLinks[number], showLabel = false) => {
        const active = currentPath === href || (href !== "/" && currentPath.startsWith(href));
        return (
            <a
                key={href}
                href={href}
                className={`navbar-link ${showLabel ? "navbar-utility-link" : "navbar-icon-link"}`}
                aria-label={showLabel ? undefined : label}
                aria-current={active ? (currentPath === href ? "page" : "location") : undefined}
                data-active={active}
            >
                <Icon size={19} strokeWidth={1.75} aria-hidden="true" />
                <span className={showLabel ? "navbar-utility-label" : "navbar-tooltip"} aria-hidden={showLabel ? undefined : true}>{label}</span>
            </a>
        );
    };

    return (
        <nav className="navbar" aria-label="Site navigation">
            <div className="navbar-primary-links">{primaryLinks.map(link => renderLink(link))}</div>
            <div className="navbar-secondary-links">{utilityLinks.map(link => renderLink(link, true))}</div>
        </nav>
    );
};

export default Navbar;
