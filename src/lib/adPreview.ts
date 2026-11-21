/** Logic for the advertiser preview (`?preview=ads`). Nothing here is sent anywhere or stored beyond the browser tab. */

export type AdPackage = "results" | "brand";

export interface AdPreviewData {
    pkg: AdPackage;
    name: string;
    /** Data URL of the uploaded logo. */
    logo: string;
    /** Absolute http(s) link. */
    url: string;
    /** Short line shown in the Results spotlight. */
    description: string;
}

export type AdPreviewErrors = Partial<Record<"name" | "logo" | "url" | "description", string>>;

export const STORAGE_KEY = "nt-ad-preview";
export const MAX_LOGO_BYTES = 300 * 1024;
export const MAX_NAME = 40;
export const MAX_DESCRIPTION = 90;
export const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"];

const LOGO_DATA_URL = /^data:image\/(png|jpeg|webp|svg\+xml|gif);base64,[a-z0-9+/=]+$/i;

export const isLogoDataUrl = (value: unknown): value is string => typeof value === "string" && LOGO_DATA_URL.test(value);

/** Returns an absolute http(s) URL, adding https:// when no scheme is typed; otherwise null. */
export function safeHttpUrl(input: string): string | null {
    const raw = input.trim();
    if (!raw || /\s/.test(raw)) return null;
    const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
    try {
        const url = new URL(withScheme);
        if ((url.protocol !== "https:" && url.protocol !== "http:") || !url.hostname.includes(".")) return null;
        return url.href;
    } catch {
        return null;
    }
}

export function validatePreview(data: { pkg: AdPackage; name: string; logo: string; url: string; description: string }): AdPreviewErrors {
    const errors: AdPreviewErrors = {};
    if (!data.name.trim()) errors.name = "Enter your brand name.";
    else if (data.name.trim().length > MAX_NAME) errors.name = `Keep it to ${MAX_NAME} characters.`;
    if (!isLogoDataUrl(data.logo)) errors.logo = "Upload your logo (PNG, JPG, SVG, WebP or GIF, up to 300 KB).";
    if (!safeHttpUrl(data.url)) errors.url = "Enter a valid website address, for example yourbrand.com.";
    if (data.pkg === "results") {
        if (!data.description.trim()) errors.description = "Add a short description.";
        else if (data.description.trim().length > MAX_DESCRIPTION) errors.description = `Keep it to ${MAX_DESCRIPTION} characters.`;
    }
    return errors;
}

export function normalizePreview(data: AdPreviewData): AdPreviewData {
    return {
        pkg: data.pkg,
        name: data.name.trim(),
        logo: data.logo,
        url: safeHttpUrl(data.url) ?? "",
        description: data.pkg === "results" ? data.description.trim() : "",
    };
}

/** Parses stored JSON, returning null for anything that does not validate. */
export function parsePreview(json: string | null): AdPreviewData | null {
    if (!json) return null;
    try {
        const v = JSON.parse(json) as Partial<AdPreviewData>;
        if (v.pkg !== "results" && v.pkg !== "brand") return null;
        const data = { pkg: v.pkg, name: String(v.name ?? ""), logo: String(v.logo ?? ""), url: String(v.url ?? ""), description: String(v.description ?? "") };
        return Object.keys(validatePreview(data)).length ? null : normalizePreview(data);
    } catch {
        return null;
    }
}

export const readPreview = (): AdPreviewData | null => {
    try { return parsePreview(sessionStorage.getItem(STORAGE_KEY)); } catch { return null; }
};
export const writePreview = (data: AdPreviewData | null) => {
    try { data ? sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data)) : sessionStorage.removeItem(STORAGE_KEY); } catch { /* storage unavailable */ }
};

export const wantsPreview = (search: string) => new URLSearchParams(search).get("preview") === "ads";
