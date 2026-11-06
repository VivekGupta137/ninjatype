import { expect, test } from 'bun:test';
import { CHALLENGES, decodeShareResult, encodeShareResult, readSharedSearch, shareCaption, visibleShareResult, sharePath, usernameError, validateShareResult, type ShareResult } from './shareResult';
import { SHARE_AVATAR_STYLES } from './shareAvatar';
import { SHARE_THEME_IDS } from './shareThemes';
import { practiceShareSnapshot, streakShareSnapshot } from './shareSession';

test('streak cards use the retained all-time record, not the latest daily speed', () => {
    const session = { timestamp: Date.now(), wpm: 50, accuracy: 98, cpm: 250, errors: 1, duration: 60, mode: 'time' };
    const snapshot = streakShareSnapshot({ sessions: [session], personalBest: { ...session, wpm: 95 } }, 7);
    expect(snapshot).toEqual({ wpm: 95, speed: 'raw', streak: 7 });
    expect(streakShareSnapshot({ sessions: [] }, 7)).toBeNull();
    expect(streakShareSnapshot({ sessions: [session] }, 0)).toBeNull();
});

test('streak links round trip with a compact validated count and accurate caption', () => {
    const value: ShareResult = { v: 1, username: 'Ninja', wpm: 95, speed: 'raw', streak: 7 };
    expect(decodeShareResult(encodeShareResult(value))).toEqual(value);
    expect(shareCaption(value)).toBe('My practice streak is 7 days, and my all-time best typing speed is 95 WPM.');
    expect(visibleShareResult(value, { accuracy: false, dictionary: false, challenge: false }).streak).toBe(7);
    for (const streak of [0, -1, 1.5, 36501, NaN, Infinity, '7', '<script>']) {
        expect(validateShareResult({ ...value, streak })).toBeNull();
    }
    for (const count of ['0', '-1', '1.5', '01', '36501', 'NaN', '1e2']) {
        expect(decodeShareResult(encodeXorUnchecked(`[n:Ninja][s:95][sk:${count}]`))).toBeNull();
    }
    expect(decodeShareResult(encodeXorUnchecked('[n:Ninja][s:95][sk:7][sk:8]'))).toBeNull();
});

const result: ShareResult = { v: 1, username: 'Ninja', wpm: 87, accuracy: 98.5, challenge: 'time', speed: 'raw', detail: '1m · 1K Common', duration: 60 };
// Independent fixtures pin the public key and x1 wire format.
const xorFixture = (bytes: Buffer) => Buffer.from(bytes.map((byte, index) => byte ^ 'dontcheatpls'.charCodeAt(index % 12)));
const encodeXorUnchecked = (text: string) => 'x1.' + xorFixture(Buffer.from(text)).toString('base64url');
const readXorText = (encoded: string) => xorFixture(Buffer.from(encoded.slice(3), 'base64url')).toString('utf8');
const encodeUnchecked = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');

test('URL-safe UTF-8 links round trip without local history or a server', () => {
    for (const username of ['Zoë O’Neil', 'निंजा', '键盘高手', '𐐀'.repeat(40), 'A'.repeat(40)]) {
        const value = { ...result, username };
        const path = sharePath(value);
        expect(path).toMatch(/^\/share\/\?result=x1\.[A-Za-z0-9_-]+$/);
        const { detail, ...compact } = value;
        expect(readSharedSearch(new URL(path, 'https://www.ninjatype.com').search)).toEqual({ ...compact, dictionary: '1k' });
    }
});

test('new links use XOR compact tags and old plain compact/JSON links still decode', () => {
    const encoded = encodeShareResult(result);
    expect(readXorText(encoded)).toBe('[n:Ninja][s:87][a:98.5][t:0][dk:1k][d:60]');
    expect(encoded.length).toBeLessThan(encodeUnchecked(result).length / 2);
    expect(decodeShareResult(encodeUnchecked(result))).toEqual(result);
    expect(decodeShareResult(Buffer.from(readXorText(encoded)).toString('base64url'))).toEqual(decodeShareResult(encoded));
});

