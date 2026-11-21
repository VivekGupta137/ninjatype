import { useStore } from '@nanostores/react';
import { Check, Ghost, Keyboard } from 'lucide-react';
import { Chip, ProgressBar } from '@heroui/react';
import { $onlineLobbyState, $onlinePlayers, $onlineTargetWords } from '@/store/online';

export default function OnlineAnalyticsContainer() {
    const phase = useStore($onlineLobbyState);
    const players = useStore($onlinePlayers);
    const target = useStore($onlineTargetWords);
    const waiting = phase === 'idle' || phase === 'countdown';
    const shown = [...players].sort((a, b) => Number(b.isYou) - Number(a.isYou));
    const shadow = players.find(player => !player.isYou);
    return <section className="shadow-track" aria-labelledby="online-track-title"><div className="shadow-track-heading"><h2 id="online-track-title">{shadow ? 'You and your shadow' : 'Your starting pace'}</h2><span>{waiting ? 'Same starting line' : phase === 'finished' ? 'Final comparison' : 'Live progress'}</span></div><ul className="shadow-lanes">{shown.map(player => {
        const complete = player.finishedAt !== null;
        const progress = Math.min(100, Math.floor(player.progressWords / target * 100));
        return <li key={player.id} data-you={player.isYou} data-tone={player.isYou ? complete ? 'success' : 'primary' : 'warning'}><span className="shadow-lane-icon">{player.isYou ? <Keyboard size={18} /> : <Ghost size={18} />}</span><div className="shadow-lane-name"><strong>{player.name}</strong><span>{player.isYou ? 'This run' : player.recordedAttempt ? <>{player.recordedAttempt.accuracy}% accuracy · <time dateTime={new Date(player.recordedAttempt.timestamp).toISOString()}>{new Date(player.recordedAttempt.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time></> : 'Your best recorded pace'}</span></div><div className="shadow-lane-progress"><ProgressBar aria-label={`${player.name} progress`} value={progress} className="shadow-lane-bar"><ProgressBar.Track><ProgressBar.Fill /></ProgressBar.Track></ProgressBar></div><span className="shadow-lane-completion">{complete ? <Chip size="sm" variant="soft" color="success"><Check size={11} /><Chip.Label>{player.finishedAt!.toFixed(1)}s</Chip.Label></Chip> : `${progress}%`}</span><span className="shadow-lane-speed"><strong>{player.isYou ? waiting ? '—' : player.currentWpm : player.avgWpm}</strong> WPM</span></li>;
    })}</ul>{!shadow && <p className="shadow-first-note">Your completed run becomes a pace to chase next time.</p>}</section>;
}
