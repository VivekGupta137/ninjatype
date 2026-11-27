import { useCallback, useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { buildRun, type CustomRun } from "@/lib/customMaterial";
import { $activeRun, $lowercase, $materials, deleteMaterial, loadMaterials, saveActiveRun, saveMaterial, type SaveError } from "@/store/customMaterial";
import { $customRun } from "@/store/customRun";
import { endCustomRun, startCustomRun } from "@/store/customPractice";
import MaterialEditor from "./MaterialEditor";
import MaterialLibrary from "./MaterialLibrary";
import MaterialPractice from "./MaterialPractice";
import "@/styles/my-material.css";

type View = { name: "library" } | { name: "edit"; id?: string } | { name: "practice"; id: string };

export default function MyMaterial() {
    const materials = useStore($materials);
    const run = useStore($customRun);
    const active = useStore($activeRun);
    const [view, setView] = useState<View>({ name: "library" });

    useEffect(() => {
        loadMaterials();
        const leave = () => endCustomRun();
        document.addEventListener("astro:before-swap", leave);
        return () => { document.removeEventListener("astro:before-swap", leave); leave(); };
    }, []);

    const goLibrary = useCallback(() => { endCustomRun(); setView({ name: "library" }); }, []);
    const begin = useCallback((id: string, next: CustomRun) => { saveActiveRun({ materialId: id, mode: next.mode, section: next.section }); startCustomRun(next); setView({ name: "practice", id }); }, []);

    if (!materials) return <div className="mm-page" aria-busy="true" />;
    const find = (id?: string) => materials.find(item => item.id === id);

    if (view.name === "practice") {
        const material = find(view.id);
        if (!material || !run) { queueMicrotask(goLibrary); return null; }
        return <MaterialPractice material={material} run={run} onRun={next => begin(material.id, next)} onBack={goLibrary} />;
    }

    return (
        <div className="mm-page">
            {view.name === "library" && (
                <MaterialLibrary materials={materials} active={active}
                    onContinue={() => { const m = find(active?.materialId); if (m && active) begin(m.id, buildRun(m, active.mode, active.section, $lowercase.get())); }}
                    onAdd={() => setView({ name: "edit" })}
                    onOpen={(id, from) => { const m = find(id); if (m) begin(id, buildRun(m, "sections", from === "resume" ? m.nextSection : 0, $lowercase.get())); }}
                    onEdit={id => setView({ name: "edit", id })}
                    onDelete={id => { deleteMaterial(id); }} />
            )}
            {view.name === "edit" && (
                <MaterialEditor key={view.id ?? "new"} material={find(view.id)}
                    onCancel={() => setView({ name: "library" })}
                    onSave={(draft): SaveError | null => {
                        const result = saveMaterial(draft);
                        if (!result.ok) return result.error;
                        setView({ name: "library" });
                        return null;
                    }} />
            )}
        </div>
    );
}
