import { useEffect, useRef, useState } from "react";
import { useStore } from "@nanostores/react";
import {
    $hackerCharCount,
    $hackerSession,
    $hackerSettingsOpen,
    $hackerFinalMessageVisible,
    initiatePayloadInjection,
} from "@/store/hacker";
import { HACKER_CODE, HACKER_SOURCE_LENGTH } from "@/constants/hackerCode";

import { SequenceLines, useTerminalFollow } from "./SequenceOutput";

const SEED_LENGTH = HACKER_CODE.indexOf("#include");
export default function HackerEditor() {
    const [editing, setEditing] = useState(false);
    const count = useStore($hackerCharCount);
    const input = useRef<HTMLInputElement>(null);
    const session = useStore($hackerSession);
    const scroll = useTerminalFollow(
        `${count}:${session.elapsed}:${session.phase}`,
    );
    const text = HACKER_CODE.slice(
        0,
        SEED_LENGTH + Math.min(count, HACKER_SOURCE_LENGTH),
    );
    const firstLine = 1;
    const lines = text.split("\n");
    function advance(size = 1) {
        $hackerCharCount.set(
            Math.min(HACKER_SOURCE_LENGTH, $hackerCharCount.get() + size * 5),
        );
    }
    useEffect(() => {
        const field = input.current;
        const onBeforeInput = (event: InputEvent) => {
            // Mobile keyboards can send deletion without a keydown event.
            if (event.inputType.startsWith("delete")) {
                event.preventDefault();
                $hackerCharCount.set(Math.max(0, $hackerCharCount.get() - 5));
            }
        };
        field?.addEventListener("beforeinput", onBeforeInput);
        return () => field?.removeEventListener("beforeinput", onBeforeInput);
    }, []);
    useEffect(() => {
        // Desktop can type anywhere in the workspace; controls retain their native keys.
        const onKey = (e: KeyboardEvent) => {
            const el = e.target as HTMLElement;
            if (
                e.ctrlKey ||
                e.metaKey ||
                e.altKey ||
                e.isComposing ||
                $hackerSettingsOpen.get() ||
                $hackerFinalMessageVisible.get()
            )
                return;
            if (
                el.closest(
                    "input, textarea, button, a, select, dialog, [role=button], [contenteditable]",
                )
            )
                return;
            if (e.key.length === 1) {
                e.preventDefault();
                advance();
            } else if (e.key === "Enter") {
                e.preventDefault();
                initiatePayloadInjection();
            } else if (e.key === "Backspace") {
                e.preventDefault();
                $hackerCharCount.set(Math.max(0, $hackerCharCount.get() - 5));
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);
    return (
        <>
            <div className="hacker-editor-tools">
                <span className="hacker-dim">kernel / drivers / ninja</span>
                <input
                    ref={input}
                    className="hacker-hidden-input"
                    onFocus={() => setEditing(true)}
                    onBlur={() => setEditing(false)}
                    aria-label="Type to write terminal code"
                    enterKeyHint="go"
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    onChange={(e) => {
                        if ((e.nativeEvent as InputEvent).isComposing) return;
                        advance(Array.from(e.target.value).length);
                        e.target.value = "";
                    }}
                    onCompositionEnd={(e) => {
                        advance(Array.from(e.currentTarget.value).length);
                        e.currentTarget.value = "";
                    }}
                    onKeyDown={(e) => {
                        if (
                            e.ctrlKey ||
                            e.metaKey ||
                            e.altKey ||
                            e.nativeEvent.isComposing
                        )
                            return;
                        if (e.key === "Enter") {
                            e.preventDefault();
                            initiatePayloadInjection();
                        }
                        if (e.key === "Backspace") {
                            e.preventDefault();
                            $hackerCharCount.set(
                                Math.max(0, $hackerCharCount.get() - 5),
                            );
                        }
                    }}
                />
                <button
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => {
                        if (editing) input.current?.blur();
                        else input.current?.focus();
                    }}
                >
                    {editing ? "Done" : "Type ⌨"}
                </button>
            </div>
            <div
                className="hacker-editor-body hacker-pane-body"
                ref={scroll}
                onClick={() => input.current?.focus()}
            >
                <pre className="hacker-code">
                    {lines.map((line, index) => (
                        <div className="hacker-code-line" key={index}>
                            <span
                                className="hacker-line-number"
                                aria-hidden="true"
                            >
                                {firstLine + index}
                            </span>
                            <span
                                className={
                                    line.trim().startsWith("#")
                                        ? "hacker-code-directive"
                                        : /^(\/\/|\/\*| \*| \*\/)/.test(line)
                                          ? "hacker-dim"
                                          : ""
                                }
                            >
                                {line}
                                {index === lines.length - 1 && (
                                    <span className="hacker-cursor" />
                                )}
                            </span>
                        </div>
                    ))}
                </pre>
                <pre className="hacker-terminal-text hacker-editor-sequence">
                    <SequenceLines
                        events={session.events.filter(
                            (event) => event.pane === "editor",
                        )}
                    />
                </pre>
            </div>
            <div className="hacker-editor-footer">
                <span>
                    Ln {firstLine + lines.length - 1}, Col{" "}
                    {lines.at(-1)!.length + 1}
                </span>
                <span>
                    {session.phase === "writing"
                        ? "AUTO STREAM"
                        : count >= HACKER_SOURCE_LENGTH
                          ? "SOURCE COMPLETE"
                          : count
                            ? "Modified"
                            : "Type any letters to begin"}
                </span>
                <span>Linux / x86_64</span>
            </div>
        </>
    );
}
