import { useMemo } from 'react';
import { defaultAvatarImages, type AvatarAppearance, type AvatarImages } from '@/lib/shareAvatarImage';

/** Only bundled DiceBear artwork, never user-supplied markup or image URLs. */
export default function CardAvatar({ images, x, y, size, ...options }: AvatarAppearance & { images?: AvatarImages; x: number; y: number; size: number }) {
    const fallback = useMemo(() => !options.style || options.style === 'gaze' ? defaultAvatarImages(options) : null,
        [options.username, options.style, options.variant, options.animated]);
    const avatar = images ?? fallback;
    return avatar ? <image x={x} y={y} width={size} height={size} href={avatar.animated} data-export-href={avatar.still} aria-hidden="true" /> : null;
}
