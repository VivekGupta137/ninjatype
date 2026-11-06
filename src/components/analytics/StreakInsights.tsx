import { useStore } from '@nanostores/react';
import { Flame, Trophy } from 'lucide-react';
import { $history } from '@/store/history';
import { useDailyProgress } from '@/hooks/useDailyProgress';
import { streakShareSnapshot } from '@/lib/shareSession';
import ShareResultButton from '@/components/share/ShareResultButton';
import '@/styles/streak-insights.css';

export default function StreakInsights({ compact = false }: { compact?: boolean }) {
    const progress = useDailyProgress();
    const history = useStore($history);
    if (!progress || (compact && !progress.completedToday)) return null;
    const snapshot = streakShareSnapshot(history, progress.streak);
    const days = (value: number) => `${value} ${value === 1 ? 'day' : 'days'}`;
    return <section id={compact ? undefined : 'practice-streak'} className={`streak-insights${compact ? ' streak-insights--compact' : ''}`} aria-label="Practice streak insights">
        <div className="streak-insights-heading">
            <h2>{compact ? "Today's practice counts" : 'Your daily practice'}</h2>
            {snapshot && <ShareResultButton result={snapshot} label="Share streak" />}
        </div>
        <dl className="streak-insights-metrics">
            <div><dt><Flame size={16} aria-hidden="true" />Current streak</dt><dd>{days(progress.streak)}</dd></div>
            {!compact && <div><dt><Trophy size={16} aria-hidden="true" />Best streak</dt><dd>{days(progress.bestStreak)}</dd></div>}
            {snapshot && <div><dt>All-time best typing speed</dt><dd>{snapshot.wpm} <span>WPM</span></dd></div>}
        </dl>
        {!compact && <>
            <p>{progress.completedToday ? "You've practised today. Nicely done." : 'A typing test, lesson, or race adds one day to your streak.'} Each fully missed day subtracts one, down to zero. Your best streak stays saved.</p>
            {!snapshot && <p>{progress.streak > 0 ? 'Complete a scored typing test to share your streak with your best speed.' : 'Complete a practice session to start a shareable streak.'}</p>}
        </>}
    </section>;
}
