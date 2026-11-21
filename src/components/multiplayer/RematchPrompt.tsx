import { useEffect, useRef, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import KeyButton from '@/components/ui/KeyButton';
import { tr, type LearnLocale } from '@/lib/learnLocale';

interface Props { requestedBy: string[]; optedIn: boolean; active: boolean; canJoin: boolean; onJoin: () => void; locale?: LearnLocale }
export default function RematchPrompt({ requestedBy, optedIn, active, canJoin, onJoin, locale = 'en' }: Props) {
    const dialog = useRef<HTMLDialogElement>(null);
    const [dismissed, setDismissed] = useState(false);
    const show = active && requestedBy.length > 0 && !optedIn && !dismissed;
    useEffect(() => {
        if (show && !dialog.current?.open) dialog.current?.showModal();
        else if (!show && dialog.current?.open) dialog.current.close();
    }, [show]);
    return <dialog ref={dialog} className="multiplayer-rematch-dialog" aria-labelledby="multiplayer-rematch-title" onCancel={() => setDismissed(true)} onClick={event => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) setDismissed(true);
    }}>
        <button type="button" className="multiplayer-rematch-close" aria-label={tr(locale, 'Dismiss rematch invitation', 'Revanche-Einladung schließen')} onClick={() => setDismissed(true)}><X size={18} /></button>
        <span className="multiplayer-rematch-icon"><RefreshCw size={24} /></span>
        <h2 id="multiplayer-rematch-title">Race again?</h2>
        <p><strong>{requestedBy[0]}</strong>{requestedBy.length === 1 ? ' wants another round.' : ` and ${requestedBy.length - 1} more ${requestedBy.length === 2 ? 'player wants' : 'players want'} another round.`}</p>
        <p className="multiplayer-rematch-count" role="status">{requestedBy.length} {requestedBy.length === 1 ? 'player has' : 'players have'} opted in. Two players start a rematch.</p>
        <div className="multiplayer-actions"><KeyButton variant="ghost" onPress={() => setDismissed(true)}>{tr(locale, 'Not now', 'Jetzt nicht')}</KeyButton><KeyButton variant="primary" isDisabled={!canJoin} onPress={onJoin}><RefreshCw size={14} />{tr(locale, 'Race again', 'Nochmal tippen')}</KeyButton></div>
        {!canJoin && <p className="multiplayer-rematch-wait">{tr(locale, 'Waiting for final scores…', 'Warte auf die Endpunkte…')}</p>}
    </dialog>;
}
