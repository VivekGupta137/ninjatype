import { Trash2 } from "lucide-react";
import { clearHistory } from "@/store/history";

const ResetHistoryBtn = () => {
    const handleReset = () => {
        if (typeof window !== "undefined") {
            const confirmed = window.confirm(
                "Are you sure you want to delete all typing history? This action cannot be undone."
            );
            if (confirmed) {
                clearHistory();
                alert("Typing history has been cleared.");
            }
        }
    };

    return (
        <button id="reset-history-btn" className="btn large-btn" onClick={handleReset}>
            <Trash2 /> <span>Clear History Data</span>
        </button>
    );
};

export default ResetHistoryBtn;
