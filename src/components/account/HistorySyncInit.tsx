import { useEffect } from "react";
import { initHistorySync } from "@/store/historySync";

/** Mounted once per page. Only listens for new attempts (no network request until one is saved on a synced device). */
export default function HistorySyncInit() {
    useEffect(() => initHistorySync(), []);
    return null;
}
