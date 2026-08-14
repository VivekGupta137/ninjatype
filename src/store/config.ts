import { THEME } from "@/constants/themes";
import { QUOTE_TYPES, WORD_TYPES } from "@/constants/wordTypes";
import { CHART_BINS_OPTIONS, type ChartBinsSetting } from "@/constants/chartBins";
import { persistentMap } from "@nanostores/persistent";
import { atom, effect } from "nanostores";
import { z } from "zod";

const chartBinsValues = CHART_BINS_OPTIONS.map((option) => option.value) as [
    ChartBinsSetting,
    ...ChartBinsSetting[],
];

// Zod schema for config validation
export const configSchema = z.object({
    theme: z.enum(Object.keys(THEME) as [keyof typeof THEME, ...Array<keyof typeof THEME>]),
    mode: z.enum(["time", "words", "quotes"]),
    maxWordCount: z.string().regex(/^\d+$/, "Must be a numeric string"),
    countdownTime: z.string().regex(/^\d+(s|m|h)$/, "Must be a time string like '15s'"),
    dictionary: z.enum(Object.keys(WORD_TYPES) as [keyof typeof WORD_TYPES, ...Array<keyof typeof WORD_TYPES>]),
    quotes: z.enum(Object.keys(QUOTE_TYPES) as [keyof typeof QUOTE_TYPES, ...Array<keyof typeof QUOTE_TYPES>]),
    chartBins: z.enum(chartBinsValues),
});

export type Config = z.infer<typeof configSchema>;

export const defaultConfig: Config = {
    theme: "amoled",
    mode: "time", // default is time
    maxWordCount: "25",
    countdownTime: "15s",
    dictionary: "1k", // default dictionary source
    quotes: "motivational-quotes", // default quotes source
    chartBins: "auto",
};

export const $config = persistentMap<Config>(
    "config:",
    defaultConfig
);

effect([$config], (config) => {
    if (typeof window === "undefined") return;

    const merged = { ...defaultConfig, ...config };
    const result = configSchema.safeParse(merged);

    if (!result.success) {
        console.warn("Invalid config detected:", result.error.flatten());
        $config.set(defaultConfig);
        return;
    }

    if (JSON.stringify(merged) !== JSON.stringify(config)) {
        $config.set(result.data);
    }
});

export const $isMounted = atom<boolean>(false);
