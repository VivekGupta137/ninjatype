import { useEffect, useRef, useState } from "react";
import { useStore } from "@nanostores/react";
import { ColorSwatch, Input, Label, TextField, ToggleButton, ToggleButtonGroup } from "@heroui/react";
import { Palette, Plus } from "lucide-react";
import KeyButton from "@/components/ui/KeyButton";
import { ProGate } from "@/components/ui/ProBadge";
import KeyLink from "@/components/ui/KeyLink";
import ThemeColorControl from "@/components/themes/ThemeColorControl";
import { $account, refreshAccount } from "@/store/account";
import { $activeCustomId, $customThemes } from "@/store/customThemes";
import {
    CUSTOM_COLOR_FIELDS, DEFAULT_CUSTOM_COLORS, MAX_CUSTOM_THEMES, MAX_NAME, cleanName, contrastWarnings, exportTheme, newThemeId, normalizeHex, parseImport,
    type CustomColorKey, type CustomColors, type CustomTheme,
} from "@/lib/customTheme";
import "@/styles/ui.css";
import "@/styles/theme-builder.css";

interface Draft { id: string | null; name: string; colors: CustomColors; hex: Record<CustomColorKey, string> }

const COLOR_DESCRIPTIONS: Record<CustomColorKey, string> = {
    bg: "Page and typing area", altBg: "Cards and panels", main: "Active keys and highlights", pipe: "Caret and secondary highlights",
    text: "Main typing text", docText: "Articles and document text", subText: "Labels and secondary text", subAltText: "Borders and inactive keys",
    error: "Mistyped characters", errorExtra: "Emphasized errors", colorfulError: "Colorful error states", colorfulErrorExtra: "Emphasized colorful errors",
    success: "Correct and completed states", successExtra: "Emphasized success states", starWhite: "White achievement stars", starGreen: "Green achievement stars",
    starYellow: "Yellow achievement stars", starOrange: "Orange achievement stars", starRed: "Red achievement stars",
};

const toDraft = (t?: CustomTheme): Draft => {
    const colors = t?.colors ?? DEFAULT_CUSTOM_COLORS;
    return { id: t?.id ?? null, name: t?.name ?? "My theme", colors, hex: { ...colors } };
};

