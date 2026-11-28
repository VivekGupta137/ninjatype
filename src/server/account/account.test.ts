import { readFileSync } from "node:fs";
import { afterAll, beforeAll, expect, test } from "bun:test";
import { createClient, type Client } from "@libsql/client";
import { getMigrations } from "better-auth/db/migration";
import { createAuth } from "./auth";
import { handle } from "./handler";
import type { Env } from "./env";

const env: Env = {
    TURSO_DATABASE_URL: "file::memory:",
    BETTER_AUTH_SECRET: "test-secret-test-secret-test-secret-123",
    BETTER_AUTH_URL: "http://localhost:4321",
    ALLOWED_ORIGINS: "http://localhost:4321",
    PRO_GRANT_EMAILS: "sync@example.com",
    DODO_PAYMENTS_WEBHOOK_KEY: "whsec_" + btoa("dodo-test-signing-key"),
};
let client: Client;
let auth: ReturnType<typeof createAuth>;
const call = (path: string, init?: RequestInit) => handle(new Request(`http://localhost:4321${path}`, { headers: { origin: "http://localhost:4321", "content-type": "application/json" }, ...init }), env, auth, client);

beforeAll(async () => {
    client = createClient({ url: "file::memory:" });
    auth = createAuth(env, client);
    const { runMigrations } = await getMigrations(auth.options);
    await runMigrations();
    await client.executeMultiple(readFileSync(new URL("../../../db/account-migrations/0002_sync.sql", import.meta.url), "utf8"));
    await client.executeMultiple(readFileSync(new URL("../../../db/account-migrations/0003_pro.sql", import.meta.url), "utf8"));
});
afterAll(() => client.close());

test("anonymous /api/me is not signed in and not Pro", async () => {
    const body = await (await call("/api/me")).json();
    expect(body).toEqual({ user: null, pro: false });
});

test("unknown routes 404", async () => {
    expect((await call("/api/nope")).status).toBe(404);
});

test("email and password sign-up and sign-in work without an email service", async () => {
    const up = await call("/api/auth/sign-up/email", { method: "POST", body: JSON.stringify({ email: "pw@example.com", password: "correct horse battery", name: "Pw User" }) });
    expect(up.status).toBe(200);
    expect((await call("/api/auth/sign-in/email", { method: "POST", body: JSON.stringify({ email: "pw@example.com", password: "wrong password!!" }) })).status).toBe(401);
    const ok = await call("/api/auth/sign-in/email", { method: "POST", body: JSON.stringify({ email: "pw@example.com", password: "correct horse battery" }) });
    expect(ok.status).toBe(200);
    const cookie = (ok.headers.getSetCookie?.() ?? []).map(c => c.split(";")[0]).join("; ");
    const me = await (await call("/api/me", { headers: { cookie, origin: "http://localhost:4321" } })).json() as any;
    expect(me.user.email).toBe("pw@example.com");
    expect(me.pro).toBe(false);
});

test("short passwords are rejected", async () => {
    const res = await call("/api/auth/sign-up/email", { method: "POST", body: JSON.stringify({ email: "short@example.com", password: "short", name: "S" }) });
    expect(res.status).toBe(400);
});

test("origin allow-list: local dev accepts any localhost port, production list is strict", async () => {
    const { isAllowedOrigin } = await import("./auth");
    expect(isAllowedOrigin(env, "http://localhost:5555")).toBe(true);
    expect(isAllowedOrigin(env, "http://127.0.0.1:4347")).toBe(true);
    expect(isAllowedOrigin(env, "https://evil.example")).toBe(false);
    const prod = { ...env, BETTER_AUTH_URL: "https://www.ninjatype.com", ALLOWED_ORIGINS: "https://www.ninjatype.com" };
    expect(isAllowedOrigin(prod, "https://www.ninjatype.com")).toBe(true);
    expect(isAllowedOrigin(prod, "http://localhost:4347")).toBe(false);
});

