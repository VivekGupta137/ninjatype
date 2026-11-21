import { $config, defaultConfig } from "@/store/config";
import { ToggleButton, ToggleButtonGroup } from "@heroui/react";
import { CaseSensitive, Clock4, Quote } from "lucide-react";
import { tr, type LearnLocale } from "@/lib/learnLocale";
import "@/styles/ui.css";

type Mode = typeof defaultConfig.mode;
const MODES: { id: Mode; en: string; de: string; icon: React.ReactNode }[] = [
    { id: "time", en: "Time", de: "Zeit", icon: <Clock4 /> },
    { id: "words", en: "Words", de: "Wörter", icon: <CaseSensitive /> },
    { id: "quotes", en: "Quotes", de: "Zitate", icon: <Quote /> },
];

const ConfigMode = ({ config, locale = "en" }: { config: ReturnType<typeof $config.get> | null; locale?: LearnLocale }) => (
    <ToggleButtonGroup
        className="key-group config-mode-group"
        aria-label={tr(locale, "Test mode", "Testmodus")}
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={new Set(config ? [config.mode] : [])}
        onSelectionChange={keys => { const mode = Array.from(keys)[0] as Mode | undefined; if (mode) $config.setKey("mode", mode); }}
    >
        {MODES.map(m => (
            <ToggleButton key={m.id} id={m.id} className="key-btn key-btn--ghost config-key" aria-label={tr(locale, m.en, m.de)}>
                {m.icon}<span className="config-label">{tr(locale, m.en, m.de)}</span>
            </ToggleButton>
        ))}
    </ToggleButtonGroup>
);

export default ConfigMode;
