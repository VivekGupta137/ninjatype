import type { Client } from "@libsql/client";
import type { Env } from "./env";

export type Plan = "monthly" | "yearly";

const base = (env: Env) => (env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "https://live.dodopayments.com" : "https://test.dodopayments.com");

const b64 = (s: string): Uint8Array<ArrayBuffer> => Uint8Array.from(atob(s), c => c.charCodeAt(0));

/** Verifies a Standard Webhooks signature (`webhook-id`, `webhook-timestamp`, `webhook-signature: v1,<base64>[ ...]`). Rejects deliveries more than 5 minutes off. */
export async function verifyWebhook(headers: Headers, body: string, secret: string, now = Date.now()): Promise<boolean> {
    const id = headers.get("webhook-id"), ts = headers.get("webhook-timestamp"), sig = headers.get("webhook-signature");
    if (!id || !ts || !sig || !secret || Math.abs(now - Number(ts) * 1000) > 5 * 60_000) return false;
    let keyBytes: Uint8Array<ArrayBuffer>;
    try { keyBytes = b64(secret.replace(/^whsec_/, "")); } catch { return false; }
    const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const data = new TextEncoder().encode(`${id}.${ts}.${body}`);
    for (const part of sig.split(" ")) {
        const [version, value] = part.split(",");
        if (version !== "v1" || !value) continue;
        try { if (await crypto.subtle.verify("HMAC", key, b64(value), data)) return true; } catch { /* malformed signature: try the next */ }
    }
    return false;
}

async function dodo(env: Env, path: string, body?: unknown): Promise<Record<string, unknown>> {
    const res = await fetch(`${base(env)}${path}`, { method: body === undefined ? "GET" : "POST", headers: { authorization: `Bearer ${env.DODO_PAYMENTS_API_KEY}`, "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
    if (!res.ok) throw new Error(`Dodo ${base(env).slice(8, 12)} ${path.split("?")[0]} failed: ${res.status} ${(await res.text()).slice(0, 300)}`);
    return (await res.json()) as Record<string, unknown>;
}

export const billingConfigured = (env: Env) => !!(env.DODO_PAYMENTS_API_KEY && env.DODO_PRODUCT_MONTHLY && env.DODO_PRODUCT_YEARLY);

/** Creates a single-use checkout session; `metadata.user_id` ties the subscription webhooks back to the account. */
export async function createCheckout(env: Env, user: { id: string; email: string; name?: string | null }, plan: Plan, returnUrl: string): Promise<string> {
    const product_id = plan === "yearly" ? env.DODO_PRODUCT_YEARLY : env.DODO_PRODUCT_MONTHLY;
    const session = await dodo(env, "/checkouts", {
        product_cart: [{ product_id, quantity: 1 }],
        customer: { email: user.email, name: user.name || user.email },
        return_url: returnUrl,
        metadata: { user_id: user.id },
    });
    if (typeof session.checkout_url !== "string") throw new Error("Dodo returned no checkout_url");
    return session.checkout_url;
}

/** Creates a Customer Portal link (update card, cancel) for a paying customer. */
export async function createPortal(env: Env, customerId: string, returnUrl: string): Promise<string> {
    const session = await dodo(env, `/customers/${encodeURIComponent(customerId)}/customer-portal/session?return_url=${encodeURIComponent(returnUrl)}`, {});
    if (typeof session.link !== "string") throw new Error("Dodo returned no portal link");
    return session.link;
}

export async function customerIdFor(client: Client, userId: string): Promise<string | null> {
    const rs = await client.execute({ sql: `select provider_customer_id from entitlement where user_id = ? and source = 'dodo'`, args: [userId] });
    return (rs.rows[0]?.provider_customer_id as string | undefined) ?? null;
}

interface DodoEvent { type?: string; timestamp?: string; data?: { subscription_id?: string; customer?: { customer_id?: string }; customer_id?: string; status?: string; metadata?: { user_id?: string } | null; next_billing_date?: string | null; current_period_end?: string | null; expires_at?: string | null; past_due_ends_at?: string | null; cancelled_at?: string | null } }

/** Applies a Dodo `subscription.*` event. `webhookId` dedupes retries; the envelope timestamp drops out-of-order events. */
export async function applyDodoEvent(client: Client, webhookId: string, event: DodoEvent, now = Date.now()): Promise<"applied" | "duplicate" | "ignored" | "stale"> {
    if (!event.type?.startsWith("subscription.")) return "ignored";
    const data = event.data ?? {};
    const subId = data.subscription_id;
    const customerId = data.customer?.customer_id ?? data.customer_id ?? null;
    let userId = data.metadata?.user_id;
    if (!userId && subId) {
        const rs = await client.execute({ sql: `select user_id from entitlement where provider_subscription_id = ?`, args: [subId] });
        userId = rs.rows[0]?.user_id as string | undefined;
    }
    if (!userId || !subId) return "ignored";
    const seen = await client.execute({ sql: `insert into billing_event (id, type, received_at) values (?, ?, ?) on conflict (id) do nothing`, args: [webhookId, event.type, now] });
    if (seen.rowsAffected === 0) return "duplicate";
    const at = Date.parse(event.timestamp ?? "") || now;
    const existing = await client.execute({ sql: `select event_at from entitlement where user_id = ?`, args: [userId] });
    if (existing.rows[0] && Number(existing.rows[0].event_at) > at) return "stale";

    // Access runs to the end of the paid period. A cancelled subscription keeps it until then; failed, expired or on-hold ones lose it now.
    const status = data.status ?? event.type.slice("subscription.".length);
    const periodEnd = Date.parse(data.next_billing_date ?? data.current_period_end ?? data.expires_at ?? "") || null;
    let end: number | null;
    if (status === "active" || status === "renewed" || status === "plan_changed" || status === "unpaused") end = periodEnd;
    else if (status === "cancelled") end = periodEnd && periodEnd > now ? periodEnd : now;
    else if (event.type === "subscription.past_due") end = Date.parse(data.past_due_ends_at ?? "") || periodEnd;
    else end = now;
    await client.execute({
        sql: `insert into entitlement (user_id, source, status, trial_used, period_end, provider_customer_id, provider_subscription_id, event_at, updated_at) values (?, 'dodo', ?, 1, ?, ?, ?, ?, ?)
              on conflict (user_id) do update set source = 'dodo', status = excluded.status, trial_used = 1, period_end = excluded.period_end, provider_customer_id = coalesce(excluded.provider_customer_id, provider_customer_id), provider_subscription_id = excluded.provider_subscription_id, event_at = excluded.event_at, updated_at = excluded.updated_at`,
        args: [userId, status, end, customerId, subId, at, now],
    });
    return "applied";
}

/**
 * Pulls a subscription straight from Dodo and applies it, for the moment a customer returns from checkout (the webhook may be late or,
 * in local dev, unreachable). Only applies when the subscription's `metadata.user_id` is the signed-in user, so it can't grant Pro to someone else.
 */
export async function confirmSubscription(client: Client, env: Env, userId: string, subscriptionId: string): Promise<"applied" | "ignored" | "duplicate" | "stale"> {
    const sub = (await dodo(env, `/subscriptions/${encodeURIComponent(subscriptionId)}`)) as NonNullable<DodoEvent["data"]> & { subscription_id?: string };
    if (sub.metadata?.user_id !== userId) return "ignored";
    const event: DodoEvent = { type: "subscription.updated", timestamp: new Date().toISOString(), data: { ...sub, subscription_id: sub.subscription_id ?? subscriptionId } };
    return applyDodoEvent(client, `confirm_${crypto.randomUUID()}`, event);
}
