import { renderToStaticMarkup } from 'react-dom/server';
import { Resvg, initWasm, type InitInput } from '@resvg/resvg-wasm';
import ResultCard from '@/components/share/ResultCard';
import { loadAvatarImages } from './shareAvatarImage';
import { THEME } from '@/constants/themes';
import type { CardPalette } from './shareThemes';
import { readShareImageRequest } from './shareImageRequest';

type AssetLoader = (path: string) => Promise<Response>;
// Reuse the compiled renderer across requests, including local Vite hot reloads.
const shared = globalThis as typeof globalThis & { __ninjaShareWasm?: WeakMap<typeof initWasm, Promise<void>> };
const initialized = shared.__ninjaShareWasm ??= new WeakMap();
const fontPaths = ['/fonts/nunito-card-regular.ttf', '/fonts/nunito-card-bold.ttf'];

export async function renderSharePNG(request: Request, loadAsset: AssetLoader, wasm: () => Promise<InitInput>): Promise<Response> {
    const error = (status: number, message: string, headers = {}) => new Response(message, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers } });
    if (!['GET', 'HEAD'].includes(request.method)) return error(405, 'Use GET or HEAD.', { Allow: 'GET, HEAD' });
    const parsed = readShareImageRequest(new URL(request.url));
    if (!parsed) return error(400, 'Invalid shared result or image format.');
    const headers = {
        'Content-Type': 'image/png',
        'Content-Disposition': `inline; filename="ninjatype-${parsed.format}.png"`,
        'Cache-Control': 'public, max-age=86400',
        'X-Content-Type-Options': 'nosniff',
        'X-Robots-Tag': 'noindex',
    };
    if (request.method === 'HEAD') return new Response(null, { headers });
    try {
        if (!initialized.has(initWasm)) {
            const ready = wasm().then(module => initWasm(module)).catch(error => { initialized.delete(initWasm); throw error; });
            initialized.set(initWasm, ready);
        }
        const { result, format } = parsed;
        const [fontBuffers, css, avatarImages] = await Promise.all([
            Promise.all(fontPaths.map(async path => {
                const response = await loadAsset(path);
                if (!response.ok) throw new Error('Card font unavailable.');
                return new Uint8Array(await response.arrayBuffer());
            })),
            loadAsset(THEME[result.theme ?? 'amoled'].path).then(response => {
                if (!response.ok) throw new Error('Card theme unavailable.');
                return response.text();
            }),
            loadAvatarImages({ username: result.username, style: result.avatar, variant: result.avatarVariant, animated: false }),
            initialized.get(initWasm),
        ]);
        const color = (name: string) => {
            const value = css.match(new RegExp(`--${name}:\\s*(#[a-fA-F0-9]{3,8})\\s*;`))?.[1];
            if (!value) throw new Error('Invalid card palette.');
            return value;
        };
        const palette: CardPalette = { bg: color('bg-color'), surface: color('alt-bg-color'), text: color('text-color'), main: color('main-color'), muted: color('sub-text-color'), border: color('sub-alt-text-color') };
        const svg = renderToStaticMarkup(<ResultCard result={result} format={format} palette={palette} avatarImages={avatarImages} />);
        const renderer = new Resvg(svg, { font: { fontBuffers, defaultFontFamily: 'Nunito', sansSerifFamily: 'Nunito' } });
        try {
            const image = renderer.render();
            try { return new Response(new Uint8Array(image.asPng()).buffer, { headers }); }
            finally { image.free(); }
        } finally { renderer.free(); }
    } catch (cause) {
        console.error('Share image rendering failed:', cause);
        return error(503, 'The image could not be rendered. Please try again.');
    }
}
