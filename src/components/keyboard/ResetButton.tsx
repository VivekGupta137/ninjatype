import { $config } from "@/store/config";
import { Icon } from "@iconify/react";
import { useStore } from "@nanostores/react";

const ResetButton = () => {
    const config = useStore($config);
    const handleReset = () => {
        $config.set({...config});
    };
    return (
        <div id="reset-button">
            <button className="btn" onClick={handleReset} title="Reset Configuration">
                <Icon icon="solar:restart-linear" width="24" height="24" />
            </button>
        </div>
    );
};

export default ResetButton;
