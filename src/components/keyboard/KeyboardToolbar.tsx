import { $config } from "@/store/config";
import { useStore } from "@nanostores/react";
import CountdownToolbar from "./CountdownToolbar";
import WordcountToolbar from "./WordcountToolbar";
import { useEffect, useState } from "react";

const KeyboardToolbar = () => {
    const storedConfig = useStore($config);
    const [config, setConfig] = useState<typeof storedConfig | null>(null);
    useEffect(()=>{
        setConfig(storedConfig);
    }, [storedConfig]);
    const mode = config?.mode || "time";
    return ( <div id="keyboard-toolbar">
        {mode === "time" && <CountdownToolbar />}
        {mode === "words" && <WordcountToolbar />}
    </div> );
}
 
export default KeyboardToolbar;