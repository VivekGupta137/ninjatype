import { useId } from "react";
import { type FingerId, type FingerLoad } from "@/lib/advancedStats";
import { tr, type LearnLocale } from "@/lib/learnLocale";
import "@/styles/results.css";

type FingerShape = { key: "thumb" | "index" | "middle" | "ring" | "pinky"; x: number; y: number; angle: number; length: number; region: string };
// Each fill follows the same outer contour as the hand and closes with a curved base.
// Rotated rectangles leave diagonal slivers; gradients make those look like shadows.
const FINGERS: FingerShape[] = [
    { key: "thumb", x: 94, y: 208, angle: -55, length: 96, region: "M81 193 C77 194 64 182 61 177 C57 172 59 168 54 163 C43 153 29 154 18 159 C14 161 12 163 14 168 C27 177 35 186 42 196 Q59 210 81 193 Z" },
    { key: "index", x: 111, y: 145, angle: -12, length: 104, region: "M96 165 C97 149 92 119 88 100 L80 57 C79 48 83 40 91 42 C96 42 99 43 101 53 L110 85 C113 99 120 131 125 133 Q116 153 96 165 Z" },
    { key: "middle", x: 144, y: 142, angle: 3, length: 127, region: "M125 133 C129 135 131 121 133 107 L135 75 C138 54 139 35 141 24 C143 18 148 14 154 15 C160 16 164 22 163 31 L160 97 C160 109 158 134 165 139 Q145 154 125 133 Z" },
    { key: "ring", x: 164, y: 158, angle: 14, length: 117, region: "M165 139 C166 133 168 122 171 111 C178 91 178 74 188 56 C191 48 192 44 200 44 C208 43 212 50 209 64 L199 134 C197 142 192 159 195 158 Q177 174 165 139 Z" },
    { key: "pinky", x: 194, y: 180, angle: 37, length: 98, region: "M195 158 C197 158 201 154 207 150 L232 117 C236 112 236 106 245 103 C253 99 262 109 254 121 C248 132 242 146 233 155 C224 164 217 177 215 187 Q202 183 195 158 Z" },
];
// A continuous, lightly irregular contour: long splayed fingers and a curved thumb web.
// Keep the interior simple, like a hand-drawn outline, rather than a segmented glove.
const SILHOUETTE = "M123 298 C155 295 202 282 206 275 C207 272 200 265 200 255 C199 248 204 245 206 237 L215 187 C217 177 224 164 233 155 C242 146 248 132 254 121 C262 109 253 99 245 103 C236 106 236 112 232 117 L207 150 C201 154 197 158 195 158 C192 159 197 142 199 134 L209 64 C212 50 208 43 200 44 C192 44 191 48 188 56 C178 74 178 91 171 111 C168 122 166 133 165 139 C158 134 160 109 160 97 L163 31 C164 22 160 16 154 15 C148 14 143 18 141 24 C139 35 138 54 135 75 L133 107 C131 121 129 135 125 133 C120 131 113 99 110 85 L101 53 C99 43 96 42 91 42 C83 40 79 48 80 57 L88 100 C92 119 97 149 96 165 C95 178 89 187 81 193 C77 194 64 182 61 177 C57 172 59 168 54 163 C43 153 29 154 18 159 C14 161 12 163 14 168 C27 177 35 186 42 196 C48 203 53 213 57 226 C60 237 77 245 84 254 L102 274 L113 282 Z";
const IDS: Record<"left" | "right", Record<FingerShape["key"], FingerId>> = {
    left: { thumb: "thumb", index: "L2", middle: "L3", ring: "L4", pinky: "L5" },
    right: { thumb: "thumb", index: "R2", middle: "R3", ring: "R4", pinky: "R5" },
};
const LABELS: Record<FingerId, [string, string]> = {
    L5: ["Left pinky", "Linker Kleiner"], L4: ["Left ring", "Linker Ring"], L3: ["Left middle", "Linker Mittel"], L2: ["Left index", "Linker Zeige"],
    thumb: ["Thumbs", "Daumen"], R2: ["Right index", "Rechter Zeige"], R3: ["Right middle", "Rechter Mittel"], R4: ["Right ring", "Rechter Ring"], R5: ["Right pinky", "Rechter Kleiner"],
};

