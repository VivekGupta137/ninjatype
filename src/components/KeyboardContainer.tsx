import { useEffect, useRef, useState } from "react";
import { useStore } from "@nanostores/react";
import { $kbState } from "@/store/keyboard";
import { KBSTATE } from "@/constants/keyboardState";
import KeyboardToolbar from "./keyboard/KeyboardToolbar";
import Keyboard from "./keyboard/Keyboard";
import { Button } from "@heroui/react";
import type { LearnLocale } from "@/lib/learnLocale";

const KeyboardContainer = ({ locale = "en" }: { locale?: LearnLocale }) => {
    const keyboardRef = useRef<HTMLDivElement>(null);

    const storedKbState = useStore($kbState);
    const [kbState, setKbState] = useState<typeof storedKbState | null>(null);

    useEffect(() => {
        setKbState(storedKbState);
    }, [storedKbState]);

    return (
        <div
            id="keyboard-container"
            ref={keyboardRef}
            data-kb-loaded={kbState ?? KBSTATE.LOADING}
        >
            <KeyboardToolbar locale={locale} />
            {kbState != null && kbState !== KBSTATE.LOADING && <Keyboard locale={locale} />}
        </div>
    );
};

export default KeyboardContainer;
