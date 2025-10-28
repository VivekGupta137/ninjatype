import { $kbSentence, $kbState, $kbTypedText } from "@/store/keyboard";
import { useStore } from "@nanostores/react";
import Paragraph from "./Paragraph";
import { KBSTATE } from "@/constants/keyboardState";
import { useEffect, useState } from "react";

const Keyboard = () => {
    const sentence = useStore($kbSentence);
    const storedKbState = useStore($kbState);
    const [kbState, setKbState] = useState<typeof storedKbState | null>(null);

    useEffect(() => {
        setKbState(storedKbState);
    }, [storedKbState]);
    const isFocused = kbState === KBSTATE.FOCUSSED;
    const typedSentence = useStore($kbTypedText);

    const isComplete = false
    return (<div id="keyboard-wrapper">
        {kbState && <div id={"keyboard"} data-kb-focused={isFocused ? 1 : 0}>
            <Paragraph paragraphText={sentence} typedText={typedSentence} isActive={!isComplete} />
        </div>}
    </div>);
}

export default Keyboard;