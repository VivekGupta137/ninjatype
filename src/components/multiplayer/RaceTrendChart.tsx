import { useState } from 'react';
import { trendWpm, type RaceTrends } from '@/lib/multiplayer/trends';
import type { Round } from '@/lib/multiplayer/protocol';

const COLORS = ['#38bdf8', '#a78bfa', '#34d399', '#fb923c', '#f472b6', '#facc15', '#2dd4bf', '#818cf8', '#fb7185', '#a3e635'];
const WIDTH = 760, HEIGHT = 270, LEFT = 52, RIGHT = 18, TOP = 20, BOTTOM = 38;
export default function RaceTrendChart({ round, trends, collecting }: { round: Round; trends: RaceTrends | null; collecting: boolean }) {
    const [metric, setMetric] = useState<'wpm' | 'completion'>('wpm');
    const [hidden, setHidden] = useState<Set<string>>(new Set());
    const duration = Math.max(1, ((round.endedAt ?? round.deadline) - round.startAt) / 1000);
    const series = round.players.map((player, index) => ({ ...player, color: COLORS[index % COLORS.length],
        points: trends?.roundId === round.id ? trends.samples[player.id] ?? [] : [] }));
    const value = (point: { at: number; correctChars: number }) => metric === 'wpm'
        ? trendWpm(point, round.startAt) : Math.round(point.correctChars / Math.max(1, round.text.length) * 100);
    const highest = Math.max(40, ...series.filter(p => !hidden.has(p.id)).flatMap(p => p.points.map(value)));
    const maxY = metric === 'completion' ? 100 : Math.ceil(highest / 20) * 20;
    const x = (at: number) => LEFT + Math.max(0, Math.min(duration, (at - round.startAt) / 1000)) / duration * (WIDTH - LEFT - RIGHT);
    const y = (v: number) => HEIGHT - BOTTOM - Math.min(maxY, v) / maxY * (HEIGHT - TOP - BOTTOM);
    return <section className="multiplayer-trend-chart" aria-labelledby="race-trends-title">
        <div className="multiplayer-trend-heading"><div><h3 id="race-trends-title">Race performance</h3><p>{collecting ? 'Collecting final scores…' : 'Race over. Compare how everyone typed.'}</p></div>
            <div className="multiplayer-trend-modes" role="group" aria-label="Chart metric"><button type="button" aria-pressed={metric === 'wpm'} onClick={() => setMetric('wpm')}>WPM</button><button type="button" aria-pressed={metric === 'completion'} onClick={() => setMetric('completion')}>Completion</button></div>
        </div>
        <svg className="multiplayer-trend-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-labelledby="race-trend-description">
            <title id="race-trend-description">{metric === 'wpm' ? 'Words per minute' : 'Passage completion percentage'} over the race for all {round.players.length} players</title>
            {[0, 1, 2, 3, 4].map(i => <g key={i}><line className="multiplayer-trend-grid" x1={LEFT} x2={WIDTH - RIGHT} y1={y(maxY * i / 4)} y2={y(maxY * i / 4)} /><text x={LEFT - 10} y={y(maxY * i / 4) + 4} textAnchor="end">{Math.round(maxY * i / 4)}{metric === 'completion' ? '%' : ''}</text><text x={x(round.startAt + duration * i / 4 * 1000)} y={HEIGHT - 14} textAnchor="middle">{Math.round(duration * i / 4)}s</text></g>)}
            {series.filter(player => !hidden.has(player.id)).map(player => <g key={player.id}>
                <polyline fill="none" stroke={player.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" points={player.points.map(point => `${x(point.at)},${y(value(point))}`).join(' ')} />
                {player.points.map(point => <circle key={point.at} cx={x(point.at)} cy={y(value(point))} r="3" fill={player.color}><title>{player.nickname}: {value(point)}{metric === 'wpm' ? ' WPM' : '% of passage'} at {((point.at - round.startAt) / 1000).toFixed(1)}s</title></circle>)}
            </g>)}
        </svg>
        <div className="multiplayer-trend-legend" aria-label="Show or hide players">{series.map(player => <button key={player.id} type="button" aria-pressed={!hidden.has(player.id)} onClick={() => setHidden(previous => {
            const next = new Set(previous); if (next.has(player.id)) next.delete(player.id); else next.add(player.id); return next;
        })}><i style={{ backgroundColor: player.color }} /><span>{player.nickname}</span><small>{player.metrics ? `${player.metrics.wpm} WPM` : player.points.length > 1 ? 'Sampled' : 'No samples'}</small></button>)}</div>
        <p className="multiplayer-trend-note">Lines use samples available in this browser. Final points use validated scores. Select a player to show or hide their line.</p>
    </section>;
}
