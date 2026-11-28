/** Thin fetch client for the account worker (`workers/account`): Better Auth routes + `/api/me`. */
export const MIN_PASSWORD = 10;
export const MAX_PASSWORD = 128;

export interface AccountUser { id: string; name: string; email: string }
export interface Me { user: AccountUser | null; pro: boolean; proUntil?: string | null }

/** Astro's dev server only forwards proxied API paths that end in "/"; the vite proxy strips it again. */
const apiPath = (path: string) => (import.meta.env.DEV && !path.endsWith("/") ? `${path}/` : path);

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns a user-facing message for the first problem, or null when the form is valid. */
export function validateCredentials(input: { email: string; password: string; name?: string }, mode: "signIn" | "signUp"): string | null {
    if (!EMAIL.test(input.email.trim())) return "Enter a valid email address.";
    if (mode === "signUp" && !(input.name ?? "").trim()) return "Enter a display name.";
    if (input.password.length < MIN_PASSWORD) return `Use at least ${MIN_PASSWORD} characters for your password.`;
    if (input.password.length > MAX_PASSWORD) return `Use at most ${MAX_PASSWORD} characters for your password.`;
    return null;
}

const FRIENDLY: Record<string, string> = {
    USER_ALREADY_EXISTS: "An account with this email already exists. Sign in instead.",
    USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "An account with this email already exists. Sign in instead.",
    INVALID_EMAIL_OR_PASSWORD: "Email or password is incorrect.",
    PASSWORD_TOO_SHORT: `Use at least ${MIN_PASSWORD} characters for your password.`,
    INVALID_PASSWORD: "That password is not correct.",
};

async function post(path: string, body: unknown): Promise<void> {
    const res = await fetch(apiPath(`/api/auth/${path}`), { method: "POST", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) return;
    const data = (await res.json().catch(() => ({}))) as { code?: string; message?: string };
    if (res.status === 429) throw new Error("Too many attempts. Wait a minute and try again.");
    throw new Error((data.code && FRIENDLY[data.code]) || data.message || "Something went wrong. Try again.");
}

export async function fetchMe(): Promise<Me> {
    const res = await fetch(apiPath("/api/me"), { credentials: "include", cache: "no-store" });
    if (!res.ok) throw new Error("Could not load your account.");
    return (await res.json()) as Me;
}
export const signUp = (email: string, password: string, name: string) => post("sign-up/email", { email: email.trim(), password, name: name.trim() });
export const signIn = (email: string, password: string) => post("sign-in/email", { email: email.trim(), password });
export const signOut = () => post("sign-out", {});
export const deleteAccount = (password: string) => post("delete-user", { password });
