const Letter = ({ char, showPipe, state }: { char: string, showPipe: boolean, state: LetterState }) => {
    
    return (<div className={"letter"} data-state={state}>
        {showPipe && <span className={"blink pipe"} >|</span>}
        <span >{char}</span>
    </div>);
}

export default Letter;

export enum LetterState {
    Correct,
    Incorrect,
    Untyped,
    ExtraTyped,
    NotVisited
}