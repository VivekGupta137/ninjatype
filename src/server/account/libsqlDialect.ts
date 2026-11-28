import type { Client, InValue, Transaction } from "@libsql/client";
import {
    CompiledQuery, SqliteAdapter, SqliteIntrospector, SqliteQueryCompiler,
    type DatabaseConnection, type Dialect, type Driver, type Kysely, type QueryResult, type TransactionSettings,
} from "kysely";

/**
 * Minimal Kysely dialect over an existing libSQL client. Written in-repo instead of using
 * `@libsql/kysely-libsql` because that package imports the Node build of `@libsql/client`,
 * which does not run on Cloudflare (we pass the `/web` client).
 */
export class LibsqlDialect implements Dialect {
    constructor(private readonly client: Client) {}
    createAdapter = () => new SqliteAdapter();
    createQueryCompiler = () => new SqliteQueryCompiler();
    createDriver = (): Driver => new LibsqlDriver(this.client);
    createIntrospector = (db: Kysely<any>) => new SqliteIntrospector(db);
}

class LibsqlDriver implements Driver {
    constructor(private readonly client: Client) {}
    async init() {}
    async acquireConnection() { return new LibsqlConnection(this.client); }
    async beginTransaction(conn: LibsqlConnection, _settings: TransactionSettings) { await conn.begin(); }
    async commitTransaction(conn: LibsqlConnection) { await conn.commit(); }
    async rollbackTransaction(conn: LibsqlConnection) { await conn.rollback(); }
    async releaseConnection() {}
    async destroy() {}
}

class LibsqlConnection implements DatabaseConnection {
    private tx?: Transaction;
    constructor(private readonly client: Client) {}

    async executeQuery<R>(query: CompiledQuery): Promise<QueryResult<R>> {
        const stmt = { sql: query.sql, args: query.parameters as InValue[] };
        const res = await (this.tx ?? this.client).execute(stmt);
        return {
            rows: res.rows as unknown as R[],
            numAffectedRows: BigInt(res.rowsAffected),
            insertId: res.lastInsertRowid === undefined ? undefined : BigInt(res.lastInsertRowid),
        };
    }
    // eslint-disable-next-line require-yield
    async *streamQuery(): AsyncIterableIterator<never> { throw new Error("libSQL dialect does not support streaming"); }
    async begin() { this.tx = await this.client.transaction("write"); }
    async commit() { await this.tx?.commit(); this.tx = undefined; }
    async rollback() { await this.tx?.rollback(); this.tx = undefined; }
}
