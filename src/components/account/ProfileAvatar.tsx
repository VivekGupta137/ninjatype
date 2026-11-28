import { useEffect, useState } from "react";
import { avatarImageKey, type AvatarAppearance } from "@/lib/shareAvatarImage";
import { useAvatarImages } from "@/components/share/useAvatarImages";
import "@/styles/account.css";

/** True when the visitor asks for less motion; the avatar then shows its still frame. */
function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(false);
    useEffect(() => {
        const query = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReduced(query.matches);
        const onChange = () => setReduced(query.matches);
        query.addEventListener("change", onChange);
        return () => query.removeEventListener("change", onChange);
    }, []);
    return reduced;
}

/** DiceBear avatar for the signed-in user, generated in the browser (no avatar API). Animated unless motion is reduced. */
export default function ProfileAvatar({ username, style, variant, initial, size = 64 }: AvatarAppearance & { initial: string; size?: number }) {
    const reduced = usePrefersReducedMotion();
    const loaded = useAvatarImages({ username, style, variant, animated: !reduced });
    const src = loaded?.images ? (reduced ? loaded.images.still : loaded.images.animated) : null;
    return (
        <span className="acct-avatar" style={{ width: size, height: size }} data-key={avatarImageKey({ username, style, variant })}>
            {src ? <img src={src} alt="" width={size} height={size} /> : <span aria-hidden="true">{initial}</span>}
        </span>
    );
}
