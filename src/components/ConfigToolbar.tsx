import { useStore } from "@nanostores/react";
import Divider from "./common/Divider";
import ConfigMode from "./toolbar/ConfigMode";
import ConfigModeSettings from "./toolbar/ConfigModeSettings";
import { $config, $isMounted } from "@/store/config";
import { useEffect, useState } from "react";

const ConfigToolbar = () => {
    const storedConfig = useStore($config);
    const [config, setConfig] = useState<typeof storedConfig | null>(null);
    
    useEffect(()=>{
        setConfig(storedConfig);
    }, [storedConfig]);

    return (<div id="config-toolbar-container">
        <div id="config-toolbar">
            <ConfigMode config={config} />
            <Divider />
            <ConfigModeSettings config={config} />
        </div>
    </div>);
}

export default ConfigToolbar;