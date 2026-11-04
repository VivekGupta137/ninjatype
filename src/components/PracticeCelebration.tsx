import { Flame, Trophy, X } from "lucide-react";
import type { CSSProperties } from "react";
import { confettiParticles } from "@/lib/celebrations";
import { useCelebration } from "@/hooks/useCelebration";

const particles = confettiParticles();

export default function PracticeCelebration() {
    const { event, showConfetti, dismiss, setHovered, setFocused } = useCelebration();
    const announcement = event ? [
        event.streak !== undefined ? `+1 added to your daily streak. ${event.streak} ${event.streak === 1 ? "day" : "days"}.` : "",
        event.record ? `Congratulations! New personal best: ${event.record.wpm} WPM, up from ${event.record.previousWpm} WPM.` : "",
    ].filter(Boolean).join(" ") : "";
    return (
        <>
            <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announcement}</div>
            {event && <>
                {showConfetti && <div key={event.id} className="practice-confetti" aria-hidden="true">
                    {particles.map((piece, index) => <i key={index} data-color={piece.color} style={{
                        left: `${piece.x}%`,
                        "--confetti-drift": `${piece.drift}vw`,
                        "--confetti-rotation": `${piece.rotation}deg`,
                        animationDelay: `${piece.delay}ms`,
                        animationDuration: `${piece.duration}ms`,
                    } as CSSProperties} />)}
                </div>}
                <aside className="practice-celebration" aria-label="Practice achievement"
                    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
                    onFocusCapture={() => setFocused(true)} onBlurCapture={e => {
                        if (!(e.relatedTarget instanceof Node) || !e.currentTarget.contains(e.relatedTarget)) setFocused(false);
                    }}>
                    <div className="practice-celebration-copy">
                        {event.streak !== undefined && <div className="practice-celebration-item">
                            <Flame size={20} strokeWidth={1.7} aria-hidden="true" />
                            <div><strong>+1 added to your daily streak</strong><p>{event.streak} {event.streak === 1 ? "day" : "days"} · today's practice is complete.</p></div>
                        </div>}
                        {event.record && <div className="practice-celebration-item">
                            <Trophy size={20} strokeWidth={1.7} aria-hidden="true" />
                            <div><strong>New personal best!</strong><p>Congratulations on breaking your record.</p><p className="practice-celebration-score">{event.record.previousWpm} → {event.record.wpm} WPM</p></div>
                        </div>}
                    </div>
                    <button type="button" onClick={dismiss} aria-label="Dismiss celebration" className="practice-celebration-close"><X size={16} aria-hidden="true" /></button>
                </aside>
            </>}
        </>
    );
}
