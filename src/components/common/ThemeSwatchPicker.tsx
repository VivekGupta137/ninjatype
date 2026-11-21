import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { ColorSwatch, ColorSwatchPicker, Popover } from "@heroui/react";
import { THEME } from "@/constants/themes";
import { $config } from "@/store/config";

type ThemeKey = keyof typeof THEME;
const KEYS = Object.keys(THEME) as ThemeKey[];

/** Navbar theme switcher: a color swatch that opens a swatch picker of every theme. */
export default function ThemeSwatchPicker() {
    const { theme: stored } = useStore($config);
    // Read the stored theme after mount so server and client markup match.
    const [theme, setTheme] = useState<ThemeKey>("amoled");
    useEffect(() => setTheme(stored), [stored]);

    const current = THEME[theme] ?? THEME.amoled;
    const byColor = (hex: string) => KEYS.find(k => THEME[k].colors.main.toLowerCase() === hex.toLowerCase());

    return (
        <Popover>
            <Popover.Trigger<"button">
                render={props => <button {...props} type="button" />}
                className="navbar-link navbar-utility-link navbar-theme-trigger"
                aria-label={`Theme: ${current.label}`}
                title={`Theme: ${current.label}`}
            >
                <span className="navbar-icon" aria-hidden="true">
                    <ColorSwatch color={current.colors.main} colorName={current.label} size="sm" shape="circle" />
                </span>
            </Popover.Trigger>
            <Popover.Content className="navbar-theme-popover" placement="bottom end" offset={10}>
                <Popover.Dialog className="navbar-theme-popover-body" aria-label="Choose a theme">
                    <Popover.Heading className="navbar-theme-popover-heading">Theme · {current.label}</Popover.Heading>
                    <ColorSwatchPicker
                        aria-label="Theme colors"
                        layout="grid"
                        value={current.colors.main}
                        onChange={color => {
                            const key = byColor(color.toString("hex"));
                            if (key) $config.setKey("theme", key);
                        }}
                    >
                        {KEYS.map(k => (
                            <ColorSwatchPicker.Item key={k} color={THEME[k].colors.main} aria-label={THEME[k].label}>
                                <ColorSwatchPicker.Swatch />
                                <ColorSwatchPicker.Indicator />
                            </ColorSwatchPicker.Item>
                        ))}
                    </ColorSwatchPicker>
                </Popover.Dialog>
            </Popover.Content>
        </Popover>
    );
}
