import type { Client } from "@libsql/client";
import type { Env } from "./env";

export interface Entitlement {
    pro: boolean;
    proUntil: string | null;
    source: "dodo" | "grant" | null;
}

const grantEmails = (env: Env) => (env.PRO_GRANT_EMAILS ?? "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);

/** Entitlement is decided here and only here. `PRO_GRANT_EMAILS` grants Pro to listed accounts (testing, staff). */
export async function getEntitlement(client: Client, env: Env, user: { id: string; email: string }, now = Date.now()): Promise<Entitlement> {
    if (grantEmails(env).includes(user.email.toLowerCase())) return { pro: true, proUntil: null, source: "grant" };
    const rs = await client.execute({ sql: `select source, period_end from entitlement where user_id = ?`, args: [user.id] });
    const row = rs.rows[0];
    if (!row) return { pro: false, proUntil: null, source: null };
    const end = row.period_end === null ? 0 : Number(row.period_end);
    return { pro: end > now, proUntil: end ? new Date(end).toISOString() : null, source: row.source as Entitlement["source"] };
}
