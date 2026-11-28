import { ColorSwatch, ToggleButton, ToggleButtonGroup } from "@heroui/react";
import { THEME, SELECTABLE_THEME_KEYS, availableTheme, isProTheme, type ThemeKey } from "@/constants/themes";
import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { $config } from "@/store/config";
import { $activeCustomId, activeCustomTheme } from "@/store/customThemes";
import { $account, refreshAccount } from "@/store/account";
import KeyLink from "@/components/ui/KeyLink";
import "@/styles/ui.css";

/** Theme chooser: one keycap per theme, each with its main color. */
const Themes = () => {
    const { theme: storedTheme } = useStore($config);
    // Read after mount so server and client markup match.
    const [theme, setTheme] = useState<ThemeKey | null>(null);
    const customId = useStore($activeCustomId);
    const account = useStore($account);
    const [mounted, setMounted] = useState(false);
    const pro = mounted && account.status === "in" && account.pro;
    useEffect(() => { setMounted(true); }, []);
    const customActive = !!customId && !!theme && !!activeCustomTheme();
    useEffect(() => { setTheme(storedTheme); }, [storedTheme]);
    useEffect(() => { if ($account.get().status === "loading") void refreshAccount(); }, []);

    return (
        <div>
        <ToggleButtonGroup
            className="key-group theme-key-group not-prose"
            aria-label="Available themes"
            selectionMode="single"
            disallowEmptySelection
            selectedKeys={new Set(theme && !customActive ? [availableTheme(theme, pro)] : [])}
            onSelectionChange={keys => { const v = Array.from(keys)[0] as ThemeKey | undefined; if (v && (!isProTheme(v) || pro)) { $activeCustomId.set(""); $config.setKey("theme", v); } }}
        >
            {SELECTABLE_THEME_KEYS.map(key => (
                <ToggleButton key={key} id={key} className="key-btn key-btn--ghost theme-key" isDisabled={isProTheme(key) && !pro}>
                    <ColorSwatch color={THEME[key].colors.main} colorName={THEME[key].label} size="xs" shape="circle" />
                    {THEME[key].label}{isProTheme(key) ? " · Pro" : ""}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
        {!pro && <p>Pro themes require an active subscription. <KeyLink href="/pro/" size="sm" variant="ghost">Explore Pro</KeyLink></p>}
        </div>
    );
};

export default Themes;
