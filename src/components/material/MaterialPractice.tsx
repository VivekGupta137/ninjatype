import { useEffect, useRef } from "react";
import { useStore } from "@nanostores/react";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RotateCcw } from "lucide-react";
import { ToggleButton, ToggleButtonGroup } from "@heroui/react";
import KeyButton from "@/components/ui/KeyButton";
import KeyboardContainer from "@/components/KeyboardContainer";
import SessionResults from "@/components/analytics/SessionResults";
import { KBTYPINGSTATE } from "@/constants/keyboardState";
import { buildRun, nextSectionIndex, type CustomRun, type Material, type RunMode } from "@/lib/customMaterial";
import { $completedSession } from "@/store/analytics";
import { $kbState, $kbTypingState } from "@/store/keyboard";
import { recordRun, setLowercase } from "@/store/customMaterial";

type Props = { material: Material; run: CustomRun; onRun: (run: CustomRun) => void; onBack: () => void };

const label = (run: CustomRun) =>
    run.totalSections <= 1 ? "Whole text"
        : run.mode === "whole" ? `Whole text from section ${run.section + 1} of ${run.totalSections}`
        : `Section ${run.section + 1} of ${run.totalSections}`;

export default function MaterialPractice({ material, run, onRun, onBack }: Props) {
    const typingState = useStore($kbTypingState);
    const kbState = useStore($kbState);
    const session = useStore($completedSession);
    const saved = useRef<string | null>(null);

    // Save the resume point and personal best once per completed run.
    useEffect(() => {
        if (typingState !== KBTYPINGSTATE.COMPLETED || !session) return;
        const key = session.id ?? String(session.timestamp);
        if (saved.current === key) return;
        saved.current = key;
        recordRun(run, { wpm: session.wpm, accuracy: session.accuracy });
    }, [typingState, session, run]);

    // Global styles hide the keyboard and reveal results from this body attribute.
    useEffect(() => {
        document.body.setAttribute("data-kb-state", String(kbState));
        document.body.setAttribute("data-kb-typing-state", String(typingState));
    }, [kbState, typingState]);
    useEffect(() => () => {
        document.body.removeAttribute("data-kb-state");
        document.body.removeAttribute("data-kb-typing-state");
    }, []);

    const completed = typingState === KBTYPINGSTATE.COMPLETED;
    const multi = run.totalSections > 1 && run.mode === "sections";
    const go = (delta: number) => onRun(buildRun(material, run.mode, run.section + delta, run.lowercase));
    const next = () => onRun(buildRun(material, "sections", nextSectionIndex(run), run.lowercase));

    return (
        <>
            <div id="main-container" className="mm-practice">
                <div className="mm-practice-head">
                    <KeyButton variant="ghost" size="sm" onPress={onBack}><ArrowLeft size={14} aria-hidden="true" />My material</KeyButton>
                    <p className="mm-practice-title"><strong>{run.title}</strong> <span>{label(run)}</span></p>
                    <KeyButton variant="ghost" size="sm" onPress={() => onRun(run)}><RotateCcw size={14} aria-hidden="true" />Restart</KeyButton>
                </div>
                <div className="mm-toolbar" role="toolbar" aria-label="Material settings">
                    {run.totalSections > 1 && (<>
                        <ToggleButtonGroup className="key-group" selectionMode="single" disallowEmptySelection aria-label="How much to type"
                            selectedKeys={new Set([run.mode])}
                            onSelectionChange={keys => { const key = [...keys][0]; if (key && key !== run.mode) onRun(buildRun(material, key as RunMode, run.section, run.lowercase)); }}>
                            <ToggleButton id="sections" className="key-btn key-btn--ghost">Section</ToggleButton>
                            <ToggleButton id="whole" className="key-btn key-btn--ghost" aria-label="Whole text, from the current section to the end">Whole text</ToggleButton>
                        </ToggleButtonGroup>
                        <span className="config-sep" aria-hidden="true" />
                        <div className="mm-stepper">
                            <KeyButton variant="ghost" size="sm" isIconOnly aria-label="Back 5 sections" isDisabled={run.section === 0} onPress={() => go(-5)}><ChevronsLeft size={16} aria-hidden="true" /></KeyButton>
                            <KeyButton variant="ghost" size="sm" isIconOnly aria-label="Previous section" isDisabled={run.section === 0} onPress={() => go(-1)}><ChevronLeft size={16} aria-hidden="true" /></KeyButton>
                            <span className="mm-stepper-value" aria-live="polite">{run.section + 1}<small> / {run.totalSections}</small></span>
                            <KeyButton variant="ghost" size="sm" isIconOnly aria-label="Next section" isDisabled={run.section >= run.totalSections - 1} onPress={() => go(1)}><ChevronRight size={16} aria-hidden="true" /></KeyButton>
                            <KeyButton variant="ghost" size="sm" isIconOnly aria-label="Forward 5 sections" isDisabled={run.section >= run.totalSections - 1} onPress={() => go(5)}><ChevronsRight size={16} aria-hidden="true" /></KeyButton>
                        </div>
                        <span className="config-sep" aria-hidden="true" />
                    </>)}
                    <KeyButton variant="ghost" size="sm" isActive={run.lowercase} aria-label="Lowercase only"
                        onPress={() => { setLowercase(!run.lowercase); onRun(buildRun(material, run.mode, run.section, !run.lowercase)); }}>
                        aa<span className="mm-toggle-label">Lowercase</span>
                    </KeyButton>
                </div>
                <KeyboardContainer />
            </div>
            <div id="analytics-container">
                {completed && (
                    <div className="mm-next">
                        <p><strong>{label(run)}</strong> complete.</p>
                        <div className="mm-actions">
                            {multi && <KeyButton variant="primary" onPress={next}>Next section<ArrowRight size={16} aria-hidden="true" /></KeyButton>}
                            <KeyButton variant={multi ? "secondary" : "primary"} onPress={() => onRun(run)}><RotateCcw size={16} aria-hidden="true" />Practise this again</KeyButton>
                            <KeyButton variant="ghost" onPress={onBack}>Back to my material</KeyButton>
                        </div>
                    </div>
                )}
                <SessionResults />
            </div>
        </>
    );
}
