import { useState, useRef, useMemo, useEffect } from "react";
import Word from "./Word";

const Paragraph = ({
    paragraphText,
    typedText,
    isActive = false
}: {
    paragraphText: string,
    typedText: string,
    isActive?: boolean
}) => {

    const words = paragraphText.split(" ");
    const typedWords = typedText.split(/\s+/).slice(0, words.length);
    const totalTypedWords = typedWords.filter(x => x != "").length;

    const [lineNumber, setLineNumber] = useState(-1);

    const contentRef = useRef<HTMLDivElement>(null);

    const wordTags = useMemo(() => words.map((word, index) => {
        const typed = typedWords[index] || "";
        return <Word key={index} text={word} typed={typed} isActive={isActive && (index === typedWords.length - 1)} />
    }), [paragraphText, typedText, isActive]);

    useEffect(() => {
        if (contentRef.current) {
            const { width: contentWidth } = contentRef.current.getBoundingClientRect();

            let currentLineNumber = -1;
            let cumulativeWidth = 0;
            const lineHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--line-height'));

            wordTags.filter((_, idx) => idx < totalTypedWords).forEach((_, index) => {
                const wordElement = contentRef.current?.children[index] as HTMLElement;
                const wordWidth = wordElement.getBoundingClientRect().width;
                const wordHeight = wordElement.getBoundingClientRect().height;

                // const nextWordElement = index < wordTags.length - 1 ? contentRef.current?.children[index + 1] as HTMLElement : null;
                // const nextWordWidth = nextWordElement ? nextWordElement.getBoundingClientRect().width : 0;

                cumulativeWidth += wordWidth;
                

                if (cumulativeWidth >= contentWidth) {
                    // increment one extra for the first line to make it second line
                    // currentLineNumber = currentLineNumber == 0 ? -1 : 0;
                    currentLineNumber += (wordHeight / lineHeight) - (index === 0 ? 1 : 0);
                    cumulativeWidth = wordWidth;
                }
            })

            setLineNumber(currentLineNumber);

        }
    }, [typedWords])

    return (<div>

        <div id="paragraph">
            <div id="paragraph-content" ref={contentRef} style={{
                transform: `translateY(calc(${lineNumber * -1} * var(--line-height)))`
            }}>
                {wordTags}
            </div>
        </div>
    </div>);
}

export default Paragraph;