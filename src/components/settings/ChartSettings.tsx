import {
    CHART_BINS_OPTIONS,
    type ChartBinsSetting,
} from "@/constants/chartBins";
import { $config } from "@/store/config";
import { Button } from "@heroui/react";
import { useStore } from "@nanostores/react";
import { Check } from "lucide-react";

const ChartSettings = () => {
    const { chartBins } = useStore($config);
    const active = CHART_BINS_OPTIONS.find((option) => option.value === chartBins);

    const handleChange = (value: ChartBinsSetting) => {
        $config.setKey("chartBins", value);
    };

    return (
        <div id="chart-settings-container">
            <div id="chart-settings" className="flex flex-row gap-2 flex-wrap">
                {CHART_BINS_OPTIONS.map((option) => (
                    <Button
                        key={option.value}
                        variant={chartBins === option.value ? "primary" : "outline"}
                        onClick={() => handleChange(option.value)}
                        className="rounded-md"
                    >
                        {option.label}
                        {chartBins === option.value ? (
                            <Check className="ml-2" size={16} />
                        ) : null}
                    </Button>
                ))}
            </div>
            {active?.hint ? (
                <p className="chart-settings-hint">{active.hint}</p>
            ) : null}
        </div>
    );
};

export default ChartSettings;
