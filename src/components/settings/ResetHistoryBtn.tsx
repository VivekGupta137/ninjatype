import { Trash2 } from "lucide-react";
import { clearHistory } from "@/store/history";
import { showToast } from "@/util/toast";
import KeyButton from "@/components/ui/KeyButton";

/**
 * Button component for clearing all typing history
 * Includes confirmation dialog to prevent accidental deletion
 */
const ResetHistoryBtn = () => {
    const handleReset = () => {
        if (typeof window === "undefined") return;

        const confirmed = window.confirm(
            "Are you sure you want to delete all typing history? This action cannot be undone.",
        );

        if (confirmed) {
            clearHistory();
            showToast({
                type: "success",
                message: "Typing history has been cleared successfully.",
            });
        }
    };

    return (
        <KeyButton variant="danger" onPress={handleReset} aria-label="Clear all typing history">
            <Trash2 size={16} /> Clear history data
        </KeyButton>
    );
};

export default ResetHistoryBtn;