// Match keyStatus's "Weak" error threshold: 0% is success, 20%+ is error.
const ERROR_RATE_CEILING = 20;

/** Outlined hands with error-rate tints; the numbers also communicate all color data. */
export default function HandsChart({ fingers, locale }: { fingers: FingerLoad[]; locale: LearnLocale }) {
    const uid = useId().replace(/:/g, "");
    const byId = new Map(fingers.map((finger) => [finger.finger, finger]));

    return (
        <figure className="adv-hands">
            <div className="adv-hands-pair">
                {(["left", "right"] as const).map((side) => {
                    const clipId = `${uid}-${side}-contour`;
                    const mirror = side === "left";
                    const handName = mirror ? tr(locale, "Left hand", "Linke Hand") : tr(locale, "Right hand", "Rechte Hand");
                    const items = FINGERS.map((shape) => {
                        const id = IDS[side][shape.key];
                        const finger = byId.get(id);
                        const angle = shape.angle * Math.PI / 180;
                        const errorMix = Math.min(100, Math.max(0, (finger?.errorRate ?? 0) / ERROR_RATE_CEILING * 100));
                        return {
                            shape, id, finger,
                            name: tr(locale, LABELS[id][0], LABELS[id][1]),
                            x: shape.x + Math.sin(angle) * shape.length,
                            y: shape.y - Math.cos(angle) * shape.length,
                            fill: `color-mix(in srgb, var(--error-color) ${errorMix}%, var(--success-color))`,
                            opacity: finger && (finger.presses > 0 || finger.errors > 0) ? 0.65 : 0,
                        };
                    });
                    return (
                        <div className="adv-hand" key={side}>
                            <svg viewBox="-60 -30 390 350" role="img" aria-labelledby={`${uid}-${side}-name`}>
                                <defs>
                                    <clipPath id={clipId}><path d={SILHOUETTE} /></clipPath>
                                </defs>
                                <g transform={mirror ? "translate(270 0) scale(-1 1)" : undefined}>
                                    <g clipPath={`url(#${clipId})`}>
                                        {items.map(({ id, shape, fill, opacity, name, finger }) => (
                                            <path key={id} d={shape.region} className="adv-hand-fill" fill={fill} fillOpacity={opacity}>
                                                <title>{`${name}: ${Math.round((finger?.share ?? 0) * 100)}% · ${(finger?.errorRate ?? 0).toFixed(0)}% ${tr(locale, "errors", "Fehler")} · ${finger?.avgLatencyMs ?? 0} ms`}</title>
                                            </path>
                                        ))}
                                    </g>
                                    <path d={SILHOUETTE} className="adv-hand-outline" />
                                </g>
                                {items.map(({ id, shape, x, y, finger }) => {
                                    const thumb = shape.key === "thumb";
                                    const labelX = mirror ? 270 - x : x;
                                    const textX = labelX + (thumb ? (mirror ? 16 : -16) : 0);
                                    return (
                                        <text key={id} x={textX} y={y - (thumb ? 5 : 24)} textAnchor={thumb ? (mirror ? "start" : "end") : "middle"}>
                                            <tspan x={textX} className="adv-hand-pct">{Math.round((finger?.share ?? 0) * 100)}%</tspan>
                                            <tspan x={textX} dy="15" className="adv-hand-err">{(finger?.errorRate ?? 0).toFixed(0)}% {tr(locale, "err", "Fehl.")}</tspan>
                                        </text>
                                    );
                                })}
                            </svg>
                            <p className="adv-hand-name" id={`${uid}-${side}-name`}>{handName}</p>
                        </div>
                    );
                })}
            </div>
            <figcaption className="adv-hands-note">{tr(locale, "Fill: error rate (0–20%+) · bold: keystroke share · below: error rate", "Farbe: Fehlerrate (0–20%+) · fett: Anschlagsanteil · darunter: Fehlerrate")}</figcaption>
            <p className="sr-only">
                {fingers.map((finger) => `${tr(locale, LABELS[finger.finger][0], LABELS[finger.finger][1])}: ${Math.round(finger.share * 100)}%, ${finger.errorRate.toFixed(0)}% ${tr(locale, "errors", "Fehler")}, ${finger.avgLatencyMs} ms.`).join(" ")}
            </p>
        </figure>
    );
}
