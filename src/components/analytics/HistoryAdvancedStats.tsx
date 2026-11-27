import { useMemo } from "react";
import { Card } from "@heroui/react";
import { Gauge } from "lucide-react";
import type { TypingSession } from "@/store/history";
import { aggregateAdvanced } from "@/lib/advancedStats";
import { AdvancedStatsView } from "./AdvancedStats";
import "@/styles/results.css";

/** Advanced stats averaged/summed over the sessions matching the history filters. */
export default function HistoryAdvancedStats({ sessions }: { sessions: TypingSession[] }) {
    const view = useMemo(() => aggregateAdvanced(sessions.map((s) => s.advanced)), [sessions]);
    return (
        <div className="history-advanced" aria-labelledby="advanced-stats-heading">
            <Card>
                <Card.Header>
                    <div className="res-card-head"><Gauge size={16} aria-hidden="true" /><Card.Title id="advanced-stats-heading">Advanced stats</Card.Title></div>
                    <Card.Description>
                        {view.sessions === 0
                            ? "Complete a typing test to see rhythm, burst pace, error types and finger load."
                            : `Across ${view.sessions} filtered ${view.sessions === 1 ? "attempt" : "attempts"}: rhythm and pace are averages; error types and finger load are totals. Attempts saved before this feature are not included.`}
                    </Card.Description>
                </Card.Header>
            </Card>
            {view.sessions > 0 && <AdvancedStatsView view={view} />}
        </div>
    );
}
