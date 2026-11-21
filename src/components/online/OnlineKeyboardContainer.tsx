import { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { Accordion, Chip, Dropdown, Label, ToggleButton, ToggleButtonGroup } from '@heroui/react';
import KeyButton from '@/components/ui/KeyButton';
import TextLink from '@/components/ui/TextLink';
import { MetricCard } from '@/components/analytics/ResultOverview';
import '@/styles/results.css';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, ChevronDown, Clock3, Flag, Gauge, Ghost, MousePointer2, RotateCcw, ShieldCheck, Trophy } from 'lucide-react';
import Paragraph from '@/components/keyboard/Paragraph';
import OnlineLobby from './OnlineLobby';
import ShareResultButton from '@/components/share/ShareResultButton';
import OnlineAnalyticsContainer from './OnlineAnalyticsContainer';
import {
    $onlineLobbyState, $onlineTargetWords, $onlineSentence, $onlineTypedText,
    $onlineElapsed, $onlineWpm, $onlineAccuracy, $onlinePlayers,
    $onlineErrors, $onlineAttempts, $onlineTimedOut, $onlineBenchmark, ONLINE_WORD_COUNTS,
    prepareOnlineRace, startOnlineRace, stopOnlineLobby, typeOnlineText,
} from '@/store/online';
import { completedRaceWords } from '@/lib/onlineRace';

function ShadowHowTo() {
    const [open, setOpen] = useState<Set<string | number>>(new Set());
    useEffect(() => {
        const reveal = () => { if (window.location.hash === '#shadow-how-to') setOpen(new Set(['how'])); };
        reveal();
        window.addEventListener('hashchange', reveal);
        return () => window.removeEventListener('hashchange', reveal);
    }, []);
    return <div id="shadow-how-to" className="shadow-how-to">
        <Accordion variant="surface" expandedKeys={open} onExpandedChange={keys => setOpen(new Set(keys))}>
            <Accordion.Item id="how">
                <Accordion.Heading><Accordion.Trigger>How your shadow works<Accordion.Indicator><ChevronDown /></Accordion.Indicator></Accordion.Trigger></Accordion.Heading>
                <Accordion.Panel><Accordion.Body>Your shadow follows the average WPM of your fastest valid saved attempt today, projected onto this passage. Today resets at midnight in your local time. Choose All-time best to race your lifetime record. It’s a pace to chase, rather than a replay of each keystroke. If you have no saved pace today, finish a run to set today’s benchmark. Each new race uses the best saved pace for your selection.</Accordion.Body></Accordion.Panel>
            </Accordion.Item>
        </Accordion>
    </div>;
}

const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;

