import { Card } from "@heroui/react";
import { Check, CloudUpload, Dumbbell, Palette } from "lucide-react";
import { FREE_FOREVER } from "./proContent";
import "@/styles/ui.css";
import "@/styles/pro.css";

const FEATURES = [
    { icon: CloudUpload, name: "History sync", text: "Start on your laptop, continue on your phone. Results, streaks and key stats follow your account." },
    { icon: Dumbbell, name: "Adaptive training", text: "A daily routine built from your weakest keys, plus a weekly review that compares like-for-like tests." },
    { icon: Palette, name: "Custom themes", text: "Build your own colour theme, check its contrast, and import or export it as a file." },
];

/** Static (no hydration) feature cards and the free-forever list for /pro/. */
export default function ProFeatures() {
    return (
        <>
            <section aria-labelledby="pro-includes">
                <div className="pro-intro">
                    <h2 id="pro-includes">What you get</h2>
                    <p className="pro-lede">Three things that keep your practice in step across devices and point you at what to work on next.</p>
                </div>
                <div className="pro-cats">
                    {FEATURES.map(({ icon: Icon, name, text }) => (
                        <Card key={name} className="pro-cat">
                            <Icon size={22} aria-hidden="true" />
                            <div>
                                <div className="pro-cat-name">{name}</div>
                                <p>{text}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>
            <section aria-labelledby="pro-free">
                <Card className="pro-included">
                    <Card.Content>
                        <h2 id="pro-free">Free forever</h2>
                        <ul className="pro-checks pro-checks--cols">
                            {FREE_FOREVER.map(pt => <li key={pt}><Check size={16} aria-hidden="true" />{pt}</li>)}
                        </ul>
                    </Card.Content>
                </Card>
            </section>
        </>
    );
}
