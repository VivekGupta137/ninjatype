import { useEffect } from "react";
import { $config, type Config } from "@/store/config";
import { dictionaryKeysFor } from "@/constants/wordTypes";
import { dictionaryFor, type LearnLocale } from "@/lib/learnLocale";

/**
 * No-visual island mounted on the practice pages.
 *
 * The practice dictionary always stays within the page locale's supported
 * list: /de/tippgeschwindigkeitstest/ types the German list (`de-1k`),
 * the English homepage types an English list. A dictionary the visitor
 * picked from the page's own list is kept (e.g. "5K Common" on the English
 * page); an out-of-locale dictionary is switched to the page default.
 */
const LocalePracticeInit = ({ locale = "en" }: { locale?: LearnLocale }) => {
    useEffect(() => {
        const supported = dictionaryKeysFor(locale);
        if (!supported.includes($config.get().dictionary)) {
            $config.setKey("dictionary", dictionaryFor(locale) as Config["dictionary"]);
        }
    }, [locale]);
    return null;
};

export default LocalePracticeInit;
