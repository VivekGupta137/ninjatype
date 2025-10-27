import type { THEME } from "@/constants/themes";
import { persistentMap } from "@nanostores/persistent";

export const $config = persistentMap<{
    theme: keyof typeof THEME;
}>("config:", {
    theme: "default",
});