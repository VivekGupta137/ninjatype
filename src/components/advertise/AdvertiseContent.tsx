import { useEffect, useMemo, useState } from "react";
import { Accordion, Button, Card, Chip, Modal, ToggleButton, ToggleButtonGroup, useOverlayState } from "@heroui/react";
import { Bot, Check, ChevronDown, Copy, FileText, Globe, Image as ImageIcon, GraduationCap, Info, Keyboard, Link as LinkIcon, Mail, Megaphone, Mouse, NotebookPen } from "lucide-react";
import CloudflareLogo from "~icons/logos/cloudflare-icon";
import GmailLogo from "~icons/logos/google-gmail";
import OutlookLogo from "~icons/vscode-icons/file-type-outlook";
import MailIcon from "~icons/lucide/mail";
import KeyButton from "@/components/ui/KeyButton";

/* Payment / slot-booking link. Leave empty until it is ready; step 1 then
 * falls back to "email your preferred start date". */
const PAYMENT_URL = "";
const CONTACT_EMAIL = "vivekgupta@ninjatype.com";

type TermId = "month" | "quarter" | "year";
const TERMS: { id: TermId; label: string; days: number; unit: string }[] = [
    { id: "month", label: "Monthly", days: 30, unit: "month" },
    { id: "quarter", label: "Quarterly", days: 90, unit: "quarter" },
    { id: "year", label: "Yearly", days: 360, unit: "year" },
];

const PACKS = [
    {
        id: "results", name: "Results spotlight", tag: "After every session",
        prices: { month: 150, quarter: 300, year: 720 },
        blurb: "A large sponsor section on the results screen, shown whenever someone finishes a typing practice or Ghost Race.",
        points: ["Large, high-attention placement", "Typing practice and Ghost Race", "Shown after every completed session", "Never interrupts typing"],
    },
    {
        id: "brand", name: "Always-on brand", tag: "Most visible", featured: true,
        prices: { month: 250, quarter: 500, year: 1200 },
        blurb: "Your logo sits next to the NinjaType logo and in the footer, visible on every page.",
        points: ["ninjatype × your logo in the header", "Logo in the site-wide footer", "On every page, all the time", "Click-through link with UTM tags"],
    },
] as const;

const ASSETS = [
    { label: "Logo (PNG, transparent)", Icon: ImageIcon },
    { label: "Official website URL", Icon: Globe },
    { label: "Short description", Icon: FileText },
    { label: "Dedicated landing-page URL", Icon: LinkIcon },
    { label: "Product image", Icon: ImageIcon },
];

/** Discount vs. paying monthly, from the first package's prices. */
const termDiscount = (id: TermId) => {
    const t = TERMS.find(x => x.id === id)!;
    const p = PACKS[0].prices;
    return Math.round((1 - p[id] / (p.month * (t.days / 30))) * 100);
};

const CATEGORIES = [
    { label: "Keyboards", text: "Mechanical, ergonomic and typing keyboards", Icon: Keyboard },
    { label: "Ergonomic gear", text: "Mice, wrist rests, chairs, desks and stands", Icon: Mouse },
    { label: "Productivity & note-taking", text: "Apps and tools for focus, planning and notes", Icon: NotebookPen },
    { label: "Developer & AI tools", text: "Editors, APIs, coding and AI assistants", Icon: Bot },
    { label: "Exam & job prep", text: "Courses, test prep and career platforms", Icon: GraduationCap },
];


const BLOG_POINTS = [
    "We use your live product or a working sample you provide",
    "Written for typing, productivity and developer readers",
    "Clearly labelled as sponsored, with a link to your site",
    "Permanent post, searchable and shareable",
];

const PROCESSING_NOTE = "Please allow up to 3 days of processing time before your ad appears on the site.";

