import { ArrowUpRight, Check, Flame } from "lucide-react";
import { Popover } from "@heroui/react";
import { useDailyProgress } from "@/hooks/useDailyProgress";

export default function DailyStreak() {
    const progress = useDailyProgress();
    if (!progress) return null;
    return (
        <Popover>
            <Popover.Trigger<"button">
                render={props => <button {...props} type="button" />}
                className="daily-streak"
                data-active={progress.streak > 0}
                data-pending={!progress.completedToday}
                aria-label={`${progress.streak}-day practice streak`}
            >
                <Flame className="daily-streak-flame" size={16} strokeWidth={1.7} aria-hidden="true" />
                <span aria-hidden="true">{progress.streak} <span className="daily-streak-unit">{progress.streak === 1 ? 'day' : 'days'} streak</span></span>
            </Popover.Trigger>
            <Popover.Content className="daily-streak-popover" placement="bottom end" offset={10}>
                <Popover.Dialog className="daily-streak-popover-body" aria-label="Your practice streak">
                    <Popover.Heading className="daily-streak-popover-heading"><Flame size={16} aria-hidden="true" />Practice streak</Popover.Heading>
                    <dl className="daily-streak-popover-stats">
                        <div><dt>Current</dt><dd>{progress.streak}<span>{progress.streak === 1 ? 'day' : 'days'}</span></dd></div>
                        <div><dt>Personal best</dt><dd>{progress.bestStreak}<span>{progress.bestStreak === 1 ? 'day' : 'days'}</span></dd></div>
                    </dl>
                    <p className="daily-streak-popover-today" data-complete={progress.completedToday}>
                        {progress.completedToday && <Check size={14} aria-hidden="true" />}
                        {progress.completedToday ? 'Practised today' : 'Today is still yours'}
                    </p>
                    <p className="daily-streak-popover-help">A test, lesson, or race adds one each day. A fully missed day subtracts one, never below zero.</p>
                    <a className="daily-streak-popover-action" href="/history/#practice-streak">View history & share<ArrowUpRight size={16} aria-hidden="true" /></a>
                </Popover.Dialog>
            </Popover.Content>
        </Popover>
    );
}
