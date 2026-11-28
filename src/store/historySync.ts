import { atom } from "nanostores";
import { MAX_HISTORY_SESSIONS } from "@/constants/history";
import { syncClear, syncPull, syncPush, SyncClearedError } from "@/lib/accountApi";
import { chunk, mergeDays, mergeSessions, unsent } from "@/lib/historySync";
import { collectPracticeDays } from "@/lib/practiceJourney";
import { personalBestSession } from "@/lib/celebrations";
import { $account, refreshAccount } from "./account";
import { $history, clearHistory, type TypingSession } from "./history";

const KEY = "history:sync";
const BATCH = 200;

/** Persisted per device. `userId` binds the opt-in to one account so a shared browser never syncs by accident. */
interface Persisted { userId: string; enabled: boolean; cursor: number; clearedSeen: number; sent: string[] }

export type SyncStatus = { state: "off" | "idle" | "syncing" | "error"; lastSyncedAt?: number; message?: string };
export const $syncStatus = atom<SyncStatus>({ state: "off" });

const read = (): Persisted | null => {
    try { return JSON.parse(localStorage.getItem(KEY) ?? "null"); } catch { return null; }
};
const write = (p: Persisted) => { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* storage full: sync restarts from scratch next time */ } };
/** Sync is a Pro feature: a lapsed account stops syncing but keeps its local history untouched. */
const currentUserId = () => { const a = $account.get(); return a.status === "in" && a.pro ? a.user.id : null; };
const active = (): Persisted | null => { const p = read(), id = currentUserId(); return p && id && p.userId === id && p.enabled ? p : null; };

export const isSyncEnabledFor = (userId: string) => { const p = typeof localStorage === "undefined" ? null : read(); return !!p && p.userId === userId && p.enabled; };

export function enableSync(userId: string): Promise<void> {
    write({ userId, enabled: true, cursor: 0, clearedSeen: 0, sent: [] });
    return runSync();
}
export function disableSync(): void {
    const p = read();
    if (p) write({ ...p, enabled: false });
    $syncStatus.set({ state: "off" });
}

let running: Promise<void> | null = null;
let rerun = false;

/** Pull, merge, then push what the server lacks. Safe to call often; concurrent calls coalesce. */
export function runSync(): Promise<void> {
    if (running) { rerun = true; return running; }
    running = (async () => {
        try { do { rerun = false; await syncOnce(); } while (rerun); }
        catch (e) { $syncStatus.set({ state: "error", message: e instanceof Error ? e.message : "Could not sync history." }); }
        finally { running = null; }
    })();
    return running;
}

async function syncOnce(): Promise<void> {
    let p = active();
    if (!p) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) return;
    $syncStatus.set({ ...$syncStatus.get(), state: "syncing", message: undefined });

    for (let attempt = 0; attempt < 3; attempt++) {
        p = await pullAll(p);
        try { p = await pushAll(p); break; }
        catch (e) {
            if (!(e instanceof SyncClearedError)) throw e;
            // Another device cleared: drop local history, then pull again from scratch.
            wipeLocal();
            p = { ...p, cursor: 0, sent: [], clearedSeen: e.clearedAt }; write(p);
        }
    }
    lastRun = Date.now();
    $syncStatus.set({ state: "idle", lastSyncedAt: lastRun });
}

function wipeLocal() { $history.set({ sessions: [] }); }

async function pullAll(start: Persisted): Promise<Persisted> {
    let p = start, more = true;
    while (more) {
        const page = await syncPull(p.cursor);
        if (page.clearedAt > p.clearedSeen) {
            wipeLocal();
            p = { ...p, cursor: 0, sent: [], clearedSeen: page.clearedAt }; write(p);
            continue; // re-pull from 0 under the new clear marker
        }
        const remote = page.sessions as TypingSession[];
        const local = $history.get();
        const sessions = mergeSessions(local.sessions, remote, MAX_HISTORY_SESSIONS);
        $history.set({
            sessions,
            dailyCompletionDays: mergeDays(local.dailyCompletionDays, page.days, sessions),
            personalBest: personalBestSession(sessions, local.personalBest),
        });
        p = { ...p, cursor: page.cursor, sent: [...new Set([...p.sent, ...remote.map(s => s.id!).filter(Boolean), ...page.days.map(d => `day:${d}`)])] };
        write(p);
        more = page.more;
    }
    return p;
}

async function pushAll(start: Persisted): Promise<Persisted> {
    let p = start;
    const { sessions, dailyCompletionDays } = $history.get();
    const sent = new Set(p.sent);
    const days = collectPracticeDays(sessions, dailyCompletionDays).filter(d => !sent.has(`day:${d}`));
    const batches = chunk(unsent(sessions, sent), BATCH);
    if (!batches.length && days.length) batches.push([]);
    for (const [i, batch] of batches.entries()) {
        await syncPush({ sessions: batch, days: i === 0 ? days : [], clearedSeen: p.clearedSeen });
        p = { ...p, sent: [...p.sent, ...batch.map(s => s.id!), ...(i === 0 ? days.map(d => `day:${d}`) : [])] };
        write(p);
    }
    return p;
}

/** History page: delete only this device's copy. It is re-downloaded on the next sync. */
export function clearLocalData(): void {
    clearHistory();
    const p = read();
    if (p) write({ ...p, cursor: 0, sent: [] });
}

/** History page: delete the cloud copy and turn sync off here. Other synced devices drop their copy at their next sync. */
export async function clearCloudData(): Promise<void> {
    const p = active();
    if (!p) return;
    await syncClear().then(clearedSeen => write({ ...p, clearedSeen, cursor: 0, sent: [], enabled: false }));
    $syncStatus.set({ state: "off" });
}

const AUTO_MIN_GAP_MS = 60_000;
const PUSH_DELAY_MS = 30_000;
let lastRun = 0;

/** Automatic syncs are rate-limited so they never hammer the server; the Sync button bypasses this. */
export async function autoSync(): Promise<void> {
    if (Date.now() - lastRun < AUTO_MIN_GAP_MS) return;
    if ($account.get().status === "loading") await refreshAccount();
    if (active()) await runSync();
}

/** Upload new attempts shortly after they are saved (one batched request, at most once a minute). Returns a cleanup. */
export function initHistorySync(): () => void {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsub = $history.listen(() => {
        if (running || !isEnabledOnDevice()) return;
        clearTimeout(timer);
        timer = setTimeout(() => { void autoSync(); }, PUSH_DELAY_MS);
    });
    return () => { clearTimeout(timer); unsub(); };
}

const isEnabledOnDevice = () => { const p = read(); return !!p?.enabled; };
