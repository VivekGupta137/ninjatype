import { Flame } from "lucide-react";
import { Tooltip } from "@heroui/react";
import { useDailyProgress } from "@/hooks/useDailyProgress";

export default function DailyStreak() {
    const progress = useDailyProgress();
    if (!progress) return null;
    const description = `${progress.streak}-day practice streak. ` + (progress.completedToday
        ? "You've practised today."
        : "Complete a practice session today to keep your streak going.");
    return (
        <Tooltip delay={150} closeDelay={80}>
            <Tooltip.Trigger<"button">
                render={props => <button {...props} type="button" />}
                className="daily-streak"
                data-active={progress.streak > 0}
                data-pending={!progress.completedToday}
                aria-label={`${progress.streak}-day practice streak`}
            >
                <Flame className="daily-streak-flame" size={16} strokeWidth={1.7} aria-hidden="true" />
                <span aria-hidden="true">{progress.streak} <span className="daily-streak-unit">day</span></span>
            </Tooltip.Trigger>
            <Tooltip.Content className="daily-streak-tooltip" placement="bottom end" offset={8}>
                <p>{description}</p>
                <p>Completed typing tests, finger lessons, and races count automatically. Each local calendar day counts once; missing a full day resets the streak.</p>
            </Tooltip.Content>
        </Tooltip>
    );
}
