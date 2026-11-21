import type { AnchorHTMLAttributes } from "react";
import { buttonVariants } from "@heroui/react";
import type { KeyButtonVariant } from "./KeyButton";
import "@/styles/ui.css";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
    variant?: KeyButtonVariant;
    isActive?: boolean;
    isIconOnly?: boolean;
    size?: "sm" | "md" | "lg";
};

/** A real link (`<a>`) that looks like a KeyButton. Use for navigation; use KeyButton for actions. */
export default function KeyLink({ variant = "secondary", isActive, isIconOnly, size = "md", className = "", ...props }: Props) {
    const cls = [
        buttonVariants({ variant: "outline", size, isIconOnly }),
        "key-btn", `key-btn--${variant}`, isActive && "key-btn--active", isIconOnly && "key-btn--icon", className,
    ].filter(Boolean).join(" ");
    return <a className={cls} {...props} />;
}
