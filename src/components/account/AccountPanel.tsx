import { useEffect, useState, type SyntheticEvent } from "react";
import { useStore } from "@nanostores/react";
import { Alert, Card, Chip, Dropdown, Input, Label, TextField, ToggleButton, ToggleButtonGroup } from "@heroui/react";
import { ArrowRight, Check, ChevronDown, Eye, EyeOff, LogOut, Shuffle, Trash2 } from "lucide-react";
import KeyButton from "@/components/ui/KeyButton";
import KeyLink from "@/components/ui/KeyLink";
import { $account, refreshAccount } from "@/store/account";
import HistorySyncControl from "./HistorySyncControl";
import { PRO_INCLUDES } from "./proContent";
import ProfileAvatar from "./ProfileAvatar";
import AvatarPreview from "@/components/share/AvatarPreview";
import TextLink from "@/components/ui/TextLink";
import { loadProfileAvatar, nextVariant, saveProfileAvatar, DEFAULT_PROFILE_AVATAR, type ProfileAvatar as AvatarChoice } from "@/lib/profileAvatar";
import { SHARE_AVATAR_LABELS, SHARE_AVATAR_STYLES, isShareAvatarStyle } from "@/lib/shareAvatar";
import { deleteAccount, MIN_PASSWORD, signIn, signOut, signUp, validateCredentials } from "@/lib/accountApi";
import { nextLabel, safeNext } from "@/lib/accountNext";
import "@/styles/ui.css";
import "@/styles/account.css";
import "@/styles/share.css";

/** Inline error alert, same structure as the "Inline alerts" example on /components/. */
function ErrorAlert({ message }: { message: string }) {
    return (
        <Alert status="danger" role="alert">
            <Alert.Indicator />
            <Alert.Content><Alert.Title>Something went wrong</Alert.Title><Alert.Description>{message}</Alert.Description></Alert.Content>
        </Alert>
    );
}

type Mode = "signIn" | "signUp";

/** Query params: `?next=/pro/` (where to go after signing in) and `?mode=signup`. Read after mount so server and client markup match. */
function useParams() {
    const [params, setParams] = useState<{ next: string | null; mode: Mode }>({ next: null, mode: "signIn" });
    useEffect(() => {
        const q = new URLSearchParams(window.location.search);
        setParams({ next: safeNext(q.get("next")), mode: q.get("mode") === "signup" ? "signUp" : "signIn" });
    }, []);
    return params;
}

