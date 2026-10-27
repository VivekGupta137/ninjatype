import { useEffect, useRef, useState } from 'react';
import { Avatar as DiceBearAvatar, Style } from '@dicebear/core';
import moods from '@dicebear/styles/moods.json';
import emoji from '@dicebear/styles/fun-emoji.json';
import robots from '@dicebear/styles/bottts.json';
import pixels from '@dicebear/styles/pixel-art.json';
import { DEFAULT_AVATAR, type AvatarSettings } from '@/lib/multiplayer/protocol';

// Artwork attribution and license links: /avatar-credits.txt.
const styles = { moods: new Style(moods), 'fun-emoji': new Style(emoji), bottts: new Style(robots), 'pixel-art': new Style(pixels) };
// Bounded client cache; no avatar API requests.
const images = new Map<string, string>();
export default function Avatar({ username, settings = DEFAULT_AVATAR }: { username: string; settings?: AvatarSettings }) {
    const [image, setImage] = useState<{ username: string; url: string } | null>(null);
    const fallbackSeed = useRef('');
    if (!fallbackSeed.current) fallbackSeed.current = crypto.randomUUID();
    const seed = settings.seed ?? fallbackSeed.current;
    const key = JSON.stringify([seed, settings.style, settings.background, settings.variant]);
    useEffect(() => {
        let cancelled = false;
        const generate = async () => {
            let url = images.get(key);
            if (!url) {
                const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${seed}:${settings.variant}`)))]
                    .map(b => b.toString(16).padStart(2, '0')).join('');
                url = new DiceBearAvatar(styles[settings.style] ?? styles.moods, { seed: hash, size: 40, ...(settings.background === 'auto' ? {} : { backgroundColor: [settings.background] }) }).toDataUri();
                if (images.size >= 100) images.delete(images.keys().next().value!);
                images.set(key, url);
            }
            if (!cancelled) setImage({ username: key, url });
        };
        void generate().catch(() => { if (!cancelled) setImage(null); });
        return () => { cancelled = true; };
    }, [key]);
    return image?.username === key ? <img className="multiplayer-avatar" src={image.url} width={36} height={36} alt="" /> :
        <span className="multiplayer-avatar multiplayer-initials" aria-hidden="true">{username.slice(0, 2).toUpperCase()}</span>;
}
