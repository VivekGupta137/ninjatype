import { Chip, Popover, buttonVariants } from "@heroui/react";
import { ArrowRight, Info } from "lucide-react";
import type { ReactNode } from "react";
import { Hint } from "@/components/ui/InfoTip";
import KeyLink from "@/components/ui/KeyLink";
import "@/styles/ui.css";

interface Props {
    /** Accessible name and popover heading. */
    label: string;
    children: ReactNode;
    /** Optional keycap link shown at the bottom of the popover. */
    href?: string;
    hrefLabel?: string;
    /** When given, the chip itself is the (clickable) trigger; otherwise an icon key is. */
    chip?: ReactNode;
    /** Optional content pinned to the popover's top-right corner. */
    headerExtra?: ReactNode;
}

/** On-demand context keeps the default practice surface quiet. */
export default function PracticeInfo({ label, children, href, hrefLabel = "View history", chip, headerExtra }: Props) {
    const content = (
        <Popover.Content className="practice-pop" placement="bottom" offset={8}>
            <Popover.Dialog aria-label={label} className="practice-pop-body">
                <div className="practice-pop-head">
                    <Popover.Heading className="practice-pop-heading"><Info size={15} aria-hidden="true" />{label}</Popover.Heading>
                    {headerExtra && <div className="practice-pop-extra">{headerExtra}</div>}
                </div>
                <div className="practice-pop-content">{children}</div>
                {href && <KeyLink href={href} size="sm" variant="primary" className="practice-pop-action">{hrefLabel}<ArrowRight size={14} aria-hidden="true" /></KeyLink>}
            </Popover.Dialog>
        </Popover.Content>
    );

    if (chip) {
        return (
            <Popover>
                <Popover.Trigger<"button"> render={props => <button {...props} type="button" />} className="practice-chip-trigger" aria-label={label}>
                    <Chip size="md" variant="soft" color="accent" className="practice-last-chip">
                        <Chip.Label className="practice-chip-label">{chip}<Info size={13} aria-hidden="true" className="practice-chip-info" /></Chip.Label>
                    </Chip>
                </Popover.Trigger>
                {content}
            </Popover>
        );
    }
    return (
        <Hint text={label}>
            <Popover>
                <Popover.Trigger<"button">
                    render={props => <button {...props} type="button" />}
                    className={`${buttonVariants({ variant: "outline", size: "sm", isIconOnly: true })} key-btn key-btn--ghost key-btn--icon practice-info-trigger`}
                    aria-label={label}
                >
                    <Info size={16} aria-hidden="true" />
                </Popover.Trigger>
                {content}
            </Popover>
        </Hint>
    );
}