test('all challenges, speed types and stable theme IDs round trip', () => {
    for (const challenge of Object.keys(CHALLENGES) as ShareResult['challenge'][]) {
        for (const speed of ['raw', 'correct'] as const) {
            for (const theme of SHARE_THEME_IDS) {
                const value = { ...result, detail: undefined, dictionary: '1k', challenge, speed, theme };
                expect(decodeShareResult(encodeShareResult(value))).toEqual(validateShareResult(value));
            }
        }
    }
    const lesson = { ...result, challenge: 'learn' as const, detail: 'Index Finger · Level 3' };
    expect(decodeShareResult(encodeShareResult(lesson))).toEqual(lesson);
});

test('omitted accuracy is removed from the payload and caption, including zero handling', () => {
    const hidden = { ...result, accuracy: undefined };
    const encoded = encodeShareResult(hidden);
    expect(readXorText(encoded)).not.toContain('[a:');
    expect(encoded.length).toBeLessThan(encodeShareResult(result).length);
    expect(decodeShareResult(encoded)).not.toHaveProperty('accuracy');
    expect(shareCaption(hidden)).toBe('I type at 87 WPM.');
    expect(decodeShareResult(encodeShareResult({ ...result, accuracy: 0 }))?.accuracy).toBe(0);
});

test('compact parser rejects ambiguous tags, injection and invalid numeric or enum fields', () => {
    const prefix = '[n:Ninja][s:87][t:0]';
    for (const text of [
        prefix + '[n:Other]', prefix + '[unknown:x]', prefix + 'trailing', 'leading' + prefix,
        '[n:Ninja][t:0]', '[n:Ninja][s:87][t:3]', '[n:Ninja][s:87][t:1][m:w]',
        '[n:Ninja][s:87][t:2][m:t]', '[n:Ninja][s:87][t:0][m:unknown]',
        '[n:Ninja][s:NaN][t:0]', '[n:Ninja][s:1e2][t:0]', '[n:Ninja][s:][t:0]',
        '[n:Ninja][s:501][t:0]', '[n:Ninja][s:01][t:0]', '[n:Ninja][s:-1][t:0]',
        prefix + '[a:101]', prefix + '[a:]', prefix + '[d:0]', prefix + '[d:3601]',
        prefix + '[st:verified]', prefix + '[dk:__proto__]', prefix + '[th:c]', prefix + '[th:00]',
        '[n:<script>alert(1)</script>][s:87][t:0]', '[n:Ninja[a:90]][s:87][t:0]',
    ]) expect(decodeShareResult(Buffer.from(text).toString('base64url'))).toBeNull();
    expect(decodeShareResult(Buffer.from(prefix + '[st:raw]').toString('base64url'))?.speed).toBe('raw');
});

test('normalizes names and bounds displayed precision', () => {
    expect(validateShareResult({ ...result, username: '  Zoe\u0308  ', wpm: 80.1234, accuracy: 99.999, duration: 61.111 }))
        .toEqual({ ...result, username: 'Zoë', wpm: 80.1, accuracy: 100, duration: 61.1 });
});

test('rejects markup, controls, bidi overrides, whitespace-only and overlong names', () => {
    for (const username of ['', ' ', 'x'.repeat(41), '<img src=x onerror=alert(1)>', 'a\nb', 'a\u0000b', 'a\u202Eb', 'a\u2066b']) {
        expect(usernameError(username)).not.toBeNull();
        expect(decodeShareResult(encodeUnchecked({ ...result, username }))).toBeNull();
    }
});

