import { useStore } from "@nanostores/react";
import { Check } from "lucide-react";
import { $onlineLobbyState, $onlineRankedPlayers, $onlineTargetWords } from "@/store/online";

const OnlineAnalyticsContainer = () => {
    const phase = useStore($onlineLobbyState);
    const players = useStore($onlineRankedPlayers);
    const target = useStore($onlineTargetWords);
    const waiting = phase === 'idle' || phase === 'countdown';
    // Stable starting positions; ranking takes over once everyone is moving.
    const shown = waiting ? [...players].sort((a, b) => Number(b.isYou) - Number(a.isYou) || a.id.localeCompare(b.id)) : players;

    const opponentCount = players.filter(player => !player.isYou).length;
    return <section className="online-track" aria-labelledby="online-track-title"><div className="online-track-heading"><h2 id="online-track-title">{phase === 'finished' ? 'At the finish line' : 'On the track'}</h2><span>{opponentCount ? `You + ${opponentCount} past ${opponentCount === 1 ? 'attempt' : 'attempts'}` : 'Your first run'} <span>·</span> {waiting ? 'ready when you are' : phase === 'finished' ? 'finish order, then progress' : 'race standings'}</span></div>
        <ol className="online-racers">{shown.map((player, i) => {
            const complete = player.finishedAt !== null;
            const progress = complete ? 100 : Math.min(99, Math.floor(player.progressWords / target * 100));
            return <li key={player.id} className="online-racer" data-you={player.isYou} data-finished={complete}>
                <span className="online-racer-rank">{waiting ? '—' : `${i + 1}`.padStart(2, '0')}</span>
                <div className="online-racer-name"><span>{player.name}{player.isYou && <small>you</small>}</span><span>{player.isYou ? 'Your lane' : player.recordedAttempt ? <time dateTime={new Date(player.recordedAttempt.timestamp).toISOString()}>{new Date(player.recordedAttempt.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {player.recordedAttempt.accuracy}% accuracy</time> : 'Past attempt'}</span></div>
                <div className="online-racer-lane"><div className="online-racer-progress" role="progressbar" aria-label={`${player.name} progress`} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress}%` }} /></div></div>
                <span className="online-racer-completion">{complete ? <><Check size={12} />{player.finishedAt!.toFixed(1)}s</> : `${progress}%`}</span>
                <span className="online-racer-speed"><strong>{waiting ? '—' : complete && !player.isYou ? Math.round(player.avgWpm) : Math.round(player.currentWpm)}</strong><span> wpm</span></span>
            </li>;
        })}</ol>
        <p className="online-ranking-note">{opponentCount ? 'Recorded speeds are matched to this track. Finish order decides the result.' : 'Your completed runs will appear here as past attempts.'}</p>
    </section>;
};

export default OnlineAnalyticsContainer;
