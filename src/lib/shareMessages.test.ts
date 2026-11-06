import { expect, test } from 'bun:test';
import { isShareMessage, shareMessage, shareMessageOptions } from './shareMessages';

test('speed options substitute actual scores into all seven requested messages', () => {
    const texts = shareMessageOptions({ wpm: 72, speed: 'raw' }).slice(1).map(option => option.text);
    expect(texts).toEqual([
        'Just hit 72 wpm!', 'Reached 72 wpm!', 'Typing speed: 72 wpm',
        'I can now type 72 words per minute.', 'Just hit a new milestone: 72 wpm!',
        'Current typing speed: 72 wpm', 'Achieved 72 wpm milestone.',
    ]);
    expect(shareMessage({ wpm: 91.5, speed: 'raw', message: 1 }).text).toBe('Just hit 91.5 wpm!');
});

test('streak messages are separate, agree with the count and never imply consecutive days', () => {
    const options = shareMessageOptions({ wpm: 72, speed: 'raw', streak: 7 });
    expect(options).toHaveLength(6);
    for (const option of options) {
        expect(option.text).toContain('7');
        expect(option.text).toContain('streak');
        expect(option.text).not.toMatch(/consecutive|in a row|wpm/);
        expect(shareMessage({ wpm: 72, speed: 'raw', streak: 7, message: option.id }).subtitle).toContain('all-time best');
    }
    expect(shareMessage({ wpm: 72, speed: 'raw', streak: 1, message: 4 }).text).toBe('My practice streak: 1 day.');
    expect(isShareMessage(7, false)).toBe(true);
    expect(isShareMessage(7, true)).toBe(false);
});

test('defaults remain unchanged and corrected speeds remain explicit', () => {
    expect(shareMessage({ wpm: 72, speed: 'raw' }).lead).toBe('Hi I can now type at');
    expect(shareMessage({ wpm: 72, speed: 'correct', message: 4 }).text).toBe('I can now type 72 correct words per minute.');
    expect(shareMessage({ wpm: 72, speed: 'correct', message: 7 }).subtitle).toContain('correct words per minute');
});
