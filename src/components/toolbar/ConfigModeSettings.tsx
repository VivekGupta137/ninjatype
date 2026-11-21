import { TEST_DURATIONS } from "@/constants/testDurations";
import { $config } from "@/store/config";
import { ToggleButton, ToggleButtonGroup } from "@heroui/react";
import { Minus, Plus } from "lucide-react";
import SolarProgrammingBroken from "~icons/solar/programming-broken";
import MdiEmojiLolOutline from "~icons/mdi/emoji-lol-outline";
import ArcticonsMotive from "~icons/arcticons/motive";
import KeyButton from "@/components/ui/KeyButton";
import { Hint } from "@/components/ui/InfoTip";
import { tr, type LearnLocale } from "@/lib/learnLocale";
import "@/styles/ui.css";

const ConfigModeSettings = ({ config, locale = "en" }: { config: ReturnType<typeof $config.get> | null; locale?: LearnLocale }) => {
    const mode = config?.mode;

    const times: string[] = TEST_DURATIONS.map(option => option.label);
    const wordCounts = ["10", "25", "50", "100", "150"];
    const quotes: { label: string; value: NonNullable<typeof config>["quotes"]; icon: React.ReactNode }[] = [
        { label: tr(locale, "Motivate", "Motivation"), value: "motivational-quotes", icon: <ArcticonsMotive /> },
        { label: tr(locale, "Coders", "Code"), value: "programming-quotes", icon: <SolarProgrammingBroken /> },
        { label: tr(locale, "Funny", "Witzig"), value: "funny-quotes", icon: <MdiEmojiLolOutline /> },
    ];
    if (import.meta.env.DEV) {
        times.push("2s");
        wordCounts.push("5");
    }

    const options: { id: string; label: string; icon?: React.ReactNode }[] =
        mode === "time" ? times.map(t => ({ id: t, label: t }))
        : mode === "words" ? wordCounts.map(c => ({ id: c, label: c }))
        : mode === "quotes" ? quotes.map(q => ({ id: q.value, label: q.label, icon: q.icon }))
        : [];

    const activeValue = mode === "time" ? config?.countdownTime : mode === "words" ? config?.maxWordCount : mode === "quotes" ? config?.quotes : undefined;
    const activeIndex = activeValue != null ? options.findIndex(o => o.id === activeValue) : -1;
    const stepper = mode === "time" || mode === "words";

    const select = (id: string) => {
        if (mode === "time") $config.setKey("countdownTime", id);
        else if (mode === "words") $config.setKey("maxWordCount", id);
        else if (mode === "quotes") $config.setKey("quotes", id as NonNullable<typeof config>["quotes"]);
    };
    const step = (delta: number) => {
        const next = options[Math.min(options.length - 1, Math.max(0, activeIndex + delta))];
        if (next) select(next.id);
    };

    return (
        <div className="config-step-wrap">
            {stepper && (
                <Hint text={tr(locale, "Shorter", "Kürzer")}>
                    <KeyButton isIconOnly variant="ghost" size="sm" className="config-step" aria-label={tr(locale, "Decrease test length", "Testlänge verringern")} data-visible={activeIndex > 0} onPress={() => step(-1)}><Minus size={16} /></KeyButton>
                </Hint>
            )}
            <ToggleButtonGroup
                className="key-group config-setting-group"
                aria-label={mode === "time" ? tr(locale, "Test duration", "Testdauer") : mode === "words" ? tr(locale, "Word count", "Wortanzahl") : tr(locale, "Quote set", "Zitat-Auswahl")}
                selectionMode="single"
                disallowEmptySelection
                selectedKeys={new Set(activeValue != null ? [activeValue] : [])}
                onSelectionChange={keys => { const id = Array.from(keys)[0] as string | undefined; if (id) select(id); }}
            >
                {options.map(o => (
                    <ToggleButton key={o.id} id={o.id} className="key-btn key-btn--ghost config-key" aria-label={o.label}>
                        {o.icon}<span>{o.label}</span>
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
            {stepper && (
                <Hint text={tr(locale, "Longer", "Länger")}>
                    <KeyButton isIconOnly variant="ghost" size="sm" className="config-step" aria-label={tr(locale, "Increase test length", "Testlänge erhöhen")} data-visible={activeIndex !== options.length - 1} onPress={() => step(1)}><Plus size={16} /></KeyButton>
                </Hint>
            )}
        </div>
    );
};

export default ConfigModeSettings;
