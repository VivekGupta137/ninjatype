import { useMemo } from "react";
import type { TypingSession } from "@/store/history";
import { aggregateAdvanced } from "@/lib/advancedStats";
import { AdvancedStatsView } from "./AdvancedStats";
import "@/styles/results.css";

/** Advanced stats averaged/summed over the sessions matching the history filters. */
export default function HistoryAdvancedStats({ sessions }: { sessions: TypingSession[] }) {
    const view = useMemo(() => aggregateAdvanced(sessions.map((s) => s.advanced)), [sessions]);
    if (view.sessions === 0) return null;
    return <div className="history-advanced"><AdvancedStatsView view={view} /></div>;
}
