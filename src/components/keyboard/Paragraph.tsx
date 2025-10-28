import { useState, useRef, useMemo, useEffect, memo } from "react";
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

    const words = useMemo(() => paragraphText.split(" "), [paragraphText]);
    const typedWords = useMemo(() => typedText.split(/\s+/).slice(0, words.length), [typedText, words.length]);
    const totalTypedWords = useMemo(() => typedWords.filter(x => x != "").length, [typedWords]);

    const [lineNumber, setLineNumber] = useState(-1);

    const contentRef = useRef<HTMLDivElement>(null);
    const lastCalculatedWordRef = useRef(-1);
    const rafIdRef = useRef<number | null>(null);

    const wordTags = useMemo(() => words.map((word, index) => {
        const typed = typedWords[index] || "";
        return <Word key={index} text={word} typed={typed} isActive={isActive && (index === typedWords.length - 1)} />
    }), [words, typedWords, isActive]);

    useEffect(() => {
        // Only recalculate when we've typed a new word, not on every character
        if (totalTypedWords === lastCalculatedWordRef.current) {
            return;
        }
        
        // Cancel any pending calculation
        if (rafIdRef.current !== null) {
            cancelAnimationFrame(rafIdRef.current);
        }
        
        // Schedule calculation for next frame
        rafIdRef.current = requestAnimationFrame(() => {
            if (!contentRef.current) return;
            
            const { width: contentWidth } = contentRef.current.getBoundingClientRect();

            let currentLineNumber = -1;
            let cumulativeWidth = 0;
            const lineHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--line-height'));

            // Only calculate up to the last typed word
            for (let index = 0; index < totalTypedWords; index++) {
                const wordElement = contentRef.current?.children[index] as HTMLElement;
                if (!wordElement) continue;
                
                const wordWidth = wordElement.getBoundingClientRect().width;
                const wordHeight = wordElement.getBoundingClientRect().height;

                cumulativeWidth += wordWidth;

                if (cumulativeWidth >= contentWidth) {
                    currentLineNumber += (wordHeight / lineHeight) - (index === 0 ? 1 : 0);
                    cumulativeWidth = wordWidth;
                }
            }

            setLineNumber(currentLineNumber);
            lastCalculatedWordRef.current = totalTypedWords;
            rafIdRef.current = null;
        });
        
        return () => {
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
            }
        };
    }, [totalTypedWords])

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