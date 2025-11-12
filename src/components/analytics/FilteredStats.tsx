import { ListChecks, Gauge, Clock, Target } from "lucide-react";

type FilteredStatsProps = {
    sessionsCount: number;
    avgWpm: number;
    totalTime: string;
    avgAccuracy: number;
};

const FilteredStats = ({ sessionsCount, avgWpm, totalTime, avgAccuracy }: FilteredStatsProps) => {
    return (
        <div className="filtered-stats">
            <div className="filtered-stat-item">
                <ListChecks size={20} strokeWidth={1.5} className="filtered-stat-icon" />
                <span className="filtered-stat-value">{sessionsCount}</span>
                <span className="filtered-stat-label">sessions</span>
            </div>
            <div className="filtered-stat-divider">|</div>
            <div className="filtered-stat-item">
                <Gauge size={20} strokeWidth={1.5} className="filtered-stat-icon" />
                <span className="filtered-stat-value">{avgWpm}</span>
                <span className="filtered-stat-label">WPM avg</span>
            </div>
            <div className="filtered-stat-divider">|</div>
            <div className="filtered-stat-item">
                <Clock size={20} strokeWidth={1.5} className="filtered-stat-icon" />
                <span className="filtered-stat-value">{totalTime}</span>
                <span className="filtered-stat-label">total</span>
            </div>
            <div className="filtered-stat-divider">|</div>
            <div className="filtered-stat-item">
                <Target size={20} strokeWidth={1.5} className="filtered-stat-icon" />
                <span className="filtered-stat-value">{avgAccuracy}%</span>
                <span className="filtered-stat-label">accuracy</span>
            </div>
        </div>
    );
};

export default FilteredStats;