const FAQS: [string, string][] = [
    ["How long until my ad goes live?", `${PROCESSING_NOTE} The booking period starts on the day it goes live.`],
    ["Will ads interrupt typing?", "No. There are no popups, banners or video. The results spotlight appears only after a session is finished, and the logo spots are static."],
    ["How long is each booking?", "Monthly is 30 days, quarterly is 90 days (3 × 30) and yearly is 360 days (12 × 30), starting the day your creative goes live."],
    ["Can I buy both sponsorships?", "Yes. They are independent, so you can book one or both."],
    ["What do I need to send?", "A logo (PNG with transparent background), your official URL, a short description, a dedicated landing-page URL and a product image."],
    ["How does the blog review work?", "You give us a live product or a working sample. We use it, then publish an honest, clearly labelled review. You can request factual corrections but not approve the opinion."],
    ["Who can advertise?", "Keyboards, ergonomic gear, productivity and note-taking tools, developer and AI tools, and exam and job prep platforms. We may decline anything outside these categories or misleading."],
    ["Where do the stats come from?", "Visitors and page views are the last 30 days of first-party analytics from Cloudflare, refreshed regularly."],
];

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(2).replace(/\.?0+$/, "")}k` : String(n));

/* Deterministic chart: steady traffic with gradual growth. */
function trend(seed: number) {
    const W = 400, H = 90, N = 30;
    let s = seed;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const pts = Array.from({ length: N }, (_, i) => {
        const t = i / (N - 1);
        const v = 0.3 + 0.38 * t + Math.sin(i * 0.9) * 0.04 + (rnd() - 0.5) * 0.07;
        return [t * W, H - Math.max(0.15, Math.min(0.9, v)) * H] as const;
    });
    const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
    return { W, H, line, area: `${line} L${W} ${H} L0 ${H} Z` };
}

function StatCard({ label, value, seed }: { label: string; value: number; seed: number }) {
    const c = useMemo(() => trend(seed), [seed]);
    return (
        <Card className="adv-stat" role="img" aria-label={`${label}: ${value.toLocaleString("en-US")} in the last 30 days`}>
            <div className="adv-stat-text">
                <div className="adv-stat-label">{label}</div>
                <div className="adv-stat-value">{fmt(value)}</div>
                <div className="adv-stat-source">
                    <CloudflareLogo width={20} height={20} aria-hidden="true" />
                    <span>Data from Cloudflare Analytics · last 30 days</span>
                </div>
            </div>
            <svg className="adv-chart" viewBox={`0 0 ${c.W} ${c.H}`} preserveAspectRatio="none" aria-hidden="true">
                <path className="adv-chart-area" d={c.area} />
                <path className="adv-chart-line" d={c.line} pathLength={1} />
            </svg>
        </Card>
    );
}

function Mock({ id }: { id: string }) {
    return (
        <div className="adv-mock" aria-hidden="true">
            {id === "results" ? (
                <div className="mock-screen">
                    <div className="mock-result"><b>87</b><span>wpm</span><b>98%</b><span>acc</span></div>
                    <div className="mock-sponsor"><span className="mock-logo">your logo</span><span className="mock-copy"><i /><i /></span><em>Sponsored</em></div>
                </div>
            ) : (
                <div className="mock-screen">
                    <div className="mock-header"><b>ninjatype</b><span>×</span><span className="mock-logo">your logo</span></div>
                    <div className="mock-body" />
                    <div className="mock-footer"><span>© NinjaType</span><span className="mock-logo">your logo</span></div>
                </div>
            )}
        </div>
    );
}

interface Booking { name: string; term: string; price: number }

export default function AdvertiseContent({ stats }: { stats: { last30daysVisitors: number; last30daysPageViews: number } }) {
    const [data, setData] = useState(stats);
    const [term, setTerm] = useState<TermId>("month");
    const [booking, setBooking] = useState<Booking | null>(null);
    const [copied, setCopied] = useState(false);
    const modal = useOverlayState();

    useEffect(() => {
        fetch("/info/stats.json").then(r => (r.ok ? r.json() : null)).then(d => {
            if (d && typeof d.last30daysVisitors === "number" && typeof d.last30daysPageViews === "number") setData(d);
        }).catch(() => {});
    }, []);

    const openBooking = (b: Booking) => { setBooking(b); modal.open(); };

    const summary = booking ? `${booking.name} · ${booking.term} · $${booking.price} USD` : "";
    const subject = `NinjaType booking — ${summary}`;
    const body = `Hi,\n\nI'd like to book: ${summary}\nPreferred start date: \n\nAssets attached / below:\n- Logo (PNG):\n- Official URL:\n- Description:\n- Dedicated URL:\n- Product image:\n`;
    const q = (o: Record<string, string>) => Object.entries(o).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
    const openGmail = () => window.open(`https://mail.google.com/mail/?${q({ view: "cm", fs: "1", to: CONTACT_EMAIL, su: subject, body })}`, "_blank", "noopener");
    const openOutlook = () => window.open(`https://outlook.office.com/mail/deeplink/compose?${q({ to: CONTACT_EMAIL, subject, body })}`, "_blank", "noopener");
    const openMailApp = () => { window.location.href = `mailto:${CONTACT_EMAIL}?${q({ subject, body })}`; };
    const copyEmail = async () => {
        try { await navigator.clipboard.writeText(CONTACT_EMAIL); } catch { /* clipboard unavailable */ }
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };

    return (
        <>
            <section>
                <Chip size="sm" variant="soft">For publishers &amp; marketing teams</Chip>
                <h1>Advertise on NinjaType</h1>
                <p className="adv-lede">Reach people who practise typing every day, with no popups, banners or anything that gets between them and the keyboard.</p>
            </section>

            <section aria-label="Audience stats" className="adv-stats">
                <StatCard label="Total visits" value={data.last30daysVisitors} seed={11} />
                <StatCard label="Page views" value={data.last30daysPageViews} seed={29} />
            </section>

            <section aria-labelledby="packs-title">
                <div className="adv-section-head">
                    <h2 id="packs-title">Sponsorship</h2>
                    <ToggleButtonGroup
                        className="adv-terms"
                        aria-label="Booking length"
                        selectionMode="single"
                        disallowEmptySelection
                        selectedKeys={new Set([term])}
                        onSelectionChange={keys => { const v = Array.from(keys)[0] as TermId | undefined; if (v) setTerm(v); }}
                    >
                        {TERMS.map(t => {
                            const off = termDiscount(t.id);
                            return (
                                <ToggleButton key={t.id} id={t.id} className="key-btn">
                                    {t.label}
                                    <Chip size="sm" className="adv-term-chip">{off > 0 ? `Save ${off}%` : "Base price"}</Chip>
                                </ToggleButton>
                            );
                        })}
                    </ToggleButtonGroup>
                </div>
                <div className="adv-grid">
                    {PACKS.map(p => {
                        const t = TERMS.find(x => x.id === term)!;
                        const price = p.prices[term];
                        const original = p.prices.month * (t.days / 30);
                        const saving = Math.round((1 - price / original) * 100);
                        return (
                            <Card key={p.id} className="adv-pack" data-featured={"featured" in p}>
                                <Mock id={p.id} />
                                <Card.Header>
                                    <div className="flex items-center justify-between gap-3 flex-wrap">
                                        <Card.Title>{p.name}</Card.Title>
                                        <Chip size="sm" variant={"featured" in p ? "primary" : "soft"} color="accent">{p.tag}</Chip>
                                    </div>
                                    <Card.Description>{p.blurb}</Card.Description>
                                </Card.Header>
                                <Card.Content>
                                    <ul className="adv-checks">{p.points.map(pt => <li key={pt}><Check size={16} aria-hidden="true" />{pt}</li>)}</ul>
                                </Card.Content>
                                <Card.Footer>
                                    <div className="adv-buy">
                                        <div>
                                            <p className="adv-price">
                                                ${price}
                                                {saving > 0 && <s className="adv-price-old" aria-label={`Original price $${original}`}>${original}</s>}
                                                <small> USD</small>
                                            </p>
                                            <p className="adv-meta">
                                                <span>{t.days} days</span>
                                                {saving > 0 && <Chip size="sm" color="success" variant="soft">{saving}% off</Chip>}
                                            </p>
                                        </div>
                                        <KeyButton variant="primary" onPress={() => openBooking({ name: p.name, term: t.label, price })}>Book now</KeyButton>
                                    </div>
                                </Card.Footer>
                            </Card>
                        );
                    })}
                </div>
                <p className="adv-disclaimer"><Info size={14} aria-hidden="true" />{PROCESSING_NOTE}</p>
            </section>

            <section aria-labelledby="blog-title">
                <Card>
                    <Card.Content>
                        <div className="adv-blog-row">
                            <div className="adv-blog-main">
                                <Chip size="sm" variant="soft" className="self-start">One-time · Standalone or add-on</Chip>
                                <h2 id="blog-title">Sponsored blog review</h2>
                                <p className="adv-lede">An honest, hands-on review of your product, published on the NinjaType blog. Buy it on its own or add it to any package.</p>
                                <ul className="adv-checks">{BLOG_POINTS.map(pt => <li key={pt}><Check size={16} aria-hidden="true" />{pt}</li>)}</ul>
                            </div>
                            <div className="adv-blog-buy">
                                <p className="adv-price">$69<small> USD</small></p>
                                <p className="adv-meta mb-2">One time · no subscription</p>
                                <KeyButton variant="primary" onPress={() => openBooking({ name: "Sponsored blog review", term: "One time", price: 69 })}>Book now</KeyButton>
                            </div>
                        </div>
                    </Card.Content>
                </Card>
            </section>

            <section aria-labelledby="cats-title">
                <div className="adv-section-head"><h2 id="cats-title">Who can advertise</h2></div>
                <p className="adv-lede mb-4">We keep ads relevant to our users. Ads must relate to one of these categories:</p>
                <div className="adv-cats">
                    {CATEGORIES.map(({ label, text, Icon }) => (
                        <Card key={label} className="adv-cat">
                            <Icon size={20} aria-hidden="true" />
                            <div>
                                <div className="adv-cat-name">{label}</div>
                                <p>{text}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            <section aria-labelledby="faq-title">
                <div className="adv-section-head"><h2 id="faq-title">FAQ</h2></div>
                <Accordion variant="surface">
                    {FAQS.map(([question, answer]) => (
                        <Accordion.Item key={question}>
                            <Accordion.Heading>
                                <Accordion.Trigger>
                                    {question}
                                    <Accordion.Indicator><ChevronDown /></Accordion.Indicator>
                                </Accordion.Trigger>
                            </Accordion.Heading>
                            <Accordion.Panel><Accordion.Body>{answer}</Accordion.Body></Accordion.Panel>
                        </Accordion.Item>
                    ))}
                </Accordion>
            </section>

            <Modal state={modal}>
                <Modal.Backdrop>
                    <Modal.Container scroll="inside">
                        <Modal.Dialog className="adv-modal">
                            <Modal.CloseTrigger />
                            <Modal.Header>
                                <Modal.Icon><Megaphone /></Modal.Icon>
                                <Modal.Heading>Book your slot</Modal.Heading>
                                <p className="adv-modal-sub">Two quick steps. We'll confirm by email.</p>
                            </Modal.Header>
                            <Modal.Body className="adv-modal-body">
                                {booking && (
                                    <div className="adv-order">
                                        <div>
                                            <div className="adv-order-name">{booking.name}</div>
                                            <Chip size="sm" variant="soft" color="accent">{booking.term}</Chip>
                                        </div>
                                        <div className="adv-order-price">${booking.price}<small> USD</small></div>
                                    </div>
                                )}

                                <div className="adv-email">
                                    <Mail size={14} aria-hidden="true" />
                                    <code>{CONTACT_EMAIL}</code>
                                    <KeyButton size="sm" onPress={copyEmail} aria-label="Copy email address">
                                        {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                                    </KeyButton>
                                </div>
                                <ol className="adv-steps">
                                    <li>
                                        <b>Request your start date</b>
                                        <p>Email us to check that date's availability, and send your site assets:</p>
                                        <ul className="adv-assets">
                                            {ASSETS.map(({ label, Icon }) => <li key={label}><Icon size={15} aria-hidden="true" />{label}</li>)}
                                        </ul>
                                    </li>
                                    <li>
                                        <b>Make the payment</b>
                                        <p>Once the slot is confirmed, pay the agreed amount.</p>
                                        {PAYMENT_URL && <KeyButton variant="primary" className="mt-2" onPress={() => window.open(PAYMENT_URL, "_blank", "noopener")}>Pay now ↗</KeyButton>}
                                    </li>
                                    <li>
                                        <b>Go live</b>
                                        <p>{PROCESSING_NOTE.replace("Please allow", "Allow")}</p>
                                    </li>
                                </ol>
                            </Modal.Body>
                            <Modal.Footer className="adv-modal-footer">
                                <p className="adv-send-hint">Send your request with</p>
                                <div className="adv-mail-row" role="group" aria-label="Open in an email app">
                                    <KeyButton variant="primary" size="lg" onPress={openGmail}><GmailLogo width={20} height={20} aria-hidden="true" />Gmail</KeyButton>
                                    <KeyButton variant="primary" size="lg" onPress={openOutlook}><OutlookLogo width={20} height={20} aria-hidden="true" />Outlook</KeyButton>
                                    <KeyButton variant="primary" size="lg" onPress={openMailApp}><MailIcon width={20} height={20} aria-hidden="true" />Mail app</KeyButton>
                                </div>
                                <p className="adv-send-foot">Opens a draft with your booking details pre-filled. By booking you agree to the <a href="/terms-of-service/#advertising-terms">terms &amp; conditions</a>.</p>
                            </Modal.Footer>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>
        </>
    );
}
