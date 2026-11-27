import { useState } from "react";
import { Chip } from "@heroui/react";
import { FileText, Pencil, Play, Plus, Trash2 } from "lucide-react";
import KeyButton from "@/components/ui/KeyButton";
import { MAX_MATERIALS, MAX_MATERIAL_CHARS, buildRun, countWords, splitSections, type ActiveRun, type Material } from "@/lib/customMaterial";

const dateFormat = new Intl.DateTimeFormat("en", { day: "numeric", month: "short" });

type Props = {
    materials: Material[];
    active: ActiveRun | null;
    onContinue: () => void;
    onAdd: () => void;
    onOpen: (id: string, from: "resume" | "start") => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
};

export default function MaterialLibrary({ materials, active, onContinue, onAdd, onOpen, onEdit, onDelete }: Props) {
    const [confirming, setConfirming] = useState<string | null>(null);
    const full = materials.length >= MAX_MATERIALS;
    const last = active ? materials.find(item => item.id === active.materialId) : undefined;
    const lastRun = last && active ? buildRun(last, active.mode, active.section) : null;
    return (
        <section className="mm-view" aria-labelledby="mm-heading">
            <header className="mm-head">
                <div>
                    <h1 id="mm-heading" className="mm-title">My material</h1>
                    <p className="mm-sub">Practise typing your own text, such as clinical notes or legal clauses. It stays in this browser only and is never uploaded.</p>
                </div>
                <div className="mm-add">
                    <KeyButton variant="primary" onPress={onAdd} isDisabled={full}>
                        <Plus size={16} aria-hidden="true" />Add material
                    </KeyButton>
                    <p className="mm-disclaimer">Stored in this browser only. Never uploaded.</p>
                </div>
            </header>
            {last && lastRun && (
                <div className="mm-continue">
                    <p>
                        <strong>{last.title}</strong>
                        <span>{lastRun.totalSections > 1 ? (lastRun.mode === "whole" ? `Whole text from section ${lastRun.section + 1} of ${lastRun.totalSections}` : `Section ${lastRun.section + 1} of ${lastRun.totalSections}`) : "Whole text"}</span>
                    </p>
                    <KeyButton variant="primary" onPress={onContinue}><Play size={16} aria-hidden="true" />Continue practice</KeyButton>
                </div>
            )}
            {full && <p className="mm-note" role="status">You have reached the limit of {MAX_MATERIALS} items. Delete one to add another.</p>}

            {materials.length === 0 ? (
                <div className="mm-empty">
                    <FileText size={28} aria-hidden="true" />
                    <p><strong>No material yet</strong></p>
                    <p>Paste a passage you want to get faster at typing. Up to {MAX_MATERIAL_CHARS.toLocaleString("en")} characters each.</p>
                    <KeyButton variant="primary" onPress={onAdd}><Plus size={16} aria-hidden="true" />Add your first material</KeyButton>
                </div>
            ) : (
                <ul className="mm-list" aria-label="Your material">
                    {materials.map(item => {
                        const sections = splitSections(item.text).length;
                        return (
                            <li key={item.id} className="mm-item">
                                <div className="mm-item-main">
                                    <span className="mm-item-title">{item.title}</span>
                                    <span className="mm-item-meta">
                                        <Chip size="sm" variant="soft"><Chip.Label>{countWords(item.text).toLocaleString("en")} words</Chip.Label></Chip>
                                        {sections > 1 && (
                                            <Chip size="sm" variant="soft"><Chip.Label>{item.nextSection > 0 ? `Section ${item.nextSection + 1} of ${sections}` : `${sections} sections`}</Chip.Label></Chip>
                                        )}
                                        {item.bestWpm && <Chip size="sm" variant="soft" color="success"><Chip.Label>Best {item.bestWpm} WPM</Chip.Label></Chip>}
                                        <span>{item.lastPracticedAt ? `Practised ${dateFormat.format(item.lastPracticedAt)}` : `Added ${dateFormat.format(item.createdAt)}`}</span>
                                    </span>
                                </div>
                                <div className="mm-item-actions">
                                    {item.nextSection > 0 && sections > 1 ? (
                                        <>
                                            <KeyButton variant="primary" size="sm" onPress={() => onOpen(item.id, "resume")} aria-label={`Resume ${item.title} at section ${item.nextSection + 1}`}>
                                                <Play size={14} aria-hidden="true" />Resume section {item.nextSection + 1}
                                            </KeyButton>
                                            <KeyButton variant="secondary" size="sm" onPress={() => onOpen(item.id, "start")} aria-label={`Start ${item.title} from the beginning`}>
                                                Start over
                                            </KeyButton>
                                        </>
                                    ) : (
                                        <KeyButton variant="primary" size="sm" onPress={() => onOpen(item.id, "start")} aria-label={`Start practice: ${item.title}`}>
                                            <Play size={14} aria-hidden="true" />Start practice
                                        </KeyButton>
                                    )}
                                    {confirming === item.id ? (
                                        <>
                                            <KeyButton variant="danger" size="sm" onPress={() => { setConfirming(null); onDelete(item.id); }}>Delete "{item.title.slice(0, 24)}"</KeyButton>
                                            <KeyButton variant="ghost" size="sm" onPress={() => setConfirming(null)}>Cancel</KeyButton>
                                        </>
                                    ) : (
                                        <>
                                            <KeyButton variant="ghost" size="sm" isIconOnly aria-label={`Edit ${item.title}`} onPress={() => onEdit(item.id)}><Pencil size={15} aria-hidden="true" /></KeyButton>
                                            <KeyButton variant="ghost" size="sm" isIconOnly aria-label={`Delete ${item.title}`} onPress={() => setConfirming(item.id)}><Trash2 size={15} aria-hidden="true" /></KeyButton>
                                        </>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
