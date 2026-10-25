import { useEffect, useRef } from 'react';
import { Check, RefreshCw, X } from 'lucide-react';
import { AVATAR_BACKGROUNDS, AVATAR_STYLES, type AvatarSettings } from '@/lib/multiplayer/protocol';
import Avatar from './Avatar';
const labels = { moods: 'Faces', 'fun-emoji': 'Emoji', bottts: 'Robots', 'pixel-art': 'Pixel art' };
const colors = ['Automatic', 'Sky', 'Lavender', 'Rose', 'Mint', 'Peach', 'Sunshine'];
export default function AvatarCustomizer({ open, username, settings, onChange, onClose }: { open: boolean; username: string; settings: AvatarSettings; onChange: (settings: AvatarSettings) => void; onClose: () => void }) {
    const dialog = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        if (open && !dialog.current?.open) dialog.current?.showModal();
        else if (!open && dialog.current?.open) dialog.current.close();
    }, [open]);
    return <dialog className="multiplayer-avatar-dialog" ref={dialog} aria-labelledby="avatar-settings-title" onCancel={onClose} onClick={event => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    }}>
        <button className="multiplayer-avatar-close" type="button" aria-label="Close avatar settings" onClick={onClose}><X size={18} /></button>
        <h2 id="avatar-settings-title">Your avatar</h2>
        <div className="multiplayer-avatar-preview"><Avatar username={username} settings={settings} /><span>{username || 'Your nickname'}</span><button type="button" onClick={() => onChange({ ...settings, variant: (settings.variant + 1) % 32 })}><RefreshCw size={14} />Shuffle</button></div>
        <fieldset><legend>Style</legend><div className="multiplayer-avatar-styles">{AVATAR_STYLES.map(style => <button type="button" key={style} aria-pressed={settings.style === style} onClick={() => onChange({ ...settings, style })}><Avatar username={username} settings={{ ...settings, style }} /><span>{labels[style]}</span>{settings.style === style && <Check size={13} />}</button>)}</div></fieldset>
        <fieldset><legend>Background</legend><div className="multiplayer-avatar-colors">{AVATAR_BACKGROUNDS.map((background, index) => <button type="button" key={background} title={colors[index]} aria-label={`${colors[index]} background`} aria-pressed={settings.background === background} onClick={() => onChange({ ...settings, background })}><span style={{ background: background === 'auto' ? 'conic-gradient(#b6e3f4, #c0aede, #ffd5dc, #d1f4d5, #b6e3f4)' : `#${background}` }}>{settings.background === background && <Check size={13} />}</span></button>)}</div></fieldset>
        <div className="multiplayer-avatar-footer"><a href="/avatar-credits.txt" target="_blank" rel="noreferrer">Artwork credits</a><button className="online-primary-action" type="button" onClick={onClose}>Done<Check size={14} /></button></div>
    </dialog>;
}
