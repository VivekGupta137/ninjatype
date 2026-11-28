import type { ReactNode } from "react";
import { useStore } from "@nanostores/react";
import { Star } from "lucide-react";
import { $account } from "@/store/account";
import "@/styles/ui.css";

/** Small "★ PRO" pill. Use `ProBadge` alone inline, or wrap a control with `ProGate` to pin it to the control's top corner. */
export function ProBadge({ className = "" }: { className?: string }) {
    return <span className={`pro-pill ${className}`.trim()}><Star size={9} fill="currentColor" aria-hidden="true" />PRO</span>;
}

/** Pins the pill to the top-end corner of a control that needs Pro. The pill is decorative; put "Pro" in the control's own label or aria-label. */
export function ProGate({ show = true, children }: { show?: boolean; children: ReactNode }) {
    if (!show) return <>{children}</>;
    return <span className="pro-gate">{children}<ProBadge className="pro-pill--corner" /></span>;
}

/** True once the signed-in account is known to be Pro. Hide the pill for these users. */
export function useIsPro(): boolean {
    const account = useStore($account);
    return account.status === "in" && account.pro;
}