export default function OnlineKeyboardContainer() {
    const phase = useStore($onlineLobbyState);
    const target = useStore($onlineTargetWords);
    const benchmark = useStore($onlineBenchmark);
    const today = benchmark === 'today';
    const benchmarkLabel = today ? 'Today’s best' : 'All-time best';
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
    const ghostTypedChars = racing && shadow ? Math.min(sentence.length, Math.floor(elapsed * shadow.avgWpm * 5 / 60)) : 0;
    const finished = phase === 'finished';
    const ready = phase === 'idle';
    const completed = completedRaceWords(sentence, typed);
    const accuracyTone = !attempts ? 'neutral' : accuracy >= 95 ? 'success' : accuracy >= 90 ? 'primary' : accuracy >= 80 ? 'warning' : 'danger';
    const difference = shadow ? wpm - shadow.avgWpm : 0;
    const expectedFinish = shadow ? sentence.length / 5 / shadow.avgWpm * 60 : null;
    const beatShadow = finished && !timedOut && expectedFinish !== null && elapsed < expectedFinish - .05;
    const matchedShadow = finished && !timedOut && expectedFinish !== null && Math.abs(elapsed - expectedFinish) <= .05;
    const newBest = finished && !timedOut && !!shadow && difference > 0;
    const gap = shadow ? Math.trunc(completed - shadow.progressWords) : 0;

    useEffect(() => {
        prepareOnlineRace($onlineTargetWords.get(), 'today');
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
        <header className="online-heading shadow-heading"><div><span className="online-eyebrow"><Ghost size={14} />SOLO CHALLENGE</span><h1>Ghost typing race<span>.</span></h1><p>A solo typing game against today’s best pace. Just you and your shadow.</p></div><TextLink variant="muted" size="sm" href="#shadow-how-to">How it works →</TextLink></header>

        <section className="shadow-setup" data-busy={racing || phase === 'countdown'} aria-label="Set up your solo race">
            <div className="shadow-length">{racing || phase === 'countdown' ? <span className="shadow-active-length"><Flag size={14} />{target} words</span> : <><span>Race length</span><ToggleButtonGroup className="key-group shadow-length-picker" aria-label="Race length" selectionMode="single" disallowEmptySelection isDisabled={!ready && !finished} selectedKeys={new Set([String(target)])} onSelectionChange={keys => {
                const count = Number(Array.from(keys)[0]);
                if (ONLINE_WORD_COUNTS.includes(count as typeof ONLINE_WORD_COUNTS[number])) prepareOnlineRace(count);
            }}>{ONLINE_WORD_COUNTS.map(count => <ToggleButton key={count} id={String(count)} className="key-btn key-btn--ghost">{count} words</ToggleButton>)}</ToggleButtonGroup></>}</div>
            <div className="shadow-benchmark">
                <span className="shadow-icon"><Ghost size={22} /></span>
                <div className="shadow-benchmark-details">
                    {racing || phase === 'countdown' ? <span className="online-eyebrow">{benchmarkLabel.toUpperCase()}</span> : <Dropdown>
                        <KeyButton variant="ghost" size="sm" className="shadow-benchmark-trigger" aria-label={`Race against: ${benchmarkLabel}`}>
                            {benchmarkLabel}<ChevronDown size={14} aria-hidden="true" />
                        </KeyButton>
                        <Dropdown.Popover className="shadow-benchmark-popover" placement="bottom end">
                            <Dropdown.Menu aria-label="Race against" selectionMode="single" disallowEmptySelection selectedKeys={new Set([benchmark])} onAction={key => {
                                if ((key === 'today' || key === 'all') && key !== benchmark) prepareOnlineRace(target, key);
                            }}>
                                <Dropdown.Item id="today" textValue="Today’s best"><Label>Today’s best</Label><Dropdown.ItemIndicator /></Dropdown.Item>
                                <Dropdown.Item id="all" textValue="All-time best"><Label>All-time best</Label><Dropdown.ItemIndicator /></Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown>}
                    <p>{shadow ? <><strong>{shadow.avgWpm}</strong> WPM <span>· your shadow’s pace</span></> : today ? 'No pace today. Set your first benchmark.' : 'No shadow yet. Make your first mark.'}</p>
                    {shadow?.recordedAttempt && <small>{shadow.recordedAttempt.accuracy}% accuracy · <time dateTime={new Date(shadow.recordedAttempt.timestamp).toISOString()}>{new Date(shadow.recordedAttempt.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time></small>}
                </div>
            </div>
        </section>

        <section className="online-race-panel shadow-panel" aria-label={finished ? 'Solo race results' : 'Solo typing race'}>
            {finished ? <div className="shadow-result-heading" data-tone={timedOut ? 'warning' : !shadow || beatShadow || matchedShadow ? 'success' : 'primary'}><div className="shadow-result-copy"><span className="shadow-outcome-icon">{timedOut ? <Clock3 size={24} /> : newBest ? <Trophy size={24} /> : <Check size={24} />}</span><div><span className="shadow-status" data-tone={timedOut ? 'warning' : newBest || !shadow ? 'success' : 'primary'}>{timedOut ? 'Time limit reached' : newBest ? (today ? 'New best today' : 'New all-time best') : !shadow ? (today ? 'First pace today recorded' : 'First pace recorded') : 'Run complete'}</span><h2>{timedOut ? 'Take a fresh run.' : !shadow ? 'Your shadow starts here.' : beatShadow ? 'You beat your shadow.' : matchedShadow ? 'You matched your shadow.' : 'A pace to build on.'}</h2><p>{timedOut ? 'Try a shorter track and find your rhythm.' : shadow ? <><span data-tone={difference > 0 ? 'success' : difference < 0 ? 'warning' : 'neutral'}>{difference > 0 ? '+' : ''}{Number(difference.toFixed(1))} WPM</span> compared with {today ? 'your previous best today' : 'your all-time best'}.</> : 'Come back to the starting line and race this pace.'}</p></div></div><div className="shadow-result-action"><div className="share-result-controls"><KeyButton variant="primary" onPress={newRace}><RotateCcw size={15} />Race again</KeyButton>{!timedOut && <ShareResultButton result={{ challenge: 'ghost', wpm, accuracy, speed: 'correct', duration: elapsed, detail: `${target} words` }} />}</div><p>{!timedOut && elapsed >= 1 && wpm > 0 ? 'Saved to your typing history' : 'Your best pace is kept'}</p></div></div> : <div className="online-race-toolbar"><Chip size="md" variant="soft" color={phase === 'countdown' ? 'warning' : racing ? 'success' : 'accent'}><Chip.Label>{ready ? 'Ready when you are' : phase === 'countdown' ? 'Get your fingers ready' : 'Race in progress'}</Chip.Label></Chip>{racing && shadow ? <span className="shadow-gap" data-tone={gap > 0 ? 'success' : gap < 0 ? 'warning' : 'neutral'}>{gap > 0 ? <ArrowUpRight size={14} /> : gap < 0 ? <ArrowDownRight size={14} /> : <Ghost size={14} />}{gap > 0 ? `${gap} ${gap === 1 ? 'word' : 'words'} ahead` : gap < 0 ? `${Math.abs(gap)} ${gap === -1 ? 'word' : 'words'} behind your shadow` : 'Neck and neck'}</span> : <span className="shadow-rule">{target} words · accuracy comes first</span>}</div>}
            <div className="shadow-metrics res-details" role="group" aria-label={finished ? 'Your final typing metrics' : 'Your typing metrics'}>
                <MetricCard icon={<Gauge size={14} />} label="Your WPM" value={racing || finished ? wpm : '—'} unit="wpm" tone="primary" />
                <MetricCard icon={<ShieldCheck size={14} />} label="Accuracy" value={racing || finished ? `${accuracy}%` : '—'} tone={accuracyTone === 'danger' ? 'error' : accuracyTone === 'neutral' ? undefined : accuracyTone} />
                <MetricCard icon={<Flag size={14} />} label="Words" value={`${completed} / ${target}`} tone={completed === target ? 'success' : 'primary'} />
                <MetricCard icon={<Clock3 size={14} />} label={finished ? 'Run time' : 'Time'} value={finished ? `${elapsed.toFixed(1)}s` : formatTime(elapsed)} tone={timedOut ? 'warning' : undefined} />
            </div>
            {!finished && <><div className="online-you-progress" role="progressbar" aria-label="Your race progress" aria-valuemin={0} aria-valuemax={target} aria-valuenow={completed}><span style={{ width: `${completed / target * 100}%` }} /></div><div className="online-writing-area"><div id="keyboard-container" data-kb-loaded={sentence ? 1 : 0}><div id="keyboard-wrapper">
                {racing && <input ref={input} id="kb-hidden-input" type="text" value={typed} onChange={event => typeOnlineText(event.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} aria-label="Solo race typing input" aria-describedby="online-typing-instructions" />}
                <div id="keyboard" data-kb-focused={!racing || focused ? 1 : 0} data-preview={ready}><Paragraph paragraphText={sentence} typedText={typed} isActive={racing} ghostTypedChars={ghostTypedChars} /></div>
            </div></div>{(ready || phase === 'countdown') && <OnlineLobby />}{racing && !focused && <KeyButton className="online-focus-button" onPress={() => input.current?.focus()}><MousePointer2 size={16} />Click to keep typing</KeyButton>}</div><div className="online-panel-footer"><p id="online-typing-instructions">{ready ? 'A three-second countdown. Then the track is yours.' : phase === 'countdown' ? 'Read the opening words. Typing starts when the countdown ends.' : shadow ? 'Underlined characters show your shadow’s progress. Correct each word, then press space.' : 'Correct the word, then press space to move ahead.'}</p>{racing && <KeyButton variant="ghost" size="sm" onPress={newRace}><RotateCcw size={14} />Restart</KeyButton>}</div></>}
            <OnlineAnalyticsContainer />
            {finished && <div className="shadow-result-footer"><p>{completed}/{target} words · {errors} incorrect {errors === 1 ? 'press' : 'presses'}</p><details><summary>View passage<span aria-hidden="true">+</span></summary><p>{sentence}</p></details></div>}
        </section>
        <div className="shadow-bottom-links"><TextLink variant="muted" size="sm" href="/">Free practice →</TextLink><TextLink variant="muted" size="sm" href="/multiplayer-typing-race/">Race with friends →</TextLink></div>
        <ShadowHowTo />
    </div>;
}
