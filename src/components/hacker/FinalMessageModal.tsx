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
      role="dialog"
      aria-modal="true"
      aria-label={messageText}
    >
      <div
        className="hacker-final-msg-modal"
        data-type={config.type}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="hacker-final-top-bar">
          <span className="hacker-final-status-badge">
            {isFail ? "[ ✖ SECURITY ALERT // LOCKOUT ]" : "[ ✔ CLEARANCE // OVERRIDE ACTIVE ]"}
          </span>
          <span className="hacker-final-top-meta">
            {isFail ? "ERR: 0xDEADBEEF" : "SYS: ROOT-0"}
          </span>
        </div>

        {/* Hazard / Cyber Accent Strip */}
        <div className="hacker-final-hazard-bar" />

        {/* Center Title Banner Box */}
        <div className="hacker-final-title-box">
          <span className="hacker-final-bracket corner-tl">┌</span>
          <span className="hacker-final-bracket corner-tr">┐</span>
          <span className="hacker-final-bracket corner-bl">└</span>
          <span className="hacker-final-bracket corner-br">┘</span>

          <div className="hacker-final-badge">
            {isFail
              ? "/// COUNTER-INTRUSION DEFENSE ACTIVATED ///"
              : "/// ZERO-DAY EXPLOIT SEQUENCE VERIFIED ///"}
          </div>

          <h2 className="hacker-final-title-text">
            {messageText}
          </h2>

          <div className="hacker-final-subtext">
            {isFail
              ? "UNAUTHORIZED ACCESS PREVENTED · SOCKET SEVERED"
              : "ALL SYSTEM RESTRICTIONS BYPASSED · ROOT SHELL OPEN"}
          </div>
        </div>

        {/* Hazard / Cyber Accent Strip */}
        <div className="hacker-final-hazard-bar" />

        {/* Telemetry Diagnostics Table */}
        <div className="hacker-final-telemetry">
          <div className="hacker-final-telemetry-header">
            <span>{isFail ? "[!] INTRUSION TELEMETRY" : "[*] TARGET COMPROMISE METRICS"}</span>
            <span>PORTS: {target.ports}</span>
          </div>
          <div className="hacker-final-telemetry-body">
            <div className="hacker-final-telemetry-row">
              <span className="hacker-final-telemetry-label">TARGET NODE</span>
              <span className="hacker-final-telemetry-val">{target.name} ({target.ip})</span>
            </div>
            <div className="hacker-final-telemetry-row">
              <span className="hacker-final-telemetry-label">NODE TYPE / PING</span>
              <span className="hacker-final-telemetry-val">{target.type.toUpperCase()} · {target.latency}ms</span>
            </div>
            <div className="hacker-final-telemetry-row">
              <span className="hacker-final-telemetry-label">
                {isFail ? "DEFENSE ENGINE" : "SECURITY LEVEL"}
              </span>
              <span className="hacker-final-telemetry-val">
                {isFail ? "REMOTE PEER TERMINATED TCP STREAM" : "RING-0 KERNEL HOOK OBTAINED"}
              </span>
            </div>
            <div className="hacker-final-telemetry-row">
              <span className="hacker-final-telemetry-label">
                {isFail ? "INCIDENT ID" : "SESSION TOKEN"}
              </span>
              <span className="hacker-final-telemetry-val">
                {isFail ? "#403-SOK-SEC-DROP" : "#ROOT-UID-0000-OK"}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="hacker-final-actions">
          <button
            className="hacker-final-dismiss-btn"
            onClick={() => $hackerFinalMessageVisible.set(false)}
          >
            [ DISMISS (ESC) ]
          </button>
        </div>

        <div className="hacker-final-footer-hint">
          PRESS [ESC] OR CLICK OUTSIDE TO RESUME
        </div>
      </div>
    </div>
  );
};

export default FinalMessageModal;
