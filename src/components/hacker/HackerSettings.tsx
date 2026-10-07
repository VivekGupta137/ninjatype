import { useEffect } from "react";
import { useStore } from "@nanostores/react";
import {
  $hackerSettingsOpen,
  $hackerColor,
  type HackerColor,
  resetHackerState,
} from "@/store/hacker";

const COLOR_OPTIONS: HackerColor[] = ["green", "amber", "cyan"];

export default function HackerSettings() {
  const settingsOpen = useStore($hackerSettingsOpen);
  const currentColor = useStore($hackerColor);

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
          ┌─── SETTINGS ──────────────────────────────────┐
        </div>

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
          └────────────────────── [ ESC to close ] ────────┘
        </div>
      </div>
    </div>
  );
}
