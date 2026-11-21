import { useEffect, useMemo, useRef, useState } from 'react';
import { Chip, ColorSwatch, Dropdown, Label, Switch, ToggleButton, ToggleButtonGroup } from '@heroui/react';
import KeyButton from '@/components/ui/KeyButton';
import KeyLink from '@/components/ui/KeyLink';
import TextLink from '@/components/ui/TextLink';
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
import { isShareMessage, shareMessage, shareMessageOptions } from '@/lib/shareMessages';
import { shareImagePath } from '@/lib/shareImageRequest';

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
    const [message, setMessage] = useState(0);
    const [prepared, setPrepared] = useState<{ file: File; result: ShareResult; format: CardFormat } | null>(null);
    const sharedResult = useMemo(() => result ? { ...visibleShareResult(result, { accuracy: showAccuracy, dictionary: showDictionary, challenge: showChallenge }), message: message || undefined, theme, avatar: avatar === 'gaze' ? undefined : avatar, avatarVariant: avatarVariant || undefined } : null, [result, theme, showAccuracy, showDictionary, showChallenge, avatar, avatarVariant, message]);
    const avatarImage = useAvatarImages({ username: result?.username ?? '', style: avatar, variant: avatarVariant }, !!result);
    const url = sharedResult && origin ? new URL(sharePath(sharedResult), origin).href : '';
    const imageUrl = sharedResult && origin ? new URL(shareImagePath(sharedResult, format), origin).href : '';
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
            setMessage(decoded?.message ?? 0);
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
    const heading = <header className="share-page-heading"><div><Chip size="sm" variant="soft"><Chip.Label>Your typing achievement</Chip.Label></Chip><h1>Your typing. Your moment<span>.</span></h1><p>Make it yours. Share how far you’ve come.</p></div><KeyLink variant="primary" href={challenge?.href ?? '/'}>Keep practicing<ArrowUpRight size={16} aria-hidden="true" /></KeyLink></header>;
    if (!loaded) return <>{heading}<p className="share-empty" role="status">Opening the result card…</p></>;
    if (!result || !sharedResult) return <>{heading}<section className="share-empty"><Keyboard size={32} aria-hidden="true" /><h2>No result to show yet.</h2><p>This link is missing a result or contains invalid data. Finish a typing test and choose Share result to create a new card.</p><KeyLink variant="primary" href="/">Take a typing test<ArrowUpRight size={16} aria-hidden="true" /></KeyLink></section></>;
    return <>{heading}
<section className="share-export-toolbar" aria-label="Save or share">
            <div className="share-control-heading share-export-heading"><span>Save or share</span><span>PNG · {CARD_FORMATS[format].hint}</span></div>
            <div className="share-tool-actions">
                <KeyButton onPress={async () => {
                    try { await navigator.clipboard.writeText(imageUrl); setStatus('Image URL copied. It opens your PNG directly.'); }
                    catch { setStatus('Open PNG below, then copy its address from your browser.'); }
                }}><Copy size={16} aria-hidden="true" />Copy image URL</KeyButton>
                <KeyLink href={imageUrl} target="_blank" rel="noopener noreferrer">Open PNG<ArrowUpRight size={16} aria-hidden="true" /></KeyLink>
                <KeyButton onPress={async () => {
                    try { await navigator.clipboard.writeText(url); setStatus('Link copied. Ready to send.'); }
                    catch { linkInput.current?.focus(); linkInput.current?.select(); setStatus('Select and copy the link below.'); }
                }}><Copy size={16} aria-hidden="true" />Copy result link</KeyButton>
                <KeyButton variant="primary" isDisabled={!file} onPress={() => { if (file) { downloadCard(file, file.name); setStatus('PNG ready. Attach it to your post with the result link.'); } }}><Download size={16} aria-hidden="true" />Download PNG</KeyButton>
                {nativeShare && <KeyButton isDisabled={busy} onPress={async () => {
                    setBusy(true);
                    try {
                        const data: ShareData = { title: `${result.username}'s NinjaType result`, text: shareCaption(sharedResult), url };
                        if (file && navigator.canShare?.({ files: [file] })) data.files = [file];
                        await navigator.share(data);
                        setStatus('Your result has been shared.');
                    } catch (error) {
                        if (!(error instanceof Error && error.name === 'AbortError')) setStatus('Sharing is unavailable here. Copy the link or download the PNG instead.');
                    } finally { setBusy(false); }
                }}><Share2 size={16} aria-hidden="true" />{busy ? 'Opening share options…' : 'Share…'}</KeyButton>}
                <KeyLink target="_blank" rel="noopener noreferrer" href={`https://twitter.com/intent/tweet?${new URLSearchParams({ text: shareCaption(sharedResult), url })}`}>Post to X<ArrowUpRight size={16} aria-hidden="true" /></KeyLink>
            </div>
            <p className="share-status" role="status" aria-live="polite">{status && <><Check size={14} aria-hidden="true" />{status}</>}</p>
            <label className="share-link-label" htmlFor="share-result-link">Result link</label>
            <input ref={linkInput} id="share-result-link" className="share-link-input" readOnly value={url} onFocus={event => event.target.select()} />
            <p className="share-hint">PNG exports are still images. Attach yours to a post for a personal preview.</p>

