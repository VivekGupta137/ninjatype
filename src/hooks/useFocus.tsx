import { KBSTATE } from "@/constants/keyboardState";
import { $kbState } from "@/store/keyboard";
import { useEffect, useState, type RefObject } from "react";

const useFocus = (ref: RefObject<HTMLElement | null>, defaultFocus: boolean = false) => {
    const [isFocused, setIsFocused] = useState<boolean>(defaultFocus);

    const doFocus = () => {
        ref.current?.focus();
    }

    useEffect(() => {
        if (defaultFocus) {
            doFocus();
        }
    }, [ref]);

    useEffect(() => {
        const handleFocusChange = () => {
            console.log("inside focus change handler", ref.current, document.activeElement);
            
            const focusStatus = document.activeElement === ref.current;
            $kbState.set(focusStatus ? KBSTATE.FOCUSSED : KBSTATE.NOT_FOCUSSED);
            setIsFocused(focusStatus);
        }

        document.addEventListener("focusin", handleFocusChange);
        document.addEventListener("focusout", handleFocusChange);

        // run once on mount to ensure external store and local state are in sync
        // (covers the case where the element was focused by the other effect
        // or some external code before an event fires)
        handleFocusChange();

        return () => {
            document.removeEventListener("focusin", handleFocusChange);
            document.removeEventListener("focusout", handleFocusChange);
        };
    }, [ref]);

    return ({
        isFocused, doFocus
    });
}

export default useFocus;