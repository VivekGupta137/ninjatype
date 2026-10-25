import { Check, Trophy } from 'lucide-react';
import type { Standing } from '@/lib/multiplayer/standings';
import Avatar from './Avatar';

export default function RaceLeaderboard({ players, selfId, finished }: { players: Standing[]; selfId?: string; finished: boolean }) {
    const leaders = players.slice(0, 5);
    const selfIndex = players.findIndex(player => player.id === selfId);
    const rows = leaders.map((player, index) => ({ player, rank: index + 1 }));
    if (selfIndex >= 5) rows.push({ player: players[selfIndex], rank: selfIndex + 1 });

    return <section className="multiplayer-leaderboard" aria-labelledby="race-leaders-title">
        <div className="multiplayer-leaderboard-heading">
            <Trophy size={15} aria-hidden="true" /><h2 id="race-leaders-title">Leaderboard</h2>
            <div className="multiplayer-leaderboard-meta"><span>{players.length > 5 ? 'Top 5' : `${players.length} ${players.length === 1 ? 'racer' : 'racers'}`}</span><span className="multiplayer-leaderboard-state" data-finished={finished}><span aria-hidden="true" />{finished ? 'Final' : 'Live'}</span></div>
        </div>
        <ol className="multiplayer-leaderboard-list">
            {rows.map(({ player, rank }) => {
                const you = player.id === selfId;
                const complete = player.completion === 100;
                const leading = rank === 1 && player.correctChars > 0;
                return <li key={player.id} value={rank} data-you={you} data-leading={leading} data-outside-top={rank > 5} data-tone={complete ? 'success' : you ? 'primary' : 'neutral'}>
                    <span className="multiplayer-leaderboard-rank" aria-label={`Place ${rank}`}>{rank}</span>
                    <Avatar username={player.nickname} />
                    <div className="multiplayer-leaderboard-runner">
                        <div className="multiplayer-leaderboard-player"><span title={player.nickname}>{player.nickname}</span>{you && <small>you</small>}{complete && <Check className="multiplayer-leaderboard-complete" size={12} aria-label="Passage complete" />}</div>
                        <div className="multiplayer-leaderboard-progress" role="progressbar" aria-label={`${player.nickname}'s completion`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={player.completion ?? undefined} aria-valuetext={player.completion === null ? 'No score available' : `${player.completion}% complete`}><span style={{ width: `${player.completion ?? 0}%` }} /></div>
                    </div>
                    <div className="multiplayer-leaderboard-score"><strong className="multiplayer-leaderboard-wpm">{player.wpm ?? '—'}<small> WPM</small></strong><span className="multiplayer-leaderboard-completion">{player.completion === null ? '—' : `${player.completion}%`}</span></div>
                </li>;
            })}
        </ol>
        {!players.length && <p className="multiplayer-leaderboard-empty">Standings appear when the race starts.</p>}
    </section>;
}
