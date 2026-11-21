import type { ComponentProps, ReactNode } from "react";
import { Link } from "@heroui/react";
import { ArrowUpRight } from "lucide-react";
import "@/styles/ui.css";

export type TextLinkVariant = "accent" | "muted" | "text" | "underline";

type Props = Omit<ComponentProps<typeof Link>, "children"> & {
    href: string;
    children: ReactNode;
    /**
     * accent: inline link in the main color (default)
     * muted: quiet link for footers and lists, brightens on hover
     * text: full-contrast text link
     * underline: accent link that is always underlined (inside prose)
     */
    variant?: TextLinkVariant;
    /** Leading icon. */
    icon?: ReactNode;
    size?: "sm" | "md";
    /** Opens in a new tab with a ↗ marker. Detected automatically for http(s) links. */
    external?: boolean;
};

/** Standard anchor link. Use KeyLink when a link should look like a button. */
export default function TextLink({ variant = "accent", icon, size = "md", external, href, className = "", children, ...props }: Props) {
    const isExternal = external ?? /^https?:\/\//.test(href);
    const cls = ["text-link", `text-link--${variant}`, `text-link--${size}`, className].filter(Boolean).join(" ");
    return (
        <Link href={href} className={cls} {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...props}>
            {icon && <span className="text-link__icon" aria-hidden="true">{icon}</span>}
            <span>{children}</span>
            {isExternal && <ArrowUpRight className="text-link__external" size={12} aria-hidden="true" />}
        </Link>
    );
}
