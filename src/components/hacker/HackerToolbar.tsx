import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { $hackerToolbarVisible, $hackerSettingsOpen } from "@/store/hacker";

function formatTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function HackerToolbar() {
  const toolbarVisible = useStore($hackerToolbarVisible);
  const [time, setTime] = useState(() => formatTime(new Date()));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(formatTime(new Date()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !$hackerToolbarVisible.get()) {
        $hackerToolbarVisible.set(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!toolbarVisible) return null;

  return (
    <div className="hacker-toolbar">
      <span className="hacker-toolbar-item">[ root@ninja ]</span>
      <span className="hacker-toolbar-sep" />
      <span className="hacker-toolbar-item" suppressHydrationWarning>[ {time} ]</span>
      <a href="/" className="hacker-toolbar-btn">
        [ home ]
      </a>
      <a href="/hacker-typer/blog/" className="hacker-toolbar-btn">
        [ blog ]
      </a>
      <button
        className="hacker-toolbar-btn"
        onClick={() => $hackerSettingsOpen.set(true)}
      >
        [ panes ]
      </button>
      <button
        className="hacker-toolbar-btn"
        onClick={() => $hackerSettingsOpen.set(true)}
      >
        [ settings ]
      </button>
      <button
        className="hacker-toolbar-btn"
        onClick={() => $hackerToolbarVisible.set(false)}
      >
        [ x ]
      </button>
    </div>
  );
}
