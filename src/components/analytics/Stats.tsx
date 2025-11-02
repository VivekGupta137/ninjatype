import { $accuracy, $errorCPS, $rawCPM, $rawWPM } from "@/store/analytics";
import { $stopwatch } from "@/store/keyboard";
import { useStore } from "@nanostores/react";

const Stats = () => {
    const rawCPM = useStore($rawCPM);
    const rawWPM = useStore($rawWPM);
    const stopwatch = useStore($stopwatch);
    const errorPS = useStore($errorCPS);
    const accuracy = useStore($accuracy);

    return (<div id="stats-toolbar">
        <div className="stat-item">
            <span className="stat-value">{rawWPM}</span>
            <span className="stat-label">raw WPM</span>
        </div>
        <div className="stat-divider">|</div>
        <div className="stat-item">
            <span className="stat-value">{rawCPM}</span>
            <span className="stat-label">raw CPM</span>
        </div>
        <div className="stat-divider">|</div>

        <div className="stat-item">
            <span className="stat-value">{stopwatch}s</span>
            <span className="stat-label">elapsed</span>
        </div>        <div className="stat-divider">|</div>

        <div className="stat-item">
            <span className="stat-value">
                {errorPS[errorPS.length -1]?.count || 0}
            </span>
            <span className="stat-label">Errors</span>
        </div>

        <div className="stat-divider">|</div>
        <div className="stat-item">
            <span className="stat-value">{accuracy}%</span>
            <span className="stat-label">Accuracy</span>
        </div>
    </div>);
}

export default Stats;