/** Where to send someone after they sign in (`/account/?next=/pro/`). Only same-site paths are allowed. */
export function safeNext(raw: string | null | undefined): string | null {
    if (!raw) return null;
    const value = raw.trim();
    if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\") || /[\u0000-\u001f]/.test(value)) return null;
    if (value.startsWith("/account/")) return null;
    return value;
}

const LABELS: Record<string, string> = { "/pro/": "Pro", "/history/": "your history", "/training/": "your training", "/settings/": "settings" };

/** Short name for the page you came from, for the "Continue to …" button. */
export function nextLabel(path: string): string {
    return LABELS[path.split("?")[0]] ?? "where you were";
}
