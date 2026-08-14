import { Clock, Gauge, ListChecks, Target } from "lucide-react";

type FilteredStatsProps = {
    sessionsCount: number;
    avgWpm: number;
    totalTime: string;
    avgAccuracy: number;
};

const accuracyTone = (accuracy: number) => {
    if (accuracy >= 96) return "high";
    if (accuracy >= 80) return "mid";
    return "low";
};

const wpmTone = (wpm: number) => {
    if (wpm >= 80) return "elite";
    if (wpm >= 60) return "fast";
    if (wpm >= 40) return "steady";
    return "slow";
};

const FilteredStats = ({
    sessionsCount,
    avgWpm,
    totalTime,
    avgAccuracy,
}: FilteredStatsProps) => {
    const stats = [
        {
            icon: ListChecks,
            value: sessionsCount,
            label: "Sessions",
            title: "Number of completed tests in the selected period",
            valueClass: "history-period-stat-value",
        },
        {
            icon: Gauge,
            value: avgWpm || "—",
            label: "Avg WPM",
            title: "Average words per minute across this period",
            valueClass: `history-period-stat-value history-period-stat-value--wpm history-period-stat-value--${wpmTone(avgWpm)}`,
        },
        {
            icon: Clock,
            value: totalTime,
            label: "Time typed",
            title: "Total active typing time in this period",
            valueClass: "history-period-stat-value",
        },
        {
            icon: Target,
            value: avgAccuracy ? `${avgAccuracy}%` : "—",
            label: "Avg accuracy",
            title: "Average accuracy across this period",
            valueClass: `history-period-stat-value history-period-stat-value--acc history-period-stat-value--${accuracyTone(avgAccuracy)}`,
        },
    ];

    return (
        <div className="history-period-stats">
            {stats.map(({ icon: Icon, value, label, title, valueClass }) => (
                <div key={label} className="history-period-stat" title={title}>
                    <Icon
                        size={18}
                        strokeWidth={1.75}
                        className="history-period-stat-icon"
                        aria-hidden="true"
                    />
                    <span className={valueClass}>{value}</span>
                    <span className="history-period-stat-label">{label}</span>
                </div>
            ))}
        </div>
    );
};

export default FilteredStats;
