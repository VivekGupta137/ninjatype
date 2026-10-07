import React, { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import {
  $hackerPhase,
  $hackerTarget,
  selectHackerTarget,
  type HackerTarget,
} from "@/store/hacker";

interface TopologyNode extends HackerTarget {
  x: number;
  y: number;
}

const NODES: TopologyNode[] = [
  { id: "n1", name: "H0600", ip: "28.3.126", type: "router", x: 45, y: 155, status: "ONLINE", ports: "22/tcp", latency: 12 },
  { id: "n2", name: "10-CORE", ip: "192.126.123.238", type: "router", x: 165, y: 155, status: "EXPLOITED", ports: "80,443", latency: 8 },
  { id: "n3", name: "GW-CENTRAL", ip: "192.168.10.103", type: "globe", x: 285, y: 155, status: "EXPLOITED", ports: "53,80,443,8080", latency: 2 },
  { id: "n4", name: "WAN-GW", ip: "WAN", type: "target-globe", x: 345, y: 80, status: "TARGET", ports: "21,22,80,8443", latency: 34 },
  { id: "n5", name: "LAN-VAULT", ip: "LAN", type: "target-globe", x: 475, y: 85, status: "INFILTRATING", ports: "3389,8000", latency: 45 },
  { id: "n6", name: "D6910", ip: "192.168.6.213", type: "computer", x: 140, y: 75, status: "EXPLOITED", ports: "22/tcp", latency: 14 },
  { id: "n7", name: "500-NODE", ip: "193.186.2.238", type: "computer", x: 235, y: 45, status: "ONLINE", ports: "80/tcp", latency: 19 },
  { id: "n8", name: "10000-SYS", ip: "203.205.23.206", type: "computer", x: 405, y: 40, status: "SECURE", ports: "443/tcp", latency: 29 },
  { id: "n9", name: "S06-HOST", ip: "192.186.3.124", type: "computer", x: 415, y: 160, status: "ONLINE", ports: "445/tcp", latency: 11 },
  { id: "n10", name: "UGBN6", ip: "192.186.3.256", type: "computer", x: 425, y: 230, status: "ONLINE", ports: "139/tcp", latency: 15 },
  { id: "n11", name: "066606", ip: "192.168.3.324", type: "computer", x: 235, y: 260, status: "EXPLOITED", ports: "22,80", latency: 9 },
  { id: "n12", name: "SOKGSST010DE6", ip: "192.182.183.336", type: "computer", x: 135, y: 225, status: "TARGET", ports: "22,443", latency: 16 },
  { id: "n13", name: "SUB-GLOBE", ip: "193.180.2.204", type: "globe", x: 335, y: 245, status: "EXPLOITED", ports: "8080/tcp", latency: 22 },
  { id: "n14", name: "EXT-EXFIL", ip: "103.383.260.200", type: "target-globe", x: 475, y: 120, status: "TARGET", ports: "9001/tcp", latency: 62 },
];

const LINKS = [
  { from: "n1", to: "n2", type: "dashed-amber", animated: true },
  { from: "n2", to: "n3", type: "double-stream", label: "<-- stream -->", animated: true },
  { from: "n3", to: "n4", type: "stream-orange", label: "stream >>", animated: true },
  { from: "n4", to: "n5", type: "dashed-amber", animated: true },
  { from: "n4", to: "n8", type: "solid-green" },
  { from: "n3", to: "n7", type: "solid-green" },
  { from: "n3", to: "n9", type: "dashed-green" },
  { from: "n3", to: "n10", type: "solid-green" },
  { from: "n3", to: "n11", type: "solid-green" },
  { from: "n3", to: "n13", type: "stream-green", label: "<-- sync -->", animated: true },
  { from: "n2", to: "n6", type: "solid-green" },
  { from: "n2", to: "n12", type: "solid-green" },
  { from: "n5", to: "n14", type: "solid-amber" },
];

export const NetworkTopology: React.FC = () => {
  const selectedNode = useStore($hackerTarget);
  const selectedId = selectedNode.id;
  const [packetTick, setPacketTick] = useState(0);
  const phase = useStore($hackerPhase);

  useEffect(() => {
    const interval = setInterval(() => {
      setPacketTick((t) => (t + 1) % 100);
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hacker-topology-container">
      {/* Left Node Registry List (Inspired by screenshot) */}
      <div className="hacker-topology-sidebar">
        <div className="hacker-topology-counter">
          <div className="hacker-counter-line">[ 220 | 12042.29 ]</div>
          <div className="hacker-counter-sub">TARGETS: 14/14 ON</div>
        </div>

        <div className="hacker-topology-list">
          {NODES.map((node, idx) => {
            const isSelected = node.id === selectedId;
            const isTarget = node.type === "target-globe" || node.status === "TARGET";
            return (
              <div
                key={node.id}
                className={`hacker-topology-item ${isSelected ? "hacker-topology-item-selected" : ""} ${isTarget ? "hacker-topology-item-target" : ""}`}
                onClick={() => selectHackerTarget(node)}
              >
                <span className="hacker-topology-idx">{(idx + 1).toString().padStart(2, "0")}.</span>
                <span className="hacker-topology-name">{node.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Network Topology SVG Canvas */}
      <div className="hacker-topology-canvas-wrap">
        <svg
          viewBox="0 0 520 290"
          className="hacker-topology-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Pulsing glow filter */}
            <filter id="topo-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Amber target glow */}
            <filter id="amber-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid Pattern Lines */}
          <g opacity="0.08" stroke="currentColor">
            {Array.from({ length: 9 }).map((_, i) => (
              <line key={`vg-${i}`} x1={i * 60 + 20} y1="0" x2={i * 60 + 20} y2="290" strokeWidth="0.5" />
            ))}
            {Array.from({ length: 5 }).map((_, i) => (
              <line key={`hg-${i}`} x1="0" y1={i * 60 + 20} x2="520" y2={i * 60 + 20} strokeWidth="0.5" />
            ))}
          </g>

          {/* Links / Connections */}
          {LINKS.map((link, idx) => {
            const nFrom = NODES.find((n) => n.id === link.from);
            const nTo = NODES.find((n) => n.id === link.to);
            if (!nFrom || !nTo) return null;

            const isOrange = link.type.includes("orange") || link.type.includes("amber");
            const isDashed = link.type.includes("dashed");
            const strokeColor = isOrange ? "var(--hacker-amber, #ffb000)" : "currentColor";

            // Midpoint for stream text labels
            const midX = (nFrom.x + nTo.x) / 2;
            const midY = (nFrom.y + nTo.y) / 2;

            // Packet pulse position along the line (0.0 to 1.0)
            const speedMultiplier = phase === "injecting" || phase === "transferring" ? 2.5 : 1;
            const packetPos = ((packetTick * speedMultiplier + idx * 25) % 100) / 100;
            const px = nFrom.x + (nTo.x - nFrom.x) * packetPos;
            const py = nFrom.y + (nTo.y - nFrom.y) * packetPos;

            return (
              <g key={`link-${idx}`}>
                {/* Connection line */}
                <line
                  x1={nFrom.x}
                  y1={nFrom.y}
                  x2={nTo.x}
                  y2={nTo.y}
                  stroke={strokeColor}
                  strokeWidth={isOrange ? "1.5" : "1"}
                  strokeDasharray={isDashed ? "3,3" : undefined}
                  opacity={isOrange ? 0.9 : 0.65}
                />

                {/* Animated packet bead */}
                {link.animated && (
                  <circle
                    cx={px}
                    cy={py}
                    r="2.5"
                    fill={strokeColor}
                    filter={isOrange ? "url(#amber-glow)" : "url(#topo-glow)"}
                  />
                )}

                {/* Text stream label */}
                {link.label && (
                  <text
                    x={midX}
                    y={midY - 4}
                    fill={strokeColor}
                    fontSize="7"
                    fontFamily="monospace"
                    textAnchor="middle"
                    opacity="0.8"
                  >
                    {link.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Zigzag lightning wire between Central Gateway and WAN target (as in screenshot) */}
          <path
            d="M 285 155 L 305 130 L 298 112 L 345 80"
            fill="none"
            stroke="var(--hacker-amber, #ffb000)"
            strokeWidth="1.2"
            opacity="0.85"
            strokeDasharray="2,2"
          />

          {/* Nodes */}
          {NODES.map((node) => {
            const isSelected = node.id === selectedId;
            const isTarget = node.type === "target-globe" || node.status === "TARGET";
            const nodeColor = isTarget ? "var(--hacker-amber, #ffb000)" : "currentColor";

            return (
              <g
                key={node.id}
                className="hacker-topo-node-group"
                style={{ cursor: "pointer" }}
                onClick={() => selectHackerTarget(node)}
              >
                {/* Active targeting reticle */}
                {isSelected && (
                  <g transform={`translate(${node.x}, ${node.y})`}>
                    <circle
                      cx="0"
                      cy="0"
                      r="22"
                      fill="none"
                      stroke={isTarget ? "var(--hacker-amber, #ffb000)" : "currentColor"}
                      strokeWidth="1.2"
                      strokeDasharray="4,4"
                      className="hacker-reticle-spin"
                    />
                    <circle
                      cx="0"
                      cy="0"
                      r="26"
                      fill="none"
                      stroke="rgba(255, 60, 60, 0.7)"
                      strokeWidth="0.8"
                      strokeDasharray="2,6"
                    />
                    {/* Targeting corner crosshairs */}
                    <line x1="-30" y1="0" x2="-24" y2="0" stroke="rgba(255, 60, 60, 0.7)" strokeWidth="1" />
                    <line x1="24" y1="0" x2="30" y2="0" stroke="rgba(255, 60, 60, 0.7)" strokeWidth="1" />
                    <line x1="0" y1="-30" x2="0" y2="-24" stroke="rgba(255, 60, 60, 0.7)" strokeWidth="1" />
                    <line x1="0" y1="24" x2="0" y2="30" stroke="rgba(255, 60, 60, 0.7)" strokeWidth="1" />
                  </g>
                )}

                {/* Render by node type */}
                {node.type === "computer" && (
                  <g transform={`translate(${node.x - 11}, ${node.y - 12})`} color={nodeColor}>
                    {/* Monitor frame */}
                    <rect
                      x="0"
                      y="0"
                      width="22"
                      height="15"
                      rx="2"
                      fill="var(--hk-bg-pane, #000)"
                      stroke={nodeColor}
                      strokeWidth="1.2"
                    />
                    {/* Screen inner */}
                    <rect
                      x="2.5"
                      y="2"
                      width="17"
                      height="10"
                      rx="1"
                      fill="rgba(0, 255, 65, 0.08)"
                      stroke={nodeColor}
                      strokeWidth="0.6"
                      opacity="0.9"
                    />
                    {/* Screen terminal prompt */}
                    <path
                      d="M 5 6 L 8 7.5 L 5 9"
                      fill="none"
                      stroke={nodeColor}
                      strokeWidth="0.8"
                    />
                    {/* Stand neck & base */}
                    <line x1="11" y1="15" x2="11" y2="18" stroke={nodeColor} strokeWidth="1.2" />
                    <line x1="6" y1="18" x2="16" y2="18" stroke={nodeColor} strokeWidth="1.2" />
                  </g>
                )}

                {(node.type === "globe" || node.type === "target-globe") && (
                  <g transform={`translate(${node.x}, ${node.y})`} color={nodeColor}>
                    {/* Outer sphere */}
                    <circle
                      cx="0"
                      cy="0"
                      r="13"
                      fill="var(--hk-bg-pane, #000)"
                      stroke={nodeColor}
                      strokeWidth="1.3"
                      filter={isTarget ? "url(#amber-glow)" : undefined}
                    />
                    {/* Equator & Meridian Arcs */}
                    <line x1="-13" y1="0" x2="13" y2="0" stroke={nodeColor} strokeWidth="0.9" />
                    <line x1="-11" y1="-6" x2="11" y2="-6" stroke={nodeColor} strokeWidth="0.6" opacity="0.7" />
                    <line x1="-11" y1="6" x2="11" y2="6" stroke={nodeColor} strokeWidth="0.6" opacity="0.7" />
                    <ellipse cx="0" cy="0" rx="6.5" ry="13" fill="none" stroke={nodeColor} strokeWidth="0.9" />
                    <line x1="0" y1="-13" x2="0" y2="13" stroke={nodeColor} strokeWidth="0.8" />
                  </g>
                )}

                {node.type === "router" && (
                  <g transform={`translate(${node.x}, ${node.y})`}>
                    <circle
                      cx="0"
                      cy="0"
                      r="12"
                      fill="var(--hk-bg-pane, #000)"
                      stroke={isTarget ? "var(--hacker-amber, #ffb000)" : "currentColor"}
                      strokeWidth="1.3"
                    />
                    <circle
                      cx="0"
                      cy="0"
                      r="6"
                      fill="none"
                      stroke={isTarget ? "var(--hacker-amber, #ffb000)" : "currentColor"}
                      strokeWidth="0.8"
                      strokeDasharray="2,2"
                    />
                  </g>
                )}

                {/* IP Label below node */}
                <text
                  x={node.x}
                  y={node.y + 20}
                  fill={nodeColor}
                  fontSize="7.5"
                  fontFamily="monospace"
                  textAnchor="middle"
                  letterSpacing="0.2px"
                  style={{ userSelect: "none" }}
                >
                  {node.ip}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Bottom Target Info HUD */}
        <div className="hacker-topology-hud">
          <span className="hacker-hud-item">
            TARGET: <strong className="hacker-highlight">{selectedNode.ip}</strong>
          </span>
          <span className="hacker-hud-item">
            STATUS:{" "}
            <span
              className={
                selectedNode.status === "TARGET"
                  ? "hacker-alert"
                  : selectedNode.status === "EXPLOITED"
                  ? "hacker-success"
                  : "hacker-highlight"
              }
            >
              {selectedNode.status}
            </span>
          </span>
          <span className="hacker-hud-item">RTT: {selectedNode.latency}ms</span>
          <span className="hacker-hud-item">PORTS: {selectedNode.ports}</span>
        </div>
      </div>
    </div>
  );
};

export default NetworkTopology;
