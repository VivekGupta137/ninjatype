import { useId } from "react";
import { Popover, buttonVariants } from "@heroui/react";
import { Hint } from "@/components/ui/InfoTip";
import "@/styles/ui.css";
import { LANGUAGE_OPTIONS, localeHrefFor, type SwitchLocale } from "@/lib/localeSwitch";

/*
 * National flags are the exception to the theme-only colour rule (like brand logos).
 * Inline SVG renders the same on every OS, unlike flag emoji, which show letters on Windows.
 */
const Flag = ({ locale }: { locale: SwitchLocale }) => {
    // Unique clip-path ids per instance, since the trigger and menu can both render flags.
    const id = `flag-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
    const frame = { width: 20, height: 14 };
    if (locale === "de") {
        return (
            <svg className="navbar-flag" viewBox="0 0 5 3" preserveAspectRatio="none" {...frame} aria-hidden="true" focusable="false">
                <rect width="5" height="1" y="0" fill="#000000" />
                <rect width="5" height="1" y="1" fill="#DD0000" />
                <rect width="5" height="1" y="2" fill="#FFCE00" />
            </svg>
        );
    }
    if (locale === "fr") {
        return (
            <svg className="navbar-flag" viewBox="0 0 3 2" preserveAspectRatio="none" {...frame} aria-hidden="true" focusable="false">
                <rect width="1" height="2" x="0" fill="#002395" />
                <rect width="1" height="2" x="1" fill="#FFFFFF" />
                <rect width="1" height="2" x="2" fill="#ED2939" />
            </svg>
        );
    }
    if (locale === "ja") {
        return (
            <svg className="navbar-flag" viewBox="0 0 3 2" preserveAspectRatio="none" {...frame} aria-hidden="true" focusable="false">
                <rect width="3" height="2" fill="#FFFFFF" />
                <circle cx="1.5" cy="1" r="0.6" fill="#BC002D" />
            </svg>
        );
    }
    if (locale === "nl") {
        return (
            <svg className="navbar-flag" viewBox="0 0 3 2" preserveAspectRatio="none" {...frame} aria-hidden="true" focusable="false">
                <rect width="3" height="0.67" y="0" fill="#AE1C28" />
                <rect width="3" height="0.67" y="0.67" fill="#FFFFFF" />
                <rect width="3" height="0.66" y="1.34" fill="#21468B" />
            </svg>
        );
    }
    if (locale === "it") {
        return (
            <svg className="navbar-flag" viewBox="0 0 3 2" preserveAspectRatio="none" {...frame} aria-hidden="true" focusable="false">
                <rect width="1" height="2" x="0" fill="#009246" />
                <rect width="1" height="2" x="1" fill="#FFFFFF" />
                <rect width="1" height="2" x="2" fill="#CE2B37" />
            </svg>
        );
    }
    if (locale === "sv") {
        return (
            <svg className="navbar-flag" viewBox="0 0 16 10" preserveAspectRatio="none" {...frame} aria-hidden="true" focusable="false">
                <rect width="16" height="10" fill="#006AA7" />
                <path d="M0,4 h16 v2 h-16 z M5,0 v10 h2 v-10 z" fill="#FECC02" />
            </svg>
        );
    }
    if (locale === "da") {
        return (
            <svg className="navbar-flag" viewBox="0 0 37 28" preserveAspectRatio="none" {...frame} aria-hidden="true" focusable="false">
                <rect width="37" height="28" fill="#C8102E" />
                <path d="M12,0 h4 v28 h-4 z M0,12 h37 v4 h-37 z" fill="#FFFFFF" />
            </svg>
        );
    }
    if (locale === "no") {
        return (
            <svg className="navbar-flag" viewBox="0 0 22 16" preserveAspectRatio="none" {...frame} aria-hidden="true" focusable="false">
                <rect width="22" height="16" fill="#BA0C2F" />
                <path d="M6,0 h4 v16 h-4 z M0,6 h22 v4 h-22 z" fill="#FFFFFF" />
                <path d="M7,0 h2 v16 h-2 z M0,7 h22 v2 h-22 z" fill="#00205B" />
            </svg>
        );
    }
    // United Kingdom (Union Jack)
    return (
        <svg className="navbar-flag" viewBox="0 0 60 30" preserveAspectRatio="none" {...frame} aria-hidden="true" focusable="false">
            <clipPath id={`${id}-s`}><path d="M0,0 v30 h60 v-30 z" /></clipPath>
            <clipPath id={`${id}-t`}><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" /></clipPath>
            <g clipPath={`url(#${id}-s)`}>
                <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
                <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" strokeWidth="6" />
                <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${id}-t)`} stroke="#C8102E" strokeWidth="4" />
                <path d="M30,0 v30 M0,15 h60" stroke="#FFFFFF" strokeWidth="10" />
                <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
            </g>
        </svg>
    );
};

interface Props { pathname: string; locale: string }

/** Navbar language switcher: a flag that opens a menu of shipped locales, each linking to the same page. */
export default function LanguageSwitch({ pathname, locale }: Props) {
    const current = LANGUAGE_OPTIONS.find(o => o.locale === locale) ?? LANGUAGE_OPTIONS[0];

    return (
        <Hint text={`Language: ${current.label}`}>
        <Popover>
            <Popover.Trigger<"button">
                render={props => <button {...props} type="button" />}
                className={`${buttonVariants({ variant: "outline", size: "md", isIconOnly: true })} key-btn key-btn--ghost key-btn--icon navbar-link navbar-utility-link navbar-lang-trigger`}
                aria-label={`Language: ${current.label}`}
            >
                <span className="navbar-icon" aria-hidden="true">
                    <Flag locale={current.locale} />
                </span>
            </Popover.Trigger>
            <Popover.Content className="navbar-lang-popover" placement="bottom end" offset={10}>
                <Popover.Dialog className="navbar-lang-popover-body" aria-label="Choose a language">
                    <Popover.Heading className="navbar-lang-popover-heading">Language</Popover.Heading>
                    <ul className="navbar-lang-list">
                        {LANGUAGE_OPTIONS.map(option => {
                            const active = option.locale === current.locale;
                            return (
                                <li key={option.locale}>
                                    <a
                                        href={localeHrefFor(pathname, option.locale)}
                                        lang={option.locale}
                                        hrefLang={option.locale}
                                        className="navbar-lang-option"
                                        aria-current={active ? "true" : undefined}
                                    >
                                        <Flag locale={option.locale} />
                                        <span>{option.label}</span>
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </Popover.Dialog>
            </Popover.Content>
        </Popover>
        </Hint>
    );
}
