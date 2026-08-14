import { Calendar, Trophy } from "lucide-react";

type LifetimeStatsProps = {
    bestWpm: number;
    todaysBest: number;
};

const LifetimeStats = ({ bestWpm, todaysBest }: LifetimeStatsProps) => {
    return (
        <section className="history-lifetime" aria-label="Lifetime highlights">
            <div className="history-lifetime-grid">
                <article className="history-lifetime-card history-lifetime-card--best">
                    <div className="history-lifetime-card-head">
                        <Trophy
                            className="history-lifetime-icon"
                            size={22}
                            strokeWidth={1.75}
                            aria-hidden="true"
                        />
                        <span className="history-lifetime-label">All-time best</span>
                    </div>
                    <div className="history-lifetime-value">
                        <span className="history-lifetime-number">{bestWpm || "—"}</span>
                        <span className="history-lifetime-unit">WPM</span>
                    </div>
                </article>

                <article className="history-lifetime-card history-lifetime-card--today">
                    <div className="history-lifetime-card-head">
                        <Calendar
                            className="history-lifetime-icon"
                            size={22}
                            strokeWidth={1.75}
                            aria-hidden="true"
                        />
                        <span className="history-lifetime-label">Today&apos;s best</span>
                    </div>
                    <div className="history-lifetime-value">
                        <span className="history-lifetime-number">{todaysBest || "—"}</span>
                        <span className="history-lifetime-unit">WPM</span>
                    </div>
                </article>
            </div>
        </section>
    );
};

export default LifetimeStats;
