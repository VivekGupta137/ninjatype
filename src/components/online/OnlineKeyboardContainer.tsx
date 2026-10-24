import { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { Label, ListBox } from '@heroui/react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, Clock3, Flag, Gauge, Ghost, MousePointer2, RotateCcw, ShieldCheck, Trophy } from 'lucide-react';
import Paragraph from '@/components/keyboard/Paragraph';
import OnlineLobby from './OnlineLobby';
import OnlineAnalyticsContainer from './OnlineAnalyticsContainer';
import {
    $onlineLobbyState, $onlineTargetWords, $onlineSentence, $onlineTypedText,
    $onlineElapsed, $onlineWpm, $onlineAccuracy, $onlinePlayers,
    $onlineErrors, $onlineAttempts, $onlineTimedOut, ONLINE_WORD_COUNTS,
    prepareOnlineRace, startOnlineRace, stopOnlineLobby, typeOnlineText,
} from '@/store/online';
import { completedRaceWords } from '@/lib/onlineRace';

const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;

export default function OnlineKeyboardContainer() {
    const phase = useStore($onlineLobbyState);
    const target = useStore($onlineTargetWords);
    const sentence = useStore($onlineSentence);
    const typed = useStore($onlineTypedText);
    const elapsed = useStore($onlineElapsed);
    const wpm = useStore($onlineWpm);
    const accuracy = useStore($onlineAccuracy);
    const errors = useStore($onlineErrors);
    const attempts = useStore($onlineAttempts);
    const timedOut = useStore($onlineTimedOut);
    const players = useStore($onlinePlayers);
    const shadow = players.find(player => !player.isYou);
    const input = useRef<HTMLInputElement>(null);
    const [focused, setFocused] = useState(false);
    const racing = phase === 'racing';
    const finished = phase === 'finished';
    const ready = phase === 'idle';
    const completed = completedRaceWords(sentence, typed);
    const accuracyTone = !attempts ? 'neutral' : accuracy >= 95 ? 'success' : accuracy >= 90 ? 'primary' : accuracy >= 80 ? 'warning' : 'danger';
    const difference = shadow ? wpm - shadow.avgWpm : 0;
    const expectedFinish = shadow ? sentence.length / 5 / shadow.avgWpm * 60 : null;
    const beatShadow = finished && !timedOut && expectedFinish !== null && elapsed < expectedFinish - .05;
    const matchedShadow = finished && !timedOut && expectedFinish !== null && Math.abs(elapsed - expectedFinish) <= .05;
    const personalBest = finished && !timedOut && !!shadow && difference > 0;
    const gap = shadow ? Math.trunc(completed - shadow.progressWords) : 0;

    useEffect(() => {
        prepareOnlineRace();
        if (window.location.hash === '#shadow-how-to') {
            const help = document.querySelector<HTMLDetailsElement>('#shadow-how-to');
            if (help) help.open = true;
        }
        return stopOnlineLobby;
    }, []);
    useEffect(() => {
        if (racing) {
            input.current?.focus({ preventScroll: true });
            const area = input.current?.closest('.online-writing-area');
            const bounds = area?.getBoundingClientRect();
            if (bounds && (bounds.top < 0 || bounds.bottom > window.innerHeight)) area?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
    }, [racing]);
    const newRace = () => { prepareOnlineRace(target); startOnlineRace(); };

    return <div className="online-workspace online-solo-workspace" data-phase={phase}>
        <header className="online-heading shadow-heading"><div><span className="online-eyebrow"><Ghost size={14} />SOLO CHALLENGE</span><h1>Ghost typing race<span>.</span></h1><p>A solo typing game against your best saved pace. Just you and your shadow.</p></div><a href="#shadow-how-to" onClick={() => { const help = document.querySelector<HTMLDetailsElement>('#shadow-how-to'); if (help) help.open = true; }}>How it works<ArrowRight size={14} /></a></header>

        <section className="shadow-setup" data-busy={racing || phase === 'countdown'} aria-label="Set up your solo race">
            <div className="shadow-length">{racing || phase === 'countdown' ? <span className="shadow-active-length"><Flag size={14} />{target} words</span> : <><span>Race length</span><ListBox className="shadow-length-picker" aria-label="Race length" selectionMode="single" disallowEmptySelection selectedKeys={new Set([String(target)])} onSelectionChange={keys => {
                const count = Number(Array.from(keys)[0]);
                if (ONLINE_WORD_COUNTS.includes(count as typeof ONLINE_WORD_COUNTS[number])) prepareOnlineRace(count);
            }}>{ONLINE_WORD_COUNTS.map(count => <ListBox.Item key={count} id={String(count)} textValue={`${count} words`} className="shadow-length-choice" isDisabled={!ready && !finished}><Label>{count} words</Label><ListBox.ItemIndicator /></ListBox.Item>)}</ListBox></>}</div>
            <div className="shadow-benchmark"><span className="shadow-icon"><Ghost size={22} /></span><div><span className="online-eyebrow">{shadow ? 'YOUR PERSONAL BEST' : 'YOUR FIRST BENCHMARK'}</span><p>{shadow ? <><strong>{shadow.avgWpm}</strong> WPM <span>· your shadow’s pace</span></> : 'No shadow yet. Make your first mark.'}</p>{shadow?.recordedAttempt && <small>{shadow.recordedAttempt.accuracy}% accuracy · <time dateTime={new Date(shadow.recordedAttempt.timestamp).toISOString()}>{new Date(shadow.recordedAttempt.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time></small>}</div></div>
        </section>

        <section className="online-race-panel shadow-panel" aria-label={finished ? 'Solo race results' : 'Solo typing race'}>
            {finished ? <div className="shadow-result-heading" data-tone={timedOut ? 'warning' : !shadow || beatShadow || matchedShadow ? 'success' : 'primary'}><div className="shadow-result-copy"><span className="shadow-outcome-icon">{timedOut ? <Clock3 size={24} /> : personalBest ? <Trophy size={24} /> : <Check size={24} />}</span><div><span className="shadow-status" data-tone={timedOut ? 'warning' : personalBest || !shadow ? 'success' : 'primary'}>{timedOut ? 'Time limit reached' : personalBest ? 'New personal best' : !shadow ? 'First pace recorded' : 'Run complete'}</span><h2>{timedOut ? 'Take a fresh run.' : !shadow ? 'Your shadow starts here.' : beatShadow ? 'You beat your shadow.' : matchedShadow ? 'You matched your shadow.' : 'A pace to build on.'}</h2><p>{timedOut ? 'Try a shorter track and find your rhythm.' : shadow ? <><span data-tone={difference > 0 ? 'success' : difference < 0 ? 'warning' : 'neutral'}>{difference > 0 ? '+' : ''}{Number(difference.toFixed(1))} WPM</span> compared with your previous best.</> : 'Come back to the starting line and race this pace.'}</p></div></div><div className="shadow-result-action"><button type="button" className="online-primary-action" onClick={newRace}><RotateCcw size={15} />Race again</button><p>{!timedOut && elapsed >= 1 && wpm > 0 ? 'Saved to your typing history' : 'Your best pace is kept'}</p></div></div> : <div className="online-race-toolbar"><span className="shadow-status" data-tone={phase === 'countdown' ? 'warning' : 'primary'}><i />{ready ? 'Ready when you are' : phase === 'countdown' ? 'Get your fingers ready' : 'Race in progress'}</span>{racing && shadow ? <span className="shadow-gap" data-tone={gap > 0 ? 'success' : gap < 0 ? 'warning' : 'neutral'}>{gap > 0 ? <ArrowUpRight size={14} /> : gap < 0 ? <ArrowDownRight size={14} /> : <Ghost size={14} />}{gap > 0 ? `${gap} ${gap === 1 ? 'word' : 'words'} ahead` : gap < 0 ? `${Math.abs(gap)} ${gap === -1 ? 'word' : 'words'} behind your shadow` : 'Neck and neck'}</span> : <span className="shadow-rule">{target} words · accuracy comes first</span>}</div>}
            <dl className="shadow-metrics" aria-label={finished ? 'Your final typing metrics' : 'Your typing metrics'}>
                <div data-tone="primary"><dt><Gauge size={14} />Your WPM</dt><dd>{racing || finished ? wpm : '—'}<span>words / min</span></dd></div>
                <div data-tone={accuracyTone}><dt><ShieldCheck size={14} />Accuracy</dt><dd>{racing || finished ? `${accuracy}%` : '—'}<span>correct presses</span></dd></div>
                <div data-tone={completed === target ? 'success' : 'primary'}><dt><Flag size={14} />Words</dt><dd>{completed}<span>of {target} words</span></dd></div>
                <div data-tone={timedOut ? 'warning' : 'neutral'}><dt><Clock3 size={14} />{finished ? 'Run time' : 'Time'}</dt><dd>{finished ? `${elapsed.toFixed(1)}s` : formatTime(elapsed)}<span>{finished ? 'round complete' : 'your own rhythm'}</span></dd></div>
            </dl>
            {!finished && <><div className="online-you-progress" role="progressbar" aria-label="Your race progress" aria-valuemin={0} aria-valuemax={target} aria-valuenow={completed}><span style={{ width: `${completed / target * 100}%` }} /></div><div className="online-writing-area"><div id="keyboard-container" data-kb-loaded={sentence ? 1 : 0}><div id="keyboard-wrapper">
                {racing && <input ref={input} id="kb-hidden-input" type="text" value={typed} onChange={event => typeOnlineText(event.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} aria-label="Solo race typing input" aria-describedby="online-typing-instructions" />}
                <div id="keyboard" data-kb-focused={!racing || focused ? 1 : 0} data-preview={ready || phase === 'countdown'}><Paragraph paragraphText={sentence} typedText={typed} isActive={racing} /></div>
            </div></div>{(ready || phase === 'countdown') && <OnlineLobby />}{racing && !focused && <button className="online-focus-button" type="button" onClick={() => input.current?.focus()}><MousePointer2 size={16} />Click to keep typing</button>}</div><div className="online-panel-footer"><p id="online-typing-instructions">{ready ? 'A three-second countdown. Then the track is yours.' : phase === 'countdown' ? 'Your typing input will focus when the race begins.' : 'Correct the word, then press space to move ahead.'}</p>{racing && <button type="button" onClick={newRace}><RotateCcw size={14} />Restart</button>}</div></>}
            <OnlineAnalyticsContainer />
            {finished && <div className="shadow-result-footer"><p>{completed}/{target} words · {errors} incorrect {errors === 1 ? 'press' : 'presses'}</p><details><summary>View passage<span aria-hidden="true">+</span></summary><p>{sentence}</p></details></div>}
        </section>
        <div className="shadow-bottom-links"><a href="/">Free practice<ArrowRight size={13} /></a><a href="/multiplayer-typing-race/">Race with friends<ArrowRight size={13} /></a></div>
        <details id="shadow-how-to" className="shadow-how-to"><summary>How your shadow works<span aria-hidden="true">+</span></summary><p>Your shadow follows the average WPM of your fastest valid saved attempt, projected onto this passage. It’s a pace to chase, rather than a replay of each keystroke. Finish your first run to set a benchmark. Each new race uses your best saved pace.</p></details>
    </div>;
}
