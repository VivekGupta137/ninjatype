import { createClient } from "@libsql/client/web";
import type { Client } from "@libsql/client";
import { handleSync } from "./sync";
import { getEntitlement } from "./pro";
import { applyDodoEvent, billingConfigured, confirmSubscription, createCheckout, createPortal, customerIdFor, verifyWebhook, type Plan } from "./dodo";
import { createAuth, isAllowedOrigin } from "./auth";
import type { Env } from "./env";

const json = (body: unknown, status = 200, headers: HeadersInit = {}) =>
    new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store", ...headers } });

export async function handle(request: Request, env: Env, auth: ReturnType<typeof createAuth>, client?: Client): Promise<Response> {
    // Pages serves "/api/me/" and "/api/me" alike; normalise the trailing slash.
    const pathname = new URL(request.url).pathname.replace(/(.)\/$/, "$1");
    if (pathname.startsWith("/api/auth")) {
        // Better Auth does not match "/sign-out/"; hand it the normalised URL.
        const url = new URL(request.url);
        if (url.pathname !== pathname) { url.pathname = pathname; return auth.handler(new Request(url, request)); }
        return auth.handler(request);
    }
    if (pathname === "/api/billing/webhook" && request.method === "POST") {
        const body = await request.text();
        if (!(await verifyWebhook(request.headers, body, env.DODO_PAYMENTS_WEBHOOK_KEY ?? ""))) return json({ error: "Invalid signature" }, 401);
        if (!client) return json({ error: "Not found" }, 404);
        let event;
        try { event = JSON.parse(body); } catch { return json({ error: "Invalid JSON" }, 400); }
        return json({ result: await applyDodoEvent(client, request.headers.get("webhook-id") ?? "", event) });
    }
    if ((pathname === "/api/billing/checkout" || pathname === "/api/billing/portal" || pathname === "/api/billing/confirm") && request.method === "POST" && client) {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) return json({ error: "Sign in first" }, 401);
        if (!billingConfigured(env)) return json({ error: "Billing is not available yet" }, 503);
        const origin = new URL(env.BETTER_AUTH_URL).origin;
        if (pathname === "/api/billing/confirm") {
            const { subscriptionId } = (await request.json().catch(() => ({}))) as { subscriptionId?: string };
            if (!subscriptionId || !/^sub_\w+$/.test(subscriptionId)) return json({ error: "Unknown subscription" }, 400);
            return json({ result: await confirmSubscription(client, env, session.user.id, subscriptionId) });
        }
        if (pathname === "/api/billing/portal") {
            const customerId = await customerIdFor(client, session.user.id);
            return customerId ? json({ url: await createPortal(env, customerId, `${origin}/pro/`) }) : json({ error: "No subscription to manage" }, 404);
        }
        const { plan } = (await request.json().catch(() => ({}))) as { plan?: string };
        if (plan !== "monthly" && plan !== "yearly") return json({ error: "Unknown plan" }, 400);
        if ((await getEntitlement(client, env, session.user)).source === "dodo" && (await getEntitlement(client, env, session.user)).pro) return json({ error: "Already subscribed" }, 409);
        return json({ url: await createCheckout(env, session.user, plan as Plan, `${origin}/pro/`) });
    }
    if (pathname === "/api/me" && request.method === "GET") {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) return json({ user: null, pro: false });
        const { id, name, email } = session.user;
        // Entitlement is server-side only: subscription rows, or PRO_GRANT_EMAILS.
        const ent = client ? await getEntitlement(client, env, session.user) : { pro: false, proUntil: null, source: null };
        return json({ user: { id, name, email }, ...ent });
    }
    if (pathname === "/api/sync" && client) {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session) return json({ error: "Sign in to sync" }, 401);
        if (!(await getEntitlement(client, env, session.user)).pro) return json({ error: "pro_required" }, 402);
        return handleSync(request, client, session.user.id);
    }
    return json({ error: "Not found" }, 404);
}

/** Per-request entry used by `functions/api/[[path]].ts`: origin check, DB client, route, cleanup. */
const REQUIRED: (keyof Env)[] = ["TURSO_DATABASE_URL", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL", "ALLOWED_ORIGINS"];

export async function handleRequest(request: Request, env: Env): Promise<Response> {
    const missing = REQUIRED.filter(k => !env[k]);
    if (missing.length) {
        console.error(`Account API misconfigured; missing: ${missing.join(", ")}`);
        return json({ error: "Account service is not configured", missing }, 503);
    }
    const origin = request.headers.get("origin");
    if (origin && !isAllowedOrigin(env, origin)) return json({ error: "Origin not allowed" }, 403);
    const client = createClient({ url: env.TURSO_DATABASE_URL.replace(/^libsql:/, "https:"), authToken: env.TURSO_AUTH_TOKEN });
    try {
        return await handle(request, env, createAuth(env, client), client);
    } catch (e) {
        console.error("Account API error", e);
        return json({ error: "Account service error", detail: e instanceof Error ? e.message : String(e) }, 500);
    } finally {
        client.close();
    }
}
