import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, ColorSwatch, Dropdown, Label } from '@heroui/react';
import { SHARE_AVATAR_STYLES, SHARE_AVATAR_LABELS, MAX_AVATAR_VARIANT, isShareAvatarStyle, type ShareAvatarStyle } from '@/lib/shareAvatar';
import { ChevronDown, Shuffle, ArrowUpRight, Copy, Download, Share2, Check, Keyboard } from 'lucide-react';
import { CHALLENGES, decodeShareResult, encodeShareResult, readSharedSearch, visibleShareResult, shareCaption, sharePath, type ShareResult } from '@/lib/shareResult';
import { cardPNG, downloadCard } from '@/lib/shareImage';
import { THEME } from '@/constants/themes';
import { $config } from '@/store/config';
import { SHARE_THEME_IDS, type CardPalettes, type ShareTheme } from '@/lib/shareThemes';
import AvatarPreview from './AvatarPreview';
import { useAvatarImages } from './useAvatarImages';
import ResultCard, { CARD_FORMATS, type CardFormat } from './ResultCard';

export default function SharedResult({ palettes }: { palettes: CardPalettes }) {
    const [result, setResult] = useState<ShareResult | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [format, setFormat] = useState<CardFormat>('landscape');
    const [status, setStatus] = useState('');
    const [busy, setBusy] = useState(false);
    const [origin, setOrigin] = useState('');
    const [theme, setTheme] = useState<ShareTheme>('amoled');
    const [avatar, setAvatar] = useState<ShareAvatarStyle>('gaze');
    const [avatarVariant, setAvatarVariant] = useState(0);
    const [showDictionary, setShowDictionary] = useState(true);
    const [showChallenge, setShowChallenge] = useState(true);
    const [showAccuracy, setShowAccuracy] = useState(true);
    const [prepared, setPrepared] = useState<{ file: File; result: ShareResult; format: CardFormat } | null>(null);
    const sharedResult = useMemo(() => result ? { ...visibleShareResult(result, { accuracy: showAccuracy, dictionary: showDictionary, challenge: showChallenge }), theme, avatar: avatar === 'gaze' ? undefined : avatar, avatarVariant: avatarVariant || undefined } : null, [result, theme, showAccuracy, showDictionary, showChallenge, avatar, avatarVariant]);
    const avatarImage = useAvatarImages({ username: result?.username ?? '', style: avatar, variant: avatarVariant }, !!result);
    const url = sharedResult && origin ? new URL(sharePath(sharedResult), origin).href : '';
    const file = prepared?.result === sharedResult && prepared.format === format ? prepared.file : null;
    const [nativeShare, setNativeShare] = useState(false);
    const preview = useRef<HTMLDivElement>(null);
    const linkInput = useRef<HTMLInputElement>(null);
    useEffect(() => {
        const read = () => {
            const input = readSharedSearch(window.location.search);
            const decoded = input ? decodeShareResult(encodeShareResult(input)) : null;
            setResult(decoded); setLoaded(true);
            setTheme(decoded?.theme ?? $config.get().theme);
            setAvatar(decoded?.avatar ?? 'gaze'); setAvatarVariant(decoded?.avatarVariant ?? 0);
            setShowDictionary(!!(decoded?.dictionary || decoded?.detail)); setShowChallenge(decoded?.challenge !== undefined);
            setShowAccuracy(decoded?.accuracy !== undefined);
            setOrigin(window.location.origin);
            setNativeShare(typeof navigator.share === 'function');
        };
        read(); window.addEventListener('popstate', read);
        return () => window.removeEventListener('popstate', read);
    }, []);
    useEffect(() => {
        if (url) window.history.replaceState(window.history.state, '', url);
    }, [url]);
    // Prepare the image before a share click so mobile user activation isn't lost.
    useEffect(() => {
        let cancelled = false;
        setPrepared(null); setStatus('');
        const svg = preview.current?.querySelector('svg');
        if (!svg || !sharedResult || !avatarImage?.images) return;
        const size = CARD_FORMATS[format];
        cardPNG(svg, size.width, size.height).then(blob => {
            if (!cancelled) setPrepared({ file: new File([blob], `ninjatype-${format}.png`, { type: 'image/png' }), result: sharedResult, format });
        }).catch(() => { if (!cancelled) setStatus('Image export is unavailable here. You can still copy your link.'); });
        return () => { cancelled = true; };
    }, [sharedResult, format, avatarImage]);
    const challenge = result?.challenge ? CHALLENGES[result.challenge] : null;
    const heading = <header className="share-page-heading"><div><span className="share-eyebrow">YOUR TYPING ACHIEVEMENT</span><h1>Your typing. Your moment<span>.</span></h1><p>Make it yours. Share how far you’ve come.</p></div><a className="share-button share-keep-practicing" href={challenge?.href ?? '/'}>Keep practicing<ArrowUpRight size={17} aria-hidden="true" /></a></header>;
    if (!loaded) return <>{heading}<p className="share-empty" role="status">Opening the result card…</p></>;
    if (!result || !sharedResult) return <>{heading}<section className="share-empty"><Keyboard size={32} aria-hidden="true" /><h2>No result to show yet.</h2><p>This link is missing a result or contains invalid data. Finish a typing test and choose Share result to create a new card.</p><a className="share-button share-button--primary" href="/">Take a typing test<ArrowUpRight size={16} aria-hidden="true" /></a></section></>;
    return <>{heading}
<section className="share-export-toolbar" aria-label="Save or share">
            <div className="share-control-heading share-export-heading"><span>Save or share</span><span>PNG · {CARD_FORMATS[format].hint}</span></div>
            <div className="share-tool-actions">
                <button type="button" className="share-button" onClick={async () => {
                    try { await navigator.clipboard.writeText(url); setStatus('Link copied. Ready to send.'); }
                    catch { linkInput.current?.focus(); linkInput.current?.select(); setStatus('Select and copy the link below.'); }
                }}><Copy size={17} aria-hidden="true" />Copy result link</button>
                <button type="button" className="share-button share-button--primary" disabled={!file} onClick={() => { if (file) { downloadCard(file, file.name); setStatus('PNG ready. Attach it to your post with the result link.'); } }}><Download size={17} aria-hidden="true" />Download PNG</button>
                {nativeShare && <button type="button" className="share-button" disabled={busy} onClick={async () => {
                    setBusy(true);
                    try {
                        const data: ShareData = { title: `${result.username}'s NinjaType result`, text: shareCaption(sharedResult), url };
                        if (file && navigator.canShare?.({ files: [file] })) data.files = [file];
                        await navigator.share(data);
                        setStatus('Your result has been shared.');
                    } catch (error) {
                        if (!(error instanceof Error && error.name === 'AbortError')) setStatus('Sharing is unavailable here. Copy the link or download the PNG instead.');
                    } finally { setBusy(false); }
                }}><Share2 size={17} aria-hidden="true" />{busy ? 'Opening share options…' : 'Share…'}</button>}
                <a className="share-button" target="_blank" rel="noopener noreferrer" href={`https://twitter.com/intent/tweet?${new URLSearchParams({ text: shareCaption(sharedResult), url })}`}>Post to X<ArrowUpRight size={16} aria-hidden="true" /></a>
            </div>
            <p className="share-status" role="status" aria-live="polite">{status && <><Check size={14} aria-hidden="true" />{status}</>}</p>
            <label className="share-link-label" htmlFor="share-result-link">Result link</label>
            <input ref={linkInput} id="share-result-link" className="share-link-input" readOnly value={url} onFocus={event => event.target.select()} />
            <p className="share-hint">PNG exports are still images. Attach yours to a post for a personal preview.</p>

</section>
    <div className="share-workspace">
        <div className="share-stage">
            <fieldset className="share-formats"><legend>Choose an image format</legend>{(Object.keys(CARD_FORMATS) as CardFormat[]).map(key => <label key={key} data-selected={format === key}><input type="radio" name="card-format" value={key} checked={format === key} onChange={() => setFormat(key)} /><span>{CARD_FORMATS[key].label}<small>{CARD_FORMATS[key].hint}</small></span></label>)}</fieldset>
            <div className="share-preview-area"><div className="share-preview" ref={preview} data-format={format}><ResultCard result={sharedResult} format={format} palette={palettes[theme]} avatarImages={avatarImage?.images} /></div></div>
        </div>
        <aside className="share-tools" aria-label="Share this result">
            <div className="share-customization">
                <h2>Make it yours.</h2>
                <div className="share-control-heading"><span>Theme</span><span>{THEME[theme].label}</span></div>
                <div className="share-theme-swatches" role="group" aria-label="Card theme">
                    {SHARE_THEME_IDS.map(key => <Button key={key} isIconOnly variant="ghost" className="share-theme-swatch" aria-label={`${THEME[key].label} theme`} aria-pressed={theme === key} onPress={() => setTheme(key)}><span aria-hidden="true" title={THEME[key].label}><ColorSwatch color={palettes[key].main} colorName={THEME[key].label} size="sm" /></span></Button>)}
                </div>
                <span className="share-control-label" id="share-avatar-label">Avatar style</span>
                <div className="share-avatar-controls">
                    <Dropdown>
                        <Button variant="outline" className="share-avatar-trigger" aria-label={`Avatar style: ${SHARE_AVATAR_LABELS[avatar]}`}><AvatarPreview username={result.username} style={avatar} variant={avatarVariant} /><span>{SHARE_AVATAR_LABELS[avatar]}</span><ChevronDown size={15} aria-hidden="true" /></Button>
                        <Dropdown.Popover className="share-avatar-popover" placement="bottom start">
                            <Dropdown.Menu aria-labelledby="share-avatar-label" selectionMode="single" selectedKeys={new Set([avatar])} onAction={key => { if (isShareAvatarStyle(key)) setAvatar(key); }}>
                                {SHARE_AVATAR_STYLES.map(key => <Dropdown.Item key={key} id={key} textValue={SHARE_AVATAR_LABELS[key]}><AvatarPreview username={result.username} style={key} variant={avatarVariant} /><Label>{SHARE_AVATAR_LABELS[key]}</Label><Dropdown.ItemIndicator /></Dropdown.Item>)}
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown>
                    <Button isIconOnly variant="outline" className="share-avatar-shuffle" aria-label="Shuffle avatar" onPress={() => setAvatarVariant(value => (value + 1) % (MAX_AVATAR_VARIANT + 1))}><Shuffle size={17} aria-hidden="true" /></Button>
                </div>
                {avatarImage?.error && <p role="alert" className="share-error">{avatarImage.error}</p>}
                <div className="share-field-toggles"><h3>Card details</h3>
                <label className="share-accuracy-choice"><input type="checkbox" checked={showAccuracy} disabled={result.accuracy === undefined} onChange={event => setShowAccuracy(event.target.checked)} /><span>Show accuracy<small>Include it on your card and link</small></span></label>
                <label className="share-accuracy-choice"><input type="checkbox" checked={showDictionary} disabled={!result.dictionary && !result.detail} onChange={event => setShowDictionary(event.target.checked)} /><span>Show dictionary</span></label>
                <label className="share-accuracy-choice"><input type="checkbox" checked={showChallenge} disabled={!result.challenge} onChange={event => setShowChallenge(event.target.checked)} /><span>Show practice type</span></label>
                </div>
                {result.accuracy === undefined && <p className="share-hint">Accuracy wasn’t included in this shared result.</p>}
            </div>

            <p className="share-hint">This is a player-shared snapshot, not a verified record. Names and scores are public to anyone with the link.</p>
            <p className="share-hint"><a href="/avatar-credits.txt" target="_blank" rel="noreferrer">Avatar artwork credits</a></p>
        </aside>
    </div></>;
}
