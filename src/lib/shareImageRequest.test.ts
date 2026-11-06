import { expect, test } from 'bun:test';
import { readShareImageRequest, shareImagePath, SHARE_IMAGE_FORMATS } from './shareImageRequest';
import type { ShareResult } from './shareResult';

const result: ShareResult = { v: 1, username: 'Ninja', wpm: 72, speed: 'raw', streak: 7, message: 3, theme: 'dracula', avatar: 'bottts', avatarVariant: 2 };
test('image URLs retain the card appearance and selected export format', () => {
    for (const format of SHARE_IMAGE_FORMATS) {
        const url = new URL(shareImagePath(result, format), 'https://www.ninjatype.com');
        expect(url.searchParams.get('type')).toBe('png');
        expect(readShareImageRequest(url)).toEqual({ result, format });
    }
    expect(shareImagePath(result)).not.toContain('format=');
});
test('image requests reject malformed results, unsupported formats and duplicate controls', () => {
    const base = new URL(shareImagePath(result), 'https://www.ninjatype.com');
    for (const [key, value] of [['type','jpg'], ['format','huge'], ['result','invalid']]) {
        const url = new URL(base); url.searchParams.set(key, value);
        expect(readShareImageRequest(url)).toBeNull();
    }
    for (const [key, value] of [['type','png'], ['result',base.searchParams.get('result')!], ['format','story']]) {
        const url = new URL(base); url.searchParams.append(key, value);
        if (key === 'format') url.searchParams.append('format', 'square');
        expect(readShareImageRequest(url)).toBeNull();
    }
});