function PasswordField({ label, value, onChange, autoComplete, placeholder, hint }: { label: string; value: string; onChange: (v: string) => void; autoComplete: string; placeholder?: string; hint?: string }) {
    const [show, setShow] = useState(false);
    return (
        <TextField name="password" type={show ? "text" : "password"} autoComplete={autoComplete} value={value} onChange={onChange} isRequired>
            <Label>{label}</Label>
            <div className="acct-pw">
                <Input placeholder={placeholder} />
                <button type="button" className="acct-pw-toggle" aria-label={show ? "Hide password" : "Show password"} aria-pressed={show} onClick={() => setShow(!show)}>
                    {show ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                </button>
            </div>
            {hint && <p className="acct-hint">{hint}</p>}
        </TextField>
    );
}

function AuthForm({ initialMode, next }: { initialMode: Mode; next: string | null }) {
    const [mode, setMode] = useState<Mode>(initialMode);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    useEffect(() => setMode(initialMode), [initialMode]);

    const submit = async (event: SyntheticEvent) => {
        event.preventDefault();
        const problem = validateCredentials({ email, password, name }, mode);
        if (problem) return setError(problem);
        setBusy(true);
        setError(null);
        try {
            await (mode === "signUp" ? signUp(email, password, name) : signIn(email, password));
            setPassword("");
            if (next) { window.location.assign(next); return; }
            await refreshAccount();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
        } finally {
            setBusy(false);
        }
    };

    const signUpMode = mode === "signUp";
    return (
        <Card className="acct-card">
            <ToggleButtonGroup className="key-group acct-switch" selectionMode="single" disallowEmptySelection aria-label="Sign in or create an account"
                selectedKeys={new Set([mode])} onSelectionChange={keys => { const key = [...keys][0] as Mode | undefined; if (key) { setMode(key); setError(null); } }}>
                <ToggleButton id="signIn" className="key-btn key-btn--ghost">Sign in</ToggleButton>
                <ToggleButton id="signUp" className="key-btn key-btn--ghost">Create account</ToggleButton>
            </ToggleButtonGroup>
            <div>
                <h2>{signUpMode ? "Create your free account" : "Welcome back"}</h2>
                <p className="acct-note">{signUpMode ? "Takes a few seconds. No card needed." : "Sign in to sync your history and manage Pro."}</p>
            </div>
            <form className="acct-form" onSubmit={submit} noValidate>
                {signUpMode && (
                    <TextField name="name" autoComplete="nickname" value={name} onChange={setName} isRequired>
                        <Label>Display name</Label>
                        <Input placeholder="Your name" maxLength={40} />
                    </TextField>
                )}
                <TextField name="email" type="email" autoComplete="email" value={email} onChange={setEmail} isRequired>
                    <Label>Email</Label>
                    <Input placeholder="you@example.com" />
                </TextField>
                <PasswordField label="Password" value={password} onChange={setPassword} autoComplete={signUpMode ? "new-password" : "current-password"}
                    placeholder={`At least ${MIN_PASSWORD} characters`} hint={signUpMode ? `Use ${MIN_PASSWORD}+ characters. There is no password reset yet, so keep it somewhere safe.` : undefined} />
                {error && <ErrorAlert message={error} />}
                <KeyButton type="submit" variant="primary" className="acct-submit" isDisabled={busy}>
                    {busy ? "Please wait…" : signUpMode ? "Create account" : "Sign in"}
                </KeyButton>
            </form>
            {signUpMode && <p className="acct-note">By creating an account you agree to the <TextLink variant="underline" size="sm" href="/terms-of-service/">Terms of Service</TextLink> and <TextLink variant="underline" size="sm" href="/privacy-policy/">Privacy Policy</TextLink>.</p>}
            {next && <p className="acct-note">You'll go back to {nextLabel(next)} afterwards.</p>}
        </Card>
    );
}

function WhyAccount() {
    return (
        <aside className="acct-why" aria-label="About accounts">
            <h2>Why create an account?</h2>
            <p className="acct-note">It's optional. Typing tests, lessons and races stay free without one.</p>
            <ul className="acct-checks">
                {PRO_INCLUDES.map(pt => <li key={pt}><Check size={16} aria-hidden="true" />{pt}</li>)}
            </ul>
            <p className="acct-note">An account lets you subscribe to Pro. We only store your email, display name and synced practice history.</p>
        </aside>
    );
}

function Signed({ id, name, email, pro, next }: { id: string; name: string; email: string; pro: boolean; next: string | null }) {
    const [confirming, setConfirming] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [avatar, setAvatar] = useState<AvatarChoice>(DEFAULT_PROFILE_AVATAR);
    useEffect(() => setAvatar(loadProfileAvatar(id)), [id]);
    const chooseAvatar = (next: AvatarChoice) => { setAvatar(next); saveProfileAvatar(id, next); };

    const run = async (action: () => Promise<void>) => {
        setBusy(true);
        setError(null);
        try { await action(); await refreshAccount(); } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong. Try again."); } finally { setBusy(false); }
    };

    return (
        <div className="acct-stack">
            <Card className="acct-card">
                <div className="acct-profile">
                    <ProfileAvatar username={id} style={avatar.style} variant={avatar.variant} initial={(name.trim()[0] || email[0] || "?").toUpperCase()} size={72} />
                    <div className="acct-profile-text">
                        <div className="acct-head">
                            <h2>{name}</h2>
                            <Chip size="sm" variant="soft" color={pro ? "success" : "default"}><Chip.Label>{pro ? "Pro" : "Free plan"}</Chip.Label></Chip>
                        </div>
                        <p className="acct-email">{email}</p>
                    </div>
                    <KeyButton size="sm" isDisabled={busy} onPress={() => run(signOut)}><LogOut size={14} aria-hidden="true" />Sign out</KeyButton>
                </div>
                <div className="acct-avatar-controls">
                    <span className="acct-avatar-label" id="acct-avatar-label">Profile picture</span>
                    <Dropdown>
                        <KeyButton size="sm" aria-label={`Avatar style: ${SHARE_AVATAR_LABELS[avatar.style]}`}><AvatarPreview username={id} style={avatar.style} variant={avatar.variant} /><span>{SHARE_AVATAR_LABELS[avatar.style]}</span><ChevronDown size={14} aria-hidden="true" /></KeyButton>
                        <Dropdown.Popover className="share-avatar-popover" placement="bottom start">
                            <Dropdown.Menu aria-labelledby="acct-avatar-label" selectionMode="single" selectedKeys={new Set([avatar.style])} onAction={key => { if (isShareAvatarStyle(key)) chooseAvatar({ ...avatar, style: key }); }}>
                                {SHARE_AVATAR_STYLES.map(key => <Dropdown.Item key={key} id={key} textValue={SHARE_AVATAR_LABELS[key]}><AvatarPreview username={id} style={key} variant={avatar.variant} /><Label>{SHARE_AVATAR_LABELS[key]}</Label><Dropdown.ItemIndicator /></Dropdown.Item>)}
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown>
                    <KeyButton size="sm" isIconOnly aria-label="Shuffle avatar" onPress={() => chooseAvatar({ ...avatar, variant: nextVariant(avatar.variant) })}><Shuffle size={14} aria-hidden="true" /></KeyButton>
                    <span className="acct-note">Saved in this browser. <TextLink variant="muted" size="sm" href="/avatar-credits.txt">Artwork credits</TextLink></span>
                </div>
                {next && <div className="acct-actions"><KeyLink href={next} variant="primary">Continue to {nextLabel(next)}<ArrowRight size={16} aria-hidden="true" /></KeyLink></div>}
            </Card>

            {error && <ErrorAlert message={error} />}

            <div className="acct-grid">
                <Card className="acct-card">
                    <h2>Your plan</h2>
                    {pro
                        ? <><p className="acct-note">Pro is active on this account. Manage billing or see what's included.</p><div className="acct-actions"><KeyLink href="/pro/">Manage Pro</KeyLink></div></>
                        : <>
                            <p className="acct-note">You're on the free plan. Pro adds:</p>
                            <ul className="acct-checks">{PRO_INCLUDES.map(pt => <li key={pt}><Check size={16} aria-hidden="true" />{pt}</li>)}</ul>
                            <div className="acct-actions"><KeyLink href="/pro/" variant="primary">See Pro plans</KeyLink></div>
                        </>}
                </Card>
                <Card className="acct-card">
                    <h2>History sync</h2>
                    <p className="acct-note">{pro ? "Keep results, streaks and key stats in step across your devices." : "Pro members can sync practice history across devices."}</p>
                    <div className="acct-actions"><HistorySyncControl /></div>
                </Card>
            </div>

            <Card className="acct-card acct-zone">
                <h2>Delete account</h2>
                <p className="acct-note">Permanently deletes your account and synced data. Practice stored in this browser is not affected.</p>
                {!confirming
                    ? <div className="acct-actions"><KeyButton variant="danger" size="sm" onPress={() => setConfirming(true)}><Trash2 size={14} aria-hidden="true" />Delete account</KeyButton></div>
                    : (
                        <form className="acct-form" onSubmit={e => { e.preventDefault(); void run(() => deleteAccount(password)); }}>
                            <TextField name="confirm-password" type="password" autoComplete="current-password" value={password} onChange={setPassword} isRequired>
                                <Label>Enter your password to confirm</Label>
                                <Input />
                            </TextField>
                            <div className="acct-actions">
                                <KeyButton type="submit" variant="danger" isDisabled={busy || !password}>Delete my account</KeyButton>
                                <KeyButton variant="ghost" onPress={() => { setConfirming(false); setPassword(""); }}>Cancel</KeyButton>
                            </div>
                        </form>
                    )}
            </Card>
        </div>
    );
}

export default function AccountPanel() {
    const account = useStore($account);
    const { next, mode } = useParams();
    useEffect(() => { void refreshAccount(); }, []);

    if (account.status === "loading") return <p className="acct-note" aria-live="polite">Loading your account…</p>;
    if (account.status === "error") return <ErrorAlert message={account.message} />;
    if (account.status === "out") return <div className="acct-grid acct-grid--auth"><AuthForm initialMode={mode} next={next} /><WhyAccount /></div>;
    return <Signed id={account.user.id} name={account.user.name} email={account.user.email} pro={account.pro} next={next} />;
}
