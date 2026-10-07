import { useState, useEffect, useRef } from "react";
import { useStore } from "@nanostores/react";
import {
    $hackerColor,
    $hackerPanes,
    $hackerSplits,
    $hackerTargetVersion,
    updateHackerSplits,
    toggleHackerPane,
    restoreAllPanes,
    type HackerPaneId,
} from "@/store/hacker";
import HackerEditor from "./HackerEditor";
import ProcessStatus from "./ProcessStatus";
import NetworkTopology from "./NetworkTopology";
import MemoryDump from "./MemoryDump";
import DisassemblyView from "./DisassemblyView";
import PayloadInjector from "./PayloadInjector";
import FileTransfer from "./FileTransfer";
import HackerToolbar from "./HackerToolbar";
import HackerSettings from "./HackerSettings";
import FinalMessageModal from "./FinalMessageModal";

const PANE_TITLES: Record<HackerPaneId, string> = {
    editor: "kernel/ring0_core.c",
    process: "top — processes",
    topology: "netmap — topology",
    memory: "memdump — 0x7fff",
    disasm: "disasm — gdb-gef",
    injector: "payload — injector",
    transfer: "scp — exfiltrate",
};

function PaneHeader({
    id,
    onClose,
}: {
    id: HackerPaneId;
    onClose?: () => void;
}) {
    return (
        <div className="hacker-pane-header">
            <div className="hacker-pane-header-title">
                <div className="hacker-pane-header-dot" />
                <span>{PANE_TITLES[id] ?? id}</span>
            </div>
            <div className="hacker-pane-header-actions">
                <span style={{ opacity: 0.5 }}>pane:{id}</span>
                {onClose && (
                    <button
                        className="hacker-pane-close-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        title={`Close pane:${id}`}
                        aria-label={`Close ${id} pane`}
                    >
                        ×
                    </button>
                )}
            </div>
        </div>
    );
}

