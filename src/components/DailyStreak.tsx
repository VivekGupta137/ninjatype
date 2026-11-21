import { ArrowUpRight, Check, Flame } from "lucide-react";
import { Chip, Popover } from "@heroui/react";
import { useDailyProgress } from "@/hooks/useDailyProgress";

export default function DailyStreak() {
    const progress = useDailyProgress();
    if (!progress) return null;
    // success: practised today · warning: not practised yet today
    const status = progress.completedToday ? "success" : "warning";
    const unit = progress.streak === 1 ? "day" : "days";
    return (
        <Popover>
            <Popover.Trigger<"button">
                render={props => <button {...props} type="button" />}
                className="daily-streak"
                data-status={status}
                aria-label={`${progress.streak}-day practice streak${status === "warning" ? ", not practised yet today" : ", practised today"}`}
            >
                <Chip size="md" variant="soft" color={status} className="daily-streak-chip">
                    <Flame className="daily-streak-flame" size={14} strokeWidth={1.8} aria-hidden="true" />
                    <Chip.Label><span aria-hidden="true">{progress.streak}<span className="daily-streak-unit"> {unit} streak</span></span></Chip.Label>
                </Chip>
            </Popover.Trigger>
            <Popover.Content className="daily-streak-popover" placement="bottom end" offset={10}>
                <Popover.Dialog className="daily-streak-popover-body" aria-label="Your practice streak">
                    <Popover.Heading className="daily-streak-popover-heading"><Flame size={16} aria-hidden="true" />Practice streak</Popover.Heading>
                    <dl className="daily-streak-popover-stats">
                        <div><dt>Current</dt><dd>{progress.streak}<span>{progress.streak === 1 ? 'day' : 'days'}</span></dd></div>
                        <div><dt>Personal best</dt><dd>{progress.bestStreak}<span>{progress.bestStreak === 1 ? 'day' : 'days'}</span></dd></div>
                    </dl>
                    <p className="daily-streak-popover-today" data-complete={progress.completedToday} data-status={status}>
                        {progress.completedToday && <Check size={14} aria-hidden="true" />}
                        {progress.completedToday ? 'Practised today' : progress.streak > 0 ? 'Practise today to keep your streak' : 'Practise today to start a streak'}
                    </p>
                    <p className="daily-streak-popover-help">A test, lesson, or race adds one each day. A fully missed day subtracts one, never below zero.</p>
                    <a className="daily-streak-popover-action" href="/history/#practice-streak">View history & share<ArrowUpRight size={16} aria-hidden="true" /></a>
                </Popover.Dialog>
            </Popover.Content>
        </Popover>
    );
}
