import { useStore } from '@nanostores/react';
import { Flame } from 'lucide-react';
import { Card, Chip } from '@heroui/react';
import { $history } from '@/store/history';
import { useDailyProgress } from '@/hooks/useDailyProgress';
import { streakShareSnapshot } from '@/lib/shareSession';
import ShareResultButton from '@/components/share/ShareResultButton';
import '@/styles/results.css';

export default function StreakInsights({ compact = false }: { compact?: boolean }) {
    const progress = useDailyProgress();
    const history = useStore($history);
    if (!progress || (compact && !progress.completedToday)) return null;
    const snapshot = streakShareSnapshot(history, progress.streak);
    const days = (value: number) => `${value} ${value === 1 ? 'day' : 'days'}`;
    if (compact) {
        return (
            <Card className="res-streak" aria-label="Practice streak insights">
                <Card.Header>
                    <div className="res-streak-head">
                        <Card.Title>Today's practice counts</Card.Title>
                        <Chip size="sm" variant="soft" color="success"><Flame size={12} aria-hidden="true" /><Chip.Label>{days(progress.streak)}</Chip.Label></Chip>
                    </div>
                </Card.Header>
                <Card.Content>
                    <dl className="res-streak-metrics">
                        <div><dt>Current streak</dt><dd>{days(progress.streak)}</dd></div>
                        {snapshot && <div><dt>All-time best</dt><dd>{snapshot.wpm} <span>WPM</span></dd></div>}
                    </dl>
                </Card.Content>
                {snapshot && <Card.Footer><ShareResultButton result={snapshot} label="Share streak" /></Card.Footer>}
            </Card>
        );
    }
    return (
        <Card id="practice-streak" className="res-streak history-streak" aria-label="Practice streak insights">
            <Card.Header>
                <div className="res-streak-head">
                    <div className="res-card-head"><Flame size={16} aria-hidden="true" /><Card.Title>Your daily practice</Card.Title></div>
                    <Chip size="sm" variant="soft" color={progress.completedToday ? "success" : "warning"}>
                        <Chip.Label>{progress.completedToday ? "Practised today" : "Not practised yet today"}</Chip.Label>
                    </Chip>
                </div>
            </Card.Header>
            <Card.Content>
                <dl className="res-streak-metrics res-streak-metrics--3">
                    <div><dt>Current streak</dt><dd>{days(progress.streak)}</dd></div>
                    <div><dt>Best streak</dt><dd>{days(progress.bestStreak)}</dd></div>
                    {snapshot && <div><dt>All-time best speed</dt><dd>{snapshot.wpm} <span>WPM</span></dd></div>}
                </dl>
                <p className="history-streak-note">
                    {progress.completedToday ? "You've practised today. Nicely done." : 'A typing test, lesson, or race adds one day to your streak.'} Each fully missed day subtracts one, down to zero. Your best streak stays saved.
                    {!snapshot && (progress.streak > 0 ? ' Complete a scored typing test to share your streak with your best speed.' : ' Complete a practice session to start a shareable streak.')}
                </p>
            </Card.Content>
            {snapshot && <Card.Footer><ShareResultButton result={snapshot} label="Share streak" /></Card.Footer>}
        </Card>
    );
}
