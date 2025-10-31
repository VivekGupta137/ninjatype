import { useEffect, useRef, useState } from "react";
import Keyboard from "./keyboard/Keyboard";
import useFocus from "@/hooks/useFocus";
import useTypedText from "@/hooks/useTypedText";
import { useStore } from "@nanostores/react";
import { $kbState } from "@/store/keyboard";
import { KBSTATE } from "@/constants/keyboardState";
import KeyboardToolbar from "./keyboard/KeyboardToolbar";
import ResetButton from "./keyboard/ResetButton";

const KeyboardContainer = () => {
    const keyboardRef = useRef<HTMLDivElement>(null);

    const storedKbState = useStore($kbState);
    const [kbState, setKbState] = useState<typeof storedKbState | null>(null);

    useEffect(() => {
        setKbState(storedKbState);
    }, [storedKbState]);

    return (<div id="keyboard-container" ref={keyboardRef} data-kb-loaded={kbState ?? KBSTATE.LOADING} >
        <KeyboardToolbar />
        <Keyboard />
    </div>);
}

export default KeyboardContainer;