import { TriangleAlert } from "lucide-react";
import { showToast } from "@/util/toast";
import KeyButton from "@/components/ui/KeyButton";

const ResetSettingsBtn = () => {
    const handleReset = () => {
        const confirmed = window.confirm(
            "Are you sure you want to reset all settings to default? This will also clear your typing history.",
        );

        if (confirmed) {
            showToast({
                type: "success",
                message: "Settings reset successfully. Reloading...",
            });

            // Clear localStorage and reload after a short delay to show the toast
            setTimeout(() => {
                localStorage.clear();
                location.reload();
            }, 1000);
        }
    };

    return (
        <div className="mt-2">
            <KeyButton variant="danger" onPress={handleReset} aria-label="Reset all settings to default">
                <TriangleAlert size={16} /> Reset all settings
            </KeyButton>
        </div>
    );
};

export default ResetSettingsBtn;