test('rejects malformed, oversized, truncated and duplicate query payloads', () => {
    for (const value of ['', 'x', '%%%%', 'a'.repeat(1025), Buffer.from([255]).toString('base64url'), Buffer.from('{"v":').toString('base64url')]) expect(decodeShareResult(value)).toBeNull();
    const valid = encodeShareResult(result);
    expect(readSharedSearch(`?result=${valid}&result=${valid}`)).toBeNull();
    expect(readSharedSearch('?result=')).toBeNull();
});

test('rejects wrong structures, unexpected fields and unknown versions', () => {
    for (const value of [null, [], [result], 'text', 42, { ...result, v: 2 }, { ...result, html: '<script>alert(1)</script>' }, { ...result, image: 'https://evil.example/a.png' }, { ...result, challenge: '__proto__' }, { ...result, challenge: 'constructor' }, { ...result, speed: 'verified' }]) expect(decodeShareResult(encodeUnchecked(value))).toBeNull();
    expect(decodeShareResult(encodeUnchecked(JSON.parse('{"__proto__":{"polluted":true}}')))).toBeNull();
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
});

test('numeric validation never coerces strings or accepts nonfinite and out-of-range values', () => {
    for (const [key, values] of Object.entries({ wpm: [-1, 501, NaN, Infinity, '80', null], accuracy: [-1, 101, Infinity, '99', null], duration: [0, -1, 3601, '60', null] })) {
        for (const value of values) expect(validateShareResult({ ...result, [key]: value })).toBeNull();
    }
    expect(validateShareResult({ ...result, wpm: 500, accuracy: 0, duration: 3600 })).not.toBeNull();
});

test('challenge detail is bounded plain text, never a URL or executable content', () => {
    for (const detail of ['a'.repeat(49), '<svg onload=alert(1)>', 'line\nbreak', 'https://evil.example?q=x', '']) expect(validateShareResult({ ...result, detail })).toBeNull();
    expect(validateShareResult({ ...result, detail: 'Index Finger · Level 3' })).not.toBeNull();
});

test('shared solo scores preserve raw WPM and captured challenge settings', () => {
    const snapshot = practiceShareSnapshot({ timestamp: 123, wpm: 90, correctWpm: 84, cpm: 450, accuracy: 95, errors: 4, duration: 61.2, mode: 'time', practiceSettings: { mode: 'time', countdownTime: '1m', dictionary: '1k' } });
    expect(snapshot).toEqual({ challenge: 'time', wpm: 90, accuracy: 95, speed: 'raw', duration: 61.2, detail: '1m · 1K Common' });
    const encoded = encodeShareResult({ ...snapshot, v: 1, username: 'Ninja' });
    const decoded = decodeShareResult(encoded)!;
    expect(decoded).not.toHaveProperty('timestamp');
    expect(decoded).not.toHaveProperty('errors');
    expect(decoded).not.toHaveProperty('correctWpm');
});

test('saved attempts share their own scores and mode, including older multiplayer records', () => {
    const older = { timestamp: 1000, wpm: 54, cpm: 270, accuracy: 93, errors: 2, duration: 32, mode: 'multiplayer' };
    const newer = { ...older, timestamp: 2000, wpm: 88, accuracy: 99, duration: 60, mode: 'quotes', source: 'short' };
    for (const attempt of [newer, older]) {
        const shared = decodeShareResult(encodeShareResult({ ...practiceShareSnapshot(attempt), v: 1, username: 'Ninja' }));
        expect(shared).toMatchObject({ wpm: attempt.wpm, accuracy: attempt.accuracy, duration: attempt.duration, challenge: attempt.mode });
        expect(shared).not.toHaveProperty('streak');
    }
});


