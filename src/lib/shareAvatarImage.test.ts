import { test, expect } from 'bun:test';
import { SHARE_AVATAR_STYLES } from './shareAvatar';
import { loadAvatarImages } from './shareAvatarImage';

test('every bundled avatar renders locally with a transparent background and still export', async () => {
    for (const style of SHARE_AVATAR_STYLES) {
        const images = await loadAvatarImages({ username: 'Ninja', style, variant: 7 });
        const svg = decodeURIComponent(images.still.split(',').slice(1).join(','));
        expect(svg.startsWith('<svg'), style).toBe(true);
        expect(svg, style).not.toMatch(/<script|foreignObject|(?:href|src)="(?:https?:|javascript:)/i);
        expect(svg, style).not.toContain('@keyframes');
        // DiceBear's canvas background rect is omitted by backgroundColor: [].
        expect(svg, style).not.toMatch(/<rect width="[\d.]+" height="[\d.]+" fill="/);
    }
});