const HackerLayout = () => {
    const color = useStore($hackerColor);
    const panes = useStore($hackerPanes);
    const splits = useStore($hackerSplits);
    const targetVersion = useStore($hackerTargetVersion);

    const gridRef = useRef<HTMLDivElement>(null);
    const stackRef = useRef<HTMLDivElement>(null);
    const row1Ref = useRef<HTMLDivElement>(null);
    const row2Ref = useRef<HTMLDivElement>(null);
    const row3Ref = useRef<HTMLDivElement>(null);

    /* Prevent default browser shortcuts while hacking */
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") return;
            if (e.key === "F5" || e.key === "F12") return;
            if ((e.ctrlKey || e.metaKey) && (e.key === "r" || e.key === "R")) return;
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "I") return;
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
            }
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, []);

    const showTopRow = panes.process || panes.topology;
    const showMidRow = panes.memory || panes.disasm;
    const showBotRow = panes.injector || panes.transfer;
    const showRightStack = showTopRow || showMidRow || showBotRow;
    const allPanesHidden = !panes.editor && !showRightStack;

    // Resizer 1: Left Editor vs Right Stack
    const handleMainResize = (e: React.PointerEvent) => {
        if (e.button !== 0) return;
        e.preventDefault();
        const grid = gridRef.current;
        if (!grid) return;
        const rect = grid.getBoundingClientRect();

        const onMove = (ev: PointerEvent) => {
            const percent = ((ev.clientX - rect.left) / rect.width) * 100;
            const clamped = Math.max(15, Math.min(85, percent));
            updateHackerSplits({ mainSplit: clamped });
        };

        const onUp = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };

        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
    };

    // Resizer 2: Row 1 Columns (Process vs Topology)
    const handleRow1ColResize = (e: React.PointerEvent) => {
        if (e.button !== 0) return;
        e.preventDefault();
        const row = row1Ref.current;
        if (!row) return;
        const rect = row.getBoundingClientRect();

        const onMove = (ev: PointerEvent) => {
            const percent = ((ev.clientX - rect.left) / rect.width) * 100;
            const clamped = Math.max(15, Math.min(85, percent));
            updateHackerSplits({ row1Split: clamped });
        };

        const onUp = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };

        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
    };

    // Resizer 3: Row 2 Columns (Memory vs Disasm)
    const handleRow2ColResize = (e: React.PointerEvent) => {
        if (e.button !== 0) return;
        e.preventDefault();
        const row = row2Ref.current;
        if (!row) return;
        const rect = row.getBoundingClientRect();

        const onMove = (ev: PointerEvent) => {
            const percent = ((ev.clientX - rect.left) / rect.width) * 100;
            const clamped = Math.max(15, Math.min(85, percent));
            updateHackerSplits({ row2Split: clamped });
        };

        const onUp = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };

        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
    };

    // Resizer 4: Row 3 Columns (Injector vs Transfer)
    const handleRow3ColResize = (e: React.PointerEvent) => {
        if (e.button !== 0) return;
        e.preventDefault();
        const row = row3Ref.current;
        if (!row) return;
        const rect = row.getBoundingClientRect();

        const onMove = (ev: PointerEvent) => {
            const percent = ((ev.clientX - rect.left) / rect.width) * 100;
            const clamped = Math.max(15, Math.min(85, percent));
            updateHackerSplits({ row3Split: clamped });
        };

        const onUp = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };

        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
    };

    // Resizers for Rows inside Right Stack
    const handleRowResizeTopMid = (e: React.PointerEvent) => {
        if (e.button !== 0) return;
        e.preventDefault();
        const stack = stackRef.current;
        if (!stack) return;
        const rect = stack.getBoundingClientRect();

        const onMove = (ev: PointerEvent) => {
            const y = ev.clientY - rect.top;
            const targetPercent = (y / rect.height) * 100;
            if (showBotRow) {
                const h3 = splits.rowHeights[2];
                const avail = 100 - h3;
                const newH1 = Math.max(10, Math.min(avail - 10, targetPercent));
                const newH2 = avail - newH1;
                updateHackerSplits({ rowHeights: [newH1, newH2, h3] });
            } else {
                const newH1 = Math.max(15, Math.min(85, targetPercent));
                const newH2 = 100 - newH1;
                updateHackerSplits({ rowHeights: [newH1, newH2, 0] });
            }
        };

        const onUp = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };

        document.body.style.cursor = "row-resize";
        document.body.style.userSelect = "none";
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
    };

    const handleRowResizeMidBot = (e: React.PointerEvent) => {
        if (e.button !== 0) return;
        e.preventDefault();
        const stack = stackRef.current;
        if (!stack) return;
        const rect = stack.getBoundingClientRect();

        const onMove = (ev: PointerEvent) => {
            const y = ev.clientY - rect.top;
            const targetPercent = (y / rect.height) * 100;
            if (showTopRow) {
                const h1 = splits.rowHeights[0];
                const avail = 100 - h1;
                const newH2 = Math.max(10, Math.min(avail - 10, targetPercent - h1));
                const newH3 = avail - newH2;
                updateHackerSplits({ rowHeights: [h1, newH2, newH3] });
            } else {
                const newH2 = Math.max(15, Math.min(85, targetPercent));
                const newH3 = 100 - newH2;
                updateHackerSplits({ rowHeights: [0, newH2, newH3] });
            }
        };

        const onUp = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };

        document.body.style.cursor = "row-resize";
        document.body.style.userSelect = "none";
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
    };

    const handleRowResizeTopBot = (e: React.PointerEvent) => {
        if (e.button !== 0) return;
        e.preventDefault();
        const stack = stackRef.current;
        if (!stack) return;
        const rect = stack.getBoundingClientRect();

        const onMove = (ev: PointerEvent) => {
            const y = ev.clientY - rect.top;
            const targetPercent = (y / rect.height) * 100;
            const newH1 = Math.max(15, Math.min(85, targetPercent));
            const newH3 = 100 - newH1;
            updateHackerSplits({ rowHeights: [newH1, 0, newH3] });
        };

        const onUp = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
        };

        document.body.style.cursor = "row-resize";
        document.body.style.userSelect = "none";
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
    };

    const getRowStyle = (rowIdx: 0 | 1 | 2) => {
        const visibleCount = (showTopRow ? 1 : 0) + (showMidRow ? 1 : 0) + (showBotRow ? 1 : 0);
        if (visibleCount <= 1) {
            return { flex: "1 1 0", minHeight: 0 };
        }
        return { flex: `${splits.rowHeights[rowIdx]} 1 0`, minHeight: 0 };
    };

    return (
        <div className="hacker-page" data-hacker-color={color} tabIndex={0}>
            <div className="hacker-grid" ref={gridRef}>
                {allPanesHidden && (
                    <div className="hacker-empty-board">
                        <div className="hacker-terminal-text hacker-dim">
                            [ ALL PANES CLOSED ]
                        </div>
                        <button
                            className="hacker-color-option"
                            onClick={() => restoreAllPanes()}
                        >
                            Restore All Panes
                        </button>
                    </div>
                )}

                {/* Left Pane — Code Editor */}
                {panes.editor && (
                    <div
                        className="hacker-pane"
                        style={{
                            width: showRightStack ? `${splits.mainSplit}%` : "100%",
                            flex: showRightStack ? "none" : "1 1 0",
                        }}
                    >
                        <PaneHeader
                            id="editor"
                            onClose={() => toggleHackerPane("editor")}
                        />
                        <HackerEditor />
                    </div>
                )}

                {/* Vertical Resizer: Editor vs Right Stack */}
                {panes.editor && showRightStack && (
                    <div
                        className="hacker-resizer hacker-resizer-col"
                        onPointerDown={handleMainResize}
                        onDoubleClick={() => updateHackerSplits({ mainSplit: 50 })}
                        title="Drag to resize, double-click to center (50/50)"
                    />
                )}

                {/* Right Stack */}
                {showRightStack && (
                    <div
                        ref={stackRef}
                        key={`stack-${targetVersion}`}
                        className={`hacker-right-stack ${targetVersion > 0 ? "hacker-target-flash" : ""}`}
                        style={{
                            flex: "1 1 0",
                            minWidth: 0,
                        }}
                    >
                        {/* Right 1 — Top Row: Process Status + Network Topology */}
                        {showTopRow && (
                            <div
                                ref={row1Ref}
                                className="hacker-right-top"
                                style={getRowStyle(0)}
                            >
                                {panes.process && (
                                    <div
                                        className="hacker-pane"
                                        style={{
                                            width: panes.topology ? `${splits.row1Split}%` : "100%",
                                            flex: panes.topology ? "none" : "1 1 0",
                                        }}
                                    >
                                        <PaneHeader
                                            id="process"
                                            onClose={() => toggleHackerPane("process")}
                                        />
                                        <ProcessStatus />
                                    </div>
                                )}
                                {panes.process && panes.topology && (
                                    <div
                                        className="hacker-resizer hacker-resizer-col"
                                        onPointerDown={handleRow1ColResize}
                                        onDoubleClick={() => updateHackerSplits({ row1Split: 50 })}
                                        title="Drag to resize, double-click to center (50/50)"
                                    />
                                )}
                                {panes.topology && (
                                    <div
                                        className="hacker-pane"
                                        style={{
                                            flex: "1 1 0",
                                            minWidth: 0,
                                        }}
                                    >
                                        <PaneHeader
                                            id="topology"
                                            onClose={() => toggleHackerPane("topology")}
                                        />
                                        <NetworkTopology />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Horizontal Resizers between Rows */}
                        {showTopRow && showMidRow && (
                            <div
                                className="hacker-resizer hacker-resizer-row"
                                onPointerDown={handleRowResizeTopMid}
                                onDoubleClick={() => updateHackerSplits({ rowHeights: [33.33, 33.33, 33.34] })}
                                title="Drag to resize rows, double-click to equalize"
                            />
                        )}
                        {showTopRow && !showMidRow && showBotRow && (
                            <div
                                className="hacker-resizer hacker-resizer-row"
                                onPointerDown={handleRowResizeTopBot}
                                onDoubleClick={() => updateHackerSplits({ rowHeights: [50, 0, 50] })}
                                title="Drag to resize rows, double-click to equalize"
                            />
                        )}

                        {/* Right 2 — Middle Row: Memory Dump + Disasm / Regs */}
                        {showMidRow && (
                            <div
                                ref={row2Ref}
                                className="hacker-right-middle"
                                style={getRowStyle(1)}
                            >
                                {panes.memory && (
                                    <div
                                        className="hacker-pane"
                                        style={{
                                            width: panes.disasm ? `${splits.row2Split}%` : "100%",
                                            flex: panes.disasm ? "none" : "1 1 0",
                                        }}
                                    >
                                        <PaneHeader
                                            id="memory"
                                            onClose={() => toggleHackerPane("memory")}
                                        />
                                        <MemoryDump />
                                    </div>
                                )}
                                {panes.memory && panes.disasm && (
                                    <div
                                        className="hacker-resizer hacker-resizer-col"
                                        onPointerDown={handleRow2ColResize}
                                        onDoubleClick={() => updateHackerSplits({ row2Split: 50 })}
                                        title="Drag to resize, double-click to center (50/50)"
                                    />
                                )}
                                {panes.disasm && (
                                    <div
                                        className="hacker-pane"
                                        style={{
                                            flex: "1 1 0",
                                            minWidth: 0,
                                        }}
                                    >
                                        <PaneHeader
                                            id="disasm"
                                            onClose={() => toggleHackerPane("disasm")}
                                        />
                                        <DisassemblyView />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Horizontal Resizer between Mid and Bot */}
                        {showMidRow && showBotRow && (
                            <div
                                className="hacker-resizer hacker-resizer-row"
                                onPointerDown={handleRowResizeMidBot}
                                onDoubleClick={() => updateHackerSplits({ rowHeights: [33.33, 33.33, 33.34] })}
                                title="Drag to resize rows, double-click to equalize"
                            />
                        )}

                        {/* Right 3 — Bottom Row: Injector + Transfer */}
                        {showBotRow && (
                            <div
                                ref={row3Ref}
                                className="hacker-right-bottom"
                                style={getRowStyle(2)}
                            >
                                {panes.injector && (
                                    <div
                                        className="hacker-pane"
                                        style={{
                                            width: panes.transfer ? `${splits.row3Split}%` : "100%",
                                            flex: panes.transfer ? "none" : "1 1 0",
                                        }}
                                    >
                                        <PaneHeader
                                            id="injector"
                                            onClose={() => toggleHackerPane("injector")}
                                        />
                                        <PayloadInjector />
                                    </div>
                                )}
                                {panes.injector && panes.transfer && (
                                    <div
                                        className="hacker-resizer hacker-resizer-col"
                                        onPointerDown={handleRow3ColResize}
                                        onDoubleClick={() => updateHackerSplits({ row3Split: 50 })}
                                        title="Drag to resize, double-click to center (50/50)"
                                    />
                                )}
                                {panes.transfer && (
                                    <div
                                        className="hacker-pane"
                                        style={{
                                            flex: "1 1 0",
                                            minWidth: 0,
                                        }}
                                    >
                                        <PaneHeader
                                            id="transfer"
                                            onClose={() => toggleHackerPane("transfer")}
                                        />
                                        <FileTransfer />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <HackerToolbar />
            <HackerSettings />
            <FinalMessageModal />
        </div>
    );
};

export default HackerLayout;
