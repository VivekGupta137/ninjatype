import { $config } from "@/store/config";
import { useStore } from "@nanostores/react";
import CountdownToolbar from "./CountdownToolbar";
import WordcountToolbar from "./WordcountToolbar";

const KeyboardToolbar = () => {
    const {mode} = useStore($config);
    return ( <div id="keyboard-toolbar">
        {mode === "time" && <CountdownToolbar />}
        {mode === "words" && <WordcountToolbar />}
    </div> );
}
 
export default KeyboardToolbar;