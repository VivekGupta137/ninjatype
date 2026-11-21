import { useMemo, useState } from "react";
import { useStore } from "@nanostores/react";
import {
    $keypressAnalytics,
    getAttemptCountForRange,
    getKeyStatsForRange,
    type KeyAnalyticsRange,
} from "@/store/keypressAnalytics";
import KeyAnalyticsHeatmap from "./KeyAnalyticsHeatmap";
import { Card, ToggleButton, ToggleButtonGroup } from "@heroui/react";
import { Keyboard } from "lucide-react";
import "@/styles/results.css";

const RANGE_LABELS: Record<KeyAnalyticsRange, string> = {
    latest: "Latest",
    last5: "Last 5",
    last10: "Last 10",
    overTime: "6 months",
};

const RANGE_ORDER: KeyAnalyticsRange[] = [
    "latest",
    "last5",
    "last10",
    "overTime",
];

const rangeDescription = (range: KeyAnalyticsRange, count: number): string => {
    if (count === 0) return "Complete a typing test to see key analytics.";
    if (range === "latest") return "Latest attempt · all test modes.";
    if (range === "overTime") {
        return `${count} month${count === 1 ? "" : "s"} · all test modes.`;
    }
    return `${count} recent attempts · all test modes.`;
};

const KeyAnalyticsSection = () => {
    const data = useStore($keypressAnalytics);
    const [range, setRange] = useState<KeyAnalyticsRange>("latest");
    const keys = useMemo(() => getKeyStatsForRange(range, data), [range, data]);
    const count = getAttemptCountForRange(range, data);

    return (
        <Card className="history-keys" aria-labelledby="key-analytics-heading">
            <Card.Header>
                <div className="history-progress-heading">
                    <div>
                        <div className="res-card-head"><Keyboard size={16} aria-hidden="true" /><Card.Title id="key-analytics-heading">Key performance</Card.Title></div>
                        <Card.Description>{rangeDescription(range, count)}</Card.Description>
                    </div>
                    <ToggleButtonGroup
                        className="key-group key-analytics-range"
                        aria-label="Key analytics range"
                        selectionMode="single"
                        disallowEmptySelection
                        selectedKeys={new Set([range])}
                        onSelectionChange={keys => { const v = Array.from(keys)[0] as KeyAnalyticsRange | undefined; if (v) setRange(v); }}
                    >
                        {RANGE_ORDER.map(value => <ToggleButton key={value} id={value} className="key-btn key-btn--ghost">{RANGE_LABELS[value]}</ToggleButton>)}
                    </ToggleButtonGroup>
                </div>
            </Card.Header>
            <Card.Content>
                <KeyAnalyticsHeatmap keys={keys} compact showMetricToggle emptyMessage="Complete a typing test to see key analytics." />
            </Card.Content>
        </Card>
    );
};

export default KeyAnalyticsSection;
