import type { THEME } from "@/constants/themes";
import { persistentMap } from "@nanostores/persistent";
import { atom } from "nanostores";

export const defaultConfig: {
    theme: keyof typeof THEME;
    mode: "time" | "words";
    maxWordCount: string;
    countdownTime: string;
    source: "1k";
} = {
    theme: "amoled",
    mode: "time", // default is time
    maxWordCount: "25",
    countdownTime: "15s",
    source: "1k", // default word source
};

export const $config = persistentMap<typeof defaultConfig>(
    "config:",
    defaultConfig
);

export const $isMounted = atom<boolean>(false);
