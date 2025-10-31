import { $config } from "@/store/config";
import { useStore } from "@nanostores/react";

const ResetButton = () => {
    const config = useStore($config);
    const handleReset = () => {
        $config.set({...config});
    };
    return (
        <div id="reset-button">
            <button className="btn" onClick={handleReset} title="Reset Configuration">
                <iconify-icon icon="solar:restart-linear" width="24" height="24"></iconify-icon>
            </button>
        </div>
    );
};

export default ResetButton;
