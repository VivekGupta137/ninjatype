import { $completedSession } from "@/store/analytics";
import { useStore } from "@nanostores/react";

const Stats = () => {
    const session = useStore($completedSession);
    if (!session) return null;
    return (
        <dl
            className="result-speed-metrics"
            aria-label="Session speed and accuracy"
        >
            <div data-tone="success">
                <dt>WPM</dt>
                <dd>{session.wpm}</dd>
            </div>
            <div data-tone="primary">
                <dt>Accuracy</dt>
                <dd>
                    {session.accuracy}
                    <span>%</span>
                </dd>
            </div>
        </dl>
    );
};
export default Stats;
