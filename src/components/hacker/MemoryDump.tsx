import { useStore } from "@nanostores/react";
import { $hackerSession, $hackerTarget } from "@/store/hacker";
import { sequenceEvidence } from "@/lib/hackerSequence";
import { SequenceLines, useTerminalFollow } from "./SequenceOutput";
export default function MemoryDump() {
    const session = useStore($hackerSession);
    const target = useStore($hackerTarget);
    const evidence = sequenceEvidence(target);
    const ref = useTerminalFollow(session);
    return (
        <div className="hacker-pane-body" ref={ref}>
            <pre className="hacker-terminal-text">
                <div className="hacker-highlight">{`[ MEMDUMP // ${target.name} ]`}</div>
                <div>{`[*] Mapped range: ${evidence.buffer} + 0x100`}</div>
                <div>{`[*] Capture worker armed // waiting for PAYLOAD request`}</div>
                <br />
                {session.phase === "awaiting" && (
                    <div className="hacker-dim">
                        [ idle ] No active capture. Memory findings will be
                        returned to PAYLOAD.
                    </div>
                )}
                <SequenceLines
                    events={session.events.filter(
                        (event) => event.pane === "memory",
                    )}
                />
            </pre>
        </div>
    );
}
