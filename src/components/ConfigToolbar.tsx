import { useStore } from "@nanostores/react";
import ConfigMode from "./toolbar/ConfigMode";
import ConfigModeSettings from "./toolbar/ConfigModeSettings";
import { $config } from "@/store/config";
import { useEffect, useState } from "react";

const ConfigToolbar = () => {
    const storedConfig = useStore($config);
    // Read the stored config after mount so server and client markup match.
    const [config, setConfig] = useState<typeof storedConfig | null>(null);
    useEffect(() => { setConfig(storedConfig); }, [storedConfig]);

    return (
        <div id="config-toolbar-container">
            <div id="config-toolbar" role="toolbar" aria-label="Typing test settings">
                <ConfigMode config={config} />
                <span className="config-sep" aria-hidden="true" />
                <ConfigModeSettings config={config} />
            </div>
        </div>
    );
};

export default ConfigToolbar;
