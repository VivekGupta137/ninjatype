import React, { useEffect } from "react";
import { useStore } from "@nanostores/react";
import {
  $hackerFinalMessageVisible,
  $hackerFinalMessageConfig,
  $hackerTarget,
} from "@/store/hacker";

export const FinalMessageModal: React.FC = () => {
  const visible = useStore($hackerFinalMessageVisible);
  const config = useStore($hackerFinalMessageConfig);
  const target = useStore($hackerTarget);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && $hackerFinalMessageVisible.get()) {
        $hackerFinalMessageVisible.set(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!visible) return null;

  const isFail = config.type === "fail";
  const messageText = config.text.trim() || (isFail ? "Access Denied" : "Access Granted");

  return (
    <div
      className="hacker-final-msg-overlay"
      onClick={() => $hackerFinalMessageVisible.set(false)}
    >
      <div
        className="hacker-final-msg-modal"
        data-type={config.type}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hacker-terminal-text" style={{ opacity: 0.6, fontSize: 11 }}>
          {isFail
            ? "┌─── SECURITY FAILURE ───────────────────────────────┐"
            : "┌─── SECURITY OVERRIDE ──────────────────────────────┐"}
        </div>

        <div className="hacker-terminal-text" style={{ opacity: 0.4 }}>
          [██████████████████████████████████████████████████]
        </div>

        <div className="hacker-final-msg-title">
          {messageText}
        </div>

        <div className="hacker-terminal-text" style={{ opacity: 0.4 }}>
          [██████████████████████████████████████████████████]
        </div>

        <div className="hacker-terminal-text" style={{ fontSize: 12, lineHeight: 1.5 }}>
          {isFail ? (
            <span style={{ color: "#ff4444" }}>
              [-] INTRUSION REJECTED: Target {target.ip} ({target.name}) closed remote socket.
            </span>
          ) : (
            <span className="hacker-success">
              [+] PRIVILEGE ELEVATED: Target {target.ip} ({target.name}) ring-0 root obtained.
            </span>
          )}
        </div>

        <div style={{ marginTop: 8 }}>
          <button
            className="hacker-color-option"
            style={{
              borderColor: isFail ? "#ff4444" : undefined,
              color: isFail ? "#ff4444" : undefined,
            }}
            onClick={() => $hackerFinalMessageVisible.set(false)}
          >
            [ Dismiss (ESC) ]
          </button>
        </div>

        <div className="hacker-terminal-text" style={{ opacity: 0.6, fontSize: 11 }}>
          └────────────────────────────────────────────────────┘
        </div>
      </div>
    </div>
  );
};

export default FinalMessageModal;
