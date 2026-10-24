import { useStore } from "@nanostores/react";
import { $hackerSession, $hackerTarget } from "@/store/hacker";
import { sequenceEvidence } from "@/lib/hackerSequence";
import { SequenceLines, useTerminalFollow } from "./SequenceOutput";
export default function DisassemblyView() {
    const session = useStore($hackerSession);
    const target = useStore($hackerTarget);
    const evidence = sequenceEvidence(target);
    const ref = useTerminalFollow(session);
    const tracing = session.elapsed >= 4400 && session.phase !== "awaiting";
    const patched = session.elapsed >= 14_000;
    return (
        <div className="hacker-pane-body" ref={ref}>
            <pre className="hacker-terminal-text">
                <div className="hacker-highlight">{`[ GDB / GEF // ${target.name} ]`}</div>
                <div>{`[*] Architecture: x86_64 // auth gate debugger`}</div>
                <div>{`RIP: ${tracing ? evidence.guard : "not attached"}   RAX: ${patched ? "0x1" : "0x0"}`}</div>
                <div>{`RSI: ${evidence.buffer}   EFL: ${patched ? "[IF]" : "[ZF IF]"}`}</div>
                <br />
                {session.phase === "awaiting" && (
                    <div className="hacker-dim">
                        [ idle ] Waiting for PAYLOAD to submit a
                        reverse-engineering task.
                    </div>
                )}
                <SequenceLines
                    events={session.events.filter(
                        (event) => event.pane === "disasm",
                    )}
                />
            </pre>
        </div>
    );
}
