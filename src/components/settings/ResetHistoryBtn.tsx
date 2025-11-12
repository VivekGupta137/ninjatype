import { Trash2 } from "lucide-react";
import { clearHistory } from "@/store/history";
import { showToast } from "@/util/toast";

/**
 * Button component for clearing all typing history
 * Includes confirmation dialog to prevent accidental deletion
 */
const ResetHistoryBtn = () => {
    const handleReset = () => {
        if (typeof window === "undefined") return;
        
        const confirmed = window.confirm(
            "Are you sure you want to delete all typing history? This action cannot be undone."
        );
        
        if (confirmed) {
            clearHistory();
            showToast({ 
                type: 'success', 
                message: 'Typing history has been cleared successfully.' 
            });
        }
    };

    return (
        <button 
            id="reset-history-btn" 
            className="btn large-btn" 
            onClick={handleReset}
            aria-label="Clear all typing history"
        >
            <Trash2 /> <span>Clear History Data</span>
        </button>
    );
};

export default ResetHistoryBtn;
