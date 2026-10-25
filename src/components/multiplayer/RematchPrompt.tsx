import { useEffect, useRef, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';

interface Props { requestedBy: string[]; optedIn: boolean; active: boolean; canJoin: boolean; onJoin: () => void }
export default function RematchPrompt({ requestedBy, optedIn, active, canJoin, onJoin }: Props) {
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
        <button type="button" className="multiplayer-rematch-close" aria-label="Dismiss rematch invitation" onClick={() => setDismissed(true)}><X size={18} /></button>
        <span className="multiplayer-rematch-icon"><RefreshCw size={24} /></span>
        <h2 id="multiplayer-rematch-title">Race again?</h2>
        <p><strong>{requestedBy[0]}</strong>{requestedBy.length === 1 ? ' wants another round.' : ` and ${requestedBy.length - 1} more ${requestedBy.length === 2 ? 'player wants' : 'players want'} another round.`}</p>
        <p className="multiplayer-rematch-count" role="status">{requestedBy.length} {requestedBy.length === 1 ? 'player has' : 'players have'} opted in. Two players start a rematch.</p>
        <div className="multiplayer-actions"><button type="button" onClick={() => setDismissed(true)}>Not now</button><button type="button" className="online-primary-action" disabled={!canJoin} onClick={onJoin}><RefreshCw size={14} />Race again</button></div>
        {!canJoin && <p className="multiplayer-rematch-wait">Waiting for final scores…</p>}
    </dialog>;
}
