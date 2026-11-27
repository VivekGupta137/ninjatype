import { Chip } from "@heroui/react";
import { $kbSentence, $kbTypedText } from "@/store/keyboard";
import { useStore } from "@nanostores/react";
import { $customRun } from "@/store/customRun";
import { tr, type LearnLocale } from "@/lib/learnLocale";

const WordcountToolbar = ({ locale = "en" }: { locale?: LearnLocale }) => {
    const customRun = useStore($customRun);
    const sentenceWordCount = useStore($kbSentence).trim().split(" ").length;
    // Long material renders only a window, so count against the whole passage.
    const totalWordCount = customRun ? customRun.words : sentenceWordCount;
    const typedWordCount = useStore($kbTypedText).trim().split(" ").filter(word => word.length > 0).length;

    return (<div id="wordcount-toolbar">
        <Chip size="lg" variant="soft" color="accent" className="test-chip">
            <Chip.Label><span id={"typed-word-count"}>{typedWordCount}</span><span id={"total-word-count"}> / {totalWordCount} </span><span className="test-chip-label">{tr(locale, "words", "Wörter")}</span></Chip.Label>
        </Chip>
    </div>);
}

export default WordcountToolbar;