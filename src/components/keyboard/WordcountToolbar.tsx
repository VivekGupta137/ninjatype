import { $kbSentence, $kbTypedText } from "@/store/keyboard";
import { useStore } from "@nanostores/react";

const WordcountToolbar = () => {
    const totalWordCount = useStore($kbSentence).trim().split(" ").length;
    const typedWordCount = useStore($kbTypedText).trim().split(" ").filter(word => word.length > 0).length;

    return (<div id="wordcount-toolbar">
        <span id={"typed-word-count"}>{typedWordCount}</span> <span id={"total-word-count"}> / {totalWordCount} words</span> 
    </div>);
}

export default WordcountToolbar;