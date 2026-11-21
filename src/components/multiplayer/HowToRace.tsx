import { useEffect, useState } from "react";
import { Accordion } from "@heroui/react";
import { ChevronDown } from "lucide-react";
import { tr, type LearnLocale } from "@/lib/learnLocale";

const STEPS = [
    ["Create or join a room", "Raum erstellen oder beitreten", "Choose a nickname. Create a Words or Time race with your preferred dictionary, or enter an existing room’s exact name. Complete the security check to enter.", "Wähle einen Spitznamen. Erstelle ein Wörter- oder Zeitrennen mit deinem Wörterbuch oder gib den exakten Namen eines bestehenden Raums ein. Absolviere die Sicherheitsprüfung zum Betreten."],
    ["Invite friends and ready up", "Freunde einladen und bereit machen", "Share your invitation link. At least two players need to be ready to start. Everyone races the same passage after a shared countdown.", "Teile deinen Einladungslink. Zum Start müssen mindestens zwei Spieler bereit sein. Alle tippen nach einem gemeinsamen Countdown denselben Text."],
    ["Type, compare and race again", "Tippen, vergleichen, Revanche", "Watch your WPM and accuracy as you type. Words races end on the first finish or two-minute limit; timed races end at the selected timer. Compare final scores and choose a rematch.", "Beobachte WPM und Genauigkeit beim Tippen. Wörter-Rennen enden mit dem ersten Zieleinlauf oder dem Zwei-Minuten-Limit; Zeitrennen enden mit dem Timer. Vergleiche die Punkte und wähle eine Revanche."],
] as const;

/** Three-step guide; opens when the page is reached through #how-to-race. */
export default function HowToRace({ locale = "en" }: { locale?: LearnLocale }) {
    const [open, setOpen] = useState<Set<string | number>>(new Set());
    useEffect(() => {
        const reveal = () => { if (window.location.hash === "#how-to-race") setOpen(new Set(["how"])); };
        reveal();
        window.addEventListener("hashchange", reveal);
        return () => window.removeEventListener("hashchange", reveal);
    }, []);
    return (
        <div id="how-to-race">
            <Accordion variant="surface" expandedKeys={open} onExpandedChange={keys => setOpen(new Set(keys))}>
                <Accordion.Item id="how">
                    <Accordion.Heading><Accordion.Trigger>{tr(locale, "How to play a typing race with friends", "So spielst du ein Tipp-Rennen mit Freunden")}<Accordion.Indicator><ChevronDown /></Accordion.Indicator></Accordion.Trigger></Accordion.Heading>
                    <Accordion.Panel><Accordion.Body>
                        <ol className="multiplayer-how-steps">{STEPS.map(([titleEn, titleDe, textEn, textDe], index) => <li key={titleEn}><b>{String(index + 1).padStart(2, "0")} · {tr(locale, titleEn, titleDe)}</b><p>{tr(locale, textEn, textDe)}</p></li>)}</ol>
                    </Accordion.Body></Accordion.Panel>
                </Accordion.Item>
            </Accordion>
        </div>
    );
}
