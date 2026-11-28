import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { Cloud, CloudOff, RefreshCw } from "lucide-react";
import { Hint } from "@/components/ui/InfoTip";
import { ProGate } from "@/components/ui/ProBadge";
import KeyButton from "@/components/ui/KeyButton";
import KeyLink from "@/components/ui/KeyLink";
import { $account, refreshAccount } from "@/store/account";
import { $syncStatus, disableSync, enableSync, isSyncEnabledFor, runSync } from "@/store/historySync";
import "@/styles/ui.css";
import "@/styles/account.css";

/** Compact sync controls for /history/ (beside "Practice again") and /account/. Syncs once when the page opens (if signed in and on), then on demand. */
export default function HistorySyncControl() {
    const account = useStore($account);
    const status = useStore($syncStatus);
    const userId = account.status === "in" ? account.user.id : null;
    const pro = account.status === "in" && account.pro;
    const [enabled, setEnabled] = useState(false);

    useEffect(() => { if ($account.get().status === "loading") void refreshAccount(); }, []);
    useEffect(() => {
        const on = userId && pro ? isSyncEnabledFor(userId) : false;
        setEnabled(on);
        if (on) void runSync();
    }, [userId, pro]);

    if (account.status === "loading" || account.status === "error") return null;
    if (!userId) return <ProGate><KeyLink href="/account/"><Cloud size={16} aria-hidden="true" /> Sign in to sync</KeyLink></ProGate>;

    if (!pro) return <ProGate><KeyLink href="/pro/"><Cloud size={16} aria-hidden="true" /> Sync history</KeyLink></ProGate>;

    const syncing = status.state === "syncing";
    const failed = status.state === "error";
    const tip = syncing ? "Syncing…"
        : failed ? `Sync failed${status.message ? `: ${status.message}` : ""}`
        : status.lastSyncedAt ? `Synced ${new Date(status.lastSyncedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : "Not synced yet";

    if (!enabled) return <ProGate><KeyButton onPress={() => { setEnabled(true); void enableSync(userId); }}><Cloud size={16} aria-hidden="true" /> Sync this device</KeyButton></ProGate>;

    return (
        <ProGate><div className="key-split" role="group" aria-label="History data sync">
            <Hint text={tip}>
                <KeyButton isDisabled={syncing} aria-label={`Sync now. ${tip}`} className={failed ? "key-split-error" : undefined} onPress={() => { void runSync(); }}>
                    <RefreshCw size={16} className={syncing ? "acct-spin" : undefined} aria-hidden="true" /> Sync now
                </KeyButton>
            </Hint>
            <Hint text="Turn off sync on this device">
                <KeyButton isIconOnly aria-label="Turn off sync on this device" onPress={() => { disableSync(); setEnabled(false); }}>
                    <CloudOff size={16} aria-hidden="true" />
                </KeyButton>
            </Hint>
        </div></ProGate>
    );
}
