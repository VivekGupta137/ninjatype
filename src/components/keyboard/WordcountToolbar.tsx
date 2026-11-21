import { Chip } from "@heroui/react";
import { $kbSentence, $kbTypedText } from "@/store/keyboard";
import { useStore } from "@nanostores/react";

const WordcountToolbar = () => {
    const totalWordCount = useStore($kbSentence).trim().split(" ").length;
    const typedWordCount = useStore($kbTypedText).trim().split(" ").filter(word => word.length > 0).length;

    return (<div id="wordcount-toolbar">
        <Chip size="lg" variant="soft" color="accent" className="test-chip">
            <Chip.Label><span id={"typed-word-count"}>{typedWordCount}</span><span id={"total-word-count"}> / {totalWordCount} </span><span className="test-chip-label">words</span></Chip.Label>
        </Chip>
    </div>);
}

export default WordcountToolbar;