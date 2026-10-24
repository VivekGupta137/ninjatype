import { useEffect, useRef, useState } from 'react';
import { Check, ShieldCheck } from 'lucide-react';

interface TurnstileAPI {
    render(container: HTMLElement, options: { sitekey: string; action: string; callback: (token: string) => void;
        'expired-callback': () => void; 'error-callback': () => void; 'timeout-callback': () => void;
        theme: string; size: 'normal' | 'compact'; appearance: 'always' }): string;
    remove(id: string): void;
    reset(id: string): void;
}
declare global { interface Window { turnstile?: TurnstileAPI } }
let loading: Promise<void> | null = null;
function load() {
    if (window.turnstile) return Promise.resolve();
    if (!loading) loading = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        const failed = () => { clearTimeout(timer); script.remove(); loading = null; reject(new Error('Security check could not load.')); };
        const timer = setTimeout(failed, 10_000);
        script.onload = () => { clearTimeout(timer); resolve(); };
        script.onerror = failed;
        document.head.append(script);
    });
    return loading;
}
export default function Turnstile({ siteKey, action, attempt, onToken }: {
    siteKey: string; action: 'room_entry'; attempt: number; onToken: (token: string) => void;
}) {
    const container = useRef<HTMLDivElement>(null);
    const callback = useRef(onToken); callback.current = onToken;
    const widgetRef = useRef<string | null>(null);
    const [status, setStatus] = useState<'loading' | 'checking' | 'verified' | 'failed' | 'expired'>('loading');
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        let cancelled = false, widget: string | undefined;
        setStatus('loading'); callback.current('');
        void load().then(() => {
            if (cancelled || !container.current || !window.turnstile) return;
            setStatus('checking');
            widget = window.turnstile.render(container.current, { sitekey: siteKey, action, theme: 'auto', size: container.current.clientWidth < 300 ? 'compact' : 'normal', appearance: 'always',
                callback: token => { if (!cancelled) { setStatus('verified'); callback.current(token); } },
                'expired-callback': () => { if (!cancelled) { callback.current(''); setStatus('expired'); } },
                'error-callback': () => { if (!cancelled) { callback.current(''); setStatus('failed'); } },
                'timeout-callback': () => { if (!cancelled) { callback.current(''); setStatus('failed'); } },
            });
            widgetRef.current = widget;
        }).catch(() => { if (!cancelled) setStatus('failed'); });
        return () => {
            cancelled = true;
            if (widgetRef.current === widget) widgetRef.current = null;
            if (widget) { try { window.turnstile?.remove(widget); } catch { /* The removed container may already be detached. */ } }
        };
    }, [siteKey, action, retry]);
    useEffect(() => {
        // A submitted token needs a fresh check; choosing a tab does not consume it.
        callback.current('');
        if (!widgetRef.current || !window.turnstile) return;
        setStatus('checking');
        try { window.turnstile.reset(widgetRef.current); }
        catch { setStatus('failed'); }
    }, [attempt]);
    const retryChallenge = () => {
        callback.current('');
        if (widgetRef.current && window.turnstile) {
            setStatus('checking');
            try { window.turnstile.reset(widgetRef.current); return; } catch {}
        }
        setRetry(n => n + 1);
    };
    return <div className="multiplayer-security">
        <div className="multiplayer-security-status" role="status"><span><ShieldCheck size={14} />Security check</span><span>{status === 'verified' ? <><Check size={13} />Verified</> : status === 'loading' ? 'Loading…' : status === 'checking' ? 'Verifying…' : status === 'expired' ? 'Expired' : 'Needs attention'}</span></div>
        <div ref={container} className="multiplayer-turnstile-widget" />
        {(status === 'failed' || status === 'expired') && <p>Complete a fresh check. <button type="button" onClick={retryChallenge}>Try again</button> or <a href="/">practice</a>.</p>}
    </div>;
}
