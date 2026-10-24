import { describe, expect, test } from 'bun:test';
import { newLocalRun, typeLocalRun, localMetrics } from './localRun';
import { decodeHeader, encodeHeader, nickname, roomName } from './protocol';

describe('local multiplayer typing and protocol', () => {
    test('mistakes must be corrected and attempts preserve corrected errors', () => {
        let r = newLocalRun('round-id', 'one two');
        r = typeLocalRun(r, 'onx ', 1000);
        expect(r.typedText).toBe('onx');
        r = typeLocalRun(r, 'on', 2000);
        r = typeLocalRun(r, 'one two', 3000);
        expect(r.stopped).toBe(true);
        expect(r.errors).toBeGreaterThan(0);
        expect(r.attempts).toBeGreaterThan(r.typedText.length);
        expect(typeLocalRun(r, '', 4000)).toEqual(r);
        expect(localMetrics(r, 0, 3000).completedWords).toBe(2);
    });
    test('header transport handles Unicode nicknames without including tokens in URLs', () => {
        const input = JSON.stringify({ nickname: '忍者 🥷', name: 'Exact-ROOM' });
        expect(decodeHeader(encodeHeader(input))).toBe(input);
        expect(encodeHeader(input)).toMatch(/^[A-Za-z0-9_-]+$/);
    });
    test('room names preserve case and nickname normalization rejects invisible controls', () => {
        expect(roomName('  Exact-ROOM  ')).toBe('Exact-ROOM');
        expect(() => roomName('room with spaces')).toThrow();
        expect(nickname('  Ninja   User  ')).toBe('Ninja User');
        expect(() => nickname('invisible\u200b')).toThrow();
    });
});
