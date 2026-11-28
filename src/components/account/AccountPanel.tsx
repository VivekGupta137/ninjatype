import { useEffect, useState, type SyntheticEvent } from "react";
import { useStore } from "@nanostores/react";
import { Alert, Card, Chip, Input, Label, TextField } from "@heroui/react";
import KeyButton from "@/components/ui/KeyButton";
import { $account, refreshAccount } from "@/store/account";
import { deleteAccount, MIN_PASSWORD, signIn, signOut, signUp, validateCredentials } from "@/lib/accountApi";
import "@/styles/ui.css";
import "@/styles/account.css";

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

function AuthForm() {
    const [mode, setMode] = useState<Mode>("signIn");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const submit = async (event: SyntheticEvent) => {
        event.preventDefault();
        const problem = validateCredentials({ email, password, name }, mode);
        if (problem) return setError(problem);
        setBusy(true);
        setError(null);
        try {
            await (mode === "signUp" ? signUp(email, password, name) : signIn(email, password));
            setPassword("");
            await refreshAccount();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <Card className="acct-card">
            <h2>{mode === "signIn" ? "Sign in" : "Create your account"}</h2>
            <form className="acct-form" onSubmit={submit} noValidate>
                {mode === "signUp" && (
                    <TextField name="name" autoComplete="nickname" value={name} onChange={setName} isRequired>
                        <Label>Display name</Label>
                        <Input placeholder="Your name" maxLength={40} />
                    </TextField>
                )}
                <TextField name="email" type="email" autoComplete="email" value={email} onChange={setEmail} isRequired>
                    <Label>Email</Label>
                    <Input placeholder="you@example.com" />
                </TextField>
                <TextField name="password" type="password" autoComplete={mode === "signIn" ? "current-password" : "new-password"} value={password} onChange={setPassword} isRequired>
                    <Label>Password</Label>
                    <Input placeholder={`At least ${MIN_PASSWORD} characters`} />
                </TextField>
                {error && <ErrorAlert message={error} />}
                <div className="acct-actions">
                    <KeyButton type="submit" variant="primary" isDisabled={busy}>{busy ? "Please wait…" : mode === "signIn" ? "Sign in" : "Create account"}</KeyButton>
                    <KeyButton variant="ghost" onPress={() => { setMode(mode === "signIn" ? "signUp" : "signIn"); setError(null); }}>
                        {mode === "signIn" ? "Need an account? Sign up" : "Have an account? Sign in"}
                    </KeyButton>
                </div>
            </form>
            <p className="acct-note">There is no password reset yet, so keep your password somewhere safe.</p>
        </Card>
    );
}

function Signed({ name, email, pro }: { name: string; email: string; pro: boolean }) {
    const [confirming, setConfirming] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    const run = async (action: () => Promise<void>) => {
        setBusy(true);
        setError(null);
        try { await action(); await refreshAccount(); } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong. Try again."); } finally { setBusy(false); }
    };

    return (
        <Card className="acct-card">
            <div className="acct-head">
                <h2>{name}</h2>
                <Chip size="sm" variant="soft" color={pro ? "success" : "default"}><Chip.Label>{pro ? "Pro" : "Free plan"}</Chip.Label></Chip>
            </div>
            <p className="acct-email">{email}</p>
            {error && <ErrorAlert message={error} />}
            <div className="acct-actions">
                <KeyButton isDisabled={busy} onPress={() => run(signOut)}>Sign out</KeyButton>
                {!confirming && <KeyButton variant="danger" onPress={() => setConfirming(true)}>Delete account</KeyButton>}
            </div>
            {confirming && (
                <form className="acct-form acct-danger" onSubmit={e => { e.preventDefault(); void run(() => deleteAccount(password)); }}>
                    <p>This permanently deletes your account. Practice stored in this browser is not affected. Enter your password to confirm.</p>
                    <TextField name="confirm-password" type="password" autoComplete="current-password" value={password} onChange={setPassword} isRequired>
                        <Label>Password</Label>
                        <Input />
                    </TextField>
                    <div className="acct-actions">
                        <KeyButton type="submit" variant="danger" isDisabled={busy || !password}>Delete my account</KeyButton>
                        <KeyButton variant="ghost" onPress={() => { setConfirming(false); setPassword(""); }}>Cancel</KeyButton>
                    </div>
                </form>
            )}
        </Card>
    );
}

export default function AccountPanel() {
    const account = useStore($account);
    useEffect(() => { void refreshAccount(); }, []);

    if (account.status === "loading") return <p className="acct-note" aria-live="polite">Loading your account…</p>;
    if (account.status === "error") return <ErrorAlert message={account.message} />;
    if (account.status === "out") return <AuthForm />;
    return <Signed name={account.user.name} email={account.user.email} pro={account.pro} />;
}
