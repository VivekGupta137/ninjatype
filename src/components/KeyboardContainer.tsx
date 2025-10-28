import { useEffect, useRef, useState } from "react";
import Keyboard from "./keyboard/Keyboard";
import useFocus from "@/hooks/useFocus";
import useTypedText from "@/hooks/useTypedText";
import { useStore } from "@nanostores/react";
import { $kbState } from "@/store/keyboard";
import { KBSTATE } from "@/constants/keyboardState";
import KeyboardToolbar from "./keyboard/KeyboardToolbar";

const KeyboardContainer = () => {
    const keyboardRef = useRef<HTMLDivElement>(null);
    const { doFocus } = useFocus(keyboardRef, true);
    const {  } = useTypedText({ focusKeyboard: doFocus })
    const storedKbState = useStore($kbState);
    const [kbState, setKbState] = useState<typeof storedKbState | null>(null);
    
    useEffect(()=>{
        setKbState(storedKbState);
    }, [storedKbState]);

    useEffect(()=>{
        if(kbState === KBSTATE.FOCUSSED){
            doFocus();
        }
    }, [kbState])

    return (<div id="keyboard-container" ref={keyboardRef} data-kb-loaded={kbState === KBSTATE.LOADING ? "0" : "1"} tabIndex={-1}>
        <KeyboardToolbar />
        <Keyboard />
    </div>);
}

export default KeyboardContainer;