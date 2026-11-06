import { useEffect, useState } from 'react';
import { avatarImageKey, loadAvatarImages, type AvatarAppearance, type AvatarImages } from '@/lib/shareAvatarImage';

export function useAvatarImages(options: AvatarAppearance, enabled = true) {
    const key = avatarImageKey(options);
    const [state, setState] = useState<{ key: string; images?: AvatarImages; error?: string } | null>(null);
    useEffect(() => {
        if (!enabled) return;
        let cancelled = false;
        loadAvatarImages(options).then(images => { if (!cancelled) setState({ key, images }); })
            .catch(() => { if (!cancelled) setState({ key, error: 'Avatar could not load. Try another style.' }); });
        return () => { cancelled = true; };
    }, [key, enabled]);
    return state?.key === key ? state : null;
}
