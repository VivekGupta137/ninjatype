import { useEffect, useState } from "react";
import { Accordion } from "@heroui/react";
import { ChevronDown } from "lucide-react";

const STEPS = [
    ["Create or join a room", "Choose a nickname. Create a Words or Time race with your preferred dictionary, or enter an existing room’s exact name. Complete the security check to enter."],
    ["Invite friends and ready up", "Share your invitation link. At least two players need to be ready to start. Everyone races the same passage after a shared countdown."],
    ["Type, compare and race again", "Watch your WPM and accuracy as you type. Words races end on the first finish or two-minute limit; timed races end at the selected timer. Compare final scores and choose a rematch."],
];

/** Three-step guide; opens when the page is reached through #how-to-race. */
export default function HowToRace() {
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
                    <Accordion.Heading><Accordion.Trigger>How to play a typing race with friends<Accordion.Indicator><ChevronDown /></Accordion.Indicator></Accordion.Trigger></Accordion.Heading>
                    <Accordion.Panel><Accordion.Body>
                        <ol className="multiplayer-how-steps">{STEPS.map(([title, text], index) => <li key={title}><b>{String(index + 1).padStart(2, "0")} · {title}</b><p>{text}</p></li>)}</ol>
                    </Accordion.Body></Accordion.Panel>
                </Accordion.Item>
            </Accordion>
        </div>
    );
}
