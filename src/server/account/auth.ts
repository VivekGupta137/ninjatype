import { betterAuth } from "better-auth";
import type { Client } from "@libsql/client";
import { LibsqlDialect } from "./libsqlDialect";
import type { Env } from "./env";

const LOCAL_ORIGIN = /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/;
const isLocalDev = (env: Pick<Env, "BETTER_AUTH_URL">) => LOCAL_ORIGIN.test(env.BETTER_AUTH_URL);

export const origins = (env: Pick<Env, "ALLOWED_ORIGINS">) => env.ALLOWED_ORIGINS.split(",").map(o => o.trim()).filter(Boolean);

/** Configured origins, plus any localhost / 127.0.0.1 port when running locally (dev server ports vary). */
export const isAllowedOrigin = (env: Pick<Env, "ALLOWED_ORIGINS" | "BETTER_AUTH_URL">, origin: string) =>
    origins(env).includes(origin) || (isLocalDev(env) && LOCAL_ORIGIN.test(origin));

/** Builds the Better Auth instance for one request (Workers have no module-level env or long-lived DB handle). */
export function createAuth(env: Env, client: Client) {
    return betterAuth({
        database: { dialect: new LibsqlDialect(client), type: "sqlite" },
        secret: env.BETTER_AUTH_SECRET,
        baseURL: env.BETTER_AUTH_URL,
        trustedOrigins: isLocalDev(env) ? [...origins(env), "http://localhost:*", "http://127.0.0.1:*"] : origins(env),
        // Email + password only. No verification or reset emails are sent (no email service yet).
        emailAndPassword: { enabled: true, minPasswordLength: 10, maxPasswordLength: 128, autoSignIn: true },
        // Isolates do not share memory, so keep rate-limit counters in the database.
        rateLimit: { enabled: true, storage: "database", window: 60, max: 30 },
        user: { deleteUser: { enabled: true } },
        session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
        // Cloudflare sets cf-connecting-ip; without it every visitor would share one rate-limit bucket.
        advanced: { useSecureCookies: env.BETTER_AUTH_URL.startsWith("https://"), ipAddress: { ipAddressHeaders: ["cf-connecting-ip"] } },
    });
}
export type Auth = ReturnType<typeof createAuth>;
