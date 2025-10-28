import { KEYBOARD, KEYBOARD_TEXT_KEYS } from "@/constants/keyboard";
import { KBSTATE, KBTYPINGSTATE } from "@/constants/keyboardState";
import { $kbSentence, $kbState, $kbTypedText, $kbTypingState } from "@/store/keyboard";
import { useStore } from "@nanostores/react";
import { useEffect, useRef } from "react";

const useTypedText = ({ focusKeyboard }: { focusKeyboard: () => void }) => {
    const kbState = useStore($kbState);
    const isFocused = kbState === KBSTATE.FOCUSSED;
    const storeTypedText = useStore($kbTypedText);
    const kbTypingState = useStore($kbTypingState);
    const kbSentence = useStore($kbSentence);

    // Use refs to avoid recreating the event listener
    const isFocusedRef = useRef(isFocused);
    const kbTypingStateRef = useRef(kbTypingState);
    const kbSentenceRef = useRef(kbSentence);

    const lastTypedWordRef = useRef<string>("");
    const lastSentenceWordsRef = useRef<string>("");

    // Buffer for batching updates
    const textBufferRef = useRef<string>("");
    const isUpdateScheduledRef = useRef(false);

    // Keep refs in sync with current values
    useEffect(() => {
        isFocusedRef.current = isFocused;
    }, [isFocused]);

    useEffect(() => {
        kbTypingStateRef.current = kbTypingState;
    }, [kbTypingState]);
    
    // Sync buffer with store text
    useEffect(() => {
        textBufferRef.current = storeTypedText;
        const typedWords = storeTypedText.trim().split(/\s+/);
        lastTypedWordRef.current = typedWords[typedWords.length - 1] || "";
        const sentenceWords = kbSentenceRef.current.trim().split(/\s+/);
        lastSentenceWordsRef.current = sentenceWords[typedWords.length - 1] || "";
    }, [storeTypedText]);

    useEffect(() => {
        kbSentenceRef.current = kbSentence;
    }, [kbSentence]);

    useEffect(() => {
        const flushBuffer = () => {
            if (textBufferRef.current !== $kbTypedText.get()) {
                $kbTypedText.set(textBufferRef.current);
            }
            isUpdateScheduledRef.current = false;
        };

        const scheduleUpdate = () => {
            if (!isUpdateScheduledRef.current) {
                isUpdateScheduledRef.current = true;
                requestAnimationFrame(flushBuffer);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            // if not focussed then make it focussed
            if (!isFocusedRef.current && KEYBOARD_TEXT_KEYS.includes(event.key)) {
                focusKeyboard();
                return;
            }
            
            if (isFocusedRef.current && kbTypingStateRef.current !== KBTYPINGSTATE.COMPLETED) {
                if (event.key === KEYBOARD.Space) {
                    // prevent default scrolling behavior
                    event.preventDefault();
                }
                
                if (event.key.length === 1) {
                    // Update buffer immediately
                    if(event.key === KEYBOARD.Space && textBufferRef.current.endsWith(" ")) {
                        // Prevent adding multiple spaces
                        return;
                    }
                    if(lastTypedWordRef.current.length - lastSentenceWordsRef.current.length >= 10){
                        // Prevent adding more than incorrect 10 letters
                        return;
                    }
                    textBufferRef.current = (textBufferRef.current + event.key).trimStart();
                    scheduleUpdate();
                } else if (event.key === KEYBOARD.Backspace) {
                    // Update buffer immediately
                    textBufferRef.current = textBufferRef.current.slice(0, -1);
                    scheduleUpdate();
                }
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        }
    }, [focusKeyboard]); // Only recreate when focusKeyboard changes

    return ({ typedText: storeTypedText });
}

export default useTypedText;