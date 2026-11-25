import { useEffect, useState } from "react";
import SponsorCarousel from "@/components/ui/SponsorCarousel";
import { getSlotSponsors } from "@/lib/sponsorClient";
import type { Sponsor } from "@/lib/sponsors";
import { tr, type LearnLocale } from "@/lib/learnLocale";

/** Sponsor card on the results screen (after a test or race). Reads /sponsor.json; honours ?preview=<id>. */
export default function SponsorSpotlight({ locale = "en" }: { locale?: LearnLocale }) {
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    useEffect(() => { getSlotSponsors("results").then(setSponsors); }, []);
    if (sponsors.length === 0) return null;
    return (
        <div className="res-sponsor">
            <SponsorCarousel sponsors={sponsors} slot="results" label={tr(locale, "Sponsored", "Gesponsert")} />
        </div>
    );
}
