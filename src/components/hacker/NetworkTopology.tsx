import { useEffect, useId, useState, useRef } from "react";
import { useStore } from "@nanostores/react";
import {
    $hackerSession,
    $hackerTarget,
    TOPOLOGY_TARGETS,
    selectHackerTarget,
    TRANSFER_START,
    TRANSFER_DURATION,
    type HackerTarget,
} from "@/store/hacker";
import {
    stageProgress,
    sequenceTargetStatus,
    TRANSFER_TOTAL,
} from "@/lib/hackerSequence";
import {
    NETWORK_LINKS,
    NETWORK_POSITIONS,
    networkRoute,
} from "@/lib/hackerTopology";
import TerminalDialog from "./TerminalDialog";

const PORTRAIT_POSITIONS: typeof NETWORK_POSITIONS = {
    n1: { x: 70, y: 75 },
    n2: { x: 200, y: 180 },
    n3: { x: 200, y: 300 },
    n4: { x: 200, y: 420 },
    n5: { x: 330, y: 510 },
    n6: { x: 70, y: 180 },
    n7: { x: 70, y: 300 },
    n8: { x: 330, y: 420 },
    n9: { x: 330, y: 300 },
    n10: { x: 330, y: 365 },
    n11: { x: 70, y: 365 },
    n12: { x: 70, y: 500 },
    n13: { x: 70, y: 430 },
    n14: { x: 200, y: 560 },
};
const NODES = TOPOLOGY_TARGETS.map((target) => ({
    ...target,
    ...NETWORK_POSITIONS[target.id],
}));
function NodeIcon({ type }: { type: HackerTarget["type"] }) {
    if (type === "computer")
        return (
            <g>
                <rect x={-14} y={-12} width={28} height={20} rx={2} />
                <path d="M-8 -6 L-4 -2 L-8 2 M0 2 H6 M0 8 V13 M-8 13 H8" />
            </g>
        );
    if (type === "router")
        return (
            <g>
                <circle r={13} />
                <path d="M-7 0 H7 M0 -7 V7 M-7 0 L-3 -3 M7 0 L3 3 M0 -7 L3 -3 M0 7 L-3 3" />
            </g>
        );
    return (
        <g>
            <circle r={14} />
            <ellipse rx={6} ry={14} />
            <path d="M-14 0 H14 M-12 -7 H12 M-12 7 H12" />
        </g>
    );
}
function NetworkView({
    expanded = false,
    onExpand,
}: {
    expanded?: boolean;
    onExpand?: () => void;
}) {
    const target = useStore($hackerTarget);
    const session = useStore($hackerSession);
    const [inventory, setInventory] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(true);
    const mapRef = useRef<HTMLDivElement>(null);
    const [canvas, setCanvas] = useState({ width: 360, height: 120 });
    const portrait = canvas.width < 480 && canvas.height > 280;
    useEffect(() => {
        const el = mapRef.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => {
            if (entry.contentRect.width > 0 && entry.contentRect.height > 0)
                setCanvas({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                });
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);
    const route = networkRoute(target.id);
    const compactIds = [
        ...new Set(
            canvas.width < 300 && !portrait
                ? [route[0], target.id, "n14"]
                : ["n1", ...route, "n14"],
        ),
    ];
    const mapWidth = expanded ? (portrait ? 400 : 680) : canvas.width;
    const mapHeight = expanded ? (portrait ? 620 : 360) : canvas.height;
    const positions = expanded
        ? portrait
            ? PORTRAIT_POSITIONS
            : NETWORK_POSITIONS
        : Object.fromEntries(
              compactIds.map((node, index) => [
                  node,
                  portrait
                      ? {
                            x: mapWidth / 2,
                            y:
                                48 +
                                (index * (mapHeight - 105)) /
                                    Math.max(1, compactIds.length - 1),
                        }
                      : {
                            x:
                                35 +
                                (index * (mapWidth - 70)) /
                                    Math.max(1, compactIds.length - 1),
                            y: Math.max(31, mapHeight * 0.3),
                        },
              ]),
          );
    const nodes = NODES.filter(
        (node) => expanded || compactIds.includes(node.id),
    ).map((node) => ({ ...node, ...positions[node.id] }));
    const sink = nodes.find((node) => node.id === "n14")!;
    const visibleLinks = expanded
        ? NETWORK_LINKS
        : NETWORK_LINKS.filter(
              ([from, to]) => positions[from] && positions[to],
          );
    if (
        !expanded &&
        !visibleLinks.some(
            ([a, b]) =>
                (a === route[0] && b === target.id) ||
                (b === route[0] && a === target.id),
        ) &&
        route[0] !== target.id &&
        !positions[route[1]]
    )
        visibleLinks.push([route[0], target.id]);
    const id = useId().replace(/:/g, "");
    useEffect(() => {
        const media = matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setReducedMotion(media.matches);
        update();
        media.addEventListener("change", update);
        return () => media.removeEventListener("change", update);
    }, []);
    const status = sequenceTargetStatus(
        session.phase,
        session.result?.type === "fail",
    );
    const failed =
        session.phase === "complete" && session.result?.type === "fail";
    const active = !["awaiting", "writing", "complete"].includes(session.phase);
    const exfil = ["transferring", "verifying"].includes(session.phase);
    const selected = nodes.find((node) => node.id === target.id)!;
    const received =
        (TRANSFER_TOTAL *
            stageProgress(session.elapsed, TRANSFER_START, TRANSFER_DURATION)) /
        100;
    const phaseMessage =
        session.phase === "awaiting"
            ? "Choose a host to lock the route."
            : session.phase === "writing"
              ? "Route armed. Waiting for code editor."
              : session.phase === "analyzing"
                ? "Tracing auth buffer · MEMDUMP ↔ DISASM"
                : session.phase === "injecting"
                  ? "Delivering payload · encrypted tunnel active"
                  : session.phase === "transferring"
                    ? `SCP stream · ${(received / 1024).toFixed(2)} / 4.00 MiB`
                    : session.phase === "verifying"
                      ? "Archive received · checking access receipt"
                      : failed
                        ? "Remote guard triggered · channel closed"
                        : "Access verified · archive checksum matched";
    function choose(node: HackerTarget) {
        if (node.id !== target.id) selectHackerTarget(node);
        setInventory(false);
    }
    const exfilPath =
        target.id === "n14"
            ? ""
            : portrait && !expanded
              ? `M${selected.x} ${selected.y} Q${mapWidth - 30} ${(selected.y + sink.y) / 2} ${sink.x} ${sink.y}`
              : `M${selected.x} ${selected.y} Q${(selected.x + sink.x) / 2} ${mapHeight - 5} ${sink.x} ${sink.y}`;
    return (
        <div
            className={`hacker-netmap ${expanded ? "hacker-netmap-expanded" : ""}`}
            data-failed={failed}
            data-expanded={expanded}
            data-complete={session.phase === "complete" && !failed}
        >
            <div className="hacker-netmap-controls">
                <label
                    htmlFor={`host-${id}`}
                    className="hacker-netmap-select-label"
                >
                    TARGET
                    <select
                        id={`host-${id}`}
                        value={target.id}
                        onChange={(event) =>
                            choose(
                                TOPOLOGY_TARGETS.find(
                                    (node) => node.id === event.target.value,
                                )!,
                            )
                        }
                    >
                        {TOPOLOGY_TARGETS.map((node) => (
                            <option key={node.id} value={node.id}>
                                {node.name} · {node.ip}
                            </option>
                        ))}
                    </select>
                </label>
                <button
                    aria-pressed={inventory}
                    onClick={() => setInventory((value) => !value)}
                    aria-label="Toggle host inventory"
                >
                    Hosts
                </button>
                {onExpand && (
                    <button
                        onClick={onExpand}
                        aria-label="Expand network topology"
                        title="Expand map"
                    >
                        ⛶
                    </button>
                )}
            </div>
            <div className="hacker-netmap-map" ref={mapRef}>
                <div className="hacker-netmap-map-meta">
                    <span>{expanded ? "NET / 10.24.0.0" : "ROUTE VIEW"}</span>
                    <span>
                        {expanded
                            ? `${NODES.length} NODES · ${NETWORK_LINKS.length} LINKS`
                            : `${NODES.length} HOSTS AVAILABLE`}
                    </span>
                </div>
                <svg
                    viewBox={`0 0 ${mapWidth} ${mapHeight}`}
                    className="hacker-netmap-svg"
                    aria-label="Interactive network map"
                    role="group"
                >
                    <defs>
                        <pattern
                            id={`netgrid-${id}`}
                            width={30}
                            height={30}
                            patternUnits="userSpaceOnUse"
                        >
                            <path
                                d="M30 0 H0 V30"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={0.5}
                            />
                        </pattern>
                    </defs>
                    <rect
                        width={mapWidth}
                        height={mapHeight}
                        fill={`url(#netgrid-${id})`}
                        className="hacker-netmap-grid"
                    />
                    <path
                        d={`M12 30 V12 H30 M${mapWidth - 30} 12 H${mapWidth - 12} V30 M12 ${mapHeight - 30} V${mapHeight - 12} H30 M${mapWidth - 30} ${mapHeight - 12} H${mapWidth - 12} V${mapHeight - 30}`}
                        className="hacker-netmap-frame"
                    />
                    {visibleLinks.map(([from, to], index) => {
                        const a = positions[from],
                            b = positions[to];
                        const routed =
                            (!expanded &&
                                from === route[0] &&
                                to === target.id) ||
                            route.some(
                                (node, i) =>
                                    i < route.length - 1 &&
                                    ((node === from && route[i + 1] === to) ||
                                        (node === to && route[i + 1] === from)),
                            );
                        const reverse =
                            routed && route.indexOf(from) > route.indexOf(to);
                        const path = reverse
                            ? `M${b.x} ${b.y} L${a.x} ${a.y}`
                            : `M${a.x} ${a.y} L${b.x} ${b.y}`;
                        return (
                            <g
                                key={`${from}-${to}`}
                                className={
                                    routed
                                        ? "hacker-netmap-route"
                                        : "hacker-netmap-link"
                                }
                            >
                                <path d={path} />
                                {routed && active && !reducedMotion && (
                                    <circle
                                        r={3}
                                        className="hacker-netmap-packet"
                                    >
                                        <animateMotion
                                            dur={exfil ? "1.1s" : "2.2s"}
                                            repeatCount="indefinite"
                                            path={path}
                                            begin={`${-index * 0.3}s`}
                                        />
                                    </circle>
                                )}
                            </g>
                        );
                    })}
                    {exfilPath && (
                        <g className="hacker-netmap-exfil" data-active={exfil}>
                            <path d={exfilPath} />
                            {exfil && !reducedMotion && (
                                <circle r={4}>
                                    <animateMotion
                                        dur="1.8s"
                                        repeatCount="indefinite"
                                        path={exfilPath}
                                    />
                                </circle>
                            )}
                            {exfil && (
                                <text
                                    x={
                                        portrait && !expanded
                                            ? mapWidth - 70
                                            : (selected.x + sink.x) / 2
                                    }
                                    y={
                                        expanded
                                            ? mapHeight - 20
                                            : mapHeight - 4
                                    }
                                    textAnchor="middle"
                                >
                                    {exfil
                                        ? "SCP / ENCRYPTED"
                                        : "SCP / STANDBY"}
                                </text>
                            )}
                        </g>
                    )}
                    {nodes.map((node) => {
                        const isSelected = node.id === target.id;
                        const vault =
                            node.type === "target-globe" ||
                            node.status === "TARGET";
                        return (
                            <g
                                key={node.id}
                                transform={`translate(${node.x},${node.y})`}
                                className={`hacker-netmap-node ${isSelected ? "is-selected" : ""} ${vault ? "is-vault" : ""}`}
                                role="button"
                                tabIndex={0}
                                aria-label={`Target ${node.name}, ${node.ip}`}
                                aria-pressed={isSelected}
                                onClick={() => choose(node)}
                                onKeyDown={(event) => {
                                    if (
                                        event.key === "Enter" ||
                                        event.key === " "
                                    ) {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        choose(node);
                                    }
                                }}
                            >
                                <title>{`${node.name} · ${node.ip} · ${node.latency} ms`}</title>
                                <circle r={27} className="hacker-netmap-hit" />
                                {isSelected && (
                                    <>
                                        <circle
                                            r={24}
                                            className="hacker-netmap-reticle"
                                        />
                                        <path
                                            d="M-32 0 H-26 M26 0 H32 M0 -32 V-26 M0 26 V32"
                                            className="hacker-netmap-crosshair"
                                        />
                                    </>
                                )}
                                <g className="hacker-netmap-icon">
                                    <NodeIcon type={node.type} />
                                </g>
                                <text
                                    y={expanded ? 33 : 25}
                                    textAnchor="middle"
                                >
                                    {expanded ? (
                                        node.name
                                    ) : (
                                        <>
                                            <tspan x="0">
                                                {node.name.split("-")[0]}
                                            </tspan>
                                            <tspan x="0" dy="12">
                                                {node.name
                                                    .split("-")
                                                    .slice(1)
                                                    .join("-")}
                                            </tspan>
                                        </>
                                    )}
                                </text>
                            </g>
                        );
                    })}
                </svg>
                {inventory && (
                    <div className="hacker-netmap-inventory">
                        <div className="hacker-netmap-inventory-heading">
                            HOST INVENTORY <span>Choose to retarget</span>
                        </div>
                        {TOPOLOGY_TARGETS.map((node) => (
                            <button
                                key={node.id}
                                aria-pressed={node.id === target.id}
                                onClick={() => choose(node)}
                            >
                                <span className="hacker-netmap-host-dot" />
                                <span>
                                    <strong>{node.name}</strong>
                                    <small>{node.ip}</small>
                                </span>
                                <span>{node.latency} ms</span>
                                <span>
                                    {node.id === target.id
                                        ? "LOCKED"
                                        : node.status}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div className="hacker-netmap-details">
                <div className="hacker-netmap-target-info">
                    <span>
                        <strong>{target.name}</strong>
                        <span className="hacker-dim">{target.ip}</span>
                    </span>
                    <span className="hacker-netmap-status">{status}</span>
                </div>
                <div
                    className="hacker-netmap-route-info"
                    title={route
                        .map((node) => NODES.find((n) => n.id === node)!.name)
                        .join(" → ")}
                >
                    <span>ROUTE</span>
                    {route
                        .map((node) => NODES.find((n) => n.id === node)!.name)
                        .join(" › ")}
                    <span className="hacker-netmap-latency">
                        {target.latency} ms
                    </span>
                </div>
                <div className="hacker-netmap-activity">{phaseMessage}</div>
                {expanded && (
                    <div className="hacker-netmap-legend">
                        <span>● Relay / host</span>
                        <span>◎ Vault / target</span>
                        <span>━ Selected route</span>
                        <span>Ports: {target.ports}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
export default function NetworkTopology() {
    const [expanded, setExpanded] = useState(false);
    return (
        <>
            <NetworkView onExpand={() => setExpanded(true)} />
            <TerminalDialog
                open={expanded}
                onClose={() => setExpanded(false)}
                title="Network topology"
                className="hacker-network-dialog"
            >
                <NetworkView expanded />
            </TerminalDialog>
        </>
    );
}
