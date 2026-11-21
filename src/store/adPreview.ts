import { atom } from "nanostores";
import type { AdPreviewData } from "@/lib/adPreview";

/** The advertiser preview currently shown in this tab, or null. Client only; never persisted outside sessionStorage. */
export const $adPreview = atom<AdPreviewData | null>(null);
