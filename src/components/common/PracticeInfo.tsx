import { Info } from "lucide-react";
import type { ReactNode } from "react";

/** On-demand context keeps the default practice surface quiet. */
export default function PracticeInfo({ label, children }: { label: string; children: ReactNode }) {
    return (
        <details className="practice-info" onKeyDown={event => {
            if (event.key !== "Escape") return;
            event.currentTarget.open = false;
            event.currentTarget.querySelector("summary")?.focus();
            event.stopPropagation();
        }} onBlur={event => {
            if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) {
                event.currentTarget.open = false;
            }
        }}>
            <summary aria-label={label} title={label}><Info size={14} aria-hidden="true" /></summary>
            <div className="practice-info-content" tabIndex={0} role="region" aria-label={label}>
                {children}
            </div>
        </details>
    );
}
