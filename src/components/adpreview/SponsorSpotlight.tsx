import { useStore } from "@nanostores/react";
import { $adPreview } from "@/store/adPreview";
import type { AdPreviewData } from "@/lib/adPreview";
import { tr, type LearnLocale } from "@/lib/learnLocale";
import "@/styles/adpreview.css";

export function SponsorCard({ ad, locale = "en" }: { ad: AdPreviewData; locale?: LearnLocale }) {
    return (
        <aside className="adp-spot" aria-label={tr(locale, "Sponsored", "Gesponsert")}>
            <a className="adp-spot-link" href={ad.url} target="_blank" rel="sponsored noopener noreferrer">
                <img className="adp-spot-logo" src={ad.logo} alt="" />
                <span className="adp-spot-copy">
                    <strong>{ad.name}</strong>
                    <span>{ad.description}</span>
                </span>
                <span className="adp-spot-cta">{tr(locale, "Visit", "Besuchen")} ↗</span>
            </a>
            <em className="adp-spot-label">{tr(locale, "Sponsored", "Gesponsert")}</em>
        </aside>
    );
}

/** Results-screen sponsor section. Renders only while an advertiser preview with the Results spotlight is active. */
export default function SponsorSpotlight({ locale = "en" }: { locale?: LearnLocale }) {
    const ad = useStore($adPreview);
    if (!ad || ad.pkg !== "results") return null;
    return <SponsorCard ad={ad} locale={locale} />;
}
