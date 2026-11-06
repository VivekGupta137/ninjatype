import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Miniflare } from 'miniflare';
import sharp from 'sharp';

const output = await mkdtemp(join(tmpdir(), 'ninjatype-share-runtime-'));
let runtime;
try {
    await promisify(execFile)(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'pages', 'functions', 'build', '--outdir', output], { env: { ...process.env, WRANGLER_SEND_METRICS: 'false' } });
    runtime = new Miniflare({ modules: true, modulesRoot: output, scriptPath: join(output, 'index.js'),
        compatibilityDate: '2025-10-30', modulesRules: [{ type: 'CompiledWasm', include: ['**/*.wasm'] }],
        serviceBindings: { ASSETS: async request => {
            const path = new URL(request.url).pathname;
            if (path === '/share/' || path === '/share') return new Response('<h1>Share editor</h1>', { headers: { 'Content-Type': 'text/html' } });
            return new Response(await readFile(new URL(`../public${path}`, import.meta.url)));
        } },
    });
    // Legacy compact Base64 remains accepted; production and XOR use the same renderer.
    const payload = Buffer.from('[n:Ninja][s:72][sk:7][c:3][th:2][av:2]').toString('base64url');
    for (const [format, width, height] of [['landscape',1200,630], ['square',1080,1080], ['story',1080,1920]]) {
        const response = await runtime.dispatchFetch(`https://ninjatype.com/share/?result=${payload}&type=png&format=${format}`);
        if (response.status !== 200) assert.fail(`PNG response ${response.status}: ${await response.text()}`);
        assert.equal(response.headers.get('content-type'), 'image/png');
        const metadata = await sharp(await response.arrayBuffer()).metadata();
        assert.deepEqual([metadata.width, metadata.height], [width, height]);
    }
    const editor = await runtime.dispatchFetch(`https://ninjatype.com/share/?result=${payload}`);
    assert.equal(await editor.text(), '<h1>Share editor</h1>');
    const bad = await runtime.dispatchFetch('https://ninjatype.com/share/?result=invalid&type=png');
    assert.equal(bad.status, 400);
    console.log('Cloudflare share runtime: PNG formats, static editor passthrough, and invalid-link handling passed.');
} finally {
    await runtime?.dispose();
    await rm(output, { recursive: true, force: true });
}
