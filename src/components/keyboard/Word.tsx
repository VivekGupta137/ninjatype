import { memo } from "react";
import Letter, { LetterState } from "./Letter";

const Word = memo(({ text,  typed , isActive}: { text: string, typed: string, isActive: boolean }) => {
    let letters = text.split('');
    let typedLetters = typed.split('');
    const extraTypedLetters = typedLetters.slice(letters.length);
    const spaceChar = "\u00A0"; // non-breaking space
    extraTypedLetters.push(spaceChar);

    const tags = [];
    const letterTags = letters.map((char, index) => {
        let characterState: LetterState = LetterState.NotVisited;

        if((isActive && typedLetters[index] === undefined) || typedLetters.length === 0){
            // if typedLetters is empty this means the word is not yet visited
            // if the word is active and the typed letters are not defined, it means the letter is not visited
            characterState = LetterState.NotVisited;
        }
        else if (!isActive && index >= typedLetters.length) {
            // if the user skipped to the next word, mark all untyped letters as untyped
            characterState = LetterState.Untyped;
        }
        else if (typedLetters[index] === char) {
            // if the typed letter matches
            characterState = LetterState.Correct;
        }
        else if (typedLetters[index] !== char) {
            // if the typed letter does not match
            characterState = LetterState.Incorrect;
        }
        
        
        return <Letter state={characterState} key={index} char={char} showPipe={index === typed.length && isActive} />
    });

    const extraLetterTags = extraTypedLetters.map((char, index) => (
        <Letter state={char === spaceChar ? LetterState.Correct: LetterState.ExtraTyped} key={letters.length + index} char={char} showPipe={index === (typed.length - text.length) && isActive} />
    ));

    tags.push(...letterTags);
    tags.push(...extraLetterTags);

    return (<div className={"word"}>
        {tags}
    </div>);
});

Word.displayName = 'Word';

export default Word;