test("history sync: auth required, idempotent push, pull by cursor, clear blocks stale devices", async () => {
    expect((await call("/api/sync")).status).toBe(401);
    await call("/api/auth/sign-up/email", { method: "POST", body: JSON.stringify({ email: "sync@example.com", password: "correct horse battery", name: "Sync" }) });
    const ok = await call("/api/auth/sign-in/email", { method: "POST", body: JSON.stringify({ email: "sync@example.com", password: "correct horse battery" }) });
    const cookie = (ok.headers.getSetCookie?.() ?? []).map(c => c.split(";")[0]).join("; ");
    const sync = (path: string, init: RequestInit = {}) => handle(new Request(`http://localhost:4321${path}`, { ...init, headers: { cookie, origin: "http://localhost:4321", "content-type": "application/json" } }), env, auth, client);
    const session = (id: string) => ({ id, timestamp: 1000, wpm: 60, cpm: 300, accuracy: 98, errors: 1, duration: 30, mode: "time" });
    const body = JSON.stringify({ sessions: [session("a"), session("b"), { id: "bad" }], days: ["2026-01-01", "nope"], clearedSeen: 0 });
    const first = await (await sync("/api/sync", { method: "POST", body })).json() as any;
    expect(first).toMatchObject({ accepted: 2, days: 1, rejected: 1 });
    await sync("/api/sync", { method: "POST", body }); // duplicate push is a no-op
    const pulled = await (await sync("/api/sync?since=0")).json() as any;
    expect(pulled.sessions.map((s: any) => s.id).sort()).toEqual(["a", "b"]);
    expect(pulled.days).toEqual(["2026-01-01"]);
    expect((await (await sync(`/api/sync?since=${pulled.cursor}`)).json() as any).sessions).toEqual([]);
    const cleared = await (await sync("/api/sync", { method: "DELETE" })).json() as any;
    expect(cleared.clearedAt).toBeGreaterThan(0);
    expect((await sync("/api/sync", { method: "POST", body })).status).toBe(409);
    expect((await (await sync("/api/sync?since=0")).json() as any).sessions).toEqual([]);
});

let ipCounter = 0;
async function signUpCookie(email: string) {
    // Better Auth rate-limits sign-in per IP (3 / 10s); give each test user its own address.
    const ip = `10.0.0.${++ipCounter}`;
    const req = (path: string, init: RequestInit = {}, cookie = "") => handle(new Request(`http://localhost:4321${path}`, { ...init, headers: { cookie, origin: "http://localhost:4321", "content-type": "application/json", "cf-connecting-ip": ip } }), env, auth, client);
    await req("/api/auth/sign-up/email", { method: "POST", body: JSON.stringify({ email, password: "correct horse battery", name: "T" }) });
    const ok = await req("/api/auth/sign-in/email", { method: "POST", body: JSON.stringify({ email, password: "correct horse battery" }) });
    const cookie = (ok.headers.getSetCookie?.() ?? []).map(c => c.split(";")[0]).join("; ");
    const as = (path: string, init: RequestInit = {}) => req(path, init, cookie);
    return { as, me: async () => (await as("/api/me")).json() as Promise<any> };
}

test("free users cannot sync (402)", async () => {
    const u = await signUpCookie("free@example.com");
    expect(await u.me()).toMatchObject({ pro: false, source: null });
    expect((await u.as("/api/sync?since=0")).status).toBe(402);
});

test("PRO_GRANT_EMAILS grants Pro without a subscription row", async () => {
    expect(await (await signUpCookie("sync@example.com")).me()).toMatchObject({ pro: true, source: "grant" });
});

