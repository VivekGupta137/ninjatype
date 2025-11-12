import { Trophy, Calendar } from "lucide-react";

type LifetimeStatsProps = {
    /** All-time best WPM across all sessions */
    bestWpm: number;
    /** Best WPM achieved today */
    todaysBest: number;
};

/**
 * Displays lifetime achievement statistics
 * Shows all-time best and today's best WPM with icons
 */
const LifetimeStats = ({ bestWpm, todaysBest }: LifetimeStatsProps) => {
    return (
        <div className="top-stats">
            <div className="top-stat-item">
                <Trophy className="top-stat-icon" size={32} strokeWidth={1.5} />
                <div className="top-stat-value">{bestWpm || "-"}</div>
                <div className="top-stat-unit">WPM</div>
                <div className="top-stat-label">all-time best</div>
            </div>
            <div className="top-stat-divider"></div>
            <div className="top-stat-item">
                <Calendar className="top-stat-icon" size={32} strokeWidth={1.5} />
                <div className="top-stat-value">{todaysBest || "-"}</div>
                <div className="top-stat-unit">WPM</div>
                <div className="top-stat-label">today's best</div>
            </div>
        </div>
    );
};

export default LifetimeStats;
