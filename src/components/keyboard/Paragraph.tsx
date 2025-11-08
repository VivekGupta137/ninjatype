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

    const [lineNumber, setLineNumber] = useState(-2);

    const contentRef = useRef<HTMLDivElement>(null);
    const lastCalculatedWordRef = useRef(-1);
    const rafIdRef = useRef<number | null>(null);

    const wordTags = useMemo(() => words.map((word, index) => {
        const typed = typedWords[index] || "";
        return <Word key={index} text={word} typed={typed} isActive={isActive && (index === typedWords.length - 1)} />
    }), [words, typedWords, isActive]);

    useEffect(() => {        
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
                
                // when reaching the end of the current typed word, add the width of the next word to see if it fits in the current line
                if(typedWords.length > totalTypedWords && index === totalTypedWords -1) {
                    // add width of next word
                    const nextWordElement = contentRef.current?.children[index + 1] as HTMLElement;
                    if (nextWordElement) {
                        const nextWordWidth = nextWordElement.getBoundingClientRect().width;
                        cumulativeWidth += nextWordWidth;
                    }
                }

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
    }, [typedWords.length])

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