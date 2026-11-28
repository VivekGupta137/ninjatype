import { isShareAvatarStyle, MAX_AVATAR_VARIANT, type ShareAvatarStyle } from "./shareAvatar";

/** A signed-in user's DiceBear avatar choice. Stored only in this browser. */
export type ProfileAvatar = { style: ShareAvatarStyle; variant: number };
export const DEFAULT_PROFILE_AVATAR: ProfileAvatar = { style: "gaze", variant: 0 };
const key = (userId: string) => `account:avatar:${userId}`;

export function parseProfileAvatar(raw: unknown): ProfileAvatar {
    const a = (raw ?? {}) as Record<string, unknown>;
    const variant = typeof a.variant === "number" && Number.isInteger(a.variant) && a.variant >= 0 && a.variant <= MAX_AVATAR_VARIANT ? a.variant : 0;
    return { style: isShareAvatarStyle(a.style) ? a.style : DEFAULT_PROFILE_AVATAR.style, variant };
}

export function loadProfileAvatar(userId: string): ProfileAvatar {
    try { return parseProfileAvatar(JSON.parse(localStorage.getItem(key(userId)) ?? "null")); } catch { return DEFAULT_PROFILE_AVATAR; }
}

export function saveProfileAvatar(userId: string, avatar: ProfileAvatar): void {
    try { localStorage.setItem(key(userId), JSON.stringify(avatar)); } catch { /* storage blocked: the choice lasts for this visit */ }
}

export const nextVariant = (variant: number) => (variant + 1) % (MAX_AVATAR_VARIANT + 1);
