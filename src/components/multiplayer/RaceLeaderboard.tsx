import { Trophy } from 'lucide-react';
import type { Standing } from '@/lib/multiplayer/standings';
import Avatar from './Avatar';

export default function RaceLeaderboard({ players, selfId, finished }: { players: Standing[]; selfId?: string; finished: boolean }) {
    return <section className="multiplayer-leaderboard" aria-labelledby="race-leaders-title">
        <div className="multiplayer-leaderboard-heading"><Trophy size={15} /><h2 id="race-leaders-title">Leaderboard</h2><span>{finished ? 'Final' : 'Top 5'}</span></div>
        <ol className="multiplayer-leaderboard-list">
            {players.slice(0, 5).map((player, index) => <li key={player.id} data-you={player.id === selfId} data-tone={player.completion === 100 ? 'success' : player.id === selfId ? 'primary' : 'neutral'}>
                <span className="multiplayer-leaderboard-rank">{index + 1}</span><Avatar username={player.nickname} />
                <span className="multiplayer-leaderboard-player" title={player.nickname}><span>{player.nickname}</span>{player.id === selfId && <small>you</small>}</span>
                <strong className="multiplayer-leaderboard-wpm">{player.wpm ?? '—'}<small> WPM</small></strong>
                <div className="multiplayer-leaderboard-completion"><span>{player.completion === null ? '—' : `${player.completion}%`}</span>{player.completion !== null && <div className="multiplayer-leaderboard-progress" role="progressbar" aria-label={`${player.nickname}'s completion`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={player.completion}><span style={{ width: `${player.completion}%` }} /></div>}</div>
            </li>)}
        </ol>
        {!players.length && <p className="multiplayer-leaderboard-empty">Standings appear when the race starts.</p>}
    </section>;
}
