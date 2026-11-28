-- Pro entitlement. One row per user; Pro while period_end is in the future.
-- source: dodo (subscription webhooks). event_at orders webhook events.
create table if not exists "entitlement" ("user_id" text not null primary key references "user" ("id") on delete cascade, "source" text not null, "status" text not null, "trial_used" integer not null default 0, "period_end" integer, "provider_customer_id" text, "provider_subscription_id" text, "event_at" integer not null default 0, "updated_at" integer not null);
create table if not exists "billing_event" ("id" text not null primary key, "type" text not null, "received_at" integer not null);
