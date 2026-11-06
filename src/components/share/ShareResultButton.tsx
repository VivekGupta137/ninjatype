import { useId, useRef, useState } from 'react';
import { Share2, ArrowUpRight, X } from 'lucide-react';
import { sharePath, usernameError, validateShareResult, type ResultSnapshot } from '@/lib/shareResult';
import '../../styles/share.css';
import { $config } from '@/store/config';

/** The dialog and its trigger stay in the existing result island. No global state. */
export default function ShareResultButton({ result, defaultUsername = '', label, accessibleLabel }: { result: ResultSnapshot; defaultUsername?: string; label?: string; accessibleLabel?: string }) {
    const dialog = useRef<HTMLDialogElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);
    const nameInput = useRef<HTMLInputElement>(null);
    const id = useId();
    const [username, setUsername] = useState(defaultUsername);
    const [error, setError] = useState('');
    const [includeAccuracy, setIncludeAccuracy] = useState(true);
    if (!validateShareResult({ ...result, v: 1, username: 'Ninja' })) return null;
    const close = () => { dialog.current?.close(); trigger.current?.focus(); };
    return <>
        <button ref={trigger} type="button" className={`share-result-key${label ? ' share-result-key--label' : ''}`} aria-label={accessibleLabel ?? label ?? 'Share result'} title={accessibleLabel ?? label ?? 'Share result'} aria-haspopup="dialog" onClick={() => {
            let remembered = '';
            try { remembered = localStorage.getItem('ninjatype.share-name') ?? ''; } catch { /* storage is optional */ }
            setUsername(defaultUsername || (usernameError(remembered) ? '' : remembered));
            setError(''); setIncludeAccuracy(result.accuracy !== undefined); dialog.current?.showModal(); nameInput.current?.focus();
        }}><Share2 size={16} aria-hidden="true" />{label}</button>
        <dialog ref={dialog} className="share-dialog" aria-labelledby={`${id}-title`} onCancel={close} onClick={event => { if (event.target === dialog.current) close(); }}>
            <form className="share-composer" onSubmit={event => {
                event.preventDefault();
                const problem = usernameError(username);
                if (problem) { setError(problem); return; }
                try {
                    const path = sharePath({ ...result, v: 1, username, accuracy: includeAccuracy ? result.accuracy : undefined, theme: $config.get().theme });
                    try { localStorage.setItem('ninjatype.share-name', username.normalize('NFC').trim()); } catch { /* optional */ }
                    window.location.assign(path);
                } catch { setError('This result could not be shared. Please try another test.'); }
            }}>
                <button className="share-dialog-close" type="button" aria-label="Close share dialog" onClick={close}><X size={20} /></button>
                <span className="share-eyebrow">MAKE YOUR MARK</span>
                <h2 id={`${id}-title`}>{result.streak ? 'A habit worth sharing.' : 'A score worth sharing.'}</h2>
                {result.streak && <p>{result.streak} {result.streak === 1 ? 'day' : 'days'} streak · all-time best typing speed</p>}
                <p className="share-dialog-score"><strong>{result.wpm}</strong> WPM {includeAccuracy && result.accuracy !== undefined && <span>· {result.accuracy}% accuracy</span>}</p>
                <label htmlFor={`${id}-name`}>Your display name</label>
                <input ref={nameInput} id={`${id}-name`} name="username" value={username} maxLength={40} required autoComplete="nickname" placeholder="e.g. Keyboard ninja" aria-invalid={!!error} aria-describedby={`${id}-help ${id}-error`} onChange={event => { setUsername(event.target.value); setError(''); }} />
                <label className="share-accuracy-choice"><input type="checkbox" checked={includeAccuracy} disabled={result.accuracy === undefined} onChange={event => setIncludeAccuracy(event.target.checked)} />Include accuracy</label>
                <p id={`${id}-help`} className="share-hint">Up to 40 characters. Your name and scores will be visible to anyone with the link.</p>
                <p id={`${id}-error`} className="share-error" role="alert">{error}</p>
                <button type="submit" className="share-button share-button--primary">Create my card<ArrowUpRight size={17} aria-hidden="true" /></button>
            </form>
        </dialog>
    </>;
}
