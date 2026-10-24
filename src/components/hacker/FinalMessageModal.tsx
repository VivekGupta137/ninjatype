import { useStore } from "@nanostores/react";
import {
    $hackerFinalMessageVisible,
    $hackerFinalMessageConfig,
    $hackerTarget,
    $hackerSession,
    resetHackerState,
} from "@/store/hacker";
import TerminalDialog from "./TerminalDialog";
export default function FinalMessageModal() {
    const open = useStore($hackerFinalMessageVisible);
    const preferences = useStore($hackerFinalMessageConfig);
    const session = useStore($hackerSession);
    const config =
        session.phase === "complete" && session.result
            ? session.result
            : preferences;
    const target = useStore($hackerTarget);
    const fail = config.type === "fail";
    const message =
        config.text.trim() || (fail ? "Access Denied" : "Access Granted");
    return (
        <TerminalDialog
            open={open}
            onClose={() => $hackerFinalMessageVisible.set(false)}
            title="Operation result"
        >
            <div className="hacker-final-msg-modal" data-type={config.type}>
                <div className="hacker-final-top-bar">
                    <span className="hacker-final-status-badge">
                        {fail
                            ? "SECURITY ALERT // CONNECTION TERMINATED"
                            : "CLEARANCE VERIFIED // ROOT ACCESS"}
                    </span>
                    <span className="hacker-final-top-meta">
                        {fail ? "ERR: 0x403" : "UID: 0000"}
                    </span>
                </div>
                <div className="hacker-final-hazard-bar" />
                <div className="hacker-final-title-box">
                    <div className="hacker-final-badge">
                        {fail
                            ? "/// COUNTER-INTRUSION ACTIVE ///"
                            : "/// PAYLOAD EXECUTION VERIFIED ///"}
                    </div>
                    <h3 className="hacker-final-title-text">{message}</h3>
                    <div className="hacker-final-subtext">
                        {fail
                            ? "REMOTE HOST LOCKOUT · CHANNEL CLOSED"
                            : "SECURITY OVERRIDE · ENCRYPTED CHANNEL OPEN"}
                    </div>
                </div>
                <div className="hacker-final-hazard-bar" />
                <div className="hacker-final-telemetry">
                    <div className="hacker-final-telemetry-header">
                        OPERATION TELEMETRY
                    </div>
                    <div className="hacker-final-telemetry-body">
                        <div className="hacker-final-telemetry-row">
                            <span className="hacker-final-telemetry-label">
                                TARGET NODE
                            </span>
                            <span className="hacker-final-telemetry-val">
                                {target.name}
                            </span>
                        </div>
                        <div className="hacker-final-telemetry-row">
                            <span className="hacker-final-telemetry-label">
                                REMOTE ADDRESS
                            </span>
                            <span className="hacker-final-telemetry-val">
                                {target.ip}
                            </span>
                        </div>
                        <div className="hacker-final-telemetry-row">
                            <span className="hacker-final-telemetry-label">
                                LATENCY / PORTS
                            </span>
                            <span className="hacker-final-telemetry-val">
                                {target.latency} ms · {target.ports}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="hacker-final-actions">
                    <button
                        onClick={() => $hackerFinalMessageVisible.set(false)}
                    >
                        [ DISMISS / ESC ]
                    </button>
                    <button
                        className="hacker-run-btn"
                        onClick={resetHackerState}
                    >
                        [ NEW SESSION ]
                    </button>
                </div>
            </div>
        </TerminalDialog>
    );
}
