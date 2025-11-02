import { THEME } from "@/constants/themes";
import { $config } from "@/store/config";
import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";

const ThemeWatcher = () => {
    const {theme: localTheme} = useStore($config);
    const [theme, setTheme] = useState(localTheme); // avoid hydration issues

    useEffect(()=>{
        setTheme(localTheme);
        document.querySelector("#currentTheme")?.setAttribute("href", THEME[localTheme].path ?? THEME["default"].path);
    }, [localTheme]);
    return ( <div></div> );
}
 
export default ThemeWatcher;