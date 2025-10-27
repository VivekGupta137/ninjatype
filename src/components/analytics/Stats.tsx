import { $rawCPM, $rawWPM } from "@/store/analytics";
import { useStore } from "@nanostores/react";

const Stats = () => {
    const rawCPM = useStore($rawCPM);
    const rawWPM = useStore($rawWPM);
    return ( <div id="stats-toolbar">
        <div className="stat-item">
            <span className="stat-value">{rawWPM}</span>
            <span className="stat-label">WPM</span>
        </div>
        <div className="stat-divider">|</div>
        <div className="stat-item">
            <span className="stat-value">{rawCPM}</span>
            <span className="stat-label">CPM</span>
        </div>
    </div> );
}
 
export default Stats;