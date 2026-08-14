import { useState } from "react";
import { useHistory } from "@/hooks/useHistory";
import type { TimeRange } from "@/store/history";
import { ArrowRight, ShieldCheck } from "lucide-react";
import LifetimeStats from "./LifetimeStats";
import HistoryFilters, { TIME_RANGE_LABELS } from "./HistoryFilters";
import FilteredStats from "./FilteredStats";
import HistoryTable from "./HistoryTable";
import DeleteHistoryButton from "./DeleteHistoryButton";
import KeyAnalyticsSection from "./KeyAnalyticsSection";

/**
 * Main container for the typing history page.
 * Sections: hero → lifetime highlights → period overview → session log → manage data.
 */
const PerformanceHistoryTable = () => {
    const [timeRange, setTimeRange] = useState<TimeRange>("all");
    const {
        filteredSessions,
        lifetimeStats,
        filteredStats,
        formattedTotalTime,
    } = useHistory(timeRange);

    return (
        <div id="history-container">
            <header className="history-hero">
                <div className="history-hero-text">
                    <h1 className="history-title">Typing History</h1>
                    <p className="history-subtitle">
                        Review past attempts, spot trends, and track personal bests.
                    </p>
                    <p className="history-privacy-note">
                        <ShieldCheck size={15} aria-hidden="true" />
                        <span>Stored locally in your browser — never sent to a server</span>
                    </p>
                </div>
                <a href="/" className="history-practice-btn" aria-label="Go to typing practice">
                    Practice
                    <ArrowRight size={16} aria-hidden="true" />
                </a>
            </header>

            <LifetimeStats
                bestWpm={lifetimeStats.bestWpm}
                todaysBest={lifetimeStats.todaysBest}
            />

            <section className="history-period-panel" aria-labelledby="history-period-heading">
                <div className="history-period-header">
                    <div className="history-period-intro">
                        <h2 id="history-period-heading" className="history-section-title">
                            Period overview
                        </h2>
                        <p className="history-section-desc">
                            Stats for{" "}
                            <strong>{TIME_RANGE_LABELS[timeRange].toLowerCase()}</strong>
                        </p>
                    </div>
                    <HistoryFilters
                        currentFilter={timeRange}
                        onFilterChange={setTimeRange}
                    />
                </div>

                <FilteredStats
                    sessionsCount={filteredStats.sessionsCount}
                    avgWpm={filteredStats.avgWpm}
                    totalTime={formattedTotalTime}
                    avgAccuracy={filteredStats.avgAccuracy}
                />
            </section>

            <KeyAnalyticsSection />

            <section className="history-sessions-panel" aria-labelledby="history-sessions-heading">
                <div className="history-sessions-header">
                    <h2 id="history-sessions-heading" className="history-section-title">
                        Sessions
                    </h2>
                    {filteredSessions.length > 0 && (
                        <span className="history-sessions-count">
                            {filteredSessions.length}{" "}
                            {filteredSessions.length === 1 ? "result" : "results"}
                        </span>
                    )}
                </div>

                <HistoryTable
                    sessions={filteredSessions}
                    timeRangeLabel={TIME_RANGE_LABELS[timeRange]}
                />
            </section>

            <footer className="history-footer">
                <DeleteHistoryButton
                    href="settings/#reset-settings"
                    text="Clear history"
                    showContainer={false}
                />
            </footer>
        </div>
    );
};

export default PerformanceHistoryTable;
