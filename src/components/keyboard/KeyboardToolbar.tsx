import { $config } from "@/store/config";
import { $customRun } from "@/store/customRun";
import { useStore } from "@nanostores/react";
import CountdownToolbar from "./CountdownToolbar";
import WordcountToolbar from "./WordcountToolbar";
import { useEffect, useState } from "react";
import type { LearnLocale } from "@/lib/learnLocale";

const KeyboardToolbar = ({ locale = "en" }: { locale?: LearnLocale }) => {
    const storedConfig = useStore($config);
    const customRun = useStore($customRun);
    const [config, setConfig] = useState<typeof storedConfig | null>(null);
    useEffect(()=>{
        setConfig(storedConfig);
    }, [storedConfig]);
    // Your own material is a fixed passage, so it always shows the word counter.
    const mode = customRun ? "words" : config?.mode || "time";
    return ( <div id="keyboard-toolbar">
        {mode === "time" && <CountdownToolbar locale={locale} />}
        {(mode === "words" || mode === "quotes" ) && <WordcountToolbar locale={locale} />}
    </div> );
}
 
export default KeyboardToolbar;