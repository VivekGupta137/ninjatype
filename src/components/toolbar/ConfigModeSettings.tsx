import IconMinus from "@/icons/IconMinus";
import IconPlus from "@/icons/IconPlus";
import { $config, $isMounted } from "@/store/config";
import { useEffect, useState } from "react";
import { Minus, Plus } from 'lucide-react';

const ConfigModeSettings = ({ config }: { config: ReturnType<typeof $config.get> | null }) => {
    const mode = config?.mode;
    

    const handleTimeChange = (timeMode: string) => {
        $config.setKey("countdownTime", timeMode);
    }
    const handleWordCountChange = (wordCount: string) => {
        $config.setKey("maxWordCount", wordCount);
    }
    const times = ["15s", "30s", "45s", "1m", "2m"];
    const wordCounts = ["10", "25", "50", "100", "150"];

    if(import.meta.env.DEV) {
        times.push("2s");
        wordCounts.push("5");
    }

    const activeValues = mode === "time" ? times : wordCounts;
    const activeValue = mode === "time" ? config?.countdownTime : config?.maxWordCount;
    const activeIndex = activeValues.indexOf(activeValue ?? (mode === "time" ? "15s" : "25"));

    const [currentIndex, setCurrentIndex] = useState<number>(activeIndex);

    useEffect(()=>{
        if (mode === "time") {
            handleTimeChange(activeValues[currentIndex]);
        }
        else {
            handleWordCountChange(activeValues[currentIndex]);
        }
        
    }, [currentIndex])

    useEffect(()=>{
        setCurrentIndex(activeIndex);
    }, [mode]);

    const updateSettingsIndex = (value: number) => {
        let newIndex = currentIndex + value;
        if (newIndex < 0) newIndex = 0;
        if (newIndex >= activeValues.length) newIndex = activeValues.length - 1;
        setCurrentIndex(newIndex);
    }

    const handleMinusClick = () => {
        updateSettingsIndex(-1);
    }
    const handlePlusClick = () => {
        updateSettingsIndex(1);
    }

    return (<>
        <button className="btn icon-btn" onClick={handleMinusClick} data-visible={activeIndex !== 0 && (mode === "time" || mode === "words")}>
            <Minus />
        </button>
        {times.map(time => (
            <button key={time} className="btn config-setting-btn nunito-regular-400" data-visible={mode === "time"} data-enabled={activeValue === time} onClick={() => handleTimeChange(time)}>{time}</button>
        ))}
        {wordCounts.map(count => (
            <button key={count} className="btn config-setting-btn nunito-regular-400" data-visible={mode === "words"} data-enabled={activeValue === count} onClick={() => handleWordCountChange(count)}>{count}</button>
        ))}
        <button className="btn icon-btn" onClick={handlePlusClick} data-visible={(activeIndex !== activeValues.length -1)  && (mode === "time" || mode === "words")}>
            <Plus />
        </button>
    </>);
}

export default ConfigModeSettings;