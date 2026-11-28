import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { Cloud, Trash2 } from "lucide-react";
import { $account, refreshAccount } from "@/store/account";
import { clearCloudData, clearLocalData, isSyncEnabledFor } from "@/store/historySync";
import { showToast } from "@/util/toast";
import KeyButton from "@/components/ui/KeyButton";

/**
 * Clears history data. "Clear local data" removes this device's copy (synced data can be downloaded again);
 * "Clear cloud data" appears when this device syncs to an account and deletes the account's copy.
 */
const ResetHistoryBtn = () => {
    const account = useStore($account);
    const [cloud, setCloud] = useState(false);
    const userId = account.status === "in" ? account.user.id : null;

    useEffect(() => { if ($account.get().status === "loading") void refreshAccount(); }, []);
    useEffect(() => setCloud(userId ? isSyncEnabledFor(userId) : false), [userId]);

    const clearLocal = () => {
        if (!window.confirm(`Delete the history data stored on this device?${cloud ? " Synced data can be downloaded again." : " This cannot be undone."}`)) return;
        clearLocalData();
        showToast({ type: "success", message: "History data on this device has been cleared." });
    };
    const clearCloud = async () => {
        if (!window.confirm("Delete the cloud copy of your history data and turn sync off on this device? Other synced devices will drop their copy at their next sync.")) return;
        try {
            await clearCloudData();
            setCloud(false);
            showToast({ type: "success", message: "Cloud history data has been cleared." });
        } catch {
            showToast({ type: "error", message: "Could not clear cloud data. Try again." });
        }
    };

    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: ".75rem" }}>
            <KeyButton variant="danger" onPress={clearLocal} aria-label="Clear history data on this device">
                <Trash2 size={16} /> Clear local data
            </KeyButton>
            {cloud && (
                <KeyButton variant="danger" onPress={() => { void clearCloud(); }} aria-label="Clear history data in the cloud">
                    <Cloud size={16} /> Clear cloud data
                </KeyButton>
            )}
        </div>
    );
};

export default ResetHistoryBtn;
