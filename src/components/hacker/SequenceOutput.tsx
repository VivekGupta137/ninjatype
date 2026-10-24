import { useLayoutEffect, useRef } from "react";
import type { SequenceEvent } from "@/lib/hackerSequence";

/** Follow new output and restore the latest position when a mobile panel opens. */
export function useTerminalFollow(update: unknown) {
    const ref = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        const el = ref.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [update]);
    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        const follow = () => {
            el.scrollTop = el.scrollHeight;
        };
        const observer = new ResizeObserver(follow);
        observer.observe(el);
        if (el.firstElementChild) observer.observe(el.firstElementChild);
        return () => observer.disconnect();
    }, []);
    return ref;
}
export function SequenceLines({ events }: { events: SequenceEvent[] }) {
    return (
        <>
            {events.map((event) => (
                <div
                    key={event.id}
                    data-event-id={event.id}
                    className={`hacker-sequence-line ${event.level === "warning" ? "hacker-alert" : event.level === "success" ? "hacker-success" : ""}`}
                >
                    <span className="hacker-sequence-time">{`[${(event.at / 1000).toFixed(1).padStart(4, "0")}] `}</span>
                    {event.level === "warning"
                        ? "[!] "
                        : event.level === "success"
                          ? "[+] "
                          : "[>] "}
                    {event.text}
                </div>
            ))}
        </>
    );
}
export function TerminalProgress({
    label,
    value,
}: {
    label: string;
    value: number;
}) {
    const percent = Math.floor(value);
    return (
        <div
            className="hacker-sequence-progress"
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
        >{`${label}\n[${"=".repeat(Math.floor(value / 5)).padEnd(20, "·")}] ${percent}%`}</div>
    );
}
