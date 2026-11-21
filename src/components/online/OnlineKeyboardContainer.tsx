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
import { tr, practiceHrefFor, raceHrefFor, type LearnLocale } from '@/lib/learnLocale';

function ShadowHowTo({ locale = 'en' }: { locale?: LearnLocale }) {
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
                <Accordion.Heading><Accordion.Trigger>{tr(locale, 'How your shadow works', 'So funktioniert dein Schatten')}<Accordion.Indicator><ChevronDown /></Accordion.Indicator></Accordion.Trigger></Accordion.Heading>
                <Accordion.Panel><Accordion.Body>{tr(locale, 'Your shadow follows the average WPM of your fastest valid saved attempt today, projected onto this passage. Today resets at midnight in your local time. Choose All-time best to race your lifetime record. It’s a pace to chase, rather than a replay of each keystroke. If you have no saved pace today, finish a run to set today’s benchmark. Each new race uses the best saved pace for your selection.', 'Dein Schatten folgt dem Durchschnitts-WPM deines schnellsten gespeicherten Versuchs von heute, projiziert auf diesen Text. „Heute“ setzt sich um Mitternacht deiner Ortszeit zurück. Wähle „Allzeit-Bestwert“, um gegen deinen Rekord zu tippen. Es ist ein Tempo zum Jagen — keine Wiederholung einzelner Anschläge. Ohne gespeichertes Tempo heute setzt ein Lauf den Tages-Benchmark. Jedes Rennen nutzt das beste gespeicherte Tempo deiner Auswahl.')}</Accordion.Body></Accordion.Panel>
            </Accordion.Item>
        </Accordion>
    </div>;
}

const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;

