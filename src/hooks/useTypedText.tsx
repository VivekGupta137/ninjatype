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

    //  Focus on text key press
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // if not focussed then make it focussed
            if (!isFocusedRef.current && KEYBOARD_TEXT_KEYS.includes(event.key)) {
                focusKeyboard();
                return;
            }

        }

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        }
    }, [focusKeyboard]);

    // Handle input change for mobile devices
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!isFocusedRef.current) {
            focusKeyboard();
            return;
        }

        if (kbTypingStateRef.current === KBTYPINGSTATE.COMPLETED) {
            return;
        }

        let newValue = event.target.value.trimStart();
        
        // Prevent adding multiple consecutive spaces
        newValue = newValue.replace(/  +/g, ' ');
        
        // Check word length limit
        const typedWords = newValue.trim().split(/\s+/);
        const lastTypedWord = typedWords[typedWords.length - 1] || "";
        const sentenceWords = kbSentenceRef.current.trim().split(/\s+/);
        const lastSentenceWord = sentenceWords[typedWords.length - 1] || "";
        
        if (lastTypedWord.length - lastSentenceWord.length >= 10) {
            // Don't allow more than 10 incorrect letters
            return;
        }
        
        // Update buffer and schedule flush
        textBufferRef.current = newValue;
        if (!isUpdateScheduledRef.current) {
            isUpdateScheduledRef.current = true;
            requestAnimationFrame(() => {
                if (textBufferRef.current !== $kbTypedText.get()) {
                    $kbTypedText.set(textBufferRef.current);
                }
                isUpdateScheduledRef.current = false;
            });
        }
    };

    return ({ typedText: storeTypedText, handleInputChange });
}

export default useTypedText;