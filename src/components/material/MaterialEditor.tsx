import { useId, useMemo, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import KeyButton from "@/components/ui/KeyButton";
import { MAX_MATERIAL_CHARS, MAX_TITLE_CHARS, checkDraft, countWords, defaultTitle, type Material } from "@/lib/customMaterial";
import type { SaveError } from "@/store/customMaterial";

const MESSAGES: Record<SaveError, string> = {
    empty: "Paste some text first.",
    "too-long": `That text is longer than ${MAX_MATERIAL_CHARS.toLocaleString("en")} characters. Split it into smaller parts.`,
    limit: "You have reached the limit of saved items. Delete one first.",
    storage: "Your browser could not store this (storage may be full or blocked). Delete some material and try again.",
    missing: "This item no longer exists.",
};

type Props = {
    material?: Material;
    onSave: (draft: { id?: string; title: string; text: string }) => SaveError | null;
    onCancel: () => void;
};

export default function MaterialEditor({ material, onSave, onCancel }: Props) {
    const id = useId();
    const [title, setTitle] = useState(material?.title ?? "");
    const [text, setText] = useState(material?.text ?? "");
    const [error, setError] = useState<SaveError | null>(null);
    const check = useMemo(() => checkDraft(text), [text]);
    const { replaced, removed } = check.clean;
    const cleaned = check.clean.text;
    const canSave = check.ok;

    const submit = () => {
        const result = onSave({ id: material?.id, title, text });
        if (result) setError(result);
    };

    return (
        <section className="mm-view" aria-labelledby={`${id}-h`}>
            <header className="mm-head">
                <div>
                    <h1 id={`${id}-h`} className="mm-title">{material ? "Edit material" : "Add material"}</h1>
                    <p className="mm-sub">Stored only in this browser. Text is converted to plain characters your keyboard can type.</p>
                </div>
                <KeyButton variant="ghost" onPress={onCancel}><ArrowLeft size={16} aria-hidden="true" />Back</KeyButton>
            </header>

            <form className="mm-form" onSubmit={event => { event.preventDefault(); submit(); }}>
                <div className="mm-field">
                    <label htmlFor={`${id}-title`}>Title <span className="mm-optional">(optional)</span></label>
                    <input id={`${id}-title`} className="mm-input" type="text" value={title} maxLength={MAX_TITLE_CHARS} autoComplete="off"
                        placeholder={cleaned ? defaultTitle(cleaned) : "e.g. Contract law, clause 4"}
                        onChange={event => { setTitle(event.target.value); setError(null); }} />
                </div>
                <div className="mm-field">
                    <label htmlFor={`${id}-text`}>Text to practise</label>
                    <textarea id={`${id}-text`} className="mm-textarea" value={text} spellCheck={false} rows={14} autoFocus={!material}
                        placeholder="Paste or type your text here"
                        aria-describedby={`${id}-stats`}
                        onChange={event => { setText(event.target.value); setError(null); }} />
                    <p id={`${id}-stats`} className="mm-stats">
                        {countWords(cleaned).toLocaleString("en")} words · {cleaned.length.toLocaleString("en")} / {MAX_MATERIAL_CHARS.toLocaleString("en")} characters
                        {replaced > 0 && <> · {replaced} converted to plain characters</>}
                        {removed > 0 && <> · {removed} unsupported removed</>}
                    </p>
                    {!check.ok && check.error === "too-long" && <p className="mm-error" role="alert">{MESSAGES["too-long"]}</p>}
                </div>

                {cleaned && (replaced > 0 || removed > 0) && (
                    <details className="mm-preview">
                        <summary>Preview what you will type</summary>
                        <p className="mm-preview-text">{cleaned.length > 800 ? `${cleaned.slice(0, 800)}...` : cleaned}</p>
                    </details>
                )}

                {error && <p className="mm-error" role="alert">{MESSAGES[error]}</p>}
                <div className="mm-actions">
                    <KeyButton type="submit" variant="primary" isDisabled={!canSave}><Save size={16} aria-hidden="true" />Save material</KeyButton>
                    <KeyButton variant="ghost" onPress={onCancel}>Cancel</KeyButton>
                </div>
            </form>
        </section>
    );
}
