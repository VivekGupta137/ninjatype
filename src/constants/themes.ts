export const THEME = {
    amoled: {
        path: "/themes/amoled.css",
        label: "Amoled",
        colors: {
            bg: "#000000",
            text: "#ffffff",
            main: "#e0e0e0",
        },
    },
    monokaiClassic: {
        path: "/themes/monokai.css",
        label: "Monokai Classic",
        colors: {
            bg: "#2d2a2e",
            text: "#fcfcfa",
            main: "#ffd866",
        },
    },
    dracula: {
        path: "/themes/dracula.css",
        label: "Dracula",
        colors: {
            bg: "#282a36",
            text: "#f8f8f2",
            main: "#ff79c6",
        },
    },
    nord: {
        path: "/themes/nord.css",
        label: "Nord",
        colors: {
            bg: "#2e3440",
            text: "#eceff4",
            main: "#88c0d0",
        },
    },
    solarized: {
        path: "/themes/solarized-dark.css",
        label: "Solarized",
        colors: {
            bg: "#002b36",
            text: "#93a1a1",
            main: "#859900",
        },
    },
    oneDark: {
        path: "/themes/one-dark.css",
        label: "One Dark",
        colors: {
            bg: "#282c34",
            text: "#abb2bf",
            main: "#98c379",
        },
    },
    githubDark: {
        path: "/themes/github-dark.css",
        label: "GitHub Dark",
        colors: {
            bg: "#0d1117",
            text: "#c9d1d9",
            main: "#58a6ff",
        },
    },
    gruvbox: {
        path: "/themes/gruvbox.css",
        label: "Gruvbox",
        colors: {
            bg: "#282828",
            text: "#ebdbb2",
            main: "#fe8019",
        },
    },
    tokyoNight: {
        path: "/themes/tokyo-night.css",
        label: "Tokyo Night",
        colors: {
            bg: "#1a1b26",
            text: "#c0caf5",
            main: "#7aa2f7",
        },
    },
    catppuccin: {
        path: "/themes/catppuccin.css",
        label: "Catppuccin",
        colors: {
            bg: "#1e1e2e",
            text: "#cdd6f4",
            main: "#cba6f7",
        },
    },
    material: {
        path: "/themes/material.css",
        label: "Material",
        colors: {
            bg: "#0f111a",
            text: "#a6accd",
            main: "#c792ea",
        },
    },
    rosePine: {
        path: "/themes/rose-pine.css",
        label: "Rose Pine",
        colors: {
            bg: "#191724",
            text: "#e0def4",
            main: "#ebbcba",
        },
    },
    midnightTide: { path: "/themes/midnight-tide.css", label: "Midnight Tide", colors: { bg: "#101c2b", text: "#edf5fc", main: "#7dd3fc" } },
    forestGlow: { path: "/themes/forest-glow.css", label: "Forest Glow", colors: { bg: "#14231c", text: "#eef7ee", main: "#a3e6a2" } },
    amberNight: { path: "/themes/amber-night.css", label: "Amber Night", colors: { bg: "#211a18", text: "#fff2e5", main: "#fbbf70" } },
    coralReef: { path: "/themes/coral-reef.css", label: "Coral Reef", colors: { bg: "#0f2226", text: "#eaf6f5", main: "#ff9e8a" } },
    paperGarden: { path: "/themes/paper-garden.css", label: "Paper Garden", colors: { bg: "#f3f5ec", text: "#1b3026", main: "#285f40" } },
    latteLinen: { path: "/themes/latte-linen.css", label: "Latte Linen", colors: { bg: "#f6f0e6", text: "#33261d", main: "#8a4b2a" } },
};

export type ThemeKey = keyof typeof THEME;
export const PRO_THEME_KEYS: readonly ThemeKey[] = ["dracula", "monokaiClassic", "nord", "tokyoNight", "catppuccin", "midnightTide", "forestGlow", "amberNight", "coralReef", "paperGarden", "latteLinen"];
/** Retired from the pickers. The entry stays so saved choices and old share links keep working. */
export const RETIRED_THEME_KEYS: readonly ThemeKey[] = ["solarized"];
export const SELECTABLE_THEME_KEYS = (Object.keys(THEME) as ThemeKey[]).filter(key => !RETIRED_THEME_KEYS.includes(key));
export const isProTheme = (key: ThemeKey): boolean => PRO_THEME_KEYS.includes(key);
/** Keep the saved choice intact while entitlement is unavailable or unverified. */
export function availableTheme(key: ThemeKey, pro: boolean): ThemeKey {
    return isProTheme(key) && !pro ? "amoled" : key;
}
