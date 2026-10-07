import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { $hackerColor, type HackerColor } from "@/store/hacker";
import HackerEditor from "./HackerEditor";
import ProcessStatus from "./ProcessStatus";
import MemoryDump from "./MemoryDump";
import DisassemblyView from "./DisassemblyView";
import PayloadInjector from "./PayloadInjector";
import FileTransfer from "./FileTransfer";
import HackerToolbar from "./HackerToolbar";
import HackerSettings from "./HackerSettings";

const PANE_TITLES: Record<string, string> = {
    editor: "kernel/ring0_core.c",
    process: "top — processes",
    memory: "memdump — 0x7fff",
    disasm: "disasm — gdb-gef",
    injector: "payload — injector",
    transfer: "scp — exfiltrate",
};

function PaneHeader({ id }: { id: string }) {
    return (
        <div className="hacker-pane-header">
            <div className="hacker-pane-header-title">
                <div className="hacker-pane-header-dot" />
                <span>{PANE_TITLES[id] ?? id}</span>
            </div>
            <span style={{ opacity: 0.5 }}>pane:{id}</span>
        </div>
    );
}

const HackerLayout = () => {
    const color = useStore($hackerColor);

    /* Prevent default browser shortcuts while hacking */
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            // Allow Escape, F5 (reload), F12 (devtools), Ctrl+R, Ctrl+Shift+I
            if (e.key === "Escape") return;
            if (e.key === "F5" || e.key === "F12") return;
            if ((e.ctrlKey || e.metaKey) && (e.key === "r" || e.key === "R")) return;
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "I") return;
            // Prevent everything else that might interfere (like Ctrl+S, etc.)
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
            }
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, []);

    return (
        <div className="hacker-page" data-hacker-color={color} tabIndex={0}>
            <div className="hacker-grid">
                {/* Left Pane — Code Editor */}
                <div className="hacker-pane">
                    <PaneHeader id="editor" />
                    <HackerEditor />
                </div>

                {/* Right Stack */}
                <div className="hacker-right-stack">
                    {/* Right 1 — Process Status (top) */}
                    <div className="hacker-pane">
                        <PaneHeader id="process" />
                        <ProcessStatus />
                    </div>

                    {/* Right 2 — Split: Memory Dump + Disasm / Regs */}
                    <div className="hacker-right-middle">
                        <div className="hacker-pane">
                            <PaneHeader id="memory" />
                            <MemoryDump />
                        </div>
                        <div className="hacker-pane">
                            <PaneHeader id="disasm" />
                            <DisassemblyView />
                        </div>
                    </div>

                    {/* Right 3 — Split: Injector + Transfer */}
                    <div className="hacker-right-bottom">
                        <div className="hacker-pane">
                            <PaneHeader id="injector" />
                            <PayloadInjector />
                        </div>
                        <div className="hacker-pane">
                            <PaneHeader id="transfer" />
                            <FileTransfer />
                        </div>
                    </div>
                </div>
            </div>

            <HackerToolbar />
            <HackerSettings />
        </div>
    );
};

export default HackerLayout;
