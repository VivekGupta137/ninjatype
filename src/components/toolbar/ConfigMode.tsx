import { $config, $isMounted } from "@/store/config";
import { useStore } from "@nanostores/react";

const ConfigMode = ({ config }: { config: ReturnType<typeof $config.get> | null }) => {
    
    const handleModeChange = (mode: "time" | "words") => {
        $config.setKey("mode", mode);
    }
    
    return (<>
        <button className="btn" data-enabled={ config?.mode == "time"} onClick={() => handleModeChange("time")}>
            <i className="material-icons">schedule</i><span>time</span>
        </button>
        <button className="btn" data-enabled={ config?.mode == "words"} onClick={() => handleModeChange("words")}>
            <i className="material-icons">text_format</i><span>words</span>
        </button>
    </>);
}

export default ConfigMode;