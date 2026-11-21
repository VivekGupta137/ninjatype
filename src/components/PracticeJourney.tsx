import { Chip } from "@heroui/react";
import PracticeInfo from "./common/PracticeInfo";
import { KBTYPINGSTATE } from "@/constants/keyboardState";
import { usePracticeJourney } from "@/hooks/usePracticeJourney";
import { readPracticeSettings, settingsLabel } from "@/lib/practiceJourney";
import { tr, type LearnLocale } from "@/lib/learnLocale";

export default function PracticeJourney({ locale = "en" }: { locale?: LearnLocale }) {
    const { ready, typingState, latest, comparison } = usePracticeJourney();
    if (!ready || typingState !== KBTYPINGSTATE.IDLE || !latest) return null;
    const settings = readPracticeSettings(latest.practiceSettings);
    const delta = comparison ? latest.wpm - comparison.averageWpm : 0;
    return (
        <section className="practice-journey" aria-label={tr(locale, "Previous typing attempt", "Vorheriger Tippversuch")}>
            <div className="practice-shortcuts">
                <PracticeInfo label={tr(locale, "Previous attempt", "Letzter Versuch")} href="/history/" hrefLabel={tr(locale, "View history", "Verlauf ansehen")}
                    chip={<><span className="practice-secondary">{tr(locale, "last attempt", "letzter Versuch")}</span> <span className="practice-previous-speed">{latest.wpm} wpm</span></>}>
                    <div className="pop-stats">
                        <div><span>{tr(locale, "Speed", "Tempo")}</span><b>{latest.wpm}<small>WPM</small></b></div>
                        <div><span>{tr(locale, "Accuracy", "Genauigkeit")}</span><b>{latest.accuracy}<small>%</small></b></div>
                    </div>
                    <div className="pop-meta">
                        <Chip size="sm" variant="soft">{new Date(latest.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</Chip>
                        {settings && <Chip size="sm" variant="soft">{settingsLabel(settings)}</Chip>}
                    </div>
                    {comparison && (
                        <p className="pop-compare">
                            <Chip size="sm" variant="soft" color={delta >= 0 ? "success" : "danger"}>{delta > 0 ? "+" : ""}{delta} WPM</Chip>
                            <span>{tr(locale, `vs. your last ${comparison.count} matching ${comparison.count === 1 ? "test" : "tests"}`, `ggü. deinen letzten ${comparison.count} passenden Tests`)} (Ø {comparison.averageWpm} WPM · {comparison.averageAccuracy}%)</span>
                        </p>
                    )}
                    <p className="pop-note">{tr(locale, "Complete a test, lesson or race each day to build your streak. Progress is saved in this browser.", "Absolviere täglich einen Test, eine Lektion oder ein Rennen, um deine Serie aufzubauen. Der Fortschritt wird in diesem Browser gespeichert.")}</p>
                </PracticeInfo>
            </div>
        </section>
    );
}
