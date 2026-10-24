import { DurableObject } from 'cloudflare:workers';
import { roomPlayerLimit, type RoomListing } from '../../src/lib/multiplayer/protocol';
import { type Env, json } from './env';

/** Discovery only: no global admission count or cap. One batched KV publication per three minutes. */
export class Directory extends DurableObject<Env> {
    constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env);
        ctx.storage.sql.exec('CREATE TABLE IF NOT EXISTS rooms (name TEXT PRIMARY KEY, epoch TEXT NOT NULL, createdAt INTEGER NOT NULL, expiresAt INTEGER NOT NULL, maxPlayers INTEGER NOT NULL DEFAULT 10)');
        if (!ctx.storage.sql.exec<{ name: string }>('PRAGMA table_info(rooms)').toArray().some(column => column.name === 'maxPlayers'))
            ctx.storage.sql.exec('ALTER TABLE rooms ADD COLUMN maxPlayers INTEGER NOT NULL DEFAULT 10');
    }
    async fetch(request: Request) {
        const path = new URL(request.url).pathname;
        if (path === '/register') {
            const r = await request.json() as RoomListing;
            this.ctx.storage.sql.exec('INSERT INTO rooms (name, epoch, createdAt, expiresAt, maxPlayers) VALUES (?, ?, ?, ?, ?) ON CONFLICT(name) DO UPDATE SET epoch=excluded.epoch, createdAt=excluded.createdAt, expiresAt=excluded.expiresAt, maxPlayers=excluded.maxPlayers WHERE excluded.createdAt >= rooms.createdAt', r.name, r.epoch, r.createdAt, r.expiresAt, roomPlayerLimit(r.maxPlayers));
            return json({ ok: true });
        }
        if (path === '/remove') {
            const r = await request.json() as Pick<RoomListing, 'name' | 'epoch'>;
            this.ctx.storage.sql.exec('DELETE FROM rooms WHERE name = ? AND epoch = ?', r.name, r.epoch);
            return json({ ok: true });
        }
        this.ctx.storage.sql.exec('DELETE FROM rooms WHERE expiresAt <= ?', Date.now());
        const rooms = this.ctx.storage.sql.exec<RoomListing & Record<string, SqlStorageValue>>('SELECT name, epoch, createdAt, expiresAt, maxPlayers FROM rooms ORDER BY createdAt DESC').toArray();
        await this.env.ROOM_DIRECTORY.put('public-v1', JSON.stringify({ publishedAt: Date.now(), rooms }), { expirationTtl: 600 });
        return json({ ok: true });
    }
}
