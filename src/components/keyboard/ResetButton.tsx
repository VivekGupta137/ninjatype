import { $config, defaultConfig } from "@/store/config";
import { RotateCcw } from "lucide-react";
import { tr, type LearnLocale } from "@/lib/learnLocale";

const ResetButton = ({ locale = "en" }: { locale?: LearnLocale }) => {
    const handleReset = () => {
        const isGhostRacePage = /^\/(?:ghost-race|online)\/?$/.test(window.location.pathname);
        if (isGhostRacePage) {
            window.location.reload();
            return;
        }

        $config.set({ ...defaultConfig, ...$config.get() });
    };

    return (
        <div id="reset-button">
            <button
                className="btn"
                onClick={handleReset}
                title={tr(locale, "Reset Sentence", "Satz zurücksetzen")}
            >
                <RotateCcw />
            </button>
        </div>
    );
};

export default ResetButton;
