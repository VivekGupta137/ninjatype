import { useState } from "react";
import { Play } from "lucide-react";
import "@/styles/ui.css";

interface Props { id: string; title: string; }

/** Click-to-load YouTube embed: shows the thumbnail first, then loads the privacy-enhanced player. */
export default function YouTubeEmbed({ id, title }: Props) {
    const [playing, setPlaying] = useState(false);
    return (
        <div className="yt-embed">
            {playing ? (
                <iframe
                    src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                />
            ) : (
                <button type="button" className="yt-embed-poster" onClick={() => setPlaying(true)} aria-label={`Play video: ${title}`}>
                    <img src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`} alt="" loading="lazy" onError={event => { const img = event.currentTarget; if (!img.dataset.fallback) { img.dataset.fallback = "1"; img.src = `https://i.ytimg.com/vi/${id}/mqdefault.jpg`; } }} />
                    <span className="yt-embed-play"><Play size={26} aria-hidden="true" fill="currentColor" /></span>
                    <span className="yt-embed-title">{title}</span>
                </button>
            )}
        </div>
    );
}
