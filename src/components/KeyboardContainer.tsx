import { useEffect, useRef, useState } from "react";
import { useStore } from "@nanostores/react";
import { $kbState } from "@/store/keyboard";
import { KBSTATE } from "@/constants/keyboardState";
import KeyboardToolbar from "./keyboard/KeyboardToolbar";
import Keyboard from "./keyboard/Keyboard";


const KeyboardContainer = () => {
    const keyboardRef = useRef<HTMLDivElement>(null);

    const storedKbState = useStore($kbState);
    const [kbState, setKbState] = useState<typeof storedKbState | null>(null);

    useEffect(() => {
        setKbState(storedKbState);
    }, [storedKbState]);

    return (<div id="keyboard-container" ref={keyboardRef} data-kb-loaded={kbState ?? KBSTATE.LOADING} >
        <KeyboardToolbar />

        {(kbState != null && kbState !== KBSTATE.LOADING) && <Keyboard />}
    </div>);
}

export default KeyboardContainer;