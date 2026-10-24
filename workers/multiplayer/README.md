# Multiplayer backend

Implemented client: `/multiplayer/`, linked from `/online/`. The Astro site stays static. This Worker owns the Room and Directory SQLite Durable Objects. Room sockets use hibernation; there are no gameplay progress uploads, server intervals, avatar API calls, accounts, or global room-count cap.

## Run locally

1. Copy `.dev.vars.example` in this directory to `.dev.vars`. Set your Turnstile site key/secret and add `localhost` to the widget's allowed hostnames. Use a managed widget with the `create_room` and `join_room` actions supplied by the client. Verification checks hostname, action and challenge age, including on reconnects; there is no development bypass in the backend.
2. Run `bun run dev:multiplayer` and `bun run dev` in separate terminals.
3. Visit `http://localhost:4321/multiplayer/`. Vite forwards the API and WebSockets to port 8787. If Astro chooses a different port, set that exact origin in `.dev.vars` and restart the Worker. A `127.0.0.1` origin also needs its own allowlist entry and Turnstile hostname configuration.

The room-directory cron does not run automatically during local development. Exact-name joining works immediately; invoke the scheduled event with Wrangler's `--test-scheduled` option when testing publication. Production publishes every three minutes.

`bun run test:multiplayer` runs pure lifecycle tests and a real workerd/SQLite/WebSocket integration suite with mocked Siteverify. It needs Node and Bun, uses temporary storage, and does not access a Cloudflare account. `bun run check:multiplayer` checks the Worker and Pages forwarder. `bunx astro check` and `bun run build` check the site.

## Configure deployment

Set `MAX_PLAYERS_PER_ROOM` as a plaintext variable on **Workers & Pages → ninjatype-multiplayer → Settings → Variables and Secrets**, or in this Worker's `wrangler.jsonc` `vars`. It defaults to `10` and accepts whole numbers of at least `2`; missing/invalid values fall back to `10`. Locally, put it in this directory's `.dev.vars`. Keep the Wrangler value in sync with dashboard changes because a later Wrangler deployment uses the checked-in configuration. This is a Worker runtime setting; Pages needs no variable or rebuild for capacity changes.

New rooms capture this value at creation, persist it, and advertise it in their snapshots/public listings. Existing rooms retain their saved limit through rematches and hibernation. Older rooms without a stored capacity use `10`. Reserved reconnect seats count toward the configured limit. Increasing the value increases per-room message, memory and storage work; the previous Free-tier examples assumed ten players.

Keep the account on **Workers Free**. No command here changes your plan or permits paid overflow. Cloudflare's Free request/storage/duration limits still bound capacity; Turnstile and throttling reduce abuse but cannot guarantee unlimited traffic on a Free plan.

1. Create a KV namespace using `bunx wrangler kv namespace create ROOM_DIRECTORY --config workers/multiplayer/wrangler.jsonc`. Replace `REPLACE_WITH_FREE_KV_NAMESPACE_ID` in this directory's Wrangler config with its ID.
2. Create/configure your Turnstile widget for the production hostnames (`ninjatype.com`, `www.ninjatype.com`, and `ninjatype.pages.dev` as applicable). Set `TURNSTILE_SITE_KEY` in this Worker config. Store the secret with `bunx wrangler secret put TURNSTILE_SECRET_KEY --config workers/multiplayer/wrangler.jsonc`.
3. Review exact `ALLOWED_ORIGINS`, custom-domain routes, and rate-limiter namespace IDs. Use account-unique limiter namespace IDs if another Worker already uses these IDs. Preview URLs need explicit origin/hostname configuration; there is no wildcard preview trust.
4. Deploy this Worker first using `bun run deploy:multiplayer`. The default config keeps multiplayer disabled until the keys and dependencies are ready. The SQLite class migration creates the two object namespaces. This must precede deploying Pages because Pages binds the Worker by service name.
5. Set `MULTIPLAYER_ENABLED` to `true` and deploy the Worker after configuring Turnstile and KV. Build/deploy Pages through the existing workflow. The root Pages config includes the `MULTIPLAYER` service binding, and `functions/api/multiplayer/[[path]].ts` forwards requests on Pages-owned domains. `_routes.json` invokes Functions only for multiplayer requests so practice/static assets bypass dynamic compute. Custom-zone Worker routes handle the custom domain directly and avoid the forwarding hop.
6. Verify creation, a separate challenged join, invites, two-browser starts, reconnects, results and rematches on the deployed origin. Confirm that origin and token values do not appear in application token logs; the code never logs tokens or places them in URLs.

