import { ColorSwatch, ToggleButton, ToggleButtonGroup } from "@heroui/react";
import { THEME } from "@/constants/themes";
import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { $config } from "@/store/config";
import { $activeCustomId, activeCustomTheme } from "@/store/customThemes";
import "@/styles/ui.css";

type ThemeKey = keyof typeof THEME;

/** Theme chooser: one keycap per theme, each with its main color. */
const Themes = () => {
    const { theme: storedTheme } = useStore($config);
    // Read after mount so server and client markup match.
    const [theme, setTheme] = useState<ThemeKey | null>(null);
    const customId = useStore($activeCustomId);
    const customActive = !!customId && !!theme && !!activeCustomTheme();
    useEffect(() => { setTheme(storedTheme); }, [storedTheme]);

    return (
        <ToggleButtonGroup
            className="key-group theme-key-group not-prose"
            aria-label="Available themes"
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={new Set(theme && !customActive ? [theme] : [])}
            onSelectionChange={keys => { const v = Array.from(keys)[0] as ThemeKey | undefined; if (v) { $activeCustomId.set(""); $config.setKey("theme", v); } }}
        >
            {(Object.keys(THEME) as ThemeKey[]).map(key => (
                <ToggleButton key={key} id={key} className="key-btn key-btn--ghost theme-key">
                    <ColorSwatch color={THEME[key].colors.main} colorName={THEME[key].label} size="xs" shape="circle" />
                    {THEME[key].label}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
};

export default Themes;
