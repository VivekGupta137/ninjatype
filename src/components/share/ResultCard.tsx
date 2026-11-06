import type { AvatarImages } from '@/lib/shareAvatarImage';
import CardAvatar from './CardAvatar';
import { useId } from 'react';
import { DEFAULT_CARD_PALETTE, type CardPalette } from '@/lib/shareThemes';
import { QWERTY_ROWS } from '@/constants/qwertyLayout';
import { CHALLENGES, SHARE_DICTIONARIES, isShareDictionary, type ShareResult } from '@/lib/shareResult';

export const CARD_FORMATS = {
    landscape: { label: 'Landscape', hint: '1200 × 630', width: 1200, height: 630 },
    square: { label: 'Square', hint: '1080 × 1080', width: 1080, height: 1080 },
    story: { label: 'Story', hint: '1080 × 1920', width: 1080, height: 1920 },
} as const;
export type CardFormat = keyof typeof CARD_FORMATS;

/** The Learn keyboard, drawn with export-safe SVG primitives. Only F/J are highlighted;
 * these are home-position markers, not invented per-key performance statistics. */
function CardKeyboard({ x, y, width, palette, minimal = false }: { x: number; y: number; width: number; palette: CardPalette; minimal?: boolean }) {
    return <g transform={`translate(${x} ${y}) scale(${width / 1000})`} aria-hidden="true" fontFamily="Arial, Helvetica, sans-serif">
        {QWERTY_ROWS.slice(1).map((row, rowIndex) => {
            const rowWidth = row.length * 64 + (row.length - 1) * 10;
            return <g key={rowIndex} transform={`translate(${(1000 - rowWidth) / 2} ${rowIndex * 82})`}>
                {row.map((key, index) => {
                    const home = key === 'f' || key === 'j';
                    return <g key={key} transform={`translate(${index * 74} 0)`}>
                        <rect width="64" height="70" rx="11" fill={home ? palette.surface : palette.bg} stroke={home ? palette.main : palette.border} strokeWidth="2" />
                        {!minimal && <text x="32" y="43" textAnchor="middle" fontSize="26" fill={home ? palette.text : palette.muted}>{key}</text>}
                        {home && <rect x="24" y="56" width="16" height="4" rx="2" fill={palette.text} />}
                    </g>;
                })}
            </g>;
        })}
        <rect x="345" y="246" width="310" height="56" rx="11" fill={palette.bg} stroke={palette.border} strokeWidth="2" />
        {!minimal && <text x="500" y="282" textAnchor="middle" fontSize="23" fill={palette.muted}>space</text>}
    </g>;
}

