import { useEffect, useRef, useState } from 'react';
import type { AvatarAppearance } from '@/lib/shareAvatarImage';
import { useAvatarImages } from './useAvatarImages';

export default function AvatarPreview(props: AvatarAppearance) {
    const ref = useRef<HTMLSpanElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        if (!ref.current) return;
        const observer = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect(); }
        });
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);
    const avatar = useAvatarImages({ ...props, animated: false }, visible);
    return <span ref={ref} className="share-avatar-thumbnail" aria-hidden="true">{avatar?.images && <img src={avatar.images.still} alt="" width="32" height="32" />}</span>;
}
