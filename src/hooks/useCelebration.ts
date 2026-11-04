import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { $celebration, dismissCelebration } from "@/store/celebrations";

const NOTICE_MS = 8000;
const CONFETTI_MS = 3300;

export function useCelebration() {
    const event = useStore($celebration);
    const [ready, setReady] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(true);
    const [burstId, setBurstId] = useState<string | null>(null);
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);

    useEffect(() => {
        setReady(true);
        const media = window.matchMedia("(prefers-reduced-motion: reduce)");
        const updateMotion = () => setReducedMotion(media.matches);
        updateMotion();
        media.addEventListener("change", updateMotion);
        const clear = () => dismissCelebration();
        const escape = (e: KeyboardEvent) => { if (e.key === "Escape") clear(); };
        // Capture runs before a final input's completion handler publishes the new event.
        document.addEventListener("input", clear, true);
        document.addEventListener("keydown", escape);
        document.addEventListener("astro:before-swap", clear);
        return () => {
            media.removeEventListener("change", updateMotion);
            document.removeEventListener("input", clear, true);
            document.removeEventListener("keydown", escape);
            document.removeEventListener("astro:before-swap", clear);
            clear();
        };
    }, []);

    useEffect(() => {
        if (!event) { setBurstId(null); setHovered(false); setFocused(false); return; }
        const remaining = Math.min(CONFETTI_MS, CONFETTI_MS - (Date.now() - event.createdAt));
        if (remaining <= 0) { setBurstId(null); return; }
        setBurstId(event.id);
        const timer = setTimeout(() => setBurstId(null), remaining);
        return () => clearTimeout(timer);
    }, [event]);

    useEffect(() => {
        if (!event || hovered || focused) return;
        const timer = setTimeout(() => dismissCelebration(event.id), Math.max(0, Math.min(NOTICE_MS, NOTICE_MS - (Date.now() - event.createdAt))));
        return () => clearTimeout(timer);
    }, [event, hovered, focused]);

    return {
        event: ready ? event : null,
        showConfetti: !reducedMotion && !!event && burstId === event.id,
        dismiss: () => event && dismissCelebration(event.id),
        setHovered, setFocused,
    };
}
