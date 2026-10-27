export interface Env {
    ROOMS: DurableObjectNamespace;
    DIRECTORY: DurableObjectNamespace;
    ROOM_DIRECTORY: KVNamespace;
    ALLOWED_ORIGINS: string;
    TURNSTILE_SITE_KEY: string;
    TURNSTILE_SECRET_KEY: string;
    MULTIPLAYER_ENABLED: string;
    MAX_PLAYERS_PER_ROOM?: string;
}
export const json = (data: unknown, status = 200) => Response.json(data, {
    status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
});