export default function OnlineKeyboardContainer({ locale = 'en' }: { locale?: LearnLocale }) {
    const T = (en: string, de: string) => tr(locale, en, de);
    const phase = useStore($onlineLobbyState);
    const target = useStore($onlineTargetWords);
    const benchmark = useStore($onlineBenchmark);
    const today = benchmark === 'today';
    const benchmarkLabel = today ? T('Today’s best', 'Heutiger Bestwert') : T('All-time best', 'Allzeit-Bestwert');
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
        <header className="online-heading shadow-heading"><div><span className="online-eyebrow"><Ghost size={14} />{T('SOLO CHALLENGE · GHOST RACE', 'SOLO-CHALLENGE · GHOST RACE')}</span><h1>{T('Ghost typing race', 'Tippgeschwindigkeit üben')}<span>.</span></h1><p>{T('A solo typing game against today’s best pace. Just you and your shadow.', 'Ghost Race: Tippe gegen dein bestes Tempo von heute — mit deinem Schatten als Gegner.')}</p></div><TextLink variant="muted" size="sm" href="#shadow-how-to">{T('How it works →', 'So funktioniert es →')}</TextLink></header>

        <section className="shadow-setup" data-busy={racing || phase === 'countdown'} aria-label={T("Set up your solo race", "Richte dein Solo-Rennen ein")}>
            <div className="shadow-length">{racing || phase === 'countdown' ? <span className="shadow-active-length"><Flag size={14} />{target} {T('words', 'Wörter')}</span> : <><span>{T('Race length', 'Rennlänge')}</span><ToggleButtonGroup className="key-group shadow-length-picker" aria-label={T("Race length", "Rennlänge")} selectionMode="single" disallowEmptySelection isDisabled={!ready && !finished} selectedKeys={new Set([String(target)])} onSelectionChange={keys => {
                const count = Number(Array.from(keys)[0]);
                if (ONLINE_WORD_COUNTS.includes(count as typeof ONLINE_WORD_COUNTS[number])) prepareOnlineRace(count);
            }}>{ONLINE_WORD_COUNTS.map(count => <ToggleButton key={count} id={String(count)} className="key-btn key-btn--ghost">{count} {T('words', 'Wörter')}</ToggleButton>)}</ToggleButtonGroup></>}</div>
            <div className="shadow-benchmark">
                <span className="shadow-icon"><Ghost size={22} /></span>
                <div className="shadow-benchmark-details">
                    {racing || phase === 'countdown' ? <span className="online-eyebrow">{benchmarkLabel.toUpperCase()}</span> : <Dropdown>
                        <KeyButton variant="ghost" size="sm" className="shadow-benchmark-trigger" aria-label={`${T("Race against", "Tippen gegen")}: ${benchmarkLabel}`}>
                            {benchmarkLabel}<ChevronDown size={14} aria-hidden="true" />
                        </KeyButton>
                        <Dropdown.Popover className="shadow-benchmark-popover" placement="bottom end">
                            <Dropdown.Menu aria-label={T("Race against", "Tippen gegen")} selectionMode="single" disallowEmptySelection selectedKeys={new Set([benchmark])} onAction={key => {
                                if ((key === 'today' || key === 'all') && key !== benchmark) prepareOnlineRace(target, key);
                            }}>
                                <Dropdown.Item id="today" textValue={T("Today’s best", "Heutiger Bestwert")}><Label>{T("Today’s best", "Heutiger Bestwert")}</Label><Dropdown.ItemIndicator /></Dropdown.Item>
                                <Dropdown.Item id="all" textValue={T("All-time best", "Allzeit-Bestwert")}><Label>{T("All-time best", "Allzeit-Bestwert")}</Label><Dropdown.ItemIndicator /></Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown>}
                    <p>{shadow ? <><strong>{shadow.avgWpm}</strong> WPM <span>· {T('your shadow’s pace', 'das Tempo deines Schattens')}</span></> : today ? T('No pace today. Set your first benchmark.', 'Heute noch kein Tempo. Setze deinen ersten Benchmark.') : T('No shadow yet. Make your first mark.', 'Noch kein Schatten. Setze dein erstes Zeichen.')}</p>
                    {shadow?.recordedAttempt && <small>{shadow.recordedAttempt.accuracy}% {T('accuracy', 'Genauigkeit')} · <time dateTime={new Date(shadow.recordedAttempt.timestamp).toISOString()}>{new Date(shadow.recordedAttempt.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time></small>}
                </div>
            </div>
        </section>

        <section className="online-race-panel shadow-panel" aria-label={finished ? T('Solo race results', 'Ergebnisse des Solo-Rennens') : T('Solo typing race', 'Solo-Tipp-Rennen')}>
            {finished ? <div className="shadow-result-heading" data-tone={timedOut ? 'warning' : !shadow || beatShadow || matchedShadow ? 'success' : 'primary'}><div className="shadow-result-copy"><span className="shadow-outcome-icon">{timedOut ? <Clock3 size={24} /> : newBest ? <Trophy size={24} /> : <Check size={24} />}</span><div><span className="shadow-status" data-tone={timedOut ? 'warning' : newBest || !shadow ? 'success' : 'primary'}>{timedOut ? T('Time limit reached', 'Zeitlimit erreicht') : newBest ? (today ? T('New best today', 'Neuer Bestwert heute') : T('New all-time best', 'Neuer Allzeit-Bestwert')) : !shadow ? (today ? T('First pace today recorded', 'Erstes Tages-Tempo erfasst') : T('First pace recorded', 'Erstes Tempo erfasst')) : T('Run complete', 'Lauf abgeschlossen')}</span><h2>{timedOut ? T('Take a fresh run.', 'Starte einen neuen Lauf.') : !shadow ? T('Your shadow starts here.', 'Hier beginnt dein Schatten.') : beatShadow ? T('You beat your shadow.', 'Du hast deinen Schatten geschlagen.') : matchedShadow ? T('You matched your shadow.', 'Du hast dein Schatten-Tempo getroffen.') : T('A pace to build on.', 'Ein Tempo zum Weiteraufbauen.')}</h2><p>{timedOut ? T('Try a shorter track and find your rhythm.', 'Probiere eine kürzere Strecke und finde deinen Rhythmus.') : shadow ? <><span data-tone={difference > 0 ? 'success' : difference < 0 ? 'warning' : 'neutral'}>{difference > 0 ? '+' : ''}{Number(difference.toFixed(1))} WPM</span> {T('compared with', 'im Vergleich zu')} {today ? T('your previous best today', 'deinem bisherigen Bestwert heute') : T('your all-time best', 'deinem Allzeit-Bestwert')}.</> : T('Come back to the starting line and race this pace.', 'Kehre zur Startlinie zurück und tippe gegen dieses Tempo.')}</p></div></div><div className="shadow-result-action"><div className="share-result-controls"><KeyButton variant="primary" onPress={newRace}><RotateCcw size={15} />{T('Race again', 'Nochmal tippen')}</KeyButton>{!timedOut && <ShareResultButton result={{ challenge: 'ghost', wpm, accuracy, speed: 'correct', duration: elapsed, detail: `${target} ${T('words', 'Wörter')}` }} />}</div><p>{!timedOut && elapsed >= 1 && wpm > 0 ? T('Saved to your typing history', 'In deinem Tipp-Verlauf gespeichert') : T('Your best pace is kept', 'Dein bestes Tempo bleibt gespeichert')}</p></div></div> : <div className="online-race-toolbar"><Chip size="md" variant="soft" color={phase === 'countdown' ? 'warning' : racing ? 'success' : 'accent'}><Chip.Label>{ready ? T('Ready when you are', 'Bereit, wenn du es bist') : phase === 'countdown' ? T('Get your fingers ready', 'Finger bereit') : T('Race in progress', 'Rennen läuft')}</Chip.Label></Chip>{racing && shadow ? <span className="shadow-gap" data-tone={gap > 0 ? 'success' : gap < 0 ? 'warning' : 'neutral'}>{gap > 0 ? <ArrowUpRight size={14} /> : gap < 0 ? <ArrowDownRight size={14} /> : <Ghost size={14} />}{gap > 0 ? `${gap} ${gap === 1 ? T('word', 'Wort') : T('words', 'Wörter')} ${T('ahead', 'vorn')}` : gap < 0 ? `${Math.abs(gap)} ${gap === -1 ? T('word', 'Wort') : T('words', 'Wörter')} ${T('behind your shadow', 'hinter deinem Schatten')}` : T('Neck and neck', 'Gleichauf')}</span> : <span className="shadow-rule">{target} {T('words', 'Wörter')} · {T('accuracy comes first', 'Genauigkeit zuerst')}</span>}</div>}
            <div className="shadow-metrics res-details" role="group" aria-label={finished ? T('Your final typing metrics', 'Deine finalen Werte') : T('Your typing metrics', 'Deine Tipp-Werte')}>
                <MetricCard icon={<Gauge size={14} />} label={T('Your WPM', 'Dein WPM')} value={racing || finished ? wpm : '—'} unit="wpm" tone="primary" />
                <MetricCard icon={<ShieldCheck size={14} />} label={T('Accuracy', 'Genauigkeit')} value={racing || finished ? `${accuracy}%` : '—'} tone={accuracyTone === 'danger' ? 'error' : accuracyTone === 'neutral' ? undefined : accuracyTone} />
                <MetricCard icon={<Flag size={14} />} label={T('Words', 'Wörter')} value={`${completed} / ${target}`} tone={completed === target ? 'success' : 'primary'} />
                <MetricCard icon={<Clock3 size={14} />} label={finished ? T('Run time', 'Laufzeit') : T('Time', 'Zeit')} value={finished ? `${elapsed.toFixed(1)}s` : formatTime(elapsed)} tone={timedOut ? 'warning' : undefined} />
            </div>
            {!finished && <><div className="online-you-progress" role="progressbar" aria-label={T("Your race progress", "Dein Renn-Fortschritt")} aria-valuemin={0} aria-valuemax={target} aria-valuenow={completed}><span style={{ width: `${completed / target * 100}%` }} /></div><div className="online-writing-area"><div id="keyboard-container" data-kb-loaded={sentence ? 1 : 0}><div id="keyboard-wrapper">
                {racing && <input ref={input} id="kb-hidden-input" type="text" value={typed} onChange={event => typeOnlineText(event.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} aria-label={T("Solo race typing input", "Solo-Rennen-Eingabe")} aria-describedby="online-typing-instructions" />}
                <div id="keyboard" data-kb-focused={!racing || focused ? 1 : 0} data-preview={ready}><Paragraph paragraphText={sentence} typedText={typed} isActive={racing} ghostTypedChars={ghostTypedChars} /></div>
            </div></div>{(ready || phase === 'countdown') && <OnlineLobby locale={locale} />}{racing && !focused && <KeyButton className="online-focus-button" onPress={() => input.current?.focus()}><MousePointer2 size={16} />{T('Click to keep typing', 'Klicke, um weiter zu tippen')}</KeyButton>}</div><div className="online-panel-footer"><p id="online-typing-instructions">{ready ? T('A three-second countdown. Then the track is yours.', 'Ein Drei-Sekunden-Countdown. Dann gehört die Strecke dir.') : phase === 'countdown' ? T('Read the opening words. Typing starts when the countdown ends.', 'Lies die Anfangswörter. Das Tippen startet nach dem Countdown.') : shadow ? T('Underlined characters show your shadow’s progress. Correct each word, then press space.', 'Unterstrichene Zeichen zeigen den Fortschritt deines Schattens. Korrigiere jedes Wort, dann Leertaste.') : T('Correct the word, then press space to move ahead.', 'Korrigiere das Wort, dann Leertaste für das nächste.')}</p>{racing && <KeyButton variant="ghost" size="sm" onPress={newRace}><RotateCcw size={14} />{T('Restart', 'Neustart')}</KeyButton>}</div></>}
            <OnlineAnalyticsContainer />
            {finished && <div className="shadow-result-footer"><p>{completed}/{target} {T('words', 'Wörter')} · {errors} {T('incorrect', 'falsche')} {errors === 1 ? T('press', 'Anschlag') : T('presses', 'Anschläge')}</p><details><summary>{T('View passage', 'Text ansehen')}<span aria-hidden="true">+</span></summary><p>{sentence}</p></details></div>}
        </section>
        <div className="shadow-bottom-links"><TextLink variant="muted" size="sm" href={practiceHrefFor(locale)}>{T('Free practice →', 'Kostenlos üben →')}</TextLink><TextLink variant="muted" size="sm" href={raceHrefFor(locale)}>{T('Race with friends →', 'Mit Freunden tippen →')}</TextLink></div>
        <ShadowHowTo locale={locale} />
    </div>;
}
