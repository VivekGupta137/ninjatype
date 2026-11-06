import { SHARE_AVATAR_STYLES, SHARE_AVATAR_RADIX, MAX_AVATAR_VARIANT, isShareAvatarStyle, type ShareAvatarStyle } from './shareAvatar';
import { WORD_TYPES, QUOTE_TYPES } from '@/constants/wordTypes';
import { SHARE_THEME_IDS, isShareTheme, type ShareTheme } from './shareThemes';
import { isShareMessage, shareMessage } from './shareMessages';

/** Public, editable result snapshots. Base64 is transport, never proof of a score. */
export const MAX_USERNAME_LENGTH = 40;
export const MAX_RESULT_LENGTH = 1024;
// Public client-side obfuscation, not authentication. Keep this key stable for x1 links.
const SHARE_XOR_KEY = 'dontcheatpls';
const SHARE_XOR_PREFIX = 'x1.';
const xorBytes = (bytes: Uint8Array): Uint8Array =>
    bytes.map((byte, index) => byte ^ SHARE_XOR_KEY.charCodeAt(index % SHARE_XOR_KEY.length));
export const CHALLENGES = {
    time: { label: 'Timed typing', href: '/' },
    words: { label: 'Word challenge', href: '/' },
    quotes: { label: 'Quote typing', href: '/' },
    ghost: { label: 'Ghost Race', href: '/ghost-race/' },
    multiplayer: { label: 'Multiplayer race', href: '/multiplayer-typing-race/' },
    learn: { label: 'Touch typing', href: '/learn/' },
} as const;
export type ShareResult = {
    v: 1;
    username: string;
    wpm: number;
    accuracy?: number;
    challenge?: keyof typeof CHALLENGES;
    speed: 'raw' | 'correct';
    detail?: string;
    duration?: number;
    dictionary?: string;
    theme?: ShareTheme;
    avatar?: ShareAvatarStyle;
    avatarVariant?: number;
    /** Current gentle streak; its speed is the player's all-time personal best. */
    streak?: number;
    /** Stable wording ID; zero/omitted preserves the original card message. */
    message?: number;
};
export type ResultSnapshot = Omit<ShareResult, 'v' | 'username'>;
const allowedKeys = new Set(['v', 'username', 'wpm', 'accuracy', 'challenge', 'speed', 'detail', 'duration', 'dictionary', 'theme', 'avatar', 'avatarVariant', 'streak', 'message']);
export const SHARE_DICTIONARIES = { ...WORD_TYPES, ...QUOTE_TYPES };
export const isShareDictionary = (value: unknown): value is keyof typeof SHARE_DICTIONARIES => typeof value === 'string' && Object.hasOwn(SHARE_DICTIONARIES, value);
const safeName = /^[\p{L}\p{M}\p{N} ._'’-]+$/u;
const safeDetail = /^[\p{L}\p{M}\p{N} ._'’·:/()-]+$/u;

export function usernameError(value: string): string | null {
    const name = value.normalize('NFC').trim();
    if (!name) return 'Enter a display name.';
    if (Array.from(name).length > MAX_USERNAME_LENGTH) return 'Use 40 characters or fewer.';
    if (!safeName.test(name)) return "Use letters, numbers, spaces, dots, underscores, apostrophes or hyphens.";
    return null;
}
const boundedNumber = (value: unknown, min: number, max: number): value is number =>
    typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;

/** Reject unknown fields and wrong types, then construct a fresh allowlisted record. */
export function validateShareResult(value: unknown): ShareResult | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const item = value as Record<string, unknown>;
    if (Object.keys(item).some(key => !allowedKeys.has(key)) || item.v !== 1) return null;
    if (typeof item.username !== 'string' || item.username.length > 160 || usernameError(item.username)) return null;
    if (!boundedNumber(item.wpm, 0, 500) || (item.accuracy !== undefined && !boundedNumber(item.accuracy, 0, 100))) return null;
    if (item.dictionary !== undefined && !isShareDictionary(item.dictionary)) return null;
    if (item.avatar !== undefined && !isShareAvatarStyle(item.avatar)) return null;
    if (item.avatarVariant !== undefined && (!boundedNumber(item.avatarVariant, 0, MAX_AVATAR_VARIANT) || !Number.isInteger(item.avatarVariant))) return null;
    if (item.theme !== undefined && !isShareTheme(item.theme)) return null;
    if (item.challenge !== undefined && (typeof item.challenge !== 'string' || !Object.hasOwn(CHALLENGES, item.challenge))) return null;
    if (item.speed !== 'raw' && item.speed !== 'correct') return null;
    if (item.streak !== undefined && (!boundedNumber(item.streak, 1, 36500) || !Number.isInteger(item.streak))) return null;
    if (item.message !== undefined && !isShareMessage(item.message, item.streak !== undefined)) return null;
    if (item.duration !== undefined && !boundedNumber(item.duration, 0.1, 3600)) return null;
    if (item.detail !== undefined && (typeof item.detail !== 'string' || !item.detail.trim() ||
        Array.from(item.detail).length > 48 || !safeDetail.test(item.detail))) return null;
    return {
        v: 1, username: item.username.normalize('NFC').trim(),
        wpm: Math.round(item.wpm * 10) / 10,
        ...(item.streak !== undefined ? { streak: item.streak as number } : {}),
        ...(item.message ? { message: item.message as number } : {}),
        ...(item.accuracy !== undefined ? { accuracy: Math.round((item.accuracy as number) * 100) / 100 } : {}),
        ...(item.challenge !== undefined ? { challenge: item.challenge as ShareResult['challenge'] } : {}), speed: item.speed,
        ...(item.dictionary !== undefined ? { dictionary: item.dictionary as string } : {}),
        ...(item.avatar !== undefined ? { avatar: item.avatar as ShareAvatarStyle } : {}),
        ...(item.avatarVariant !== undefined ? { avatarVariant: item.avatarVariant as number } : {}),
        ...(item.theme !== undefined ? { theme: item.theme as ShareTheme } : {}),
        ...(item.detail !== undefined ? { detail: (item.detail as string).trim() } : {}),
        ...(item.duration !== undefined ? { duration: Math.round((item.duration as number) * 10) / 10 } : {}),
    };
}

/** UTF-8 compact tags → repeating-key XOR → URL-safe Base64. */
export function encodeShareResult(value: ShareResult): string {
    const result = validateShareResult(value);
    if (!result) throw new Error('This result cannot be shared. Check its fields.');
    const type = result.challenge === 'multiplayer' ? '1' : result.challenge === 'learn' ? '2' : result.challenge !== undefined ? '0' : undefined;
    const modes = { words: 'w', quotes: 'q', ghost: 'g' } as const;
    // Old links can carry a dictionary label instead of its key. Compact it when possible.
    const dictionary = result.dictionary ?? Object.keys(SHARE_DICTIONARIES).find(key =>
        result.detail?.includes(SHARE_DICTIONARIES[key as keyof typeof SHARE_DICTIONARIES].label));
    const avatarStyle = SHARE_AVATAR_STYLES.indexOf(result.avatar ?? 'gaze');
    const avatar = (avatarStyle < SHARE_AVATAR_RADIX ? avatarStyle : 0) + SHARE_AVATAR_RADIX * (result.avatarVariant ?? 0);
    const fields: [string, string | number | undefined][] = [
        ['av', avatar ? avatar.toString(36) : undefined],
        ['as', avatarStyle >= SHARE_AVATAR_RADIX ? avatarStyle.toString(36) : undefined],
        ['n', result.username], ['s', result.wpm], ['a', result.accuracy], ['t', type],
        ['sk', result.streak],
        ['c', result.message],
        ['st', result.speed === 'correct' ? 'c' : undefined], ['dk', dictionary], ['d', result.duration],
        ['m', result.challenge && result.challenge in modes ? modes[result.challenge as keyof typeof modes] : undefined],
        ['th', result.theme !== undefined ? SHARE_THEME_IDS.indexOf(result.theme).toString(36) : undefined],
        // Only keep free text for contexts without a dictionary, e.g. a lesson level.
        ['x', !dictionary ? result.detail : undefined],
    ];
    const text = fields.filter(([, value]) => value !== undefined).map(([key, value]) => `[${key}:${value}]`).join('');
    const encoded = SHARE_XOR_PREFIX + btoa(String.fromCharCode(...xorBytes(new TextEncoder().encode(text)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    if (encoded.length > MAX_RESULT_LENGTH) throw new Error('This result is too large to share.');
    return encoded;
}

function decodeCompact(text: string): ShareResult | null {
    const fields = new Map<string, string>();
    const known = new Set(['n', 's', 'a', 't', 'st', 'dk', 'd', 'm', 'th', 'x', 'av', 'as', 'sk', 'c']);
    const pattern = /\[([a-z]+):([^\[\]]*)\]/g;
    let end = 0;
    for (const match of text.matchAll(pattern)) {
        if (match.index !== end || !known.has(match[1]) || fields.has(match[1])) return null;
        fields.set(match[1], match[2]); end = match.index + match[0].length;
    }
    if (end !== text.length || !fields.has('n') || !fields.has('s')) return null;
    for (const key of ['s', 'a', 'd']) {
        if (fields.has(key) && !/^(?:0|[1-9]\d{0,3})(?:\.\d{1,2})?$/.test(fields.get(key)!)) return null;
    }
    const type = fields.get('t');
    if (fields.has('sk') && !/^[1-9]\d{0,4}$/.test(fields.get('sk')!)) return null;
    if (fields.has('c') && !/^[0-7]$/.test(fields.get('c')!)) return null;
    if (type !== undefined && !['0', '1', '2'].includes(type)) return null;
    const mode = fields.get('m');
    if (mode !== undefined && (type !== '0' || !['t', 'w', 'q', 'g'].includes(mode))) return null;
    const speed = fields.get('st');
    if (speed !== undefined && !['raw', 'r', 'correct', 'c'].includes(speed)) return null;
    const theme = fields.get('th');
    if (theme !== undefined && !/^[0-9ab]$/.test(theme)) return null;
    const avatar = fields.get('av');
    if (avatar !== undefined && (!/^(?:0|[1-9a-z][0-9a-z]{0,2})$/.test(avatar) || parseInt(avatar, 36) >= SHARE_AVATAR_RADIX * (MAX_AVATAR_VARIANT + 1))) return null;
    const avatarId = avatar === undefined ? 0 : parseInt(avatar, 36);
    if (avatarId % SHARE_AVATAR_RADIX >= SHARE_AVATAR_STYLES.length) return null;
    const style = fields.get('as');
    if (style !== undefined && (!/^[1-9a-z][0-9a-z]?$/.test(style) || parseInt(style, 36) < SHARE_AVATAR_RADIX || parseInt(style, 36) >= SHARE_AVATAR_STYLES.length || avatarId % SHARE_AVATAR_RADIX !== 0)) return null;
    const styleId = style === undefined ? avatarId % SHARE_AVATAR_RADIX : parseInt(style, 36);
    return validateShareResult({
        ...(styleId ? { avatar: SHARE_AVATAR_STYLES[styleId] } : {}),
        ...(Math.floor(avatarId / SHARE_AVATAR_RADIX) ? { avatarVariant: Math.floor(avatarId / SHARE_AVATAR_RADIX) } : {}),
        v: 1, username: fields.get('n'), wpm: Number(fields.get('s')),
        ...(fields.has('sk') ? { streak: Number(fields.get('sk')) } : {}),
        ...(fields.has('c') ? { message: Number(fields.get('c')) } : {}),
        ...(fields.has('a') ? { accuracy: Number(fields.get('a')) } : {}),
        ...(type !== undefined ? { challenge: type === '1' ? 'multiplayer' : type === '2' ? 'learn' : mode === 'w' ? 'words' : mode === 'q' ? 'quotes' : mode === 'g' ? 'ghost' : 'time' } : {}),
        speed: speed === 'c' || speed === 'correct' ? 'correct' : 'raw',
        ...(fields.has('dk') ? { dictionary: fields.get('dk') } : {}),
        ...(fields.has('d') ? { duration: Number(fields.get('d')) } : {}),
        ...(theme !== undefined ? { theme: SHARE_THEME_IDS[parseInt(theme, 36)] } : {}),
        ...(fields.has('x') ? { detail: fields.get('x') } : {}),
    });
}

export function decodeShareResult(encoded: string): ShareResult | null {
    if (!encoded || encoded.length > MAX_RESULT_LENGTH) return null;
    const obfuscated = encoded.startsWith(SHARE_XOR_PREFIX);
    const payload = obfuscated ? encoded.slice(SHARE_XOR_PREFIX.length) : encoded;
    if (!/^[A-Za-z0-9_-]+$/.test(payload) || payload.length % 4 === 1) return null;
    try {
        const binary = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
        const text = new TextDecoder('utf-8', { fatal: true }).decode(obfuscated ? xorBytes(bytes) : bytes);
        // Old plain Base64 compact/JSON links remain readable. New links use XOR compact tags.
        return !obfuscated && text.startsWith('{') ? validateShareResult(JSON.parse(text)) : decodeCompact(text);
    } catch { return null; }
}

export function readSharedSearch(search: string): ShareResult | null {
    if (search.length > MAX_RESULT_LENGTH + 32) return null;
    const values = new URLSearchParams(search).getAll('result');
    return values.length === 1 ? decodeShareResult(values[0]) : null;
}

export function sharePath(result: ShareResult): string {
    return `/share/?result=${encodeShareResult(result)}`;
}

export function shareCaption(result: ShareResult): string {
    if (result.message) {
        const text = shareMessage(result).text;
        const sentence = /[.!?]$/.test(text) ? text : `${text}.`;
        return result.streak !== undefined ? `${sentence} All-time best typing speed: ${result.wpm} ${result.speed === 'correct' ? 'correct ' : ''}WPM.`
            : `${sentence}${result.accuracy !== undefined ? ` ${result.accuracy}% accuracy.` : ''}`;
    }
    if (result.streak !== undefined) return `My practice streak is ${result.streak} ${result.streak === 1 ? 'day' : 'days'}, and my all-time best typing speed is ${result.wpm} WPM.`;
    return `I type at ${result.wpm} ${result.speed === 'correct' ? 'correct ' : ''}WPM${result.accuracy !== undefined ? ` with ${result.accuracy}% accuracy` : ''}.`;
}

/** Remove excluded fields before creating URLs, captions or images. */
export function visibleShareResult(result: ShareResult, fields: { accuracy: boolean; dictionary: boolean; challenge: boolean }): ShareResult {
    const { accuracy, dictionary, detail, challenge, ...rest } = result;
    return {
        ...rest,
        ...(fields.accuracy && accuracy !== undefined ? { accuracy } : {}),
        ...(fields.dictionary && dictionary !== undefined ? { dictionary } : {}),
        ...(fields.dictionary && detail !== undefined ? { detail } : {}),
        ...(fields.challenge && challenge !== undefined ? { challenge } : {}),
    };
}
