import { useEffect, useMemo, useRef, useState } from "react";
import type { Sponsor } from "@/lib/sponsors";
import { SLOT_MS, activeAt, buildSchedule, dayKey, msToNextSlot, withUtm } from "@/lib/sponsorRotation";
import "@/styles/ui.css";

export type { Sponsor };

interface Props {
    sponsors: Sponsor[];
    /** UTM campaign, e.g. "header" or "results". */
    slot: string;
    /** Time each sponsor is shown. */
    interval?: number;
    label?: string;
    className?: string;
}

/**
 * Minimal sponsor carousel: autoplay, crossfade, no controls. Pauses on hover,
 * focus and touch. Follows the wall clock with a daily seeded order and weights (see lib/sponsorRotation).
 */
export default function SponsorCarousel({ sponsors, slot, interval = SLOT_MS, label = "Sponsored", className = "" }: Props) {
    const count = sponsors.length;
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [mounted, setMounted] = useState(false);
    const touchTimer = useRef<number | undefined>(undefined);

    // Clock-dependent, so computed after mount to keep server and client markup equal.
    const schedule = useMemo(() => (mounted ? buildSchedule(sponsors, dayKey()) : []), [mounted, sponsors]);

    useEffect(() => {
        setMounted(true);
        const onVis = () => setHidden(document.hidden);
        onVis();
        document.addEventListener("visibilitychange", onVis);
        return () => { document.removeEventListener("visibilitychange", onVis); window.clearTimeout(touchTimer.current); };
    }, []);

    // Follows the wall clock (same sponsor for every visitor at the same moment); holds while paused or hidden.
    useEffect(() => {
        if (!mounted || count === 0) return;
        if (!paused && !hidden) setIndex(activeAt(schedule, Date.now(), interval));
        if (count <= 1 || paused || hidden) return;
        const id = window.setTimeout(() => setIndex(activeAt(schedule, Date.now(), interval)), msToNextSlot(Date.now(), interval));
        return () => window.clearTimeout(id);
    }, [mounted, schedule, count, paused, hidden, interval, index]);

    if (count === 0) return null;

    // Touch has no hover: hold the current sponsor briefly after a tap.
    const onTouch = () => {
        setPaused(true);
        window.clearTimeout(touchTimer.current);
        touchTimer.current = window.setTimeout(() => setPaused(false), 8000);
    };

    return (
        <aside
            className={`spc ${className}`}
            aria-label={label}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            onTouchStart={onTouch}
        >
            <div className="spc-stage" aria-live="off">
                {sponsors.map((s, i) => {
                    const active = i === index;
                    return (
                        <a
                            key={s.name}
                            className="spc-card"
                            data-active={active}
                            href={withUtm(s.url, slot)}
                            target="_blank"
                            rel="sponsored nofollow noopener noreferrer"
                            tabIndex={active ? 0 : -1}
                            aria-hidden={!active}
                        >
                            {s.logo
                                ? <img className="spc-logo" src={s.logo} alt="" width={28} height={28} />
                                : <span className="spc-logo spc-mono" aria-hidden="true">{s.name.charAt(0)}</span>}
                            <em className="spc-label">{label}</em>
                            <span className="spc-copy">
                                <strong>{s.name}</strong>
                                <span>{s.description}</span>
                            </span>
                            <span className="spc-cta" aria-hidden="true">↗</span>
                        </a>
                    );
                })}
            </div>
        </aside>
    );
}
