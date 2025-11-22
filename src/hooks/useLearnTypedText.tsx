/**
 * Custom Hook for Learn Typing Text Management
 * 
 * Handles typing input and state updates for the learn feature.
 * Uses separate learn stores to avoid conflicts with main typing interface.
 * Analytics (WPM, accuracy) are calculated automatically by store effects.
 * 
 * This is a specialized version of useTypedText for the learn feature.
 */

import { useEffect, useRef } from "react";
import { useStore } from "@nanostores/react";
import { 
    $learnKbState, 
    $learnKbTypingState, 
    $learnKbSentence, 
    $learnKbTypedText 
} from "@/store/learnKeyboard";
import { KBSTATE, KBTYPINGSTATE } from "@/constants/keyboardState";
import { KEYBOARD_TEXT_KEYS } from "@/constants/keyboard";

interface UseLearnTypedTextProps {
    focusKeyboard: () => void;
}

/**
 * Hook for managing typed text in learn practice sessions
 * Analytics (WPM, accuracy) are calculated by store effects, not in this hook
 * 
 * @param props - Hook configuration
 * @returns Typed text and input change handler
 */
export const useLearnTypedText = ({ focusKeyboard }: UseLearnTypedTextProps) => {
    const learnKbState = useStore($learnKbState);
    const isFocused = learnKbState === KBSTATE.FOCUSSED;
    const storeTypedText = useStore($learnKbTypedText);
    const kbTypingState = useStore($learnKbTypingState);
    const kbSentence = useStore($learnKbSentence);

    // Use refs to avoid recreating the event listener
    const isFocusedRef = useRef(isFocused);
    const kbTypingStateRef = useRef(kbTypingState);
    const kbSentenceRef = useRef(kbSentence);

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
    }, [storeTypedText]);

    useEffect(() => {
        kbSentenceRef.current = kbSentence;
    }, [kbSentence]);

    // Focus on text key press
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

    /**
     * Handle input changes
     * Analytics and completion checks are handled automatically by store effects
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isFocusedRef.current) {
            focusKeyboard();
            return;
        }

        if (kbTypingStateRef.current === KBTYPINGSTATE.COMPLETED) {
            return;
        }

        let newText = e.target.value.trimStart();
        
        // Prevent adding multiple consecutive spaces
        newText = newText.replace(/  +/g, ' ');
        
        // Check word length limit
        const typedWords = newText.trim().split(/\s+/);
        const lastTypedWord = typedWords[typedWords.length - 1] || "";
        const sentenceWords = kbSentenceRef.current.trim().split(/\s+/);
        const lastSentenceWord = sentenceWords[typedWords.length - 1] || "";
        
        // if it is last word being typed, then don't allow spaces at the end
        if (typedWords.length === sentenceWords.length && newText.endsWith(' ')) {
            newText = newText.slice(0, -1);
        }

        if (lastTypedWord.length - lastSentenceWord.length >= 10) {
            // Don't allow more than 10 incorrect letters
            return;
        }

        // Update buffer and schedule flush
        textBufferRef.current = newText;
        if (!isUpdateScheduledRef.current) {
            isUpdateScheduledRef.current = true;
            requestAnimationFrame(() => {
                if (textBufferRef.current !== $learnKbTypedText.get()) {
                    $learnKbTypedText.set(textBufferRef.current);
                }
                isUpdateScheduledRef.current = false;
            });
        }
    };

    return {
        typedText: storeTypedText,
        handleInputChange
    };
};
