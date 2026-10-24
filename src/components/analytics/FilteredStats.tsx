type Props = {
    sessionsCount: number;
    avgWpm: number;
    totalTime: string;
    avgAccuracy: number;
    bestWpm: number;
    todaysBest: number;
};
const FilteredStats = ({
    sessionsCount,
    avgWpm,
    totalTime,
    avgAccuracy,
    bestWpm,
    todaysBest,
}: Props) => (
    <section className="history-overview" aria-label="Typing overview">
        <dl className="result-speed-metrics history-headline-metrics">
            <div data-tone="success">
                <dt>Average WPM</dt>
                <dd>{sessionsCount ? avgWpm : "—"}</dd>
            </div>
            <div data-tone="primary">
                <dt>Average accuracy</dt>
                <dd>
                    {sessionsCount ? (
                        <>
                            {avgAccuracy}
                            <span>%</span>
                        </>
                    ) : (
                        "—"
                    )}
                </dd>
            </div>
        </dl>
        <dl className="history-summary-metrics">
            <div>
                <dt>Attempts</dt>
                <dd>{sessionsCount}</dd>
            </div>
            <div>
                <dt>Time practiced</dt>
                <dd>{totalTime}</dd>
            </div>
            <div>
                <dt>All-time best</dt>
                <dd>
                    {bestWpm || "—"}
                    <span> wpm</span>
                </dd>
            </div>
            <div>
                <dt>Today’s best</dt>
                <dd>
                    {todaysBest || "—"}
                    <span> wpm</span>
                </dd>
            </div>
        </dl>
    </section>
);
export default FilteredStats;
