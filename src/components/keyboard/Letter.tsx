const Letter = ({ char, showPipe, state, ghostTyped = false }: { char: string, showPipe: boolean, state: LetterState, ghostTyped?: boolean }) => {
    
    return (<div className={"letter"} data-state={state} data-ghost-typed={ghostTyped || undefined}>
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