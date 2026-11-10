import { Heart } from "lucide-react";
import "../../styles/sponsor-link.css";

export default function SponsorLink({ showIcon = true }: { showIcon?: boolean }) {
    return (
        <a
            href="https://github.com/sponsors/VivekGupta137"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Sponsor NinjaType on GitHub (opens in a new tab)"
        >
            {showIcon && <Heart className="sponsor-heart" size={16} aria-hidden="true" />}
            Sponsor
        </a>
    );
}
