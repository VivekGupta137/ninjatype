import { CHART_BINS_OPTIONS, type ChartBinsSetting } from "@/constants/chartBins";
import { $config } from "@/store/config";
import { ToggleButton, ToggleButtonGroup } from "@heroui/react";
import { useStore } from "@nanostores/react";
import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import "@/styles/ui.css";

const ChartSettings = () => {
    const { chartBins: stored } = useStore($config);
    // Read after mount so server and client markup match.
    const [chartBins, setChartBins] = useState<ChartBinsSetting | null>(null);
    useEffect(() => { setChartBins(stored); }, [stored]);
    const active = CHART_BINS_OPTIONS.find(option => option.value === chartBins);

    return (
        <div id="chart-settings-container">
            <ToggleButtonGroup
                className="key-group"
                aria-label="Chart detail"
                selectionMode="single"
                disallowEmptySelection
                selectedKeys={new Set(chartBins ? [chartBins] : [])}
                onSelectionChange={keys => { const v = Array.from(keys)[0] as ChartBinsSetting | undefined; if (v) $config.setKey("chartBins", v); }}
            >
                {CHART_BINS_OPTIONS.map(option => (
                    <ToggleButton key={option.value} id={option.value} className="key-btn key-btn--ghost">{option.label}</ToggleButton>
                ))}
            </ToggleButtonGroup>
            {active?.hint ? <p className="chart-settings-hint"><Info size={14} aria-hidden="true" />{active.hint}</p> : null}
        </div>
    );
};

export default ChartSettings;
