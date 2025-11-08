import { $config, defaultConfig } from "@/store/config";
import { useStore } from "@nanostores/react";
import { RotateCcw } from "lucide-react";

const ResetButton = () => {
    const handleReset = () => {
        $config.set({...defaultConfig});
    };
    
    return (
        <div id="reset-button">
            <button className="btn" onClick={handleReset} title="Reset Configuration">
                <RotateCcw />
            </button>
        </div>
    );
};

export default ResetButton;
