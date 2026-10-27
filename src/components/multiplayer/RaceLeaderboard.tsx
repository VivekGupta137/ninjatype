import { Check, Flag, Trophy } from 'lucide-react';
import { Tooltip } from '@heroui/react';
import type { CSSProperties } from 'react';
import type { Standing } from '@/lib/multiplayer/standings';
import Avatar from './Avatar';

export default function RaceLeaderboard({ players, selfId, finished, track = false, timed = false }: { players: Standing[]; selfId?: string; finished: boolean; track?: boolean; timed?: boolean }) {
    const leaders = players.slice(0, 5);
    const selfIndex = players.findIndex(player => player.id === selfId);
    const rows = leaders.map((player, index) => ({ player, rank: index + 1 }));
    if (selfIndex >= 5) rows.push({ player: players[selfIndex], rank: selfIndex + 1 });

    return <section className={`multiplayer-leaderboard${track ? ' multiplayer-race-track' : ''}`} aria-labelledby="race-leaders-title">
        <div className="multiplayer-leaderboard-heading">
            <Trophy size={15} aria-hidden="true" /><h2 id="race-leaders-title">{track ? 'Live race progress' : 'Leaderboard'}</h2>
            <div className="multiplayer-leaderboard-meta"><span>{players.length > 5 ? 'Top 5' : `${players.length} ${players.length === 1 ? 'racer' : 'racers'}`}</span><span className="multiplayer-leaderboard-state" data-finished={finished}><span aria-hidden="true" />{finished ? 'Final' : 'Live'}</span></div>
        </div>
        {track && <div className="multiplayer-shared-track" aria-label="Racers’ passage progress">
            <div className="multiplayer-track-lane">
                <span className="multiplayer-track-start">Start</span><Flag className="multiplayer-track-finish" size={16} aria-label={timed ? 'Passage end' : 'Finish'} />
                {rows.map(({ player, rank }, index) => <Tooltip key={player.id} delay={100}><Tooltip.Trigger<"button"> render={props => <button {...props} type="button" className="multiplayer-track-marker" data-you={player.id === selfId} style={{ '--track-position': `${player.completion ?? 0}%`, '--track-offset': `${(index % 3 - 1) * 16}px` } as CSSProperties} aria-label={`${player.nickname}${player.id === selfId ? ', you' : ''}: rank ${rank}, ${player.wpm ?? 'no'} WPM, ${player.completion ?? 0}% passage complete`} />}><Avatar username={player.nickname} settings={player.avatar} /></Tooltip.Trigger><Tooltip.Content>{player.nickname} · #{rank} · {player.wpm ?? '—'} WPM · {player.completion ?? 0}%</Tooltip.Content></Tooltip>)}
            </div>
            <div className="multiplayer-track-scale" aria-hidden="true"><span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>{timed ? 'Passage end' : '100% · finish'}</span></div>
        </div>}
        <ol className="multiplayer-leaderboard-list">
            {rows.map(({ player, rank }) => {
                const you = player.id === selfId;
                const complete = player.completion === 100;
                const leading = rank === 1 && player.correctChars > 0;
                return <li key={player.id} value={rank} data-you={you} data-leading={leading} data-outside-top={rank > 5} data-tone={complete ? 'success' : you ? 'primary' : 'neutral'}>
                    <span className="multiplayer-leaderboard-rank" aria-label={`Place ${rank}`}>{rank}</span>
                    <Avatar username={player.nickname} settings={player.avatar} />
                    <div className="multiplayer-leaderboard-runner">
                        <div className="multiplayer-leaderboard-player"><span title={player.nickname}>{player.nickname}</span>{you && <small>you</small>}{complete && <Check className="multiplayer-leaderboard-complete" size={12} aria-label="Passage complete" />}</div>
                        <div className="multiplayer-leaderboard-progress" role="progressbar" aria-label={`${player.nickname}'s completion`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={player.completion ?? undefined} aria-valuetext={player.completion === null ? 'No score available' : `${player.completion}% complete`}><span style={{ width: `${player.completion ?? 0}%` }} /></div>
                    </div>
                    <div className="multiplayer-leaderboard-score"><strong className="multiplayer-leaderboard-wpm">{player.wpm ?? '—'}<small> WPM</small></strong><span className="multiplayer-leaderboard-completion">{player.completion === null ? '—' : `${player.completion}%`}</span></div>
                </li>;
            })}
        </ol>
        {track && <p className="multiplayer-track-note">{timed ? 'Passage progress · the timer decides when this race ends.' : 'Positions update periodically. Final results are confirmed when the race ends.'}</p>}
        {!players.length && <p className="multiplayer-leaderboard-empty">Standings appear when the race starts.</p>}
    </section>;
}
