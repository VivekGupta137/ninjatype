import { useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "@nanostores/react";
import { $hackerCharCount, $hackerTarget, $hackerTargetVersion } from "@/store/hacker";
import {
  HACKER_CODE,
  CHARS_PER_KEYPRESS_MIN,
  CHARS_PER_KEYPRESS_MAX,
} from "@/constants/hackerCode";

const HEADER_BANNER = `/* =========================================================================
 * Ring-0 Linux Kernel Subsystem — Interactive Exploit Console
 * Architecture: x86_64 SMP | Type any key to stream kernel module...
 * ========================================================================= */\n\n`;

export default function HackerEditor() {
  const target = useStore($hackerTarget);
  const targetVersion = useStore($hackerTargetVersion);
  const [charIndex, setCharIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with global store (for session reset)
  useEffect(() => {
    const unbind = $hackerCharCount.subscribe((val) => {
      setCharIndex((prev) => (prev !== val ? val : prev));
    });
    return unbind;
  }, []);

  const advanceCode = useCallback(() => {
    const advance =
      Math.floor(
        Math.random() *
          (CHARS_PER_KEYPRESS_MAX - CHARS_PER_KEYPRESS_MIN + 1)
      ) + CHARS_PER_KEYPRESS_MIN;
    const current = $hackerCharCount.get();
    const next = Math.min(current + advance, HACKER_CODE.length);
    $hackerCharCount.set(next);
    setCharIndex(next);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow browser devtools and reload shortcuts
      if (e.key === "F5" || e.key === "F12") return;
      if (e.key === "Escape") return;
      if ((e.ctrlKey || e.metaKey) && (e.key === "r" || e.key === "R")) return;
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "I" || e.key === "i")) return;

      // Do not capture typing if the target is another input or textarea (e.g. settings input)
      const targetEl = e.target as HTMLElement;
      if (targetEl && targetEl !== inputRef.current && (targetEl.tagName === "INPUT" || targetEl.tagName === "TEXTAREA")) {
        return;
      }

      // Ignore lone modifier keys
      if (["Shift", "Control", "Alt", "Meta", "CapsLock", "Tab"].includes(e.key)) return;

      e.preventDefault();
      advanceCode();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [advanceCode]);

  // Keep hidden input focused for mobile or iframe compatibility
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Auto-scroll container to bottom as code is typed
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
    cursorRef.current?.scrollIntoView({ block: "end", inline: "nearest" });
  }, [charIndex]);

  const visibleText = HACKER_CODE.slice(0, charIndex);
  const lineNum = Math.max(1, visibleText.split("\n").length);

  return (
    <div
      ref={containerRef}
      className="hacker-pane-body hacker-editor-body"
      onClick={() => inputRef.current?.focus()}
      tabIndex={0}
      style={{ cursor: "text" }}
    >
      {/* Hidden input to catch keystrokes and summon mobile keyboards */}
      <input
        ref={inputRef}
        type="text"
        className="hacker-hidden-input"
        autoFocus
        tabIndex={0}
        aria-label="Terminal Code Input"
        autoCapitalize="none"
        autoComplete="off"
        spellCheck="false"
        onChange={(e) => {
          advanceCode();
          e.target.value = "";
        }}
      />

      <div className="hacker-line-count">L:{lineNum}</div>
      <pre className="hacker-terminal-text hacker-code">
        <span className="hacker-dim">{HEADER_BANNER}</span>
        {targetVersion > 0 && (
          <span className="hacker-alert">
            {`/* [!] TARGET RE-LOCKED: ${target.ip} (${target.name}) | PORT: ${target.ports} | RTT: ${target.latency}ms */\n\n`}
          </span>
        )}
        {visibleText}
        <span ref={cursorRef} className="hacker-cursor">█</span>
      </pre>
    </div>
  );
}
