import { readFile } from 'node:fs/promises';

/** Serve the same PNG handler in Astro dev; Pages Functions handle production. */
export function shareImageDev() {
    return {
        name: 'ninjatype-share-image',
        configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
                const url = new URL(req.url ?? '/', 'http://localhost');
                if (!['/share', '/share/'].includes(url.pathname) || !url.searchParams.getAll('type').includes('png')) return next();
                try {
                    const { renderSharePNG } = await server.ssrLoadModule('/src/lib/sharePNG.server.tsx');
                    const response = await renderSharePNG(new Request(url, { method: req.method }),
                        async assetPath => new Response(await readFile(new URL(`../public${assetPath}`, import.meta.url))),
                        async () => readFile(new URL('../node_modules/@resvg/resvg-wasm/index_bg.wasm', import.meta.url)));
                    res.writeHead(response.status, Object.fromEntries(response.headers));
                    res.end(Buffer.from(await response.arrayBuffer()));
                } catch (error) { next(error); }
            });
        },
    };
}
