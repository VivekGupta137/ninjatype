import { $kbSentence, $kbState, $kbTypedText } from "@/store/keyboard";
import { useStore } from "@nanostores/react";
import Paragraph from "./Paragraph";
import { KBSTATE } from "@/constants/keyboardState";

const Keyboard = () => {
    const sentence = useStore($kbSentence);
    const kbState = useStore($kbState);
    const isFocused = kbState === KBSTATE.FOCUSSED;
    const typedSentence = useStore($kbTypedText);

    const isComplete = false
    return (<div id="keyboard-wrapper">
        <div id={"keyboard"} data-kb-focused={isFocused ? 1 : 0}>
            <Paragraph paragraphText={sentence} typedText={typedSentence} isActive={!isComplete} />
        </div>
    </div>);
}

export default Keyboard;