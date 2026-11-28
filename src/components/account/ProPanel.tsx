import { useCallback, useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { Card, Chip } from "@heroui/react";
import { Check, CircleCheck, Crown, LoaderCircle } from "lucide-react";
import KeyButton from "@/components/ui/KeyButton";
import KeyLink from "@/components/ui/KeyLink";
import { checkoutUrl, confirmSubscription, portalUrl } from "@/lib/accountApi";
import { $account, refreshAccount } from "@/store/account";
import { PRO_INCLUDES } from "./proContent";
import "@/styles/ui.css";
import "@/styles/pro.css";

const MONTHLY = 4.99;
const YEARLY = 39;
const SAVE = Math.round((1 - YEARLY / (MONTHLY * 12)) * 100);
const date = (iso: string) => new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

type Phase = "idle" | "confirming" | "failed";

/** Plans, checkout, post-payment confirmation and billing management for /pro/. */
export default function ProPanel() {
    const account = useStore($account);
    const [busy, setBusy] = useState<"monthly" | "yearly" | "portal" | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [phase, setPhase] = useState<Phase>("idle");

    // Back from Dodo checkout: pull the subscription straight from Dodo (a few tries) so Pro doesn't hinge on webhook timing.
    const confirm = useCallback(async (subscriptionId: string) => {
        setPhase("confirming");
        for (let attempt = 0; attempt < 5; attempt++) {
            await confirmSubscription(subscriptionId);
            await refreshAccount();
            const now = $account.get();
            if (now.status === "in" && now.pro) { setPhase("idle"); history.replaceState(null, "", window.location.pathname); return; }
            await new Promise(r => setTimeout(r, 2000));
        }
        setPhase("failed");
    }, []);

    useEffect(() => {
        const sub = new URLSearchParams(window.location.search).get("subscription_id");
        if (sub) void confirm(sub); else void refreshAccount();
    }, [confirm]);

    const go = async (key: "monthly" | "yearly" | "portal", open: () => Promise<string>) => {
        setBusy(key);
        setError(null);
        try { window.location.href = await open(); } catch (e) { setError(e instanceof Error ? e.message : "Could not open billing."); setBusy(null); }
    };

    if (account.status === "loading") return <p className="pro-status" aria-live="polite"><LoaderCircle className="acct-spin" size={16} aria-hidden="true" /> Loading…</p>;
    if (account.status === "error") return <p className="pro-status" role="alert">{account.message}</p>;

    if (phase === "confirming") {
        return (
            <Card className="pro-banner" role="status" aria-live="polite">
                <LoaderCircle className="acct-spin pro-banner-icon" size={28} aria-hidden="true" />
                <div><h2>Confirming your payment…</h2><p>This takes a few seconds. You can keep this page open.</p></div>
            </Card>
        );
    }

    if (account.status === "in" && account.pro) {
        const subscribed = account.source === "dodo";
        return (
            <Card className="pro-banner pro-banner--active">
                <Crown className="pro-banner-icon" size={28} aria-hidden="true" />
                <div className="pro-banner-body">
                    <div className="acct-head">
                        <h2>You have Pro</h2>
                        <Chip size="sm" variant="soft" color="success"><Chip.Label>{account.proUntil ? `Through ${date(account.proUntil)}` : "Active"}</Chip.Label></Chip>
                    </div>
                    <p>Thanks for supporting NinjaType. Everything below is unlocked on this account.</p>
                    <div className="acct-actions">
                        <KeyLink href="/history/" variant="primary">Sync history</KeyLink>
                        <KeyLink href="/training/">My training</KeyLink>
                        <KeyLink href="/settings/">Custom themes</KeyLink>
                        {subscribed && <KeyButton isDisabled={busy !== null} onPress={() => { void go("portal", portalUrl); }}>{busy === "portal" ? "Opening…" : "Manage billing"}</KeyButton>}
                    </div>
                    {error && <p className="pro-error" role="alert">{error}</p>}
                </div>
            </Card>
        );
    }

    const signedOut = account.status === "out";
    const lapsed = account.status === "in" && account.source === "dodo";
    const plan = (key: "monthly" | "yearly", name: string, price: string, per: string, note: string, best?: boolean) => (
        <Card className="pro-plan" data-featured={best ? "true" : undefined}>
            <Card.Header>
                <div className="pro-plan-head">
                    <Card.Title>{name}</Card.Title>
                    {best && <Chip size="sm" variant="primary" color="accent"><Chip.Label>Save {SAVE}%</Chip.Label></Chip>}
                </div>
                <Card.Description>{note}</Card.Description>
            </Card.Header>
            <Card.Content>
                <p className="pro-price">{price} <small>{per}</small></p>
                <ul className="pro-checks">{PRO_INCLUDES.map(pt => <li key={pt}><Check size={16} aria-hidden="true" />{pt}</li>)}</ul>
            </Card.Content>
            <Card.Footer>
                {signedOut
                    ? <KeyLink href="/account/" variant={best ? "primary" : "secondary"} className="pro-plan-cta">Sign in to subscribe</KeyLink>
                    : <KeyButton variant={best ? "primary" : "secondary"} className="pro-plan-cta" isDisabled={busy !== null} onPress={() => { void go(key, () => checkoutUrl(key)); }}>{busy === key ? "Opening checkout…" : `Subscribe ${key}`}</KeyButton>}
            </Card.Footer>
        </Card>
    );

    return (
        <div className="pro-stack">
            {phase === "failed" && (
                <Card className="pro-banner" role="alert">
                    <div>
                        <h2>We haven't seen your payment yet</h2>
                        <p>If you just paid, it can take a minute to arrive. Your card is only charged once. Check again, or contact us if Pro doesn't turn on.</p>
                        <div className="acct-actions"><KeyButton variant="primary" onPress={() => { const s = new URLSearchParams(window.location.search).get("subscription_id"); if (s) void confirm(s); else setPhase("idle"); }}>Check again</KeyButton></div>
                    </div>
                </Card>
            )}
            {lapsed && phase !== "failed" && <p className="pro-status">Your last subscription has ended. Subscribe again to get Pro back.</p>}
            <div className="pro-plans">
                {plan("yearly", "Yearly", `$${YEARLY}`, "per year", `$${(YEARLY / 12).toFixed(2)} a month, billed once a year`, true)}
                {plan("monthly", "Monthly", `$${MONTHLY}`, "per month", "Billed monthly, switch to yearly any time")}
            </div>
            {error && <p className="pro-error" role="alert">{error}</p>}
            <p className="pro-fineprint"><CircleCheck size={14} aria-hidden="true" /> Cancel any time from the billing portal. Payments are handled securely by Dodo Payments; we never see your card.{signedOut && " You'll create a free account first."}</p>
        </div>
    );
}
