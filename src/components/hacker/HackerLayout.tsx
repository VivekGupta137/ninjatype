import {
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type ReactNode,
} from "react";
import { useStore } from "@nanostores/react";
import {
    $hackerColor,
    $hackerPanes,
    $hackerSplits,
    $hackerPhase,
    $hackerSession,
    $hackerTarget,
    $hackerSettingsOpen,
    $hackerFinalMessageVisible,
    tickHackerSession,
    restoreAllPanes,
    toggleHackerPane,
    updateHackerSplits,
    type HackerPaneId,
} from "@/store/hacker";
import { sequenceTargetStatus } from "@/lib/hackerSequence";
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
const LABELS: Record<HackerPaneId, string> = {
    editor: "Code",
    process: "Processes",
    topology: "Network",
    memory: "Memory",
    disasm: "Disasm",
    injector: "Payload",
    transfer: "Transfer",
};
const TITLES: Record<HackerPaneId, string> = {
    editor: "kernel/ring0_core.c",
    process: "top — processes",
    topology: "netmap — topology",
    memory: "memdump — 0x7fff",
    disasm: "disasm — gdb-gef",
    injector: "payload — injector",
    transfer: "scp — exfiltrate",
};
const ROWS: [HackerPaneId, HackerPaneId][] = [
    ["process", "topology"],
    ["memory", "disasm"],
    ["injector", "transfer"],
];
const SPLIT_KEYS = ["row1Split", "row2Split", "row3Split"] as const;