/** Result values are escaped text. The only image is generated locally from DiceBear. */
export default function ResultCard({ result, format = 'landscape', palette = DEFAULT_CARD_PALETTE, avatarImages }: { avatarImages?: AvatarImages; result: ShareResult; format?: CardFormat; palette?: CardPalette }) {
    const id = useId().replace(/[^a-zA-Z0-9]/g, '');
    const wide = format === 'landscape';
    const story = format === 'story';
    const height = wide ? 630 : story ? 2133 : 1200;
    const layout = wide
        ? { header: 48, avatar: 72, hello: 220, score: 374, speed: 158, unit: 52, subtitle: 416, keyboard: 150, keyboardWidth: 1130, stats: 556, rule: 506 }
        : story
            ? { header: 190, avatar: 88, hello: 720, score: 988, speed: 260, unit: 82, subtitle: 1070, keyboard: 720, keyboardWidth: 1160, stats: 1440, rule: 1370 }
            : { header: 78, avatar: 88, hello: 392, score: 622, speed: 230, unit: 74, subtitle: 696, keyboard: 396, keyboardWidth: 1180, stats: 1040, rule: 964 };
    const nameX = 56 + layout.avatar + 18;
    const nameSize = Math.min(wide ? 34 : 42, 680 / Math.max(1, Array.from(result.username).length));
    const challenge = result.challenge ? CHALLENGES[result.challenge] : undefined;
    const detail = isShareDictionary(result.dictionary) ? SHARE_DICTIONARIES[result.dictionary].label : result.detail;
    const sessionDetail = [result.duration !== undefined ? `${result.duration}s` : undefined, detail].filter(Boolean).join(' · ');
    const stats = [
        ...(result.accuracy !== undefined ? [{ value: `${result.accuracy}%`, label: 'accuracy' }] : []),
        ...(sessionDetail ? [{ value: sessionDetail, label: result.duration !== undefined && detail ? 'duration · dictionary' : result.duration !== undefined ? 'duration' : 'session' }] : []),
        ...(challenge ? [{ value: challenge.label, label: 'practice type' }] : []),
    ];
    const metricXs = stats.length === 3 ? [218, 600, 982] : stats.length === 2 ? [335, 865] : [600];
    return <svg xmlns="http://www.w3.org/2000/svg" width={CARD_FORMATS[format].width} height={CARD_FORMATS[format].height} viewBox={`0 0 1200 ${height}`} role="img" aria-labelledby={`${id}-title ${id}-desc`}>
        <title id={`${id}-title`}>{`${result.username}'s typing achievement`}</title>
        <desc id={`${id}-desc`}>{result.streak ? `${result.streak}-day practice streak. All-time best typing speed: ` : ''}{result.wpm} {result.speed} WPM{result.accuracy !== undefined ? `, ${result.accuracy}% accuracy` : ''}. {challenge ? `${challenge.label}.` : ''} {detail} {result.duration !== undefined ? `${result.duration} seconds.` : ''} QWERTY keyboard with F and J home-position markers. Shared by the player; not a verified score.</desc>
        <defs>
            <radialGradient id={`${id}-fade`}><stop offset="0%" stopColor={palette.bg} stopOpacity=".97" /><stop offset="65%" stopColor={palette.bg} stopOpacity=".87" /><stop offset="100%" stopColor={palette.bg} stopOpacity="0" /></radialGradient>
            <clipPath id={`${id}-frame`}><rect width="1200" height={height} rx="24" /></clipPath>
        </defs>
        <g clipPath={`url(#${id}-frame)`}>
            <rect width="1200" height={height} fill={palette.bg} />
            <g opacity=".48"><CardKeyboard x={(1200 - layout.keyboardWidth) / 2} y={layout.keyboard} width={layout.keyboardWidth} palette={palette} /></g>
            {<ellipse cx="600" cy={(layout.hello + layout.subtitle) / 2} rx="470" ry={wide ? 220 : 360} fill={`url(#${id}-fade)`} />}
        </g>
        <rect x="1" y="1" width="1198" height={height - 2} rx="24" fill="none" stroke={palette.border} strokeWidth="2" />
        <CardAvatar images={avatarImages} username={result.username} style={result.avatar} variant={result.avatarVariant} x={56} y={layout.header} size={layout.avatar} />
        <g fontFamily="Arial, Helvetica, sans-serif" fill={palette.text}>
            <text x={nameX} y={layout.header + layout.avatar / 2 + nameSize * .35} fontSize={nameSize} fontWeight="600">{result.username}</text>
            <text x="1144" y={layout.header + layout.avatar / 2 + 7} textAnchor="end" fontSize={wide ? 20 : 23} fill={palette.muted}>ninjatype.com</text>
        </g>
        <g fontFamily="Arial, Helvetica, sans-serif" textAnchor="middle" fill={palette.text}>
            <text x="600" y={layout.hello} fontSize={wide ? 42 : story ? 60 : 65} fontWeight="500" letterSpacing="-1.5">{result.streak ? `${result.streak} ${result.streak === 1 ? 'day' : 'days'} streak. Still growing.` : 'Hi I can now type at'}</text>
            <text x="600" y={layout.score} fontSize={layout.speed} fontWeight="800" letterSpacing={wide ? -7 : -11}>
                <tspan fill={palette.main}>{result.wpm}</tspan><tspan fontSize={layout.unit} fontWeight="500" letterSpacing="-2"> wpm</tspan>
            </text>
            <text x="600" y={layout.subtitle} fontSize={wide ? 17 : 25} letterSpacing="1" fill={palette.muted}>{result.streak ? 'all-time best · words per minute' : result.speed === 'correct' ? 'correct words per minute' : 'words per minute'}</text>
        </g>
        {stats.length > 0 && <path d={`M56 ${layout.rule}H1144`} stroke={palette.border} />}
        <g fontFamily="Arial, Helvetica, sans-serif" textAnchor="middle">
            {stats.map((stat, i) => <g key={stat.label}>
                <text x={metricXs[i]} y={layout.stats} fontSize={Math.min(wide ? 23 : 28, 330 / Math.max(1, Array.from(stat.value).length))} fontWeight="600" fill={palette.text}>{stat.value}</text>
                <text x={metricXs[i]} y={layout.stats + (wide ? 24 : 36)} fontSize={wide ? 13 : 17} fill={palette.muted}>{stat.label}</text>
            </g>)}
        </g>
        {story && <text x="600" y="1890" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="25" fill={palette.muted}>ninjatype.com</text>}
    </svg>;
}
