import { useState } from "react";
import { Card, Chip } from "@heroui/react";
import { ArrowRight } from "lucide-react";
import KeyButton from "@/components/ui/KeyButton";
import { buildKeyDrill } from "@/lib/training/drills";
import type { WeakKey } from "@/lib/training/weakKeys";
import { saveDrill } from "@/store/trainingDrill";

function PriorityKey({ item, pool, day }: { item: WeakKey; pool: string[]; day: string }) {
    const [error, setError] = useState<string | null>(null);
    const drill = buildKeyDrill(item.key, pool, day);
    const label = item.key.toUpperCase();
    const start = () => {
        if (!drill) return;
        const id = saveDrill(drill.text, day, [item.key]);
        if (!id) return setError("Could not save the drill. Check browser storage or make room in My material.");
        window.location.assign(`/my-material/?start=${encodeURIComponent(id)}&from=training`);
    };
    return (
        <li>
            <Card className="trn-priority-card">
                <Card.Content>
                    <div className="trn-priority-head"><h3>Key <kbd className="trn-key">{label}</kbd></h3><div className="trn-priority-reasons">{item.reasons.includes("errors") && <Chip size="sm" variant="soft" color="warning"><Chip.Label>Repeated misses</Chip.Label></Chip>}{item.reasons.includes("slow") && <Chip size="sm" variant="soft" color="warning"><Chip.Label>High delay</Chip.Label></Chip>}</div></div>
                    {item.reasons.includes("slow") && <p className="trn-priority-metric"><strong>{Math.round(item.avgLatencyMs)} ms</strong> average delay <span>vs {Math.round(item.medianLatencyMs)} ms typical for your letters</span></p>}
                    {item.expected > 0 ? <p className="trn-priority-metric"><strong>{Math.round(item.errorRate)}%</strong> error rate <span>{item.errors} misses in {item.expected} targets</span></p> : <p className="acct-note">No target observations recorded for this key.</p>}
                    {drill ? <><p className="trn-step-note">{drill.words} words selected to practise {label}.</p><KeyButton size="sm" onPress={start}>Practice {label}<ArrowRight size={14} aria-hidden="true" /></KeyButton></> : <p className="trn-step-note">Not enough matching words for a single-key drill yet.</p>}
                    {error && <p className="acct-note" role="alert">{error}</p>}
                </Card.Content>
            </Card>
        </li>
    );
}

/** Ordered recommendations based on recent keypresses, not a fixed library. */
export default function PriorityKeys({ focus, pool, day }: { focus: WeakKey[]; pool: string[]; day: string }) {
    return (
        <section className="trn-priority" aria-labelledby="trn-priority-title">
            <div><h2 id="trn-priority-title">Your priority keys</h2><p className="trn-intro">Based on repeated misses and high key delays in up to your last 20 typing sessions. Choose a key to practise on its own.</p></div>
            <ol className="trn-priority-grid" role="list">{focus.map(item => <PriorityKey key={item.key} item={item} pool={pool} day={day} />)}</ol>
        </section>
    );
}