function Resizer({
    value,
    onChange,
    label,
    vertical = false,
}: {
    value: number;
    onChange: (value: number) => void;
    label: string;
    vertical?: boolean;
}) {
    const bounds = useRef<{
        rect: DOMRect;
        position: number;
        value: number;
    } | null>(null);
    return (
        <div
            className={`hacker-resizer hacker-resizer-${vertical ? "row" : "col"}`}
            role="separator"
            tabIndex={0}
            aria-label={label}
            aria-orientation={vertical ? "horizontal" : "vertical"}
            aria-valuenow={Math.round(value)}
            aria-valuemin={15}
            aria-valuemax={85}
            onPointerDown={(e) => {
                if (e.button !== 0) return;
                e.preventDefault();
                bounds.current = {
                    rect: (vertical
                        ? e.currentTarget.parentElement!.parentElement!
                        : e.currentTarget.parentElement!
                    ).getBoundingClientRect(),
                    position: vertical ? e.clientY : e.clientX,
                    value,
                };
                e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
                const drag = bounds.current;
                if (!drag) return;
                onChange(
                    Math.max(
                        15,
                        Math.min(
                            85,
                            drag.value +
                                (((vertical ? e.clientY : e.clientX) -
                                    drag.position) /
                                    (vertical
                                        ? drag.rect.height
                                        : drag.rect.width)) *
                                    100,
                        ),
                    ),
                );
            }}
            onPointerUp={() => {
                bounds.current = null;
            }}
            onPointerCancel={() => {
                bounds.current = null;
            }}
            onLostPointerCapture={() => {
                bounds.current = null;
            }}
            onDoubleClick={() => onChange(50)}
            onKeyDown={(e) => {
                if (
                    [
                        "ArrowLeft",
                        "ArrowRight",
                        "ArrowUp",
                        "ArrowDown",
                        "Home",
                    ].includes(e.key)
                ) {
                    e.preventDefault();
                    onChange(
                        e.key === "Home"
                            ? 50
                            : Math.max(
                                  15,
                                  Math.min(
                                      85,
                                      value +
                                          (["ArrowLeft", "ArrowUp"].includes(
                                              e.key,
                                          )
                                              ? -2
                                              : 2),
                                  ),
                              ),
                    );
                }
            }}
        />
    );
}
export default function HackerLayout() {
    const color = useStore($hackerColor);
    const panes = useStore($hackerPanes);
    const splits = useStore($hackerSplits);
    const phase = useStore($hackerPhase);
    const session = useStore($hackerSession);
    const target = useStore($hackerTarget);
    const settingsOpen = useStore($hackerSettingsOpen);
    const resultOpen = useStore($hackerFinalMessageVisible);
    const [active, setActive] = useState<HackerPaneId>("editor");
    const visible = (Object.keys(LABELS) as HackerPaneId[]).filter(
        (id) => panes[id],
    );
    const mobileActive = panes[active] ? active : visible[0];
    const rows = ROWS.map((ids, index) => ({ ids, index })).filter((row) =>
        row.ids.some((id) => panes[id]),
    );
    useEffect(() => {
        const timer = window.setInterval(() => tickHackerSession(), 100);
        const update = () => tickHackerSession();
        document.addEventListener("visibilitychange", update);
        return () => {
            clearInterval(timer);
            document.removeEventListener("visibilitychange", update);
        };
    }, []);
    useEffect(() => {
        const viewport = window.visualViewport;
        const resize = () =>
            document.documentElement.style.setProperty(
                "--terminal-height",
                `${viewport?.height ?? window.innerHeight}px`,
            );
        resize();
        viewport?.addEventListener("resize", resize);
        return () => {
            viewport?.removeEventListener("resize", resize);
            document.documentElement.style.removeProperty("--terminal-height");
        };
    }, []);
    const content: Record<HackerPaneId, ReactNode> = {
        editor: <HackerEditor />,
        process: <ProcessStatus />,
        topology: <NetworkTopology />,
        memory: <MemoryDump />,
        disasm: <DisassemblyView />,
        injector: <PayloadInjector />,
        transfer: <FileTransfer />,
    };
    function panel(id: HackerPaneId, style?: CSSProperties) {
        if (!panes[id]) return null;
        return (
            <section
                id={`terminal-panel-${id}`}
                aria-label={LABELS[id]}
                className={`hacker-pane pane-${id}`}
                data-mobile-active={mobileActive === id}
                style={style}
            >
                <header className="hacker-pane-header">
                    <span className="hacker-pane-header-title">
                        <span className="hacker-pane-header-dot" />
                        {TITLES[id]}
                    </span>
                    <button
                        className="hacker-pane-close-btn"
                        aria-label={`Close ${LABELS[id]} panel`}
                        onClick={() => toggleHackerPane(id)}
                    >
                        ×
                    </button>
                </header>
                {content[id]}
            </section>
        );
    }
    return (
        <main
            className="hacker-page"
            data-hacker-color={color}
            data-color={color}
        >
            <div
                className="hacker-app-content"
                inert={settingsOpen || resultOpen}
            >
                <header className="hacker-console-header">
                    <h1>
                        <span className="hacker-status-dot" />
                        NINJA // HACKER TERMINAL
                    </h1>
                    <span className="hacker-console-target">
                        TARGET: {target.name}{" "}
                        <span className="hacker-dim">{target.ip}</span>
                    </span>
                    <span className="hacker-console-status">
                        {sequenceTargetStatus(
                            phase,
                            session.result?.type === "fail",
                        )}
                    </span>
                </header>
                <nav
                    className="hacker-mobile-tabs"
                    aria-label="Terminal panels"
                >
                    {visible.map((id) => (
                        <button
                            key={id}
                            aria-controls={`terminal-panel-${id}`}
                            aria-pressed={mobileActive === id}
                            onClick={() => setActive(id)}
                        >
                            {LABELS[id]}
                        </button>
                    ))}
                </nav>
                <div className="hacker-grid">
                    {panel("editor", {
                        flex: rows.length ? `0 0 ${splits.mainSplit}%` : "1",
                    })}
                    {!!rows.length && panes.editor && (
                        <Resizer
                            value={splits.mainSplit}
                            onChange={(value) =>
                                updateHackerSplits({ mainSplit: value })
                            }
                            label="Editor width"
                        />
                    )}
                    {!!rows.length && (
                        <div className="hacker-right-stack">
                            {rows.map(({ ids, index }, rowIndex) => (
                                <div
                                    className="hacker-row-group"
                                    key={index}
                                    style={{
                                        flex: `${splits.rowHeights[index]} 1 0`,
                                    }}
                                >
                                    <div className="hacker-right-row">
                                        {panel(ids[0], {
                                            flex: panes[ids[1]]
                                                ? `0 0 ${splits[SPLIT_KEYS[index]]}%`
                                                : "1",
                                        })}
                                        {panes[ids[0]] && panes[ids[1]] && (
                                            <Resizer
                                                value={
                                                    splits[SPLIT_KEYS[index]]
                                                }
                                                onChange={(value) =>
                                                    updateHackerSplits({
                                                        [SPLIT_KEYS[index]]:
                                                            value,
                                                    })
                                                }
                                                label={`${LABELS[ids[0]]} width`}
                                            />
                                        )}
                                        {panel(ids[1], { flex: "1" })}
                                    </div>
                                    {rowIndex < rows.length - 1 && (
                                        <Resizer
                                            vertical
                                            value={splits.rowHeights[index]}
                                            label={`${LABELS[ids[0]]} row height`}
                                            onChange={(value) => {
                                                const heights = [
                                                    ...splits.rowHeights,
                                                ] as [number, number, number];
                                                const next =
                                                    rows[rowIndex + 1].index;
                                                const total =
                                                    heights[index] +
                                                    heights[next];
                                                heights[index] = Math.max(
                                                    10,
                                                    Math.min(total - 10, value),
                                                );
                                                heights[next] =
                                                    total - heights[index];
                                                updateHackerSplits({
                                                    rowHeights: heights,
                                                });
                                            }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    {!visible.length && (
                        <div className="hacker-empty-board">
                            <p>[ ALL PANES CLOSED ]</p>
                            <button onClick={restoreAllPanes}>
                                Restore all panes
                            </button>
                        </div>
                    )}
                </div>
                <HackerToolbar />
            </div>
            <HackerSettings />
            <FinalMessageModal />
        </main>
    );
}
