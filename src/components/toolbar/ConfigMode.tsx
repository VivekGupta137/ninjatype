import { $config, defaultConfig } from "@/store/config";
import { ToggleButton, ToggleButtonGroup } from "@heroui/react";
import { CaseSensitive, Clock4, Quote } from "lucide-react";
import "@/styles/ui.css";

type Mode = typeof defaultConfig.mode;
const MODES: { id: Mode; label: string; icon: React.ReactNode }[] = [
    { id: "time", label: "Time", icon: <Clock4 /> },
    { id: "words", label: "Words", icon: <CaseSensitive /> },
    { id: "quotes", label: "Quotes", icon: <Quote /> },
];

const ConfigMode = ({ config }: { config: ReturnType<typeof $config.get> | null }) => (
    <ToggleButtonGroup
        className="key-group config-mode-group"
        aria-label="Test mode"
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={new Set(config ? [config.mode] : [])}
        onSelectionChange={keys => { const mode = Array.from(keys)[0] as Mode | undefined; if (mode) $config.setKey("mode", mode); }}
    >
        {MODES.map(m => (
            <ToggleButton key={m.id} id={m.id} className="key-btn key-btn--ghost config-key" aria-label={m.label}>
                {m.icon}<span className="config-label">{m.label}</span>
            </ToggleButton>
        ))}
    </ToggleButtonGroup>
);

export default ConfigMode;
