import { TriangleAlert } from "lucide-react";
import { showToast } from "@/util/toast";

const ResetSettingsBtn = () => {
    const handleReset = () => {
        const confirmed = window.confirm(
            "Are you sure you want to reset all settings to default? This will also clear your typing history."
        );
        
        if (confirmed) {
            showToast({ 
                type: 'success', 
                message: 'Settings reset successfully. Reloading...' 
            });
            
            // Clear localStorage and reload after a short delay to show the toast
            setTimeout(() => {
                localStorage.clear();
                location.reload();
            }, 1000);
        }
    };
    
    return (
        <button id="reset-btn" className="btn large-btn" onClick={handleReset}>
            <TriangleAlert /> <span>Reset All Settings</span>
        </button>
    );
}

export default ResetSettingsBtn;