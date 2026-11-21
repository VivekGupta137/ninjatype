import { useStore } from '@nanostores/react';
import { Flame } from 'lucide-react';
import { Card, Chip } from '@heroui/react';
import { $history } from '@/store/history';
import { useDailyProgress } from '@/hooks/useDailyProgress';
import { streakShareSnapshot } from '@/lib/shareSession';
import ShareResultButton from '@/components/share/ShareResultButton';
import '@/styles/results.css';
import { tr, type LearnLocale } from '@/lib/learnLocale';

export default function StreakInsights({ compact = false, locale = 'en' }: { compact?: boolean; locale?: LearnLocale }) {
    const progress = useDailyProgress();
    const history = useStore($history);
    if (!progress || (compact && !progress.completedToday)) return null;
    const snapshot = streakShareSnapshot(history, progress.streak);
    const days = (value: number) => tr(locale, `${value} ${value === 1 ? 'day' : 'days'}`, `${value} ${value === 1 ? 'Tag' : 'Tage'}`);
    if (compact) {
        return (
            <Card className="res-streak" aria-label={tr(locale, "Practice streak insights", "Streak-Einblicke")}>
                <Card.Header>
                    <div className="res-streak-head">
                        <Card.Title>{tr(locale, "Today's practice counts", 'Heutiges Üben zählt')}</Card.Title>
                        <Chip size="sm" variant="soft" color="success"><Flame size={12} aria-hidden="true" /><Chip.Label>{days(progress.streak)}</Chip.Label></Chip>
                    </div>
                </Card.Header>
                <Card.Content>
                    <dl className="res-streak-metrics">
                        <div><dt>{tr(locale, "Current streak", "Aktuelle Serie")}</dt><dd>{days(progress.streak)}</dd></div>
                        {snapshot && <div><dt>{tr(locale, "All-time best", "Allzeit-Bestwert")}</dt><dd>{snapshot.wpm} <span>WPM</span></dd></div>}
                    </dl>
                </Card.Content>
                {snapshot && <Card.Footer><ShareResultButton result={snapshot} label={tr(locale, "Share streak", "Streak teilen")} /></Card.Footer>}
            </Card>
        );
    }
    return (
        <Card id="practice-streak" className="res-streak history-streak" aria-label={tr(locale, "Practice streak insights", "Streak-Einblicke")}>
            <Card.Header>
                <div className="res-streak-head">
                    <div className="res-card-head"><Flame size={16} aria-hidden="true" /><Card.Title>{tr(locale, "Your daily practice", "Dein tägliches Üben")}</Card.Title></div>
                    <Chip size="sm" variant="soft" color={progress.completedToday ? "success" : "warning"}>
                        <Chip.Label>{progress.completedToday ? tr(locale, "Practised today", "Heute geübt") : tr(locale, "Not practised yet today", "Heute noch nicht geübt")}</Chip.Label>
                    </Chip>
                </div>
            </Card.Header>
            <Card.Content>
                <dl className="res-streak-metrics res-streak-metrics--3">
                    <div><dt>{tr(locale, "Current streak", "Aktuelle Serie")}</dt><dd>{days(progress.streak)}</dd></div>
                    <div><dt>{tr(locale, "Best streak", "Beste Serie")}</dt><dd>{days(progress.bestStreak)}</dd></div>
                    {snapshot && <div><dt>{tr(locale, "All-time best speed", "Allzeit-Bestwert (Tempo)")}</dt><dd>{snapshot.wpm} <span>WPM</span></dd></div>}
                </dl>
                <p className="history-streak-note">
                    {progress.completedToday ? tr(locale, "You've practised today. Nicely done.", "Du hast heute geübt. Gut gemacht.") : tr(locale, 'A typing test, lesson, or race adds one day to your streak.', 'Ein Tipp-Test, eine Lektion oder ein Rennen verlängert deine Serie um einen Tag.')} {tr(locale, 'Each fully missed day subtracts one, down to zero. Your best streak stays saved.', 'Jeder komplett verpasste Tag zieht einen ab, bis null. Deine beste Serie bleibt gespeichert.')}
                    {!snapshot && (progress.streak > 0 ? tr(locale, ' Complete a scored typing test to share your streak with your best speed.', ' Absolviere einen gewerteten Tipp-Test, um deine Serie mit deinem Bestwert zu teilen.') : tr(locale, ' Complete a practice session to start a shareable streak.', ' Absolviere eine Übung, um eine teilbare Serie zu starten.'))}
                </p>
            </Card.Content>
            {snapshot && <Card.Footer><ShareResultButton result={snapshot} label={tr(locale, "Share streak", "Streak teilen")} /></Card.Footer>}
        </Card>
    );
}
