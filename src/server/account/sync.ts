import type { Client, InValue } from "@libsql/client";

/** History sync: sessions are append-only by id, practice days are a set, "clear" bumps `cleared_at`. */
export const PAGE = 500;
export const MAX_BATCH = 200;
const MAX_SESSION_BYTES = 20_000;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

type Raw = Record<string, unknown>;
const finite = (v: unknown) => typeof v === "number" && Number.isFinite(v);

/** Returns the session when it has the required shape and a sane size, otherwise null. */
export function validSession(v: unknown): (Raw & { id: string; timestamp: number }) | null {
    if (!v || typeof v !== "object") return null;
    const s = v as Raw;
    if (typeof s.id !== "string" || !s.id || s.id.length > 80) return null;
    if (!finite(s.timestamp) || !finite(s.wpm) || !finite(s.cpm) || !finite(s.accuracy) || !finite(s.errors) || !finite(s.duration)) return null;
    if (typeof s.mode !== "string" || s.mode.length > 40) return null;
    if (JSON.stringify(s).length > MAX_SESSION_BYTES) return null;
    return s as Raw & { id: string; timestamp: number };
}

async function clearedAt(client: Client, userId: string): Promise<number> {
    const r = await client.execute({ sql: `select cleared_at from sync_state where user_id = ?`, args: [userId] });
    return Number(r.rows[0]?.cleared_at ?? 0);
}

async function pull(client: Client, userId: string, since: number): Promise<Response> {
    const [sessions, days, cleared] = await Promise.all([
        client.execute({ sql: `select data, server_at from synced_session where user_id = ? and server_at > ? order by server_at asc limit ?`, args: [userId, since, PAGE + 1] }),
        client.execute({ sql: `select day, server_at from synced_day where user_id = ? and server_at > ? order by server_at asc limit ?`, args: [userId, since, PAGE + 1] }),
        clearedAt(client, userId),
    ]);
    const more = sessions.rows.length > PAGE || days.rows.length > PAGE;
    const sRows = sessions.rows.slice(0, PAGE), dRows = days.rows.slice(0, PAGE);
    const cursor = Math.max(since, ...sRows.map(r => Number(r.server_at)), ...dRows.map(r => Number(r.server_at)));
    return json({
        sessions: sRows.map(r => JSON.parse(String(r.data))),
        days: dRows.map(r => String(r.day)),
        clearedAt: cleared, cursor, more,
    });
}

async function push(request: Request, client: Client, userId: string): Promise<Response> {
    const body = (await request.json().catch(() => null)) as { sessions?: unknown; days?: unknown; clearedSeen?: unknown } | null;
    if (!body || !Array.isArray(body.sessions ?? []) || !Array.isArray(body.days ?? [])) return json({ error: "Invalid body" }, 400);
    const rawSessions = (body.sessions ?? []) as unknown[], rawDays = (body.days ?? []) as unknown[];
    if (rawSessions.length > MAX_BATCH || rawDays.length > 4000) return json({ error: "Batch too large" }, 413);

    // A device that has not seen the latest clear must pull first, or it would resurrect deleted history.
    const cleared = await clearedAt(client, userId);
    if (cleared > Number(body.clearedSeen ?? 0)) return json({ error: "History was cleared on another device", clearedAt: cleared }, 409);

    const sessions = rawSessions.map(validSession).filter((s): s is NonNullable<ReturnType<typeof validSession>> => s !== null);
    const days = rawDays.filter((d): d is string => typeof d === "string" && DAY.test(d));
    const base = Date.now() * 1000;
    const stmts: { sql: string; args: InValue[] }[] = [
        ...sessions.map((s, i) => ({ sql: `insert or ignore into synced_session (user_id, id, ts, data, server_at) values (?, ?, ?, ?, ?)`, args: [userId, s.id, s.timestamp, JSON.stringify(s), base + i] })),
        ...days.map((d, i) => ({ sql: `insert or ignore into synced_day (user_id, day, server_at) values (?, ?, ?)`, args: [userId, d, base + sessions.length + i] })),
    ];
    if (stmts.length) await client.batch(stmts, "write");
    return json({ accepted: sessions.length, days: days.length, rejected: rawSessions.length - sessions.length });
}

async function clear(client: Client, userId: string): Promise<Response> {
    const at = Date.now();
    await client.batch([
        { sql: `delete from synced_session where user_id = ?`, args: [userId] },
        { sql: `delete from synced_day where user_id = ?`, args: [userId] },
        { sql: `insert into sync_state (user_id, cleared_at) values (?, ?) on conflict(user_id) do update set cleared_at = excluded.cleared_at`, args: [userId, at] },
    ], "write");
    return json({ clearedAt: at });
}

export async function handleSync(request: Request, client: Client, userId: string): Promise<Response> {
    if (request.method === "GET") return pull(client, userId, Number(new URL(request.url).searchParams.get("since")) || 0);
    if (request.method === "POST") return push(request, client, userId);
    if (request.method === "DELETE") return clear(client, userId);
    return json({ error: "Method not allowed" }, 405);
}
