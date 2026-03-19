import { useStore } from "@nanostores/react";
import { useEffect, useRef } from "react";
import { $kbState } from "@/store/keyboard";
import { KBSTATE } from "@/constants/keyboardState";
import KeyboardToolbar from "@/components/keyboard/KeyboardToolbar";
import Keyboard from "@/components/keyboard/Keyboard";
import OnlineLobby from "./OnlineLobby";
import {
    $onlineLobbyState,
    startOnlineLobby,
    stopOnlineLobby,
} from "@/store/online";

const OnlineKeyboardContainer = () => {
    const keyboardRef = useRef<HTMLDivElement>(null);

    const kbState = useStore($kbState);
    const lobbyState = useStore($onlineLobbyState);

    useEffect(() => {
        startOnlineLobby();
        return () => {
            stopOnlineLobby();
        };
    }, []);

    const isReady = lobbyState === "ready";

    return (
        <div
            id="keyboard-container"
            ref={keyboardRef}
            data-kb-loaded={kbState ?? KBSTATE.LOADING}
        >
            <KeyboardToolbar />

            {!isReady && <OnlineLobby />}

            {isReady && kbState !== KBSTATE.LOADING && <Keyboard />}
        </div>
    );
};

export default OnlineKeyboardContainer;
