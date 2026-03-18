import { $config, defaultConfig } from "@/store/config";
import Divider from "../common/Divider";
import { CaseSensitive, Clock4, Quote } from "lucide-react";

const ConfigMode = ({
    config,
}: {
    config: ReturnType<typeof $config.get> | null;
}) => {
    const handleModeChange = (mode: typeof defaultConfig.mode) => {
        $config.setKey("mode", mode);
    };

    return (
        <>
            <button
                className="btn mode-btn bagel-fat-one-regular"
                data-enabled={config?.mode == "time"}
                onClick={() => handleModeChange("time")}
            >
                <Clock4 />
                <span>Time</span>
            </button>
            <button
                className="btn mode-btn bagel-fat-one-regular"
                data-enabled={config?.mode == "words"}
                onClick={() => handleModeChange("words")}
            >
                <CaseSensitive />
                <span>Words</span>
            </button>
            <button
                className="btn mode-btn bagel-fat-one-regular"
                data-enabled={config?.mode == "quotes"}
                onClick={() => handleModeChange("quotes")}
            >
                <Quote />
                <span>Quotes</span>
            </button>
            {config && <Divider />}
        </>
    );
};

export default ConfigMode;
