import { $countdownTimer } from "@/store/keyboard";
import { useStore } from "@nanostores/react";

const CountdownToolbar = () => {
    const countdownTime = useStore($countdownTimer);
    return (<div id="countdown-toolbar">
        <div id="countdown-timer">
            {countdownTime} <span id="countdown-timer-label">seconds</span>
        </div>
    </div>);
}

export default CountdownToolbar;