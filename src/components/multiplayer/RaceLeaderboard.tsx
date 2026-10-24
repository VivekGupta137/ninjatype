import { Trophy } from 'lucide-react';
import type { Standing } from '@/lib/multiplayer/standings';
import Avatar from './Avatar';

export default function RaceLeaderboard({ players, selfId, finished }: { players: Standing[]; selfId?: string; finished: boolean }) {
    return <aside className="multiplayer-leaderboard" aria-labelledby="race-leaders-title">
        <div className="multiplayer-leaderboard-heading"><Trophy size={15} /><h2 id="race-leaders-title">Leaderboard</h2><span className="multiplayer-status-pill" data-tone={finished ? 'success' : 'primary'}>{finished ? 'Final' : 'Live'}</span></div>
        <p className="multiplayer-leaderboard-hint">{finished ? 'Final race standings' : 'Top 5 · updates about every 3s'}</p>
        <ol className="multiplayer-leaderboard-list">
            {players.slice(0, 5).map((player, index) => <li key={player.id} data-you={player.id === selfId} data-tone={player.completion === 100 ? 'success' : player.id === selfId ? 'primary' : 'neutral'}>
                <span className="multiplayer-leaderboard-rank">{index + 1}</span><Avatar username={player.nickname} />
                <div className="multiplayer-leaderboard-player"><span title={player.nickname}>{player.nickname}{player.id === selfId && <small className="multiplayer-you-label">you</small>}</span>
                    <div className="multiplayer-leaderboard-stats"><strong>{player.wpm ?? '—'} <small>WPM</small></strong><span>{player.completion === null ? 'Awaiting score' : `${player.completion}% complete`}</span></div>
                    {player.completion !== null && <div className="multiplayer-leaderboard-progress" role="progressbar" aria-label={`${player.nickname}'s completion`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={player.completion}><span style={{ width: `${player.completion}%` }} /></div>}
                </div>
            </li>)}
        </ol>
        {!players.length && <p className="multiplayer-leaderboard-empty">Standings appear when the race starts.</p>}
    </aside>;
}
