// Applies db/account-migrations/*.sql to the Turso DB named in .dev.vars (or env). Safe to re-run:
// already-applied statements ("already exists") are skipped. Usage: node scripts/apply-account-migrations.mjs
import { readFileSync, readdirSync } from "node:fs";
import { createClient } from "@libsql/client";

const vars = Object.fromEntries(
    (() => { try { return readFileSync(".dev.vars", "utf8"); } catch { return ""; } })()
        .split("\n").filter(l => l.includes("=") && !l.startsWith("#")).map(l => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()]),
);
const url = process.env.TURSO_DATABASE_URL ?? vars.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN ?? vars.TURSO_AUTH_TOKEN;
if (!url) throw new Error("TURSO_DATABASE_URL is not set");

const client = createClient({ url, authToken });
const dir = "db/account-migrations";
for (const file of readdirSync(dir).filter(f => f.endsWith(".sql")).sort()) {
    const statements = readFileSync(`${dir}/${file}`, "utf8").replace(/^\s*--.*$/gm, "").split(";").map(s => s.trim()).filter(Boolean);
    let applied = 0, skipped = 0;
    for (const sql of statements) {
        try { await client.execute(sql); applied++; }
        catch (e) { if (/already exists/i.test(String(e?.message))) skipped++; else throw new Error(`${file}: ${e.message}\n${sql.slice(0, 120)}`); }
    }
    console.log(`${file}: ${applied} applied, ${skipped} already present`);
}
client.close();
