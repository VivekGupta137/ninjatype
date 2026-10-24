import { useStore } from "@nanostores/react";
import {
    $hackerSession,
    $hackerTarget,
    TRANSFER_START,
    TRANSFER_DURATION,
} from "@/store/hacker";
import {
    SEQUENCE_FILES,
    TRANSFER_TOTAL,
    stageProgress,
} from "@/lib/hackerSequence";
import {
    SequenceLines,
    TerminalProgress,
    useTerminalFollow,
} from "./SequenceOutput";
export default function FileTransfer() {
    const session = useStore($hackerSession);
    const target = useStore($hackerTarget);
    const progress = stageProgress(
        session.elapsed,
        TRANSFER_START,
        TRANSFER_DURATION,
    );
    const received = (TRANSFER_TOTAL * progress) / 100;
    const ref = useTerminalFollow(session);
    let offset = 0;
    return (
        <div className="hacker-pane-body" ref={ref}>
            <pre className="hacker-terminal-text">
                <div className="hacker-highlight">{`[ SCP EXFIL // ${target.name} ]`}</div>
                <div>{`[*] ${target.ip} → EXFIL-14 // encrypted stream`}</div>
                <div>{`[*] Manifest: ${SEQUENCE_FILES.length} files // ${(TRANSFER_TOTAL / 1024).toFixed(2)} MiB`}</div>
                <br />
                {session.elapsed < TRANSFER_START && (
                    <div className="hacker-dim">
                        [ queued ] Waiting for PAYLOAD to complete reversing and
                        injection.
                    </div>
                )}
                <SequenceLines
                    events={session.events.filter(
                        (event) => event.pane === "transfer",
                    )}
                />
                {session.phase === "transferring" && (
                    <>
                        {SEQUENCE_FILES.map((file) => {
                            const amount = Math.max(
                                0,
                                Math.min(file.size, received - offset),
                            );
                            offset += file.size;
                            if (amount <= 0 || amount >= file.size) return null;
                            return (
                                <div
                                    key={file.name}
                                    className="hacker-highlight"
                                >{`[>] ${file.name} // ${Math.floor(amount)} / ${file.size} KiB`}</div>
                            );
                        })}
                        <TerminalProgress
                            label="SCP TRANSFER"
                            value={progress}
                        />
                        <div>{`${(received / 1024).toFixed(2)} / 4.00 MiB · ${(TRANSFER_TOTAL / (TRANSFER_DURATION / 1000)).toFixed(0)} KiB/s`}</div>
                    </>
                )}
            </pre>
        </div>
    );
}
