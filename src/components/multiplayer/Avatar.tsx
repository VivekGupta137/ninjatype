import { useEffect, useState } from 'react';
import { Avatar as DiceBearAvatar, Style } from '@dicebear/core';
import moods from '@dicebear/styles/moods.json';

// Moods artwork is CC0; DiceBear code retains its MIT license in the dependency.
const moodsStyle = new Style(moods);
// Bounded client cache; no avatar API requests.
const images = new Map<string, string>();
export default function Avatar({ username }: { username: string }) {
    const [image, setImage] = useState<{ username: string; url: string } | null>(null);
    useEffect(() => {
        let cancelled = false;
        const generate = async () => {
            let url = images.get(username);
            if (!url) {
                const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(username.normalize('NFC'))))]
                    .map(b => b.toString(16).padStart(2, '0')).join('');
                url = new DiceBearAvatar(moodsStyle, { seed: hash, size: 40 }).toDataUri();
                if (images.size >= 100) images.delete(images.keys().next().value!);
                images.set(username, url);
            }
            if (!cancelled) setImage({ username, url });
        };
        void generate().catch(() => { if (!cancelled) setImage(null); });
        return () => { cancelled = true; };
    }, [username]);
    return image?.username === username ? <img className="multiplayer-avatar" src={image.url} width={36} height={36} alt="" /> :
        <span className="multiplayer-avatar multiplayer-initials" aria-hidden="true">{username.slice(0, 2).toUpperCase()}</span>;
}