test('avatar customization stays compact, bounded and independent of user markup', () => {
    for (const avatar of SHARE_AVATAR_STYLES) {
        for (const avatarVariant of [0, 1, 1295]) {
            const decoded = decodeShareResult(encodeShareResult({ ...result, avatar, avatarVariant }));
            expect(decoded?.avatar ?? 'gaze').toBe(avatar);
            expect(decoded?.avatarVariant ?? 0).toBe(avatarVariant);
        }
    }
    expect(encodeShareResult({ ...result, avatar: 'gaze', avatarVariant: 0 })).toBe(encodeShareResult(result));
    for (const extra of [{ avatar: 'https://evil.example' }, { avatar: '__proto__' }, { avatarVariant: -1 }, { avatarVariant: 1296 }, { avatarVariant: 1.2 }, { avatarVariant: '2' }]) expect(validateShareResult({ ...result, ...extra })).toBeNull();
    for (const av of ['g00', 'zzz', '-1', '1.2', '01', '']) expect(decodeShareResult(Buffer.from(`[n:Ninja][s:87][t:0][av:${av}]`).toString('base64url'))).toBeNull();
});


test('extended avatar IDs preserve all styles and legacy packed IDs', () => {
    const text = (value: string) => decodeShareResult(Buffer.from(value).toString('base64url'));
    expect(text('[n:Ninja][s:87][t:0][av:i]')).toMatchObject({ avatar: 'pixel-art', avatarVariant: 1 });
    for (const suffix of ['[as:0]', '[as:zz]', '[as:01]', '[as:g][av:1]', '[as:]']) expect(text('[n:Ninja][s:87]' + suffix)).toBeNull();
});

test('visibility removes excluded fields from URLs without mutating the source', () => {
    const original = { ...result, dictionary: '1k' };
    for (const accuracy of [true, false]) for (const dictionary of [true, false]) for (const challenge of [true, false]) {
        const visible = visibleShareResult(original, { accuracy, dictionary, challenge });
        const encoded = encodeShareResult(visible);
        const decoded = decodeShareResult(encoded)!;
        expect(decoded.accuracy !== undefined).toBe(accuracy);
        expect(decoded.dictionary !== undefined).toBe(dictionary);
        expect(decoded.challenge !== undefined).toBe(challenge);
        if (!dictionary) expect(decoded.detail).toBeUndefined();
        if (!challenge) expect(readXorText(encoded)).not.toContain('[t:');
    }
    expect(original.accuracy).toBe(98.5);
    expect(original.dictionary).toBe('1k');
    expect(original.challenge).toBe('time');
});


test('new links XOR UTF-8 bytes with dontcheatpls before Base64 encoding', () => {
    const text = '[n:Ninja][s:87][a:98.5][t:0][dk:1k][d:60]';
    const encoded = encodeShareResult(result);
    expect(encoded).toBe('x1.PwFUOgoGDwApKx9JXFgzLwJSXFlaRTEoEFVeKTgMDltFGzEoAFVYRD4');
    expect(encoded).toBe(encodeXorUnchecked(text));
    expect(Buffer.from(encoded.slice(3), 'base64url').toString('utf8')).not.toContain('[n:Ninja]');
    expect(encoded.length).toBe(Buffer.from(text).toString('base64url').length + 3);
});

test('XOR links reject malformed envelopes and still validate every decoded field', () => {
    for (const value of [
        'x1.', 'x1.x', 'x1.%%%%', 'x1.' + 'a'.repeat(1022), 'x2.' + encodeShareResult(result).slice(3),
        'x1.' + Buffer.from('[n:Ninja][s:87]').toString('base64url'),
        'x1.' + xorFixture(Buffer.from([255])).toString('base64url'),
        encodeXorUnchecked('[n:Ninja][s:501]'), encodeXorUnchecked('[n:Ninja][s:87][a:101]'),
        encodeXorUnchecked('[n:<script>alert(1)</script>][s:87]'),
        encodeXorUnchecked('[n:Ninja][s:87][s:99]'), encodeXorUnchecked('[n:Ninja][s:87][html:test]'),
        encodeXorUnchecked('[n:Ninja][s:87][dk:__proto__]'), encodeXorUnchecked('[n:Ninja][s:87][th:zz]'),
    ]) expect(decodeShareResult(value)).toBeNull();
});
