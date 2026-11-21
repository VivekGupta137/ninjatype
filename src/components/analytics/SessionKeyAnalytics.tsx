import { useMemo } from "react";
import { useStore } from "@nanostores/react";
import { $keypressEvents } from "@/store/analytics";
import { aggregateKeyStats } from "@/lib/keypressStats";
import KeyAnalyticsHeatmap from "./KeyAnalyticsHeatmap";
import { tr, type LearnLocale } from "@/lib/learnLocale";

const SessionKeyAnalytics = ({ locale = "en" }: { locale?: LearnLocale }) => {
    const events = useStore($keypressEvents);
    const keys = useMemo(() => aggregateKeyStats(events), [events]);
    return (
        <section
            className="result-panel session-key-analytics"
            aria-label={tr(locale, "Per-key delay and errors", "Verzögerung und Fehler pro Taste")}
        >
            <KeyAnalyticsHeatmap keys={keys} compact />
        </section>
    );
};
export default SessionKeyAnalytics;
