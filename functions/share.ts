import wasm from '@resvg/resvg-wasm/index_bg.wasm';
import { renderSharePNG } from '../src/lib/sharePNG.server';

export const onRequest: PagesFunction<{ ASSETS: Fetcher }> = async context => {
    const url = new URL(context.request.url);
    if (!url.searchParams.getAll('type').includes('png')) return context.next();
    return renderSharePNG(context.request,
        path => context.env.ASSETS.fetch(new URL(path, url.origin)),
        async () => wasm);
};
