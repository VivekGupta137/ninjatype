import { expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { renderSharePNG } from './sharePNG.server';
import { shareImagePath, SHARE_IMAGE_FORMATS } from './shareImageRequest';
import type { ShareResult } from './shareResult';

const result: ShareResult = { v: 1, username: 'Ninja', wpm: 72, speed: 'raw', streak: 7, message: 3, theme: 'dracula', avatar: 'bottts', avatarVariant: 2 };
const asset = async (path: string) => new Response(await readFile(new URL(`../../public${path}`, import.meta.url)));
const wasm = async () => readFile(new URL('../../node_modules/@resvg/resvg-wasm/index_bg.wasm', import.meta.url));

test('the direct endpoint returns real PNGs at all three export sizes', async () => {
    const sizes = [[1200, 630], [1080, 1080], [1080, 1920]];
    for (const [index, format] of SHARE_IMAGE_FORMATS.entries()) {
        const response = await renderSharePNG(new Request(new URL(shareImagePath(result, format), 'https://www.ninjatype.com')), asset, wasm);
        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toBe('image/png');
        expect(response.headers.get('content-disposition')).toContain('inline;');
        const bytes = await response.arrayBuffer();
        const metadata = await sharp(bytes).metadata();
        expect([metadata.width, metadata.height]).toEqual(sizes[index]);
        expect(metadata.format).toBe('png');
    }
});

test('bad requests and HEAD never initialize the renderer or load assets', async () => {
    const never = async (): Promise<never> => { throw new Error('Unexpected asset or renderer access'); };
    const url = new URL(shareImagePath(result), 'https://www.ninjatype.com');
    const head = await renderSharePNG(new Request(url, { method: 'HEAD' }), never, never);
    expect(head.status).toBe(200);
    expect(head.headers.get('content-type')).toBe('image/png');
    expect(await head.text()).toBe('');
    expect((await renderSharePNG(new Request(url, { method: 'POST' }), never, never)).status).toBe(405);
    url.searchParams.set('result', 'invalid');
    const invalid = await renderSharePNG(new Request(url), never, never);
    expect(invalid.status).toBe(400);
    expect(invalid.headers.get('cache-control')).toBe('no-store');
});
