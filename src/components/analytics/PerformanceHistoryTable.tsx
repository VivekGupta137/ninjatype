import { useState } from "react";
import { useHistory } from "@/hooks/useHistory";
import type { TimeRange } from "@/store/history";
import { ArrowRight, History, ListChecks, Trash2 } from "lucide-react";
import { Card, Chip, ToggleButton, ToggleButtonGroup } from "@heroui/react";
import KeyLink from "@/components/ui/KeyLink";
import "@/styles/results.css";
import HistoryFilters from "./HistoryFilters";
import FilteredStats from "./FilteredStats";
import HistoryTable from "./HistoryTable";
import HistoryProgressChart from "@/components/charts/HistoryProgressChart";
import KeyAnalyticsSection from "./KeyAnalyticsSection";
import HistoryAdvancedStats from "./HistoryAdvancedStats";
import StreakInsights from "./StreakInsights";
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

    const MODES = [
        { id: "all", label: "All modes" },
        { id: "time", label: "Time" },
        { id: "words", label: "Words" },
        { id: "quotes", label: "Quotes" },
    ];

    return (
        <div id="history-container">
            <header className="history-hero">
                <div className="history-hero-text">
                    <h1 className="history-title">History</h1>
                    <p className="history-subtitle">Your practice, over time.</p>
                </div>
                <div className="history-hero-actions">
                    {allSessions.length > 0 && (
                        <Chip size="md" variant="soft"><History size={14} aria-hidden="true" /><Chip.Label>{allSessions.length} {allSessions.length === 1 ? "attempt" : "attempts"} saved</Chip.Label></Chip>
                    )}
                    <KeyLink href="/" variant="primary">Practice again<ArrowRight size={16} aria-hidden="true" /></KeyLink>
                </div>
            </header>

            {allSessions.length > 0 ? (
                <>
                    <div className="history-filter-bar">
                        <HistoryFilters currentFilter={timeRange} onFilterChange={setTimeRange} />
                        <ToggleButtonGroup
                            className="key-group history-mode-group"
                            aria-label="Test mode"
                            selectionMode="single"
                            disallowEmptySelection
                            selectedKeys={new Set([mode])}
                            onSelectionChange={keys => { const v = Array.from(keys)[0] as string | undefined; if (v) setMode(v); }}
                        >
                            {MODES.map(m => <ToggleButton key={m.id} id={m.id} className="key-btn key-btn--ghost">{m.label}</ToggleButton>)}
                        </ToggleButtonGroup>
                    </div>
                    <FilteredStats
                        sessionsCount={filteredStats.sessionsCount}
                        avgWpm={filteredStats.avgWpm}
                        totalTime={formattedTotalTime}
                        avgAccuracy={filteredStats.avgAccuracy}
                        bestWpm={lifetimeStats.bestWpm}
                        todaysBest={lifetimeStats.todaysBest}
                    />
                    <StreakInsights />
                    <HistoryProgressChart sessions={filteredSessions} mode={mode} />
                    <Card className="history-sessions-panel" aria-labelledby="history-sessions-heading">
                        <Card.Header>
                            <div className="res-card-head"><ListChecks size={16} aria-hidden="true" /><Card.Title id="history-sessions-heading">Attempts</Card.Title></div>
                        </Card.Header>
                        <Card.Content>
                            <HistoryTable sessions={filteredSessions} onResetFilters={resetFilters} />
                        </Card.Content>
                    </Card>
                    <KeyAnalyticsSection />
                    <HistoryAdvancedStats sessions={filteredSessions} />
                </>
            ) : (
                <>
                    <StreakInsights />
                    <Card className="history-first-attempt" aria-labelledby="history-empty-title">
                        <Card.Content>
                            <div className="history-empty-keys" aria-hidden="true">
                                <kbd>a</kbd><kbd>s</kbd><kbd>d</kbd><kbd>f</kbd>
                            </div>
                            <h2 id="history-empty-title">No attempts yet</h2>
                            <p>Complete a typing test to start your history.</p>
                            <KeyLink href="/" variant="primary">Start typing<ArrowRight size={16} aria-hidden="true" /></KeyLink>
                        </Card.Content>
                    </Card>
                </>
            )}

            <footer className="history-footer">
                <Chip size="sm" variant="soft"><Chip.Label>Saved in this browser</Chip.Label></Chip>
                {allSessions.length > 0 && (
                    <KeyLink href="/settings/#reset-training-data" variant="ghost" size="sm" className="history-manage">
                        <Trash2 size={14} aria-hidden="true" />Manage history
                    </KeyLink>
                )}
            </footer>
        </div>
    );
};
export default PerformanceHistoryTable;
