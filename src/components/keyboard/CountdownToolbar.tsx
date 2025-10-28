import { $config } from "@/store/config";
import { $countdownTimer } from "@/store/keyboard";
import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";

const CountdownToolbar = () => {
    const storedCountdownTimer = useStore($countdownTimer);
    const [countdownTimer, setCountdownTimer] = useState<typeof storedCountdownTimer | null>(null);
    useEffect(() => {
        setCountdownTimer(storedCountdownTimer);
    }, [storedCountdownTimer]);
    const countdownTime = countdownTimer || "0";
    return (<div id="countdown-toolbar">
        <div id="countdown-timer">
            {countdownTime} <span id="countdown-timer-label">seconds</span>
        </div>
    </div>);
}

export default CountdownToolbar;