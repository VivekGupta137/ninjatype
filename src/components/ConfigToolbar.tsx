import { useStore } from "@nanostores/react";
import Divider from "./common/Divider";
import ConfigMode from "./toolbar/ConfigMode";
import ConfigModeSettings from "./toolbar/ConfigModeSettings";
import { $isMounted } from "@/store/config";

const ConfigToolbar = () => {
    const isMounted = useStore($isMounted);
    return (<div id="config-toolbar-container">
        <div id="config-toolbar">
            {isMounted && <>
                <ConfigMode />
                <Divider />
                <ConfigModeSettings />
            </>}
        </div>
    </div>);
}

export default ConfigToolbar;