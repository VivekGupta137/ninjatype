import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import {
    $hackerSettingsOpen,
    $hackerPhase,
    $hackerSession,
    initiatePayloadInjection,
    resetHackerState,
} from "@/store/hacker";
export default function HackerToolbar() {
    const phase = useStore($hackerPhase);
    const session = useStore($hackerSession);
    const [time, setTime] = useState("00:00:00");
    const [fullscreen, setFullscreen] = useState(false);
    const [supported, setSupported] = useState(false);
    useEffect(() => {
        const timer = setInterval(
            () =>
                setTime(
                    new Date().toLocaleTimeString("en-GB", { hour12: false }),
                ),
            1000,
        );
        setSupported(!!document.documentElement.requestFullscreen);
        const update = () => setFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", update);
        return () => {
            clearInterval(timer);
            document.removeEventListener("fullscreenchange", update);
        };
    }, []);
    async function toggleFullscreen() {
        try {
            if (document.fullscreenElement) await document.exitFullscreen();
            else await document.documentElement.requestFullscreen();
        } catch {
            setSupported(false);
        }
    }
    return (
        <footer className="hacker-toolbar">
            <a
                href="/"
                className="hacker-toolbar-identity"
                aria-label="NinjaType home"
            >
                [ root@ninja ]
            </a>
            <span className="hacker-toolbar-clock">{time}</span>
            <span className="hacker-toolbar-phase">
                {phase === "awaiting"
                    ? "READY // TYPE TO BEGIN"
                    : phase === "writing"
                      ? "WRITING CODE..."
                      : phase === "analyzing"
                      ? "REVERSING..."
                      : phase === "injecting"
                        ? "INJECTING..."
                        : phase === "transferring"
                          ? "EXFILTRATING..."
                          : phase === "verifying"
                            ? "VERIFYING..."
                            : session.result?.type === "fail"
                              ? "ACCESS DENIED"
                              : "ACCESS GRANTED"}
            </span>
            <div className="hacker-toolbar-actions">
                <a href="/hacker-typer/blog/" className="hacker-toolbar-blog">
                    [ guide ]
                </a>
                {supported && (
                    <button
                        className="hacker-fullscreen"
                        onClick={toggleFullscreen}
                    >
                        [ {fullscreen ? "windowed" : "fullscreen"} ]
                    </button>
                )}
                <button
                    onClick={() => $hackerSettingsOpen.set(true)}
                    aria-label="Terminal settings"
                >
                    [ settings ]
                </button>
                <button
                    className="hacker-run-btn"
                    disabled={phase !== "awaiting" && phase !== "complete"}
                    onClick={() =>
                        phase === "complete"
                            ? resetHackerState()
                            : initiatePayloadInjection()
                    }
                >
                    {phase === "complete"
                        ? "[ restart ]"
                        : phase === "awaiting"
                          ? "[ run ↵ ]"
                          : "[ active ]"}
                </button>
            </div>
        </footer>
    );
}
