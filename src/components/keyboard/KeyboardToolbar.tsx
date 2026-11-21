import { $config } from "@/store/config";
import { useStore } from "@nanostores/react";
import CountdownToolbar from "./CountdownToolbar";
import WordcountToolbar from "./WordcountToolbar";
import { useEffect, useState } from "react";
import type { LearnLocale } from "@/lib/learnLocale";

const KeyboardToolbar = ({ locale = "en" }: { locale?: LearnLocale }) => {
    const storedConfig = useStore($config);
    const [config, setConfig] = useState<typeof storedConfig | null>(null);
    useEffect(()=>{
        setConfig(storedConfig);
    }, [storedConfig]);
    const mode = config?.mode || "time";
    return ( <div id="keyboard-toolbar">
        {mode === "time" && <CountdownToolbar locale={locale} />}
        {(mode === "words" || mode === "quotes" ) && <WordcountToolbar locale={locale} />}
    </div> );
}
 
export default KeyboardToolbar;