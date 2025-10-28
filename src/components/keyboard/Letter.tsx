const Letter = ({ char, showPipe, state }: { char: string, showPipe: boolean, state: LetterState }) => {
    
    return (<div className={"letter"} data-state={state}>
        {showPipe && <div className={"blink pipe"} ></div>}
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