import { KEYBOARD, KEYBOARD_TEXT_KEYS } from "@/constants/keyboard";
import { KBSTATE } from "@/constants/keyboardState";
import { $kbState, $kbTypedText } from "@/store/keyboard";
import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";

const useTypedText = ({ focusKeyboard }: { focusKeyboard: () => void }) => {
    const kbState = useStore($kbState);
    const isFocused = kbState === KBSTATE.FOCUSSED;
    const storeTypedText = useStore($kbTypedText);


    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // if not focussed the make it focussed
            if (!isFocused && KEYBOARD_TEXT_KEYS.includes(event.key)) {
                focusKeyboard();
            }
            if (isFocused) {
                if (event.key === KEYBOARD.Space) {
                    // prevent default scrolling behavior
                    event.preventDefault();
                }
                if (event.key.length === 1) {
                    $kbTypedText.set((storeTypedText + event.key).trimStart());
                } else if (event.key === KEYBOARD.Backspace) {
                    $kbTypedText.set(storeTypedText.slice(0, -1));
                }
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        }
    }, [isFocused, storeTypedText]);

    return ({ typedText: storeTypedText });
}

export default useTypedText;