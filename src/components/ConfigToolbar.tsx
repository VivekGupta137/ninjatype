import { useStore } from "@nanostores/react";
import ConfigMode from "./toolbar/ConfigMode";
import ConfigModeSettings from "./toolbar/ConfigModeSettings";
import { $config } from "@/store/config";
import { tr, type LearnLocale } from "@/lib/learnLocale";
import { useEffect, useState } from "react";

const ConfigToolbar = ({ locale = "en" }: { locale?: LearnLocale }) => {
    const storedConfig = useStore($config);
    // Read the stored config after mount so server and client markup match.
    const [config, setConfig] = useState<typeof storedConfig | null>(null);
    useEffect(() => { setConfig(storedConfig); }, [storedConfig]);

    return (
        <div id="config-toolbar-container">
            <div id="config-toolbar" role="toolbar" aria-label={tr(locale, "Typing test settings", "Tipp-Test-Einstellungen")}>
                <ConfigMode config={config} locale={locale} />
                <span className="config-sep" aria-hidden="true" />
                <ConfigModeSettings config={config} locale={locale} />
            </div>
        </div>
    );
};

export default ConfigToolbar;