const WEBHOOK_KEY = "whsec_" + btoa("dodo-test-signing-key");
async function sign(id: string, body: string, secret = WEBHOOK_KEY, ts = Math.floor(Date.now() / 1000)) {
    const key = await crypto.subtle.importKey("raw", Uint8Array.from(atob(secret.replace(/^whsec_/, "")), c => c.charCodeAt(0)), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const sig = btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${ts}.${body}`)))));
    return { "webhook-id": id, "webhook-timestamp": String(ts), "webhook-signature": `v1,${sig}` };
}

test("billing webhook: signature required, subscription grants Pro, duplicates and stale events are ignored, cancel keeps the paid period", async () => {
    const u = await signUpCookie("paid@example.com");
    const userId = (await u.me()).user.id;
    const hook = async (id: string, event: object, headers?: Record<string, string>) => {
        const body = JSON.stringify(event);
        return handle(new Request("http://localhost:4321/api/billing/webhook", { method: "POST", body, headers: headers ?? (await sign(id, body)) }), env, auth, client);
    };
    const end = new Date(Date.now() + 30 * 86_400_000).toISOString();
    const ev = (type: string, at: string, status: string, ends = end) => ({ type, timestamp: at, data: { payload_type: "Subscription", subscription_id: "sub_1", customer: { customer_id: "cus_1" }, status, metadata: { user_id: userId }, next_billing_date: ends } });

    expect((await hook("e0", ev("subscription.active", "2026-01-01T00:00:00Z", "active"), { "webhook-id": "e0", "webhook-timestamp": "1", "webhook-signature": "v1,AAAA" })).status).toBe(401);
    expect((await hook("e0", ev("subscription.active", "2026-01-01T00:00:00Z", "active"), await sign("e0", JSON.stringify(ev("subscription.active", "2026-01-01T00:00:00Z", "active")), "whsec_" + btoa("wrong")))).status).toBe(401);

    expect(await (await hook("e1", ev("subscription.active", "2026-01-02T00:00:00Z", "active"))).json()).toEqual({ result: "applied" });
    expect(await u.me()).toMatchObject({ pro: true, source: "dodo" });
    expect(await (await hook("e1", ev("subscription.active", "2026-01-02T00:00:00Z", "active"))).json()).toEqual({ result: "duplicate" });
    expect(await (await hook("e0b", ev("subscription.expired", "2026-01-01T00:00:00Z", "expired"))).json()).toEqual({ result: "stale" });
    expect((await u.me()).pro).toBe(true);
    // Cancelled keeps access to the end of the paid period; expiry ends it.
    expect(await (await hook("e2", ev("subscription.cancelled", "2026-01-03T00:00:00Z", "cancelled"))).json()).toEqual({ result: "applied" });
    expect((await u.me()).pro).toBe(true);
    expect(await (await hook("e3", ev("subscription.expired", "2026-01-04T00:00:00Z", "expired"))).json()).toEqual({ result: "applied" });
    expect((await u.me()).pro).toBe(false);
    expect(await (await hook("e4", { type: "payment.succeeded", data: {} })).json()).toEqual({ result: "ignored" });
});

test("confirm applies a subscription pulled from Dodo, only for its own user", async () => {
    const u = await signUpCookie("confirm@example.com");
    const other = await signUpCookie("confirm-other@example.com");
    const userId = (await u.me()).user.id;
    const realFetch = globalThis.fetch;
    const withDodo = { ...env, DODO_PAYMENTS_API_KEY: "dodo_test_x", DODO_PRODUCT_MONTHLY: "pdt_m", DODO_PRODUCT_YEARLY: "pdt_y" };
    globalThis.fetch = (async () => new Response(JSON.stringify({ subscription_id: "sub_c1", status: "active", customer: { customer_id: "cus_c1" }, metadata: { user_id: userId }, next_billing_date: new Date(Date.now() + 30 * 86_400_000).toISOString() })) ) as unknown as typeof fetch;
    try {
        const { confirmSubscription } = await import("./dodo");
        expect(await confirmSubscription(client, withDodo, userId, "sub_c1")).toBe("applied");
        expect(await confirmSubscription(client, withDodo, (await other.me()).user.id, "sub_c1")).toBe("ignored");
        expect(await u.me()).toMatchObject({ pro: true, source: "dodo" });
        expect((await other.me()).pro).toBe(false);
    } finally { globalThis.fetch = realFetch; }
});