/** Pro: build, save, apply, import and export custom color themes. Colors are validated hex only (no free-form CSS). */
export default function ThemeBuilder() {
    const account = useStore($account);
    const themes = useStore($customThemes);
    const activeId = useStore($activeCustomId);
    const [draft, setDraft] = useState<Draft | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [importText, setImportText] = useState("");
    const [showImport, setShowImport] = useState(false);
    const [exportText, setExportText] = useState("");
    const [showErrors, setShowErrors] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => { if ($account.get().status === "loading") void refreshAccount(); }, []);
    const editorOpen = draft !== null;
    useEffect(() => {
        if (editorOpen) formRef.current?.querySelector<HTMLInputElement>('[name="themeName"]')?.focus();
    }, [editorOpen]);

    if (account.status === "loading") return <p className="ctb-note">Loading your account…</p>;
    if (account.status === "error") return <div className="ctb"><p role="alert">Could not load your account. {account.message}</p><div><KeyButton onPress={() => { void refreshAccount(); }}>Try again</KeyButton></div></div>;
    if (account.status !== "in" || !account.pro) {
        return (
            <div className="ctb">
                <p className="ctb-note"><Palette size={14} aria-hidden="true" /> Custom themes are a Pro feature: configure your colors, save up to {MAX_CUSTOM_THEMES}, and share them as a file.</p>
                <div><ProGate><KeyLink href="/pro/" size="sm">Unlock custom themes</KeyLink></ProGate></div>
            </div>
        );
    }

    const warnings = draft ? contrastWarnings(draft.colors) : [];
    const setColor = (key: CustomColorKey, value: string) => setDraft(d => {
        if (!d) return d;
        const hex = normalizeHex(value);
        return { ...d, hex: { ...d.hex, [key]: value }, colors: hex ? { ...d.colors, [key]: hex } : d.colors };
    });

    const save = (apply: boolean) => {
        if (!draft) return;
        const name = cleanName(draft.name);
        if (!name) {
            setMessage("Give your theme a name.");
            formRef.current?.querySelector<HTMLInputElement>('[name="themeName"]')?.focus();
            return;
        }
        const invalid = CUSTOM_COLOR_FIELDS.find(f => !normalizeHex(draft.hex[f.key]));
        if (invalid) {
            setShowErrors(true);
            setMessage("Check the highlighted hex values before saving.");
            formRef.current?.querySelector<HTMLInputElement>(`[name="${invalid.key}"]`)?.focus();
            return;
        }
        const id = draft.id ?? newThemeId();
        const existing = themes.some(t => t.id === id);
        if (!existing && themes.length >= MAX_CUSTOM_THEMES) return setMessage(`You can keep ${MAX_CUSTOM_THEMES} custom themes. Delete one first.`);
        const next: CustomTheme = { id, name, colors: draft.colors };
        $customThemes.set(existing ? themes.map(t => (t.id === id ? next : t)) : [...themes, next]);
        if (apply) $activeCustomId.set(id);
        setDraft(null);
        setMessage(apply ? `Applied ${name}.` : `Saved ${name}.`);
    };
    const remove = (id: string) => {
        if (!window.confirm("Delete this custom theme?")) return;
        $customThemes.set(themes.filter(t => t.id !== id));
        if (activeId === id) $activeCustomId.set("");
        setDraft(null);
        setMessage("Theme deleted.");
    };
    const copy = async (t: CustomTheme) => {
        try { await navigator.clipboard.writeText(exportTheme(t)); setMessage("Theme copied. Paste it into Import on another device."); }
        catch { setExportText(exportTheme(t)); setMessage("Could not copy automatically. Copy the export text below."); }
    };
    const doImport = () => {
        const result = parseImport(importText);
        if ("error" in result) return setMessage(result.error);
        if (themes.length >= MAX_CUSTOM_THEMES) return setMessage(`You can keep ${MAX_CUSTOM_THEMES} custom themes. Delete one first.`);
        $customThemes.set([...themes, result.theme]);
        setImportText("");
        setShowImport(false);
        setMessage(`Imported ${result.theme.name}.`);
    };

    const editing = draft?.id ? themes.find(t => t.id === draft.id) : undefined;

    return (
        <div className="ctb">
            <p className="ctb-note">Create up to {MAX_CUSTOM_THEMES} themes. Your themes are saved on this device; export them to use elsewhere.</p>
            {themes.length > 0 && (
                <ToggleButtonGroup
                    className="key-group theme-key-group not-prose"
                    aria-label="Your custom themes"
                    selectionMode="single"
                    selectedKeys={new Set(activeId ? [activeId] : [])}
                    onSelectionChange={keys => { $activeCustomId.set((Array.from(keys)[0] as string | undefined) ?? ""); }}
                >
                    {themes.map(t => (
                        <ToggleButton key={t.id} id={t.id} className="key-btn key-btn--ghost theme-key">
                            <ColorSwatch color={t.colors.main} colorName={t.name} size="xs" shape="circle" />
                            {t.name}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            )}
            {themes.length === 0 && !draft && <p className="ctb-note">You haven't saved a custom theme yet. Create one to get started, or import one below.</p>}
            <div className="ctb-actions">
                <ProGate><KeyButton size="sm" variant="primary" onPress={() => { setMessage(null); setShowErrors(false); setDraft(toDraft()); }} isDisabled={!!draft || themes.length >= MAX_CUSTOM_THEMES}><Plus size={14} aria-hidden="true" /> New theme</KeyButton></ProGate>
                {themes.filter(t => t.id === activeId).map(t => (
                    <KeyButton key={t.id} size="sm" variant="ghost" isDisabled={!!draft} onPress={() => { setMessage(null); setShowErrors(false); setDraft(toDraft(t)); }}>Edit {t.name}</KeyButton>
                ))}
                {activeId && <KeyButton size="sm" variant="ghost" onPress={() => { const t = themes.find(x => x.id === activeId); if (t) void copy(t); }}>Export</KeyButton>}
                <KeyButton size="sm" variant="ghost" onPress={() => setShowImport(v => !v)}>Import</KeyButton>
            </div>
            {message && <p className="ctb-note" role="status">{message}</p>}

            {exportText && <div className="ctb-export"><label htmlFor="ctb-export-text">Theme export</label><textarea id="ctb-export-text" readOnly value={exportText} rows={6} onFocus={e => e.currentTarget.select()} /><KeyButton size="sm" variant="ghost" onPress={() => setExportText("")}>Close export</KeyButton></div>}
            {showImport && (
                <div className="ctb-import">
                    <TextField value={importText} onChange={setImportText} aria-label="Theme JSON"><Input placeholder='Paste a NinjaType theme file' /></TextField>
                    <KeyButton size="sm" variant="primary" isDisabled={!importText.trim()} onPress={doImport}>Add theme</KeyButton>
                </div>
            )}

            {draft && (
                <form ref={formRef} className="ctb-editor" aria-label="Custom theme editor" onSubmit={e => { e.preventDefault(); save(true); }}>
                    <div><strong>{editing ? `Edit ${editing.name}` : "New custom theme"}</strong><p className="ctb-note">Choose a swatch or enter a hex value. The preview updates as you edit.</p></div>
                    <TextField value={draft.name} onChange={name => setDraft(d => d ? { ...d, name } : d)} maxLength={MAX_NAME}><Label>Theme name</Label><Input name="themeName" /></TextField>
                    <div><strong>Live preview</strong><p className="ctb-note">{editing?.id === activeId ? "Preview only. Saving updates your active theme." : "Preview only. Save and apply to use this theme across NinjaType."}</p></div>
                    <div className="ctb-preview" aria-label="Theme preview" style={{ background: draft.colors.bg, color: draft.colors.text, borderColor: draft.colors.subAltText }}>
                        <div className="ctb-preview-card" style={{ background: draft.colors.altBg, borderColor: draft.colors.subAltText }}>
                            <p>the quick brown <span style={{ color: draft.colors.main }}>fox</span> jumps <span style={{ color: draft.colors.error }}>ovr</span> the <span style={{ color: draft.colors.success }}>lazy</span> dog</p>
                            <small style={{ color: draft.colors.subText }}>62 wpm · 97% accuracy</small>
                        </div>
                    </div>
                    {warnings.length > 0 && <ul className="ctb-warn" aria-label="Contrast warnings">{warnings.map(w => <li key={w}>{w}</li>)}</ul>}
                    <p className="ctb-note">Use #RGB or #RRGGBB for exact colors.</p>
                    {[
                        { label: "Base colors", fields: CUSTOM_COLOR_FIELDS.slice(0, 8) },
                        { label: "Feedback colors", fields: CUSTOM_COLOR_FIELDS.slice(8, 14) },
                        { label: "Achievement stars", fields: CUSTOM_COLOR_FIELDS.slice(14) },
                    ].map(group => <fieldset className="ctb-fieldset" key={group.label}><legend>{group.label}</legend>
                        <div className="ctb-grid">
                            {group.fields.map(f => <ThemeColorControl key={f.key} colorKey={f.key} label={f.label} description={COLOR_DESCRIPTIONS[f.key]} color={draft.colors[f.key]} hex={draft.hex[f.key]} showErrors={showErrors} onChange={v => setColor(f.key, v)} />)}
                        </div></fieldset>)}
                    <div className="ctb-actions">
                        <KeyButton type="submit" variant="primary" size="sm">Save and apply</KeyButton>
                        <KeyButton size="sm" onPress={() => save(false)}>Save</KeyButton>
                        <KeyButton size="sm" variant="ghost" onPress={() => { setDraft(null); setMessage(null); }}>Cancel</KeyButton>
                        {editing && <KeyButton size="sm" variant="danger" onPress={() => remove(editing.id)}>Delete</KeyButton>}
                    </div>
                </form>
            )}
        </div>
    );
}
