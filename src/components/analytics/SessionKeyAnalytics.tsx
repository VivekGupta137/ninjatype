import { useMemo } from "react";
import { useStore } from "@nanostores/react";
import { $keypressEvents } from "@/store/analytics";
import { aggregateKeyStats } from "@/lib/keypressStats";
import KeyAnalyticsHeatmap from "./KeyAnalyticsHeatmap";

const SessionKeyAnalytics = () => {
    const events = useStore($keypressEvents);
    const keys = useMemo(() => aggregateKeyStats(events), [events]);
    return (
        <section
            className="result-panel session-key-analytics"
            aria-label="Per-key delay and errors"
        >
            <KeyAnalyticsHeatmap keys={keys} compact />
        </section>
    );
};
export default SessionKeyAnalytics;
