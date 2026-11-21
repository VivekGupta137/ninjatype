import { $config } from "@/store/config";
import { $countdownTimer } from "@/store/keyboard";
import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";
import { tr, type LearnLocale } from "@/lib/learnLocale";

const CountdownToolbar = ({ locale = "en" }: { locale?: LearnLocale }) => {
    const storedCountdownTimer = useStore($countdownTimer);
    const [countdownTimer, setCountdownTimer] = useState<typeof storedCountdownTimer | null>(null);
    useEffect(() => {
        setCountdownTimer(storedCountdownTimer);
    }, [storedCountdownTimer]);
    const countdownTime = countdownTimer || "0";
    return (<div id="countdown-toolbar">
        <div className="countdown-large" role="timer" aria-label={tr(locale, `${countdownTime} seconds remaining`, `${countdownTime} Sekunden verbleiben`)}>
            <span className="countdown-value" aria-hidden="true">{countdownTime}</span>
            <span className="countdown-unit" aria-hidden="true">{tr(locale, "seconds", "Sekunden")}</span>
        </div>
    </div>);
}

export default CountdownToolbar;