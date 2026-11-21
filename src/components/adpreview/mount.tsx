import { createRoot, type Root } from "react-dom/client";
import AdPreview from "./AdPreview";
import { $adPreview } from "@/store/adPreview";
import { readPreview, wantsPreview } from "@/lib/adPreview";

let root: Root | null = null;

/** Mounts the preview UI on the current page. Safe to call on every page load. */
export function mountAdPreview() {
    if (!$adPreview.get()) $adPreview.set(readPreview());
    const autoOpen = wantsPreview(location.search);
    if (!autoOpen && !$adPreview.get()) return;
    root?.unmount();
    const host = document.createElement("div");
    host.id = "adp-root";
    document.body.append(host);
    root = createRoot(host);
    root.render(<AdPreview autoOpen={autoOpen} />);
}

export function unmountAdPreview() {
    root?.unmount();
    root = null;
    document.getElementById("adp-root")?.remove();
}
