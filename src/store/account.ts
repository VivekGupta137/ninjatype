import { atom } from "nanostores";
import { fetchMe, type AccountUser } from "@/lib/accountApi";

export type AccountState =
    | { status: "loading" }
    | { status: "out" }
    | { status: "in"; user: AccountUser; pro: boolean }
    | { status: "error"; message: string };

/** Current account. Read it after mount; it is `loading` on the server so markup matches. */
export const $account = atom<AccountState>({ status: "loading" });

export async function refreshAccount(): Promise<void> {
    try {
        const me = await fetchMe();
        $account.set(me.user ? { status: "in", user: me.user, pro: me.pro } : { status: "out" });
    } catch (error) {
        $account.set({ status: "error", message: error instanceof Error ? error.message : "Could not load your account." });
    }
}
