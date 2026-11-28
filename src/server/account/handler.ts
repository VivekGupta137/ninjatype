import { createClient } from "@libsql/client/web";
import { createAuth, isAllowedOrigin } from "./auth";
import type { Env } from "./env";

const json = (body: unknown, status = 200, headers: HeadersInit = {}) =>
    new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store", ...headers } });

export async function handle(request: Request, env: Env, auth: ReturnType<typeof createAuth>): Promise<Response> {
    // Pages serves "/api/me/" and "/api/me" alike; normalise the trailing slash.
    const pathname = new URL(request.url).pathname.replace(/(.)\/$/, "$1");
    if (pathname.startsWith("/api/auth")) return auth.handler(request);
    if (pathname === "/api/me" && request.method === "GET") {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) return json({ user: null, pro: false });
        const { id, name, email } = session.user;
        // Entitlement is server-side only. Billing (Phase 2) will set this from the subscriptions table.
        return json({ user: { id, name, email }, pro: false, proUntil: null });
    }
    return json({ error: "Not found" }, 404);
}

/** Per-request entry used by `functions/api/[[path]].ts`: origin check, DB client, route, cleanup. */
export async function handleRequest(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("origin");
    if (origin && !isAllowedOrigin(env, origin)) return json({ error: "Origin not allowed" }, 403);
    const client = createClient({ url: env.TURSO_DATABASE_URL.replace(/^libsql:/, "https:"), authToken: env.TURSO_AUTH_TOKEN });
    try {
        return await handle(request, env, createAuth(env, client));
    } finally {
        client.close();
    }
}
