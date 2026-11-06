import { useEffect, useMemo, useState } from "react";
import { useStore } from "@nanostores/react";
import { $history } from "@/store/history";
import { collectPracticeDays, practiceStreaks, localDayKey } from "@/lib/practiceJourney";

/** Refresh on local midnight and on return to a suspended tab (including DST). */
export function useCalendarDate() {
    const [now, setNow] = useState<Date | null>(null);
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        const refresh = () => {
            clearTimeout(timer);
            const date = new Date();
            setNow(date);
            const midnight = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            timer = setTimeout(refresh, midnight.getTime() - date.getTime() + 50);
        };
        refresh();
        document.addEventListener("visibilitychange", refresh);
        window.addEventListener("focus", refresh);
        return () => {
            clearTimeout(timer);
            document.removeEventListener("visibilitychange", refresh);
            window.removeEventListener("focus", refresh);
        };
    }, []);
    return now;
}

/** Lightweight enough for the shared header: no typing engine or analytics imports. */
export function useDailyProgress() {
    const history = useStore($history);
    const now = useCalendarDate();
    return useMemo(() => {
        if (!now) return null;
        const streaks = practiceStreaks(history.sessions, now, history.dailyCompletionDays);
        return {
        completedToday: collectPracticeDays(history.sessions, history.dailyCompletionDays).includes(localDayKey(now)),
        streak: streaks.current,
        bestStreak: streaks.best,
    }; }, [history, now]);
}
