import { $config, $isMounted } from "@/store/config";

const ConfigModeSettings = ({ config }: { config: ReturnType<typeof $config.get> | null }) => {
    const mode = config?.mode ?? "time";

    const handleTimeChange = (timeMode: string) => {
        $config.setKey("countdownTime", timeMode);
    }
    const times = ["15s", "30s", "45s", "1m", "2m"];
    const wordCounts = ["10", "25", "50", "100", "150"];
    return (<>
        {times.map(time => (
            <button key={time} className="btn" data-visible={mode === "time"} data-enabled={config?.countdownTime === time} onClick={() => handleTimeChange(time)}>{time}</button>
        ))}
        {wordCounts.map(count => (
            <button key={count} className="btn" data-visible={mode === "words"} data-enabled={config?.maxWordCount === count} onClick={() => $config.setKey("maxWordCount", count)}>{count}</button>
        ))}
    </>);
}

export default ConfigModeSettings;