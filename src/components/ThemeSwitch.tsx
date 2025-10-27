import Dropdown from "@/components/common/Dropdown";
import { THEME } from "@/constants/themes";
import { $config } from "@/store/config";
import { useStore } from "@nanostores/react";
import { useEffect } from "react";

const ThemeSwitch = () => {
    const { theme } = useStore($config);

    console.log("Current theme:", theme);
    
    useEffect(() => {
        document.querySelector("#currentTheme")?.setAttribute("href", THEME[theme] ?? "/themes/default.css");
    }, [theme]);

    const handleThemeChange = (newTheme: keyof typeof THEME) => {
        $config.setKey("theme", newTheme);
    };

    return (<Dropdown>
        <Dropdown.Trigger>
            <button className="icon-button"><i className="material-icons">palette</i></button>
        </Dropdown.Trigger>
        <Dropdown.Content>
            <div>
                {
                    (Object.keys(THEME) as Array<keyof typeof THEME>).map((thm) => (
                        <button
                            key={thm}
                            className="dropdown-content-item"
                            onClick={() => handleThemeChange(thm)}
                        >
                            {thm.charAt(0).toUpperCase() + thm.slice(1)}
                        </button>
                    ))
                }
            </div>
        </Dropdown.Content>
    </Dropdown>);
}

export default ThemeSwitch;