import { useStore } from "@nanostores/react";
import {
    $hackerCharCount,
    $hackerSession,
    $hackerTarget,
    initiatePayloadInjection,
    ANALYSIS_DURATION,
    INJECTION_DURATION,
    TRANSFER_START,
    VERIFICATION_START,
    VERIFICATION_DURATION,
} from "@/store/hacker";
import { HACKER_SOURCE_LENGTH } from "@/constants/hackerCode";
import { stageProgress } from "@/lib/hackerSequence";
import {
    SequenceLines,
    TerminalProgress,
    useTerminalFollow,
} from "./SequenceOutput";
export default function PayloadInjector() {
    const session = useStore($hackerSession);
    const count = useStore($hackerCharCount);
    const target = useStore($hackerTarget);
    const ref = useTerminalFollow(session);
    const events = session.events.filter((event) => event.pane === "injector");
    return (
        <div className="hacker-pane-body" ref={ref}>
            <pre className="hacker-terminal-text">
                <div className="hacker-highlight">
                    [ NINJA PAYLOAD ENGINE v4.2 ]
                </div>
                <div>{`[*] Target: ${target.name} // ${target.ip}`}</div>
                <div>{`[*] Pipeline: memdump → disasm → inject → scp`}</div>
                <div>{`[*] Source: ${Math.min(count, HACKER_SOURCE_LENGTH)} / ${HACKER_SOURCE_LENGTH} chars`}</div>
                <br />
                {session.phase === "writing" ? (
                    <>
                        <div className="hacker-highlight">
                            [ waiting ] Waiting for code editor
                        </div>
                        <div className="hacker-dim">
                            Reverse-engineering workers queued until the source
                            file is complete.
                        </div>
                        <TerminalProgress
                            label="CODE EDITOR"
                            value={(count / HACKER_SOURCE_LENGTH) * 100}
                        />
                    </>
                ) : session.phase === "awaiting" ? (
                    <>
                        <div className="hacker-dim">
                            MEMDUMP and DISASM ready. Awaiting operator.
                        </div>
                        <button
                            className="hacker-inject-action hacker-blink"
                            onClick={() => initiatePayloadInjection()}
                        >
                            [ ENTER ] START OPERATION →
                        </button>
                    </>
                ) : (
                    <>
                        <SequenceLines events={events} />
                        {session.phase === "analyzing" && (
                            <TerminalProgress
                                label="REVERSE ENGINEERING"
                                value={stageProgress(
                                    session.elapsed,
                                    0,
                                    ANALYSIS_DURATION,
                                )}
                            />
                        )}
                        {session.phase === "injecting" && (
                            <TerminalProgress
                                label="PAYLOAD INJECTION"
                                value={stageProgress(
                                    session.elapsed,
                                    ANALYSIS_DURATION,
                                    INJECTION_DURATION,
                                )}
                            />
                        )}
                        {session.phase === "transferring" && (
                            <div className="hacker-sequence-line">
                                [&gt;] SCP running. Awaiting transfer receipt...
                            </div>
                        )}
                        {session.phase === "verifying" && (
                            <TerminalProgress
                                label="ACCESS VERIFICATION"
                                value={stageProgress(
                                    session.elapsed,
                                    VERIFICATION_START,
                                    VERIFICATION_DURATION,
                                )}
                            />
                        )}
                    </>
                )}
            </pre>
        </div>
    );
}
