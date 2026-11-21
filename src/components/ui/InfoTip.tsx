import type { ReactNode } from "react";
import { Alert, Popover, Tooltip } from "@heroui/react";
import { Info } from "lucide-react";
import "@/styles/ui.css";

interface InfoTipProps {
    /** Trigger text, e.g. "How star ratings work". */
    label: string;
    /** Short alert heading; defaults to the label. */
    title?: string;
    children: ReactNode;
    href?: string;
    hrefLabel?: string;
}

/** Inline help link that opens a mini info alert in a popover. */
export function InfoTip({ label, title, children, href, hrefLabel = "Learn more →" }: InfoTipProps) {
    return (
        <Popover>
            <Popover.Trigger<"button"> render={props => <button {...props} type="button" />} className="info-tip-trigger">
                <Info size={14} aria-hidden="true" />{label}
            </Popover.Trigger>
            <Popover.Content className="info-tip-popover" placement="bottom start" offset={8}>
                <Popover.Dialog aria-label={title ?? label}>
                    <Alert status="accent">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>{title ?? label}</Alert.Title>
                            <Alert.Description>{children}</Alert.Description>
                            {href && <a className="info-tip-link" href={href}>{hrefLabel}</a>}
                        </Alert.Content>
                    </Alert>
                </Popover.Dialog>
            </Popover.Content>
        </Popover>
    );
}

/** Wraps any focusable element with a short tooltip. */
export function Hint({ text, children }: { text: string; children: ReactNode }) {
    return (
        <Tooltip delay={200}>
            <Tooltip.Trigger>{children}</Tooltip.Trigger>
            <Tooltip.Content>{text}</Tooltip.Content>
        </Tooltip>
    );
}
