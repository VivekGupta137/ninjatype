import { Card } from "@heroui/react";
import { Clock, Gauge, ListChecks, Target, Trophy, Zap } from "lucide-react";
import { MetricCard } from "./ResultOverview";
import "@/styles/results.css";

type Props = {
    sessionsCount: number;
    avgWpm: number;
    totalTime: string;
    avgAccuracy: number;
    bestWpm: number;
    todaysBest: number;
};
const FilteredStats = ({ sessionsCount, avgWpm, totalTime, avgAccuracy, bestWpm, todaysBest }: Props) => (
    <section className="history-overview" aria-label="Typing overview">
        <div className="history-headline">
            <Card className="res-stat res-stat--lg" data-tone="success">
                <Card.Content>
                    <span className="res-stat-label"><Gauge size={16} />Average WPM</span>
                    <span className="res-stat-value">{sessionsCount ? avgWpm : "—"}</span>
                </Card.Content>
            </Card>
            <Card className="res-stat res-stat--lg" data-tone="primary">
                <Card.Content>
                    <span className="res-stat-label"><Target size={16} />Average accuracy</span>
                    <span className="res-stat-value">{sessionsCount ? <>{avgAccuracy}<small>%</small></> : "—"}</span>
                </Card.Content>
            </Card>
        </div>
        <div className="res-details">
            <MetricCard icon={<ListChecks size={16} />} label="Attempts" value={sessionsCount} />
            <MetricCard icon={<Clock size={16} />} label="Time practiced" value={totalTime} />
            <MetricCard icon={<Trophy size={16} />} label="All-time best" value={bestWpm || "—"} unit="wpm" />
            <MetricCard icon={<Zap size={16} />} label="Today’s best" value={todaysBest || "—"} unit="wpm" />
        </div>
    </section>
);
export default FilteredStats;
