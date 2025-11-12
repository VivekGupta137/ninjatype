import type { TypingSession } from "@/store/history";
import { BarChart3, ArrowRight } from "lucide-react";

type HistoryTableProps = {
    /** Array of typing sessions to display */
    sessions: TypingSession[];
};

/**
 * Formats a timestamp into a human-readable date and time string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted string like "Today, 3:45 PM" or "Nov 12, 3:45 PM"
 */
const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    const timeStr = date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
    
    if (isToday) {
        return `Today, ${timeStr}`;
    }
    
    const dateStr = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
    });
    return `${dateStr}, ${timeStr}`;
};

/**
 * Formats duration in seconds to a readable string
 * @param seconds - Duration in seconds
 * @returns Formatted string like "2m 30s" or "45s"
 */
const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
};

/**
 * Table component displaying typing session history
 * Shows sessions in a responsive table that converts to cards on mobile
 */
const HistoryTable = ({ sessions }: HistoryTableProps) => {

    if (sessions.length === 0) {
        return (
            <div className="history-empty-state">
                <BarChart3 size={64} strokeWidth={1} className="empty-icon" />
                <div className="empty-text">No typing sessions found</div>
                <div className="empty-subtext">
                    Start typing to track your progress!
                </div>
                <a href="/" className="empty-cta">
                    Go to Practice <ArrowRight size={16} />
                </a>
            </div>
        );
    }

    return (
        <div className="history-table-container">
            <table className="history-table">
                <thead>
                    <tr>
                        <th>Date & Time</th>
                        <th>WPM</th>
                        <th>CPM</th>
                        <th>Accuracy</th>
                        <th>Errors</th>
                        <th>Duration</th>
                    </tr>
                </thead>
                <tbody>
                    {sessions.map((session, index) => (
                        <tr key={`${session.timestamp}-${index}`} className="history-row">
                            <td className="history-datetime" data-label="Date & Time">
                                {formatDate(session.timestamp)}
                            </td>
                            <td className="history-wpm" data-label="WPM">{session.wpm}</td>
                            <td className="history-cpm" data-label="CPM">{session.cpm}</td>
                            <td className="history-accuracy" data-label="Accuracy">{session.accuracy}%</td>
                            <td className="history-errors" data-label="Errors">{session.errors}</td>
                            <td className="history-duration" data-label="Duration">
                                {formatDuration(session.duration)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default HistoryTable;
