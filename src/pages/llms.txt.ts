import type { APIContext } from 'astro';
import { getLLMReference } from '@/lib/llms';

export async function GET({ site }: APIContext) {
    return new Response(await getLLMReference(site ?? new URL('https://www.ninjatype.com/')), {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
}
