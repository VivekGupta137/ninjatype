import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { ColorSwatch, ColorSwatchPicker, Popover, buttonVariants } from "@heroui/react";
import { Plus } from "lucide-react";
import KeyLink from "@/components/ui/KeyLink";
import { ProBadge } from "@/components/ui/ProBadge";
import { Hint } from "@/components/ui/InfoTip";
import "@/styles/ui.css";
import { THEME, SELECTABLE_THEME_KEYS as KEYS, availableTheme, isProTheme, type ThemeKey } from "@/constants/themes";
import { $config } from "@/store/config";
import { $account, refreshAccount } from "@/store/account";
import { $activeCustomId } from "@/store/customThemes";

/** Navbar theme switcher: a color swatch that opens a swatch picker of every theme. */
export default function ThemeSwatchPicker() {
    const { theme: stored } = useStore($config);
    const account = useStore($account);
    const [mounted, setMounted] = useState(false);
    const pro = mounted && account.status === "in" && account.pro;
    useEffect(() => { setMounted(true); }, []);
    // Read the stored theme after mount so server and client markup match.
    const [theme, setTheme] = useState<ThemeKey>("amoled");
    useEffect(() => setTheme(stored), [stored]);
    useEffect(() => { if ($account.get().status === "loading") void refreshAccount(); }, []);

    const current = THEME[availableTheme(theme, pro)] ?? THEME.amoled;
    const freeKeys = KEYS.filter(k => !isProTheme(k));
    const proKeys = KEYS.filter(isProTheme);
    const byColor = (keys: ThemeKey[], hex: string) => keys.find(k => THEME[k].colors.main.toLowerCase() === hex.toLowerCase());
    const choose = (keys: ThemeKey[]) => (color: { toString: (format: "hex") => string }) => {
        const key = byColor(keys, color.toString("hex"));
        if (key) { $activeCustomId.set(""); $config.setKey("theme", key); }
    };
    const currentIsPro = isProTheme(availableTheme(theme, pro));

    return (
        <Hint text={`Theme: ${current.label}`}>
        <Popover>
            <Popover.Trigger<"button">
                render={props => <button {...props} type="button" />}
                className={`${buttonVariants({ variant: "outline", size: "md", isIconOnly: true })} key-btn key-btn--ghost key-btn--icon navbar-link navbar-utility-link navbar-theme-trigger`}
                aria-label={`Theme: ${current.label}`}
            >
                <span className="navbar-icon" aria-hidden="true">
                    <ColorSwatch color={current.colors.main} colorName={current.label} size="xs" shape="circle" />
                </span>
            </Popover.Trigger>
            <Popover.Content className="navbar-theme-popover" placement="bottom end" offset={10}>
                <Popover.Dialog className="navbar-theme-popover-body" aria-label="Choose a theme">
                    <Popover.Heading className="navbar-theme-popover-heading">Theme · {current.label}</Popover.Heading>
                    <ColorSwatchPicker key={currentIsPro ? "free-idle" : "free-active"} aria-label="Free theme colors" layout="grid" value={currentIsPro ? undefined : current.colors.main} onChange={choose(freeKeys)}>
                        {freeKeys.map(k => (
                            <ColorSwatchPicker.Item key={k} color={THEME[k].colors.main} aria-label={THEME[k].label}>
                                <ColorSwatchPicker.Swatch />
                                <ColorSwatchPicker.Indicator />
                            </ColorSwatchPicker.Item>
                        ))}
                    </ColorSwatchPicker>
                    <div className="navbar-theme-pro-head"><span>Pro themes</span><ProBadge /></div>
                    <div className="navbar-theme-pro-row">
                        {pro
                            ? <ColorSwatchPicker key={currentIsPro ? "pro-active" : "pro-idle"} className="navbar-theme-pro-picker" aria-label="Pro theme colors" layout="grid" value={currentIsPro ? current.colors.main : undefined} onChange={choose(proKeys)}>
                                {proKeys.map(k => (
                                    <ColorSwatchPicker.Item key={k} color={THEME[k].colors.main} aria-label={`${THEME[k].label} · Pro`}>
                                        <ColorSwatchPicker.Swatch />
                                        <ColorSwatchPicker.Indicator />
                                    </ColorSwatchPicker.Item>
                                ))}
                            </ColorSwatchPicker>
                            : proKeys.map(k => <LockedTheme key={k} themeKey={k} />)}
                        <Hint text="Create custom themes">
                            <a href="/custom-themes/" className="navbar-theme-add" aria-label="Create a custom theme"><Plus size={16} aria-hidden="true" /></a>
                        </Hint>
                    </div>
                </Popover.Dialog>
            </Popover.Content>
        </Popover>
        </Hint>
    );
}

/** A Pro theme swatch for free users: pressing it opens a small popover explaining Pro instead of switching themes. */
function LockedTheme({ themeKey }: { themeKey: ThemeKey }) {
    const { label, colors } = THEME[themeKey];
    return (
        <Popover>
            <Popover.Trigger<"button"> render={props => <button {...props} type="button" />} className="navbar-theme-locked" aria-label={`${label}, a Pro theme`}>
                <ColorSwatch color={colors.main} colorName={label} size="md" shape="circle" />
            </Popover.Trigger>
            <Popover.Content className="navbar-theme-popover" placement="bottom" offset={8}>
                <Popover.Dialog className="navbar-theme-popover-body" aria-label={`${label} is a Pro theme`}>
                    <Popover.Heading className="navbar-theme-popover-heading">{label} <ProBadge /></Popover.Heading>
                    <p className="navbar-theme-note">Pro unlocks eleven extra themes and your own custom colours.</p>
                    <KeyLink href="/pro/" variant="primary" size="sm">See Pro</KeyLink>
                </Popover.Dialog>
            </Popover.Content>
        </Popover>
    );
}
