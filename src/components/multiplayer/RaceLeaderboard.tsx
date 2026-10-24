import { Trophy } from 'lucide-react';
import type { Standing } from '@/lib/multiplayer/standings';
import Avatar from './Avatar';

export default function RaceLeaderboard({ players, selfId, finished }: { players: Standing[]; selfId?: string; finished: boolean }) {
    return <aside className="multiplayer-leaderboard" aria-labelledby="race-leaders-title">
        <div className="multiplayer-leaderboard-heading"><Trophy size={14} /><h2 id="race-leaders-title">Top 5 players</h2></div>
        <p className="multiplayer-leaderboard-hint">{finished ? 'Final race standings' : 'Live estimates · updates about every 10s'}</p>
        <ol className="multiplayer-leaderboard-list">
            {players.slice(0, 5).map((player, index) => <li key={player.id} data-you={player.id === selfId}>
                <span className="multiplayer-leaderboard-rank">{index + 1}</span><Avatar username={player.nickname} />
                <div className="multiplayer-leaderboard-player"><span title={player.nickname}>{player.nickname}{player.id === selfId && <small> you</small>}</span>
                    <div className="multiplayer-leaderboard-stats"><strong>{player.wpm ?? '—'} <small>WPM</small></strong><span>{player.completion === null ? 'Awaiting score' : `${player.completion}% complete`}</span></div>
                    {player.completion !== null && <div className="multiplayer-leaderboard-progress" role="progressbar" aria-label={`${player.nickname}'s completion`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={player.completion}><span style={{ width: `${player.completion}%` }} /></div>}
                </div>
            </li>)}
        </ol>
        {!players.length && <p className="multiplayer-leaderboard-empty">Standings appear when the race starts.</p>}
    </aside>;
}
