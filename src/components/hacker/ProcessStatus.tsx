import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { $hackerSession, $hackerTarget } from "@/store/hacker";
import { sequenceTargetStatus } from "@/lib/hackerSequence";
import { PROCESS_TEMPLATES } from "@/constants/hackerData";
const WORKERS = [
    { pid: 1336, command: "code-editor", ranges: [], cpu: 32, memory: 96 },
    {
        pid: 1337,
        command: "payload-engine",
        ranges: [
            [0, 18000],
            [30000, 32000],
        ],
        cpu: 24,
        memory: 128,
    },
    {
        pid: 1338,
        command: "memdump-worker",
        ranges: [
            [800, 3600],
            [11000, 14000],
            [18000, 32000],
        ],
        cpu: 12,
        memory: 64,
    },
    {
        pid: 1339,
        command: "gdb-reverse",
        ranges: [
            [4400, 7400],
            [14000, 16000],
            [30000, 32000],
        ],
        cpu: 16,
        memory: 96,
    },
    {
        pid: 1340,
        command: "scp-exfil",
        ranges: [[18000, 32000]],
        cpu: 18,
        memory: 48,
    },
    {
        pid: 1341,
        command: "receipt-verify",
        ranges: [[30000, 32000]],
        cpu: 8,
        memory: 32,
    },
];
export default function ProcessStatus() {
    const session = useStore($hackerSession);
    const target = useStore($hackerTarget);
    const [time, setTime] = useState("12:00:00");
    useEffect(() => {
        const update = () =>
            setTime(new Date().toLocaleTimeString("en-GB", { hour12: false }));
        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, []);
    const workers = WORKERS.map((worker) => {
        const active =
            worker.command === "code-editor"
                ? session.phase === "writing"
                : session.phase !== "awaiting" &&
                  session.phase !== "writing" &&
                  session.phase !== "complete" &&
                  worker.ranges.some(
                      ([begin, end]) =>
                          session.elapsed >= begin && session.elapsed < end,
                  );
        return {
            ...worker,
            active,
            cpu: active ? worker.cpu : 0,
            memory: active ? worker.memory : 8,
        };
    });
    workers.sort((a, b) => b.cpu - a.cpu);
    const running = workers.filter((worker) => worker.active).length;
    const background = PROCESS_TEMPLATES.filter(
        (process) => ![1337, 1338].includes(process.pid),
    ).map((process) => ({ ...process, cpu: +(process.cpu * 0.03).toFixed(1) }));
    const cpu =
        background.reduce((sum, process) => sum + process.cpu, 0) +
        workers.reduce((sum, worker) => sum + worker.cpu, 0);
    const used = 4096 + workers.reduce((sum, worker) => sum + worker.memory, 0);
    return (
        <div className="hacker-pane-body">
            <pre className="hacker-terminal-text">
                <div>{`top - ${time} // ${target.name}`}</div>
                <div className="hacker-highlight">{`LINK: ${target.ip} // ${sequenceTargetStatus(session.phase, session.result?.type === "fail")}`}</div>
                <div>{`Tasks: 128 total, ${running} running, ${128 - running} sleeping`}</div>
                <div>{`CPU: ${cpu.toFixed(1)}% user · ${(100 - cpu).toFixed(1)}% idle`}</div>
                <div>{`Mem: ${used} / 16384 MiB · ${16384 - used} free`}</div>
                <br />
                <div className="hacker-highlight">
                    {" PID COMMAND              CPU%  MiB STATE"}
                </div>
                {workers.map((worker) => (
                    <div
                        key={worker.pid}
                        className={
                            worker.active ? "hacker-highlight" : "hacker-dim"
                        }
                    >{`${worker.pid} ${worker.command.padEnd(20)} ${worker.cpu.toFixed(1).padStart(5)} ${String(worker.memory).padStart(4)} ${worker.active ? "RUN" : session.phase === "complete" ? (session.result?.type === "fail" ? "STOP" : "DONE") : "WAIT"}`}</div>
                ))}
                <br />
                <div className="hacker-dim">{"── SYSTEM PROCESSES ──"}</div>
                {background.map((process) => (
                    <div
                        key={process.pid}
                    >{`${String(process.pid).padStart(4)} ${process.command.padEnd(20)} ${process.cpu.toFixed(1).padStart(5)} ${process.res.padStart(4)} ${process.s}`}</div>
                ))}
            </pre>
        </div>
    );
}
