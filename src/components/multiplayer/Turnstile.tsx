import { useEffect, useRef, useState } from 'react';

interface TurnstileAPI {
    render(container: HTMLElement, options: { sitekey: string; action: string; callback: (token: string) => void;
        'expired-callback': () => void; 'error-callback': () => void; theme: string; size: string }): string;
    remove(id: string): void;
}
declare global { interface Window { turnstile?: TurnstileAPI } }
let loading: Promise<void> | null = null;
function load() {
    if (window.turnstile) return Promise.resolve();
    if (!loading) loading = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => { script.remove(); loading = null; reject(new Error('Security check could not load.')); };
        document.head.append(script);
    });
    return loading;
}
export default function Turnstile({ siteKey, action, attempt, onToken }: {
    siteKey: string; action: 'create_room' | 'join_room'; attempt: number; onToken: (token: string) => void;
}) {
    const container = useRef<HTMLDivElement>(null);
    const callback = useRef(onToken); callback.current = onToken;
    const [failed, setFailed] = useState(false);
    const [retry, setRetry] = useState(0);
    useEffect(() => {
        let cancelled = false, widget: string | undefined;
        setFailed(false); callback.current('');
        void load().then(() => {
            if (cancelled || !container.current || !window.turnstile) return;
            widget = window.turnstile.render(container.current, { sitekey: siteKey, action, theme: 'auto', size: 'flexible',
                callback: token => { if (!cancelled) callback.current(token); },
                'expired-callback': () => { if (!cancelled) callback.current(''); },
                'error-callback': () => { if (!cancelled) { callback.current(''); setFailed(true); } },
            });
        }).catch(() => { if (!cancelled) setFailed(true); });
        return () => { cancelled = true; if (widget) window.turnstile?.remove(widget); };
    }, [siteKey, action, attempt, retry]);
    return <div className="multiplayer-security"><div ref={container} />{failed && <p role="status">Security check unavailable. <button type="button" onClick={() => setRetry(n => n + 1)}>Try again</button> or <a href="/">practice</a>.</p>}</div>;
}