</section>
    <div className="share-workspace">
        <div className="share-stage">
            <ToggleButtonGroup className="key-group share-formats" aria-label="Choose an image format" selectionMode="single" disallowEmptySelection selectedKeys={new Set([format])} onSelectionChange={keys => { const v = Array.from(keys)[0] as CardFormat | undefined; if (v) setFormat(v); }}>{(Object.keys(CARD_FORMATS) as CardFormat[]).map(key => <ToggleButton key={key} id={key} className="key-btn key-btn--ghost share-format-key">{CARD_FORMATS[key].label}<small>{CARD_FORMATS[key].hint}</small></ToggleButton>)}</ToggleButtonGroup>
            <div className="share-preview-area"><div className="share-preview" ref={preview} data-format={format}><ResultCard result={sharedResult} format={format} palette={palettes[theme]} avatarImages={avatarImage?.images} /></div></div>
        </div>
        <aside className="share-tools" aria-label="Share this result">
            <div className="share-customization">
                <h2>Make it yours.</h2>
                <span className="share-control-label" id="share-message-label">Card message</span>
                <Dropdown>
                    <KeyButton className="share-message-trigger" aria-label={`Card message: ${shareMessage(sharedResult).text}`}><span>{shareMessage(sharedResult).text}</span><ChevronDown size={15} aria-hidden="true" /></KeyButton>
                    <Dropdown.Popover className="share-message-popover" placement="bottom start">
                        <Dropdown.Menu aria-labelledby="share-message-label" selectionMode="single" selectedKeys={new Set([String(message)])} onAction={key => {
                            const selected = Number(key);
                            if (isShareMessage(selected, result.streak !== undefined)) setMessage(selected);
                        }}>
                            {shareMessageOptions(sharedResult).map(option => <Dropdown.Item key={option.id} id={String(option.id)} textValue={option.text}><Label>{option.text}</Label><Dropdown.ItemIndicator /></Dropdown.Item>)}
                        </Dropdown.Menu>
                    </Dropdown.Popover>
                </Dropdown>
                <div className="share-control-heading"><span>Theme</span><span>{THEME[theme].label}</span></div>
                <div className="share-theme-swatches" role="group" aria-label="Card theme">
                    {SHARE_THEME_IDS.map(key => <KeyButton key={key} isIconOnly variant="ghost" isActive={theme === key} className="share-theme-swatch" aria-label={`${THEME[key].label} theme`} onPress={() => setTheme(key)}><span aria-hidden="true" title={THEME[key].label}><ColorSwatch color={palettes[key].main} colorName={THEME[key].label} size="xs" shape="circle" /></span></KeyButton>)}
                </div>
                <span className="share-control-label" id="share-avatar-label">Avatar style</span>
                <div className="share-avatar-controls">
                    <Dropdown>
                        <KeyButton className="share-avatar-trigger" aria-label={`Avatar style: ${SHARE_AVATAR_LABELS[avatar]}`}><AvatarPreview username={result.username} style={avatar} variant={avatarVariant} /><span>{SHARE_AVATAR_LABELS[avatar]}</span><ChevronDown size={15} aria-hidden="true" /></KeyButton>
                        <Dropdown.Popover className="share-avatar-popover" placement="bottom start">
                            <Dropdown.Menu aria-labelledby="share-avatar-label" selectionMode="single" selectedKeys={new Set([avatar])} onAction={key => { if (isShareAvatarStyle(key)) setAvatar(key); }}>
                                {SHARE_AVATAR_STYLES.map(key => <Dropdown.Item key={key} id={key} textValue={SHARE_AVATAR_LABELS[key]}><AvatarPreview username={result.username} style={key} variant={avatarVariant} /><Label>{SHARE_AVATAR_LABELS[key]}</Label><Dropdown.ItemIndicator /></Dropdown.Item>)}
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown>
                    <KeyButton isIconOnly className="share-avatar-shuffle" aria-label="Shuffle avatar" onPress={() => setAvatarVariant(value => (value + 1) % (MAX_AVATAR_VARIANT + 1))}><Shuffle size={16} aria-hidden="true" /></KeyButton>
                </div>
                {avatarImage?.error && <p role="alert" className="share-error">{avatarImage.error}</p>}
                <div className="share-field-toggles"><h3>Card details</h3>
                <Switch isSelected={showAccuracy} isDisabled={result.accuracy === undefined} onChange={setShowAccuracy}><Switch.Control><Switch.Thumb /></Switch.Control><Switch.Content><Label>Show accuracy</Label></Switch.Content></Switch>
                <Switch isSelected={showDictionary} isDisabled={!result.dictionary && !result.detail} onChange={setShowDictionary}><Switch.Control><Switch.Thumb /></Switch.Control><Switch.Content><Label>Show dictionary</Label></Switch.Content></Switch>
                <Switch isSelected={showChallenge} isDisabled={!result.challenge} onChange={setShowChallenge}><Switch.Control><Switch.Thumb /></Switch.Control><Switch.Content><Label>Show practice type</Label></Switch.Content></Switch>
                </div>
                {result.accuracy === undefined && <p className="share-hint">Accuracy wasn’t included in this shared result.</p>}
            </div>

            <p className="share-hint">This is a player-shared snapshot, not a verified record. Names and scores are public to anyone with the link.</p>
            <p className="share-hint"><TextLink variant="muted" size="sm" href="/avatar-credits.txt">Avatar artwork credits</TextLink></p>
        </aside>
    </div></>;
}
