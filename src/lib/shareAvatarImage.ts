import { Avatar, Style } from '@dicebear/core';
import gaze from '@dicebear/styles/gaze.json';
import { avatarLoaders } from './shareAvatarLoaders';
import type { ShareAvatarStyle } from './shareAvatar';

export type AvatarImages = { still: string; animated: string };
export type AvatarAppearance = { username: string; style?: ShareAvatarStyle; variant?: number; animated?: boolean };
const gazeStyle = new Style(gaze);
const styles = new Map<ShareAvatarStyle, Promise<Style>>([['gaze', Promise.resolve(gazeStyle)]]);
export function avatarImageKey(options: AvatarAppearance): string {
    return JSON.stringify([options.username, options.style ?? 'gaze', options.variant ?? 0, options.animated ?? true]);
}
function renderAvatar(style: Style, options: AvatarAppearance): AvatarImages {
    const component = style.definition().components?.animation;
    const variants = component && 'variants' in component ? component.variants : undefined;
    const animation = variants ? Object.keys(variants).find(key => key === 'medium') ?? Object.keys(variants).find(key => key !== 'none') : undefined;
    const settings = { seed: `${options.username}:${options.variant ?? 0}`, size: 128, idRandomization: false,
        backgroundColor: [],
        ...(variants ? { animationVariant: 'none' } : {}),
    };
    const still = new Avatar(style, settings).toDataUri();
    return { still, animated: options.animated !== false && animation ? new Avatar(style, { ...settings, animationVariant: animation }).toDataUri() : still };
}
export function defaultAvatarImages(options: AvatarAppearance): AvatarImages {
    return renderAvatar(gazeStyle, options);
}
export async function loadAvatarImages(options: AvatarAppearance): Promise<AvatarImages> {
    const key = options.style ?? 'gaze';
    if (!styles.has(key)) styles.set(key, avatarLoaders[key]().then(module => new Style(module.default)).catch(error => { styles.delete(key); throw error; }));
    return renderAvatar(await styles.get(key)!, options);
}