No infrastructure has been provisioned or deployed by this implementation. Live Turnstile/account-quota behavior needs the configured deployment; local tests mock challenge verification.

## Lifecycle and controls

- Nickname input or generated nickname; client-side DiceBear Identicon avatars seeded by SHA-256 of the accepted, NFC-normalized username. Identicon artwork is CC0; library code is MIT. The dependency packages contain their licenses. No avatars are persisted server-side.
- Turnstile on creation **and every socket entry**, including creator entry, public/exact-name joins and reconnects. Separate operations use separate tokens. Rematches reuse the admitted socket.
- Origin checks plus approximate location-scoped gateway limits: creation 1/minute/browser and 5/minute/IP; entry 12/minute/browser and 120/minute/IP; discovery 6/minute/browser and 120/minute/IP. Browser IDs and reconnect IDs are unsigned correlation values, not identity proof.
- Configurable member seats (default ten), including disconnected two-minute reservations. Late joiners wait for the next round. At actual start, the Room freezes its connected candidate roster.
- Three-second countdown; 15/30/50-word text; a two-minute round limit. The first valid server-accepted finish ends everyone’s round. Timeout produces stopped-player metrics without a completed winner. Server recomputes displayed metrics from one final text/count payload, with bounds; it cannot prove human typing without keystroke streaming.
- Ten-second initial final-metric collection; two-minute results/rematch window. Two connected opt-ins automatically start the next countdown once initial collection closes. Non-opt-ins wait. Cancelled countdowns retain the prior scoreboard and results deadline. Each new round gets a new ID.
- Room lifetime is fixed at 20 minutes. Empty rooms get two minutes of reconnect grace, clipped by results/hard expiry. Rematches/reconnects do not extend clocks. Silent failures are detected when the server observes a socket closure; no application heartbeat runs while typing.
- Incoming commands limited to 10/10 seconds and syncs to 2/10 seconds; persistent command flooding closes the socket. Duplicate metrics do not rewrite results. Challenge/admission receipts prevent cached Siteverify retries from creating extra rooms/connections; a bounded per-room receipt store throttles connection churn without capping room creation globally.
- Cleanup closes sockets and removes playable state. A closed room retains only challenge replay receipts until their five-minute retry window expires, then `deleteAll()` clears storage. No scores or playable room remain in that short tombstone. This intentionally avoids discarding replay protection when a room closes early.
- Directory metadata uses SQL rows and one batched KV snapshot every three minutes, approximately 480 KV writes/day. Cached discovery is a hint; actual joins validate live room existence/epoch/capacity. Snapshot growth is not an admission cap; KV value/CPU limits eventually require directory partitioning at larger scale.
- Local run state lives in session storage for reconnects; acknowledged personal metrics go to existing local history. Reconnection requires a fresh challenge and an explicit retry, with at most three attempts per disconnect window. No automatic challenge/request loop runs.

## Maintenance

Set `MULTIPLAYER_ENABLED=false` and redeploy the Worker. New HTTP operations fail closed; room commands also enforce maintenance. Existing idle sockets receive closure when their next command runs (or their scheduled alarm expires the room), rather than consuming resources in a polling loop. The client offers practice when config, admission, acknowledgment or reconnection fails. Setting `PUBLIC_MULTIPLAYER_ENABLED=false` at the Astro build disables even the initial config request.

Turnstile outages block new entries, while existing connected rounds can continue. KV outages affect discovery; challenged exact-name joins can still work. The two-minute reconnect window can expire while a user completes a challenge. Free quota exhaustion returns an unavailable/fallback state; no runtime switches plans.
