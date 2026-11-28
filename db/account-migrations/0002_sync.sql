-- History sync (a Pro feature; gated in the API). Sessions are append-only by id; practice days are a set.
-- server_at is a strictly increasing per-row cursor (ms * 1000 + index) so clients can page with `server_at > since`.
create table if not exists "synced_session" ("user_id" text not null references "user" ("id") on delete cascade, "id" text not null, "ts" integer not null, "data" text not null, "server_at" integer not null, primary key ("user_id", "id"));
create index if not exists "synced_session_cursor" on "synced_session" ("user_id", "server_at");
create table if not exists "synced_day" ("user_id" text not null references "user" ("id") on delete cascade, "day" text not null, "server_at" integer not null, primary key ("user_id", "day"));
create index if not exists "synced_day_cursor" on "synced_day" ("user_id", "server_at");
-- cleared_at: bumped when the user clears history, so other devices drop their copy instead of re-uploading it.
create table if not exists "sync_state" ("user_id" text not null primary key references "user" ("id") on delete cascade, "cleared_at" integer not null default 0);
