import { useState } from "react";
import { useHistory } from "@/hooks/useHistory";
import type { TimeRange } from "@/store/history";
import { ArrowRight } from "lucide-react";
import HistoryFilters from "./HistoryFilters";
import FilteredStats from "./FilteredStats";
import HistoryTable from "./HistoryTable";
import DeleteHistoryButton from "./DeleteHistoryButton";
import HistoryProgressChart from "@/components/charts/HistoryProgressChart";
import KeyAnalyticsSection from "./KeyAnalyticsSection";
import "@/styles/history.css";

const PerformanceHistoryTable = () => {
    const [mode, setMode] = useState("all");
    const [timeRange, setTimeRange] = useState<TimeRange>("all");
    const {
        allSessions,
        filteredSessions,
        lifetimeStats,
        filteredStats,
        formattedTotalTime,
    } = useHistory(timeRange, mode);
    const resetFilters = () => {
        setMode("all");
        setTimeRange("all");
    };

    return (
        <div id="history-container">
            <header className="history-hero">
                <div className="history-hero-text">
                    <h1 className="history-title">History</h1>
                    <p className="history-subtitle">
                        Your practice, over time.
                    </p>
                </div>
                <a href="/" className="history-practice-btn">
                    Practice again <ArrowRight size={16} aria-hidden="true" />
                </a>
            </header>

            {allSessions.length > 0 ? (
                <>
                    <div className="history-filter-bar">
                        <HistoryFilters
                            currentFilter={timeRange}
                            onFilterChange={setTimeRange}
                        />
                        <label className="history-mode-filter">
                            <span className="sr-only">Test mode</span>
                            <select
                                aria-label="Test mode"
                                value={mode}
                                onChange={(event) =>
                                    setMode(event.target.value)
                                }
                            >
                                <option value="all">All modes</option>
                                <option value="time">Time</option>
                                <option value="words">Words</option>
                                <option value="quotes">Quotes</option>
                            </select>
                        </label>
                    </div>
                    <FilteredStats
                        sessionsCount={filteredStats.sessionsCount}
                        avgWpm={filteredStats.avgWpm}
                        totalTime={formattedTotalTime}
                        avgAccuracy={filteredStats.avgAccuracy}
                        bestWpm={lifetimeStats.bestWpm}
                        todaysBest={lifetimeStats.todaysBest}
                    />
                    <HistoryProgressChart
                        sessions={filteredSessions}
                        mode={mode}
                    />
                    <section
                        className="history-sessions-panel"
                        aria-labelledby="history-sessions-heading"
                    >
                        <h2
                            id="history-sessions-heading"
                            className="history-section-title"
                        >
                            Attempts
                        </h2>
                        <HistoryTable
                            sessions={filteredSessions}
                            onResetFilters={resetFilters}
                        />
                    </section>
                    <KeyAnalyticsSection />
                </>
            ) : (
                <section
                    className="history-first-attempt"
                    aria-labelledby="history-empty-title"
                >
                    <div className="history-empty-keys" aria-hidden="true">
                        <kbd>a</kbd>
                        <kbd>s</kbd>
                        <kbd>d</kbd>
                        <kbd>f</kbd>
                    </div>
                    <h2 id="history-empty-title">No attempts yet</h2>
                    <p>Complete a typing test to start your history.</p>
                </section>
            )}

            <footer className="history-footer">
                <span>Saved in this browser.</span>
                {allSessions.length > 0 && (
                    <DeleteHistoryButton
                        href="/settings/#reset-training-data"
                        text="Manage history"
                        showContainer={false}
                    />
                )}
            </footer>
        </div>
    );
};
export default PerformanceHistoryTable;
