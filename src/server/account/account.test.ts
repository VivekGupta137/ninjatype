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
};
let client: Client;
let auth: ReturnType<typeof createAuth>;
const call = (path: string, init?: RequestInit) => handle(new Request(`http://localhost:4321${path}`, { headers: { origin: "http://localhost:4321", "content-type": "application/json" }, ...init }), env, auth);

beforeAll(async () => {
    client = createClient({ url: "file::memory:" });
    auth = createAuth(env, client);
    const { runMigrations } = await getMigrations(auth.options);
    await runMigrations();
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
