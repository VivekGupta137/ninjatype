import { $kbSentence, $kbState, $kbTypedText } from "@/store/keyboard";
import { useStore } from "@nanostores/react";
import Paragraph from "./Paragraph";
import { KBSTATE } from "@/constants/keyboardState";
import { useEffect, useRef, useState } from "react";
import useTypedText from "@/hooks/useTypedText";
import useFocus from "@/hooks/useFocus";

const Keyboard = () => {
    const sentence = useStore($kbSentence);
    const keyboardInputRef = useRef<HTMLInputElement>(null);
    const { doFocus } = useFocus(keyboardInputRef, true);
    const { typedText, handleInputChange } = useTypedText({ focusKeyboard: doFocus })
    const storedKbState = useStore($kbState);
    const [kbState, setKbState] = useState<typeof storedKbState | null>(null);

    useEffect(() => {
        setKbState(storedKbState);
    }, [storedKbState]);

    useEffect(() => {
        if (kbState === KBSTATE.FOCUSSED) {
            doFocus();
        }
    }, [kbState])


    useEffect(() => {
        setKbState(storedKbState);
    }, [storedKbState]);
    const isFocused = kbState === KBSTATE.FOCUSSED;
    // const typedSentence = useStore($kbTypedText);

    const isComplete = false
    return (<div id="keyboard-wrapper">
        <input 
            value={typedText} 
            onChange={handleInputChange} 
            ref={keyboardInputRef} 
            type="text" 
            id="kb-hidden-input" 
            autoComplete="off" 
            spellCheck="false" 
        />

        <div id="keyboard-overlay" data-kb-focused={isFocused ? 1 : 0}>
            <iconify-icon icon="lucide:mouse-pointer-click" width="48" height="48"></iconify-icon> click to focus
        </div>
        {kbState && <div id={"keyboard"} data-kb-focused={isFocused ? 1 : 0}>
            <Paragraph paragraphText={sentence} typedText={typedText} isActive={!isComplete} />
        </div>}
    </div>);
}

export default Keyboard;