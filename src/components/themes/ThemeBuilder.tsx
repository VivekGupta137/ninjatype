import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { ColorSwatch, Input, Label, TextField, ToggleButton, ToggleButtonGroup } from "@heroui/react";
import { Palette, Plus } from "lucide-react";
import KeyButton from "@/components/ui/KeyButton";
import { ProGate } from "@/components/ui/ProBadge";
import KeyLink from "@/components/ui/KeyLink";
import { $account, refreshAccount } from "@/store/account";
import { $activeCustomId, $customThemes } from "@/store/customThemes";
import {
    CUSTOM_COLOR_FIELDS, DEFAULT_CUSTOM_COLORS, MAX_CUSTOM_THEMES, MAX_NAME, cleanName, contrastWarnings, exportTheme, newThemeId, normalizeHex, parseImport,
    type CustomColorKey, type CustomColors, type CustomTheme,
} from "@/lib/customTheme";
import "@/styles/ui.css";
import "@/styles/theme-builder.css";

interface Draft { id: string | null; name: string; colors: CustomColors; hex: Record<CustomColorKey, string> }

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

    useEffect(() => { if ($account.get().status === "loading") void refreshAccount(); }, []);

    if (account.status === "loading") return null;
    if (account.status !== "in" || !account.pro) {
        return (
            <div className="ctb">
                <p className="ctb-note"><Palette size={14} aria-hidden="true" /> Custom themes are a Pro feature: pick your own eight colors, save up to {MAX_CUSTOM_THEMES}, and share them as a file.</p>
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
        if (!name) return setMessage("Give your theme a name.");
        if (CUSTOM_COLOR_FIELDS.some(f => !normalizeHex(draft.hex[f.key]))) return setMessage("Every color needs a hex value like #1a2b3c.");
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
        catch { setMessage("Could not copy. Select and copy the text from the export box instead."); }
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
            <div className="ctb-actions">
                <ProGate><KeyButton size="sm" onPress={() => { setMessage(null); setDraft(toDraft()); }} isDisabled={themes.length >= MAX_CUSTOM_THEMES}><Plus size={14} aria-hidden="true" /> New theme</KeyButton></ProGate>
                {themes.filter(t => t.id === activeId).map(t => (
                    <KeyButton key={t.id} size="sm" variant="ghost" onPress={() => { setMessage(null); setDraft(toDraft(t)); }}>Edit {t.name}</KeyButton>
                ))}
                {activeId && <KeyButton size="sm" variant="ghost" onPress={() => { const t = themes.find(x => x.id === activeId); if (t) void copy(t); }}>Export</KeyButton>}
                <KeyButton size="sm" variant="ghost" onPress={() => setShowImport(v => !v)}>Import</KeyButton>
            </div>
            {message && <p className="ctb-note" role="status">{message}</p>}

            {showImport && (
                <div className="ctb-import">
                    <TextField value={importText} onChange={setImportText} aria-label="Theme JSON"><Input placeholder='Paste a NinjaType theme file' /></TextField>
                    <KeyButton size="sm" variant="primary" isDisabled={!importText.trim()} onPress={doImport}>Add theme</KeyButton>
                </div>
            )}

            {draft && (
                <form className="ctb-editor" onSubmit={e => { e.preventDefault(); save(true); }}>
                    <TextField value={draft.name} onChange={name => setDraft({ ...draft, name })} maxLength={MAX_NAME}><Label>Theme name</Label><Input /></TextField>
                    <div className="ctb-grid">
                        {CUSTOM_COLOR_FIELDS.map(f => (
                            <div className="ctb-row" key={f.key}>
                                <input type="color" aria-label={`${f.label} color`} value={draft.colors[f.key]} onChange={e => setColor(f.key, e.target.value)} />
                                <TextField value={draft.hex[f.key]} onChange={v => setColor(f.key, v)} aria-label={`${f.label} hex`} isInvalid={!normalizeHex(draft.hex[f.key])}>
                                    <Label>{f.label}</Label><Input className="ctb-hex" maxLength={7} spellCheck={false} />
                                </TextField>
                            </div>
                        ))}
                    </div>
                    <div className="ctb-preview" aria-label="Theme preview" style={{ background: draft.colors.bg, color: draft.colors.text, borderColor: draft.colors.subAltText }}>
                        <div className="ctb-preview-card" style={{ background: draft.colors.altBg, borderColor: draft.colors.subAltText }}>
                            <p>the quick brown <span style={{ color: draft.colors.main }}>fox</span> jumps <span style={{ color: draft.colors.error }}>ovr</span> the <span style={{ color: draft.colors.success }}>lazy</span> dog</p>
                            <small style={{ color: draft.colors.subText }}>62 wpm · 97% accuracy</small>
                        </div>
                    </div>
                    {warnings.length > 0 && <ul className="ctb-warn" aria-label="Contrast warnings">{warnings.map(w => <li key={w}>{w}</li>)}</ul>}
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
