import { ToggleButton, ToggleButtonGroup } from '@heroui/react';
import '@/styles/ui.css';
import KeyButton from '@/components/ui/KeyButton';
import TextLink from '@/components/ui/TextLink';
import { useEffect, useRef } from 'react';
import { Check, RefreshCw, X } from 'lucide-react';
import { AVATAR_BACKGROUNDS, AVATAR_STYLES, type AvatarSettings } from '@/lib/multiplayer/protocol';
import Avatar from './Avatar';
import { tr, type LearnLocale } from '@/lib/learnLocale';
const labels = { moods: 'Faces', 'fun-emoji': 'Emoji', bottts: 'Robots', 'pixel-art': 'Pixel art' };
const colors = ['Automatic', 'Sky', 'Lavender', 'Rose', 'Mint', 'Peach', 'Sunshine'];
export default function AvatarCustomizer({ open, username, settings, onChange, onClose, locale = 'en' }: { open: boolean; username: string; settings: AvatarSettings; onChange: (settings: AvatarSettings) => void; onClose: () => void; locale?: LearnLocale }) {
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
        <KeyButton isIconOnly variant="ghost" size="sm" className="multiplayer-avatar-close" aria-label={tr(locale, 'Close avatar settings', 'Avatar-Einstellungen schließen')} onPress={onClose}><X size={18} /></KeyButton>
        <h2 id="avatar-settings-title">{tr(locale, 'Your avatar', 'Dein Avatar')}</h2>
        <div className="multiplayer-avatar-preview"><Avatar username={username} settings={settings} /><span>{username || 'Your nickname'}</span><KeyButton size="sm" onPress={() => onChange({ ...settings, seed: crypto.randomUUID() })}><RefreshCw size={14} />{tr(locale, 'Shuffle', 'Mischen')}</KeyButton></div>
        <fieldset><legend>{tr(locale, 'Style', 'Stil')}</legend><ToggleButtonGroup className="key-group multiplayer-avatar-styles" aria-label={tr(locale, 'Avatar style', 'Avatar-Stil')} selectionMode="single" disallowEmptySelection selectedKeys={new Set([settings.style])} onSelectionChange={keys => { const v = Array.from(keys)[0] as typeof settings.style | undefined; if (v) onChange({ ...settings, style: v }); }}>{AVATAR_STYLES.map(style => <ToggleButton key={style} id={style} className="key-btn key-btn--ghost multiplayer-avatar-style-key"><Avatar username={username} settings={{ ...settings, style }} /><span>{labels[style]}</span></ToggleButton>)}</ToggleButtonGroup></fieldset>
        <fieldset><legend>{tr(locale, 'Background', 'Hintergrund')}</legend><ToggleButtonGroup className="key-group multiplayer-avatar-colors" aria-label={tr(locale, 'Avatar background', 'Avatar-Hintergrund')} selectionMode="single" disallowEmptySelection selectedKeys={new Set([settings.background])} onSelectionChange={keys => { const v = Array.from(keys)[0] as typeof settings.background | undefined; if (v) onChange({ ...settings, background: v }); }}>{AVATAR_BACKGROUNDS.map((background, index) => <ToggleButton key={background} id={background} className="key-btn key-btn--ghost multiplayer-avatar-color-key" aria-label={`${colors[index]} background`}><span className="multiplayer-avatar-swatch" style={{ background: background === 'auto' ? 'conic-gradient(#b6e3f4, #c0aede, #ffd5dc, #d1f4d5, #b6e3f4)' : `#${background}` }} />{colors[index]}</ToggleButton>)}</ToggleButtonGroup></fieldset>
        <div className="multiplayer-avatar-footer"><TextLink variant="muted" size="sm" href="/avatar-credits.txt">{tr(locale, 'Artwork credits', 'Bild-Credits')}</TextLink><KeyButton variant="primary" onPress={onClose}>{tr(locale, 'Done', 'Fertig')}<Check size={14} /></KeyButton></div>
    </dialog>;
}
