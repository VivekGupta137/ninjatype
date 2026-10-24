import { useStore } from "@nanostores/react";
import {
    $hackerSettingsOpen,
    $hackerColor,
    $hackerPanes,
    $hackerFinalMessageConfig,
    $hackerFinalMessageVisible,
    updateFinalMessageConfig,
    toggleHackerPane,
    restoreAllPanes,
    resetHackerState,
    type HackerColor,
    type HackerPaneId,
} from "@/store/hacker";
import TerminalDialog from "./TerminalDialog";
const LABELS: Record<HackerPaneId, string> = {
    editor: "Code editor",
    process: "System monitor",
    topology: "Network",
    memory: "Memory",
    disasm: "Debugger",
    injector: "Session activity",
    transfer: "File transfer",
};
export default function HackerSettings() {
    const open = useStore($hackerSettingsOpen);
    const color = useStore($hackerColor);
    const panes = useStore($hackerPanes);
    const config = useStore($hackerFinalMessageConfig);
    return (
        <TerminalDialog
            open={open}
            onClose={() => $hackerSettingsOpen.set(false)}
            title="Settings"
        >
            <section className="hacker-settings-section">
                <h3>Accent color</h3>
                <div className="hacker-option-row">
                    {(
                        ["green", "amber", "cyan", "amoled"] as HackerColor[]
                    ).map((option) => (
                        <button
                            key={option}
                            data-swatch={option}
                            aria-pressed={color === option}
                            onClick={() => $hackerColor.set(option)}
                        >
                            <span />
                            {option === "amoled" ? "Mono" : option}
                        </button>
                    ))}
                </div>
            </section>
            <section className="hacker-settings-section">
                <div className="hacker-settings-heading">
                    <h3>Workspace panels</h3>
                    <button onClick={restoreAllPanes}>Restore all</button>
                </div>
                <div className="hacker-pane-toggles">
                    {(Object.keys(LABELS) as HackerPaneId[]).map((id) => (
                        <label key={id}>
                            <input
                                type="checkbox"
                                checked={panes[id]}
                                onChange={() => toggleHackerPane(id)}
                            />
                            {LABELS[id]}
                        </label>
                    ))}
                </div>
            </section>
            <section className="hacker-settings-section">
                <h3>Session result</h3>
                <label className="hacker-checkbox">
                    <input
                        type="checkbox"
                        checked={config.enabled}
                        onChange={(e) =>
                            updateFinalMessageConfig({
                                enabled: e.target.checked,
                            })
                        }
                    />
                    Show completion dialog
                </label>
                <div className="hacker-option-row">
                    {(["success", "fail"] as const).map((type) => (
                        <button
                            key={type}
                            aria-pressed={config.type === type}
                            onClick={() =>
                                updateFinalMessageConfig({
                                    type,
                                    text:
                                        type === "success"
                                            ? "Access Granted"
                                            : "Access Denied",
                                })
                            }
                        >
                            {type === "success" ? "Granted" : "Denied"}
                        </button>
                    ))}
                    <button
                        onClick={() => {
                            $hackerSettingsOpen.set(false);
                            $hackerFinalMessageVisible.set(true);
                        }}
                    >
                        Preview
                    </button>
                </div>
                <label
                    className="hacker-input-label"
                    htmlFor="hacker-result-message"
                >
                    Message
                </label>
                <input
                    id="hacker-result-message"
                    className="hacker-settings-input"
                    value={config.text}
                    maxLength={120}
                    onChange={(e) =>
                        updateFinalMessageConfig({ text: e.target.value })
                    }
                />
            </section>
            <footer className="hacker-dialog-footer">
                <span>Changes apply to this workspace.</span>
                <button
                    onClick={() => {
                        resetHackerState();
                        $hackerSettingsOpen.set(false);
                    }}
                >
                    Reset session
                </button>
            </footer>
        </TerminalDialog>
    );
}
