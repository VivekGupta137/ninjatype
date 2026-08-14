import { useMemo } from "react";
import { useStore } from "@nanostores/react";
import { $keypressEvents } from "@/store/analytics";
import { aggregateKeyStats } from "@/lib/keypressStats";
import KeyAnalyticsHeatmap from "./KeyAnalyticsHeatmap";

const SessionKeyAnalytics = () => {
    const events = useStore($keypressEvents);
    const keys = useMemo(() => aggregateKeyStats(events), [events]);

    return (
        <section className="session-key-analytics" aria-labelledby="session-key-analytics-title">
            <div className="session-key-analytics-header">
                <h2 id="session-key-analytics-title" className="session-key-analytics-title">
                    Key analytics
                </h2>
                <p className="session-key-analytics-desc">
                    Error rate and delay for each key in this attempt.
                </p>
            </div>
            <KeyAnalyticsHeatmap keys={keys} />
        </section>
    );
};

export default SessionKeyAnalytics;
