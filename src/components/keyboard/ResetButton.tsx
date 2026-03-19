import { $config, defaultConfig } from "@/store/config";
import { RotateCcw } from "lucide-react";

const ResetButton = () => {
    const handleReset = () => {
        const isOnlinePage = window.location.pathname.startsWith("/online");
        if (isOnlinePage) {
            window.location.reload();
            return;
        }

        $config.set({ ...defaultConfig, ...$config.get() });
    };

    return (
        <div id="reset-button">
            <button
                className="btn"
                onClick={handleReset}
                title="Reset Sentence"
            >
                <RotateCcw />
            </button>
        </div>
    );
};

export default ResetButton;
