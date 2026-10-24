import { useEffect, useRef, useState } from "react";
import { useStore } from "@nanostores/react";
import { ArrowRight, RotateCcw, Flag, MousePointer2 } from "lucide-react";
import Paragraph from "@/components/keyboard/Paragraph";
import OnlineLobby from "./OnlineLobby";
import OnlineAnalyticsContainer from "./OnlineAnalyticsContainer";
import {
    $onlineLobbyState, $onlineTargetWords, $onlineSentence, $onlineTypedText,
    $onlineElapsed, $onlineWpm, $onlineAccuracy, $onlineRankedPlayers,
    $onlineErrors, $onlineTimedOut, ONLINE_WORD_COUNTS,
    prepareOnlineRace, startOnlineRace, stopOnlineLobby, typeOnlineText,
} from "@/store/online";
import { completedRaceWords } from "@/lib/onlineRace";

const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;

const OnlineKeyboardContainer = () => {
    const phase = useStore($onlineLobbyState);
    const target = useStore($onlineTargetWords);
    const sentence = useStore($onlineSentence);
    const typed = useStore($onlineTypedText);
    const elapsed = useStore($onlineElapsed);
    const wpm = useStore($onlineWpm);
    const accuracy = useStore($onlineAccuracy);
    const errors = useStore($onlineErrors);
    const timedOut = useStore($onlineTimedOut);
    const ranked = useStore($onlineRankedPlayers);
    const input = useRef<HTMLInputElement>(null);
    const [focused, setFocused] = useState(false);
    const racing = phase === 'racing';
    const finished = phase === 'finished';
    const ready = phase === 'idle';
    const completed = completedRaceWords(sentence, typed);
    const rank = ranked.findIndex(player => player.isYou) + 1;
    const opponentCount = ranked.filter(player => !player.isYou).length;

    useEffect(() => {
        prepareOnlineRace();
        return stopOnlineLobby;
    }, []);

    useEffect(() => {
        if (racing) input.current?.focus({ preventScroll: true });
    }, [racing]);

    const newRace = () => {
        prepareOnlineRace(target);
        startOnlineRace();
    };

    return (
        <div className="online-workspace" data-phase={phase}>
            <header className="online-heading">
                <div><span className="online-eyebrow">a little friendly competition</span><h1>Find your racing rhythm.</h1><p>Race your past pace. Set a new personal best.</p></div>
                <div className="online-mode-note"><span><i />Past attempts</span><p>Recorded runs from your history.<br />Ready when you are.</p></div>
            </header>

            <p className="online-multiplayer-link"><a href="/multiplayer-typing-race/">Multiplayer typing race — play with friends <ArrowRight size={14} /></a></p>

            <div className="online-race-controls">
                <div className="online-length-picker" role="group" aria-label="Race length"><span>Race length</span>{ONLINE_WORD_COUNTS.map(count => <button key={count} type="button" aria-pressed={count === target} disabled={!ready && !finished} onClick={() => prepareOnlineRace(count)}>{count}<span> words</span></button>)}</div>
                <span className="online-race-rule">Accuracy counts. Correct mistakes to move ahead.</span>
            </div>

            <section className="online-race-panel" aria-label="Typing race">
                <div className="online-race-toolbar">
                    <span className="online-status"><i data-active={racing} />{ready ? 'Ready at the starting line' : phase === 'countdown' ? 'Get your fingers ready' : racing ? 'Race in progress' : timedOut ? 'Time limit reached' : 'Across the finish line'}</span>
                    <div className="online-live-stats"><span><strong>{racing || finished ? wpm : '—'}</strong> wpm</span><span><strong>{racing || finished ? `${accuracy}%` : '—'}</strong> accuracy</span><span><strong>{formatTime(elapsed)}</strong></span></div>
                </div>
                <div className="online-you-progress" role="progressbar" aria-label="Your race progress" aria-valuemin={0} aria-valuemax={target} aria-valuenow={completed}><span style={{ width: `${completed / target * 100}%` }} /></div>
                <div className="online-writing-area">
                    <div id="keyboard-container" data-kb-loaded={sentence ? 1 : 0}>
                        <div id="keyboard-wrapper">
                            {racing && <input ref={input} id="kb-hidden-input" type="text" value={typed} onChange={event => typeOnlineText(event.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} aria-label="Race typing input" aria-describedby="online-typing-instructions" />}
                            <div id="keyboard" data-kb-focused={!racing || focused ? 1 : 0} data-preview={ready || phase === 'countdown'}><Paragraph paragraphText={sentence} typedText={typed} isActive={racing} /></div>
                        </div>
                    </div>
                    {(ready || phase === 'countdown') && <OnlineLobby />}
                    {racing && !focused && <button className="online-focus-button" type="button" onClick={() => input.current?.focus()}><MousePointer2 size={16} />Click to keep racing</button>}
                </div>
                <div className="online-panel-footer"><p id="online-typing-instructions">{ready ? 'A short countdown, then the track is yours.' : phase === 'countdown' ? 'The typing area will focus when the race begins.' : finished ? `${completed} / ${target} words · ${errors} incorrect ${errors === 1 ? 'press' : 'presses'}` : `${completed} / ${target} words · space advances after a correct word`}</p>{(racing || finished) && <button type="button" onClick={newRace}><RotateCcw size={14} />{finished ? 'Race again' : 'Restart race'}</button>}</div>
            </section>

            {finished && <section className="online-result" aria-labelledby="online-result-title"><div><span className="online-eyebrow"><Flag size={13} />{timedOut ? 'take another run' : opponentCount ? `finished ${rank} of ${ranked.length}` : 'your first pace recorded'}</span><h2 id="online-result-title">{timedOut ? 'Time for a fresh start.' : !opponentCount ? 'A pace to build on.' : rank === 1 ? 'First over the line.' : 'A little faster. A little steadier.'}</h2><p>{timedOut ? 'This race reached the 10-minute limit. Try a shorter track.' : `${wpm} wpm · ${accuracy}% accuracy · ${elapsed.toFixed(1)} seconds. Your result is saved to typing history.`}</p></div><button className="online-primary-action" type="button" onClick={newRace}>Race again<ArrowRight size={16} /></button></section>}

            <OnlineAnalyticsContainer />
            <div className="online-bottom-note"><p><kbd>space</kbd> next word <span>·</span><kbd>backspace</kbd> correct a mistake</p><a href="/">Prefer your own pace?<span>Solo practice<ArrowRight size={13} /></span></a></div>
        </div>
    );
};

export default OnlineKeyboardContainer;
