/** Pages-owned domains cannot use custom-zone Worker routes. Forward only multiplayer traffic. */
export const onRequest: PagesFunction<{ MULTIPLAYER: Fetcher }> = async ({ request, env }) => {
    try { return await env.MULTIPLAYER.fetch(request); }
    catch {
        return Response.json({ code: 'unavailable', message: 'Multiplayer is temporarily unavailable. You can keep practicing.' },
            { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }
};
