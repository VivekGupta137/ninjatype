import type { ComponentProps } from "react";
import { Button } from "@heroui/react";
import "@/styles/ui.css";

export type KeyButtonVariant = "primary" | "secondary" | "ghost";

type Props = Omit<ComponentProps<typeof Button>, "variant"> & {
    /** primary = accent keycap, secondary = neutral keycap (default), ghost = chrome-less. */
    variant?: KeyButtonVariant;
    /** Marks the current / selected keycap (filled). */
    isActive?: boolean;
};

/** Keyboard-styled button, matching the typing keyboard's keys. Use `isIconOnly` for a square icon key. */
export default function KeyButton({ variant = "secondary", isActive, isIconOnly, className = "", ...props }: Props) {
    const cls = ["key-btn", `key-btn--${variant}`, isActive && "key-btn--active", isIconOnly && "key-btn--icon", className].filter(Boolean).join(" ");
    return <Button variant="outline" isIconOnly={isIconOnly} aria-pressed={isActive} className={cls} {...props} />;
}
