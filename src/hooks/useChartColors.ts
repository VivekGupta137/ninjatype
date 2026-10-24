import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { $config } from "@/store/config";

const fallback = {
    primary: "#e0e0e0",
    secondary: "#f3722c",
    muted: "#808080",
    border: "#404040",
    error: "#ff6b6b",
    success: "#51cf66",
    text: "#ffffff",
    bg: "#000000",
    surface: "#121212",
};
export function useChartColors() {
    const { theme } = useStore($config);
    const [colors, setColors] = useState(fallback);
    useEffect(() => {
        const read = () => {
            const style = getComputedStyle(document.documentElement);
            const value = (name: string, backup: string) =>
                style.getPropertyValue(name).trim() || backup;
            setColors({
                primary: value("--main-color", fallback.primary),
                secondary: value("--pipe-color", fallback.secondary),
                muted: value("--sub-text-color", fallback.muted),
                border: value("--sub-alt-text-color", fallback.border),
                error: value("--error-color", fallback.error),
                success: value("--success-color", fallback.success),
                text: value("--text-color", fallback.text),
                bg: value("--bg-color", fallback.bg),
                surface: value("--alt-bg-color", fallback.surface),
            });
        };
        read();
        const link = document.getElementById("currentTheme");
        link?.addEventListener("load", read);
        document.addEventListener("astro:after-swap", read);
        return () => {
            link?.removeEventListener("load", read);
            document.removeEventListener("astro:after-swap", read);
        };
    }, [theme]);
    return colors;
}
