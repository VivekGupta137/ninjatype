import { useEffect } from "react";
import { useStore } from "@nanostores/react";
import {
  $hackerSettingsOpen,
  $hackerColor,
  $hackerPanes,
  $hackerFinalMessageConfig,
  $hackerFinalMessageVisible,
  updateFinalMessageConfig,
  type HackerColor,
  type HackerPaneId,
  toggleHackerPane,
  restoreAllPanes,
  resetHackerSplits,
  resetHackerState,
} from "@/store/hacker";

const COLOR_OPTIONS: HackerColor[] = ["green", "amber", "cyan", "amoled"];

const PANE_LABELS: { id: HackerPaneId; label: string }[] = [
  { id: "editor", label: "editor" },
  { id: "process", label: "top process" },
  { id: "topology", label: "net topology" },
  { id: "memory", label: "hex memory" },
  { id: "disasm", label: "disasm / gdb" },
  { id: "injector", label: "injector" },
  { id: "transfer", label: "file transfer" },
];

export default function HackerSettings() {
  const settingsOpen = useStore($hackerSettingsOpen);
  const currentColor = useStore($hackerColor);
  const panes = useStore($hackerPanes);
  const finalConfig = useStore($hackerFinalMessageConfig);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && $hackerSettingsOpen.get()) {
        $hackerSettingsOpen.set(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!settingsOpen) return null;

  return (
    <div
      className="hacker-settings-overlay"
      onClick={() => $hackerSettingsOpen.set(false)}
    >
      <div
        className="hacker-settings-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hacker-terminal-text">
          ┌─── SETTINGS ────────────────────────────────────────┐
        </div>

        {/* Color Scheme */}
        <div className="hacker-settings-section">
          <div className="hacker-terminal-text">│ Color Scheme:</div>
          <div className="hacker-color-options">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color}
                className="hacker-color-option"
                data-active={currentColor === color || undefined}
                onClick={() => $hackerColor.set(color)}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        {/* Pane Visibility Configuration */}
        <div className="hacker-settings-section">
          <div className="hacker-terminal-text">│ Configure Panes (Show / Hide):</div>
          <div className="hacker-pane-toggles">
            {PANE_LABELS.map(({ id, label }) => {
              const isVisible = panes[id];
              return (
                <button
                  key={id}
                  className="hacker-pane-toggle-btn"
                  data-active={isVisible || undefined}
                  onClick={() => toggleHackerPane(id)}
                >
                  <span className="hacker-pane-toggle-check">
                    {isVisible ? "[✓]" : "[ ]"}
                  </span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              className="hacker-color-option"
              onClick={() => restoreAllPanes()}
              style={{ fontSize: 11, padding: "2px 8px" }}
              title="Restore all hidden panes and reset splits"
            >
              Restore All Panes
            </button>
            <button
              className="hacker-color-option"
              onClick={() => resetHackerSplits()}
              style={{ fontSize: 11, padding: "2px 8px" }}
              title="Reset all split borders back to default (50/50)"
            >
              Reset Borders (50/50)
            </button>
          </div>
        </div>

        {/* Final Message (Post-Payload) Configuration */}
        <div className="hacker-settings-section">
          <div className="hacker-terminal-text">│ Final Message (Post-Payload):</div>
          <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center", flexWrap: "wrap" }}>
            <button
              className="hacker-color-option"
              data-active={finalConfig.enabled || undefined}
              onClick={() => {
                const nextEnabled = !finalConfig.enabled;
                updateFinalMessageConfig({
                  enabled: nextEnabled,
                  text: finalConfig.type === "fail" ? "Access Denied" : "Access Granted",
                });
              }}
              title="Toggle enable/disable and reset message to default"
            >
              {finalConfig.enabled ? "[✓] Enabled" : "[ ] Disabled"}
            </button>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                className="hacker-color-option"
                data-active={finalConfig.type === "success" || undefined}
                onClick={() =>
                  updateFinalMessageConfig({
                    type: "success",
                    text: "Access Granted",
                  })
                }
                title="Switch to success (resets message to Access Granted)"
              >
                success
              </button>
              <button
                className="hacker-color-option"
                data-active={finalConfig.type === "fail" || undefined}
                onClick={() =>
                  updateFinalMessageConfig({
                    type: "fail",
                    text: "Access Denied",
                  })
                }
                style={{
                  color: finalConfig.type === "fail" ? "#ff4444" : undefined,
                  borderColor: finalConfig.type === "fail" ? "#ff4444" : undefined,
                }}
                title="Switch to fail (resets message to Access Denied)"
              >
                fail
              </button>
            </div>
            <button
              className="hacker-color-option"
              onClick={() => $hackerFinalMessageVisible.set(true)}
              style={{ fontSize: 11, padding: "3px 8px" }}
              title="Preview the final message popup"
            >
              [ Preview ]
            </button>
          </div>
          <div style={{ marginTop: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
              <label
                className="hacker-terminal-text"
                style={{ fontSize: 11, opacity: 0.7 }}
              >
                Optional Message Content:
              </label>
              <button
                type="button"
                className="hacker-toolbar-btn"
                style={{ fontSize: 10, padding: "0 4px", opacity: 0.7 }}
                onClick={() => {
                  const defaultMsg = finalConfig.type === "fail" ? "Access Denied" : "Access Granted";
                  updateFinalMessageConfig({ text: defaultMsg });
                }}
                title="Reset to default message"
              >
                [ Reset to Default ]
              </button>
            </div>
            <input
              type="text"
              className="hacker-settings-input"
              value={finalConfig.text}
              placeholder={finalConfig.type === "fail" ? "Access Denied" : "Access Granted"}
              onChange={(e) => updateFinalMessageConfig({ text: e.target.value })}
              aria-label="Final message content"
            />
          </div>
        </div>

        {/* Session Reset */}
        <div className="hacker-settings-section">
          <div className="hacker-terminal-text">│ Session:</div>
          <button
            className="hacker-color-option"
            onClick={() => {
              resetHackerState();
              $hackerSettingsOpen.set(false);
            }}
          >
            Reset Session
          </button>
        </div>

        <div className="hacker-terminal-text">
          └────────────────────────── [ ESC to close ] ─────────┘
        </div>
      </div>
    </div>
  );
}
