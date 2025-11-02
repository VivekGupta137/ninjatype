import { THEME } from "@/constants/themes";
import { $config } from "@/store/config";
import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";


const ThemeSettings = () => {
    const { theme: storedTheme } = useStore($config);
    const [theme, setTheme] = useState<typeof storedTheme>("default");

    useEffect(() => {
        setTheme(storedTheme);
    }, [storedTheme]);

    const handleThemeChange = (newTheme: keyof typeof THEME) => {
        $config.setKey("theme", newTheme);
    };
    return (
        <div id="theme-settings-container">
            {/* current theme: <strong>{theme}</strong> */}
            <div id="theme-settings">
            {
                (Object.keys(THEME) as Array<keyof typeof THEME>).map((thm) => (
                    <button
                        key={thm}
                        data-is-selected={theme === thm ? 1 : 0}
                        className="btn large-btn"
                        style={{
                            "--lg-btn-bg-color": THEME[thm].colors.bg,
                            "--lg-btn-text-color": THEME[thm].colors.text,
                            "--lg-btn-main-color": THEME[thm].colors.main,
                        } as React.CSSProperties}
                        onClick={() => handleThemeChange(thm)}
                    >
                        {THEME[thm].label}
                    </button>
                ))
            }
        </div>
        </div>
    );
}

export default ThemeSettings;