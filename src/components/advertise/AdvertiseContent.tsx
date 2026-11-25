import { useEffect, useState, type ReactNode } from "react";
import { Accordion, Card, Chip, Modal, useOverlayState } from "@heroui/react";
import { Bot, Check, ChevronDown, Copy, FileText, Globe, Eye, Image as ImageIcon, GraduationCap, Info, Keyboard, Link as LinkIcon, Mail, Megaphone, Mouse, NotebookPen } from "lucide-react";
import CloudflareLogo from "~icons/logos/cloudflare-icon";
import GmailLogo from "~icons/logos/google-gmail";
import OutlookLogo from "~icons/vscode-icons/file-type-outlook";
import MailIcon from "~icons/lucide/mail";
import KeyButton from "@/components/ui/KeyButton";
import KeyLink from "@/components/ui/KeyLink";
import TextLink from "@/components/ui/TextLink";
import YouTubeEmbed from "@/components/ui/YouTubeEmbed";

/* Payment / slot-booking link. Leave empty until it is ready; step 1 then
 * falls back to "email your preferred start date". */
const PAYMENT_URL = "";
const CONTACT_EMAIL = "vivekgupta@ninjatype.com";

 type TermId = "month" | "quarter" | "year";
const PLAN_NAME = "Always-visible sponsorship";
/** One package, three lengths. A month is 30 days, so quarterly is 90 and yearly is 360. */
type Term = { id: TermId; label: string; days: number; price: number; regular: number; blurb: string };
/** `regular` is the normal price; `price` is the Black Friday price while the deal runs. */
const TERMS: Term[] = [
    { id: "month", label: "Monthly", days: 30, price: 99, regular: 199, blurb: "Try it for a month" },
    { id: "quarter", label: "3 months", days: 90, price: 199, regular: 599, blurb: "90 days" },
    { id: "year", label: "1 year", days: 360, price: 499, regular: 1999, blurb: "Best value" },
];
/** The campaign runs 2 weeks (to Dec 8, 2026 end of day PT) as back-to-back 3-day deal windows; the deal "resets" at each window end. */
const DAY_MS = 86_400_000;
const FIRST_WINDOW_END = new Date("2026-11-29T00:00:00-08:00").getTime();
const CAMPAIGN_END = new Date("2026-12-09T00:00:00-08:00").getTime();
const WINDOW_DAYS = 3;
/** End (exclusive) of the 3-day window containing `now`, or null once the campaign is over. */
function windowEnd(now: number): number | null {
    if (now >= CAMPAIGN_END) return null;
    const k = Math.max(0, Math.ceil((now - FIRST_WINDOW_END + 1) / (WINDOW_DAYS * DAY_MS)));
    return Math.min(FIRST_WINDOW_END + k * WINDOW_DAYS * DAY_MS, CAMPAIGN_END);
}
const dealDate = (end: number) => new Date(end - 1).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "America/Los_Angeles" });
const perMonth = (t: Term, price = t.price) => price / (t.days / 30);
const saving = (t: Term, deal: boolean) => {
    const p = (x: Term) => perMonth(x, deal ? x.price : x.regular);
    return Math.round((1 - p(t) / p(TERMS[0])) * 100);
};
const dealOff = (t: Term) => Math.round((1 - t.price / t.regular) * 100);

/** Current deal window, set after mount so server and client markup match. */
function useDealClock() {
    const [now, setNow] = useState<number | null>(null);
    useEffect(() => {
        setNow(Date.now());
        const id = setInterval(() => setNow(Date.now()), 60_000);
        return () => clearInterval(id);
    }, []);
    const end = now === null ? windowEnd(FIRST_WINDOW_END - 1) : windowEnd(now);
    return { active: end !== null, end };
}

/** Date-based: names the last day of the current 3-day window. */
function DealEnds({ end }: { end: number | null }) {
    if (end === null) return null;
    return <span className="adv-countdown"><Chip size="sm" variant="soft" color="danger">Ends {dealDate(end)} · 11:59 PM PT</Chip></span>;
}

const SHARED_NOTE = "Each ad space is shared by all current sponsors and shows one sponsor at a time, in rotation. We don't disclose or cap the number of sponsors in a space.";
const TERMS_URL = "/advertisement-tnc.txt";
const REFUND_URL = "/advertisement-refund-policy.txt";

/** Opens the live site with a sample sponsor in both spots (see resolvePreview). */
const PREVIEW_URL = "/?preview=ads";

const PLACEMENTS = [
    {
        id: "footer", name: "Footer strip", tag: "Every standard page", previewNote: "Look at the bottom of the page",
        text: "A single line at the bottom of the page: ninjatype × your brand. Hover or focus it to see your tagline in a card, and click through to your site.",
        points: ["Name and a short tagline (about 60 characters)", "Shown on pages with the standard site footer", "Static, quiet and never in the typing area"],
    },
    {
        id: "results", name: "Results spotlight", tag: "After every session", previewNote: "Finish a short test to see it",
        text: "A sponsor card on the results screen, shown when someone finishes a typing practice or a Ghost Race. Your logo, name, description and link.",
        points: ["Logo, name and a one-line description", "Typing practice and Ghost Race results", "Appears only after the session, never while typing"],
    },
] as const;

const INCLUDED = [
    "Both placements: footer strip and results spotlight",
    "Click-through links with UTM tags",
    "A private preview link before you pay",
    "Labelled as sponsored, no popups or video",
];

type Kind = "sponsorship" | "review";

/** What the booking modal shows and the email asks for, per product. */
const KINDS: Record<Kind, {
    heading: string; sub: string; includes: string[]; dateLabel: string;
    assets: { label: string; Icon: typeof ImageIcon }[];
    steps: { title: string; text: string }[];
}> = {
    sponsorship: {
        heading: "Book your sponsorship",
        sub: "Send us a short email. We confirm availability and share a preview before you pay.",
        includes: ["Footer strip", "Results spotlight"],
        dateLabel: "Preferred start date",
        assets: [
            { label: "Logo (PNG, transparent)", Icon: ImageIcon },
            { label: "Official website URL", Icon: Globe },
            { label: "Brand name and short description", Icon: FileText },
            { label: "Footer tagline (about 60 characters)", Icon: FileText },
            { label: "Dedicated landing-page URL", Icon: LinkIcon },
            { label: "Product image", Icon: ImageIcon },
        ],
        steps: [
            { title: "Email your details", text: "Send your preferred start date and the assets below." },
            { title: "Approve your preview", text: "We confirm availability and send a private link that shows your brand in the real footer strip and results spotlight." },
            { title: "Make the payment", text: "Once you are happy with the preview, pay the agreed amount." },
            { title: "Go live", text: "Allow up to 3 days of processing. Your booking starts the day it goes live." },
        ],
    },
    review: {
        heading: "Book a blog review",
        sub: "Send us a short email. We confirm the date and what we need from you.",
        includes: ["One sponsored post on the NinjaType blog"],
        dateLabel: "Preferred publish date",
        assets: [
            { label: "Live product link or working sample", Icon: LinkIcon },
            { label: "Official website URL", Icon: Globe },
            { label: "Short description of the product", Icon: FileText },
            { label: "Logo (PNG, transparent)", Icon: ImageIcon },
            { label: "Product images or screenshots", Icon: ImageIcon },
        ],
        steps: [
            { title: "Email your details", text: "Send your preferred publish date, your product and the assets below." },
            { title: "Make the payment", text: "Once we confirm the booking, pay the agreed amount." },
            { title: "We review and publish", text: "We use the product, write an honest labelled review and share the link with you." },
        ],
    },
};

const CATEGORIES = [
    { label: "Keyboards", text: "Mechanical, ergonomic and typing keyboards", Icon: Keyboard },
    { label: "Ergonomic gear", text: "Mice, wrist rests, chairs, desks and stands", Icon: Mouse },
    { label: "Productivity & note-taking", text: "Apps and tools for focus, planning and notes", Icon: NotebookPen },
    { label: "Developer & AI tools", text: "Editors, APIs, coding and AI assistants", Icon: Bot },
    { label: "Exam & job prep", text: "Courses, test prep and career platforms", Icon: GraduationCap },
];


const BLOG_PRICE = 69;
const BLOG_REGULAR = 120;
const BLOG_POINTS = [
    "We use your live product or a working sample you provide",
    "Written for typing, productivity and developer readers",
    "Clearly labelled as sponsored, with a link to your site",
    "No planned end date, searchable and shareable",
];

const PROCESSING_NOTE = "Please allow up to 3 days of processing time before your ad appears on the site.";

const docLink = (href: string, text: string) => <a className="adv-doc-link" href={href} target="_blank" rel="noopener noreferrer">{text}</a>;

const FAQS: [string, ReactNode][] = [
    ["How long until my ad goes live?", `${PROCESSING_NOTE} The booking period starts on the day it goes live.`],
    ["Will ads interrupt typing?", "No. There are no popups, banners or video. The results spotlight appears only after a session is finished, and the footer strip is one static line."],
    ["How long is each booking?", "Monthly is 30 days, quarterly is 90 days (3 × 30) and yearly is 360 days (12 × 30), starting the day your creative goes live."],
    ["Does a booking renew automatically?", "No. A booking ends on its last day and you are not charged again. To continue, email us before it ends; renewal is at the prices and terms current at that time."],
    ["Can I cancel a booking?", "Yes, at any time by email. Cancelling before your ad is live and before we have started work on it gives a refund. Cancelling a running booking stops the placement but does not give a refund, including on 3-month and 1-year plans."],
    ["Can I get a refund?", <>Payments are final except in a few cases: you cancel before the ad is live, we end a running sponsorship and you have not breached the terms (refunded pro rata for the unused days), or a change to the terms that you do not accept. A blog review is non-refundable once we start testing or writing. See the {docLink(REFUND_URL, "refund policy")} for every case and worked examples.</>],
    ["How are refunds paid?", <>Every refund has a processing fee of 5% of the total you paid deducted from it, and taxes or bank charges are not refunded. Refunds are paid in USD by card through a payment link or checkout that you provide, not back to the original payment method. Details are in the {docLink(REFUND_URL, "refund policy")}.</>],
    ["What does the sponsorship include?", "Always-visible placement means both spots: the footer strip and the results spotlight. They are sold together, in the same plan."],
    ["Can I see my ad before paying?", "Yes. We send you a private preview link that shows your name and tagline in the real footer strip and results spotlight, so you can confirm the placement."],
    ["What do I need to send?", "A logo (PNG with transparent background), your official URL, a short description, a footer tagline of about 60 characters, a dedicated landing-page URL and a product image."],
    ["How does the blog review work?", "You give us a live product or a working sample. We use it, then publish an honest, clearly labelled review. You can request factual corrections but not approve the opinion."],
    ["Who can advertise?", "Keyboards, ergonomic gear, productivity and note-taking tools, developer and AI tools, and exam and job prep platforms. We may decline anything outside these categories or misleading, and can pause or remove an ad that breaks the advertising terms."],
    ["Where do the stats come from?", "Visitors and page views are the last 30 days of first-party analytics from Cloudflare, refreshed regularly. They are site-wide figures, not the number of times one sponsor's ad is shown."],
    ["Is the ad space exclusive to me?", `No. ${SHARED_NOTE} So your ad is not shown on every page view or after every session, and your share of the rotation changes as sponsors join or leave.`],
];

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(2).replace(/\.?0+$/, "")}k` : String(n));

function StatCard({ label, value }: { label: string; value: number }) {
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
        </Card>
    );
}

function Mock({ id }: { id: string }) {
    return (
        <div className="adv-mock" aria-hidden="true">
            {id === "results" ? (
                <div className="mock-screen">
                    <div className="mock-result"><b>87</b><span>wpm</span><b>98%</b><span>acc</span></div>
                    <div className="mock-sponsor"><span className="mock-logo">logo</span><span className="mock-copy"><b>Your brand</b><i /></span><em>Sponsored</em></div>
                </div>
            ) : (
                <div className="mock-screen">
                    <div className="mock-body" />
                    <div className="mock-strip-row">
                        <span className="mock-line" />
                        <span className="mock-strip"><Info size={12} /><span>ninjatype ×</span><b>Your brand</b><span>↗</span></span>
                        <span className="mock-line" />
                    </div>
                </div>
            )}
        </div>
    );
}

interface Booking { name: string; term: string; price: number; kind: Kind }

export default function AdvertiseContent({ stats }: { stats: { last30daysVisitors: number; last30daysPageViews: number } }) {
    const [data, setData] = useState(stats);
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
    const kind = booking ? KINDS[booking.kind] : null;
    const body = kind
        ? `Hi,\n\nI'd like to book: ${summary}\n${kind.dateLabel}: \nCompany / brand name: \n\nAssets attached / below:\n${kind.assets.map(a => `- ${a.label}:`).join("\n")}\n`
        : "";
    const q = (o: Record<string, string>) => Object.entries(o).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
    const openGmail = () => window.open(`https://mail.google.com/mail/?${q({ view: "cm", fs: "1", to: CONTACT_EMAIL, su: subject, body })}`, "_blank", "noopener");
    const openOutlook = () => window.open(`https://outlook.office.com/mail/deeplink/compose?${q({ to: CONTACT_EMAIL, subject, body })}`, "_blank", "noopener");
    const openMailApp = () => { window.location.href = `mailto:${CONTACT_EMAIL}?${q({ subject, body })}`; };
    const copyEmail = async () => {
        try { await navigator.clipboard.writeText(CONTACT_EMAIL); } catch { /* clipboard unavailable */ }
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };

    const { active: dealActive, end: dealEnd } = useDealClock();
    const blogPrice = dealActive ? BLOG_PRICE : BLOG_REGULAR;
    const priceOf = (t: Term) => (dealActive ? t.price : t.regular);

    return (
        <>
            {dealActive && (
                <aside id="blackfriday" className="adv-deal-banner" aria-label="Black Friday deal">
                    <div className="adv-deal-text">
                        <Chip size="sm" color="danger" variant="primary">Black Friday deal</Chip>
                        <p><b>Up to 75% off every sponsorship plan</b> · 3 days only, renewed every 3 days through Dec 8</p>
                    </div>
                    <DealEnds end={dealEnd} />
                    <KeyLink size="sm" variant="primary" href="#pricing">See deal prices</KeyLink>
                </aside>
            )}
            <section className="adv-hero">
                <div className="adv-hero-text">
                <Chip size="sm" variant="soft">For publishers &amp; marketing teams</Chip>
                <h1>Advertise on NinjaType</h1>
                <p className="adv-lede">Reach people who practise typing every day, with no popups, banners or anything that gets between them and the keyboard.</p>
                </div>
                <YouTubeEmbed id="G0CvoJkM1m0" title="NinjaType.com: a quick tour" />
            </section>

            <section aria-label="Audience stats" className="adv-stats">
                <StatCard label="Visitors" value={data.last30daysVisitors} />
                <StatCard label="Page views" value={data.last30daysPageViews} />
            </section>

            <section aria-labelledby="where-title">
                <div className="adv-intro">
                    <h2 id="where-title">Always-visible placement</h2>
                    <p className="adv-lede">One sponsorship, two spots: the site footer and every results screen. Never in the typing area.</p>
                </div>
                <div className="adv-grid">
                    {PLACEMENTS.map(p => (
                        <Card key={p.id} className="adv-pack">
                            <Mock id={p.id} />
                            <Card.Header>
                                <div className="flex items-center justify-between gap-3 flex-wrap">
                                    <Card.Title>{p.name}</Card.Title>
                                    <Chip size="sm" variant="soft" color="accent">{p.tag}</Chip>
                                </div>
                                <Card.Description>{p.text}</Card.Description>
                            </Card.Header>
                            <Card.Content>
                                <ul className="adv-checks">{p.points.map(pt => <li key={pt}><Check size={16} aria-hidden="true" />{pt}</li>)}</ul>
                            </Card.Content>
                            <Card.Footer>
                                <div className="adv-preview">
                                    <div className="adv-preview-actions">
                                        <KeyLink variant="primary" href="#pricing">Buy</KeyLink>
                                        <KeyLink href={PREVIEW_URL} target="_blank" rel="noopener">
                                            <Eye size={16} aria-hidden="true" />Preview live<span className="sr-only"> (opens in a new tab)</span>
                                        </KeyLink>
                                    </div>
                                    <p className="adv-preview-note"><Info size={13} aria-hidden="true" />{p.previewNote}</p>
                                </div>
                            </Card.Footer>
                        </Card>
                    ))}
                </div>
            </section>

            <section id="pricing" aria-labelledby="packs-title">
                <div className="adv-intro">
                    <h2 id="packs-title">Pricing</h2>
                    <p className="adv-lede">Pick a length. Both placements are included, and longer plans cost less per month.</p>
                    {dealActive && (
                        <p className="adv-deal-note"><Chip size="sm" color="danger" variant="primary">Black Friday</Chip> Deal prices valid for 3 days only, then renewed every 3 days until Dec 8. <DealEnds end={dealEnd} /></p>
                    )}
                </div>
                <div className="adv-plans">
                    {TERMS.map(t => {
                        const off = saving(t, dealActive);
                        const best = t.id === "year";
                        return (
                            <Card key={t.id} className="adv-plan" data-featured={best}>
                                <Card.Header>
                                    <div className="flex items-center justify-between gap-3 flex-wrap">
                                        <Card.Title>{t.label}</Card.Title>
                                        {dealActive ? <Chip size="sm" color="danger" variant="soft">Black Friday −{dealOff(t)}%</Chip> : best ? <Chip size="sm" variant="primary" color="accent">Best value</Chip> : off > 0 ? <Chip size="sm" color="success" variant="soft">Save {off}%</Chip> : <Chip size="sm" variant="soft">No commitment</Chip>}
                                    </div>
                                </Card.Header>
                                <Card.Content>
                                    <p className="adv-price">
                                        {dealActive && <s className="adv-price-old"><span className="sr-only">Regular price </span>${t.regular}</s>}
                                        <span className="adv-price-now">${priceOf(t)}</span><small> USD</small>
                                    </p>
                                    <p className="adv-meta">
                                        <span>{t.days} days</span>
                                        <span aria-hidden="true">·</span>
                                        <span>${Math.round(perMonth(t, priceOf(t)))} / month</span>
                                        {best && off > 0 && <Chip size="sm" color="success" variant="soft">Save {off}%</Chip>}
                                    </p>
                                </Card.Content>
                                <Card.Footer>
                                    <KeyButton variant={best ? "primary" : "secondary"} fullWidth onPress={() => openBooking({ name: PLAN_NAME, term: `${t.label} (${t.days} days)${dealActive ? " · Black Friday deal" : ""}`, price: priceOf(t), kind: "sponsorship" })}>Book now</KeyButton>
                                </Card.Footer>
                            </Card>
                        );
                    })}
                </div>
                <Card className="adv-included">
                    <Card.Content>
                        <h3>Included in every plan</h3>
                        <ul className="adv-checks adv-checks--cols">{INCLUDED.map(pt => <li key={pt}><Check size={16} aria-hidden="true" />{pt}</li>)}</ul>
                        <p className="adv-note">{SHARED_NOTE}</p>
                    </Card.Content>
                </Card>
            </section>

            <section aria-labelledby="blog-title">
                <Card>
                    <Card.Content>
                        <div className="adv-blog-row">
                            <div className="adv-blog-main">
                                <div className="flex items-center flex-wrap gap-2">
                                    <Chip size="sm" variant="soft" className="self-start">One-time · Standalone or add-on</Chip>
                                    {dealActive && <Chip size="sm" color="danger" variant="soft">Black Friday −{Math.round((1 - BLOG_PRICE / BLOG_REGULAR) * 100)}%</Chip>}
                                </div>
                                <h2 id="blog-title">Sponsored blog review</h2>
                                <p className="adv-lede">An honest, hands-on review of your product, published on the NinjaType blog. Buy it on its own or add it to the always-visible sponsorship.</p>
                                <ul className="adv-checks">{BLOG_POINTS.map(pt => <li key={pt}><Check size={16} aria-hidden="true" />{pt}</li>)}</ul>
                            </div>
                            <div className="adv-blog-buy">
                                <p className="adv-price">
                                    {dealActive && <s className="adv-price-old"><span className="sr-only">Regular price </span>${BLOG_REGULAR}</s>}
                                    <span className="adv-price-now">${blogPrice}</span><small> USD</small>
                                </p>
                                <p className="adv-meta mb-2">One time · no subscription</p>
                                <KeyButton variant="primary" onPress={() => openBooking({ name: "Sponsored blog review", term: dealActive ? "One time · Black Friday deal" : "One time", price: blogPrice, kind: "review" })}>Book now</KeyButton>
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

            <p className="adv-terms-line">All bookings are subject to the <a href={TERMS_URL} target="_blank" rel="noopener noreferrer">advertising terms &amp; conditions</a> and the <a href={REFUND_URL} target="_blank" rel="noopener noreferrer">refund policy</a>.</p>

            <Modal state={modal}>
                <Modal.Backdrop>
                    <Modal.Container scroll="inside">
                        <Modal.Dialog className="adv-modal">
                            <Modal.CloseTrigger />
                            <Modal.Header>
                                <Modal.Icon><Megaphone /></Modal.Icon>
                                <Modal.Heading>{kind?.heading ?? "Request a booking"}</Modal.Heading>
                                <p className="adv-modal-sub">{kind?.sub}</p>
                            </Modal.Header>
                            <Modal.Body className="adv-modal-body">
                                {booking && kind && (
                                    <div className="adv-order">
                                        <div>
                                            <div className="adv-order-name">{booking.name}</div>
                                            <Chip size="sm" variant="soft" color="accent">{booking.term}</Chip>
                                            <ul className="adv-order-includes">{kind.includes.map(i => <li key={i}><Check size={13} aria-hidden="true" />{i}</li>)}</ul>
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
                                {kind && (
                                    <>
                                        <div>
                                            <h3 className="adv-assets-title">What to send</h3>
                                            <ul className="adv-assets">
                                                {kind.assets.map(({ label, Icon }) => <li key={label}><Icon size={15} aria-hidden="true" />{label}</li>)}
                                            </ul>
                                        </div>
                                        <ol className="adv-steps">
                                            {kind.steps.map(st => (
                                                <li key={st.title}>
                                                    <b>{st.title}</b>
                                                    <p>{st.text}</p>
                                                    {st.title === "Make the payment" && PAYMENT_URL && <KeyButton variant="primary" className="mt-2" onPress={() => window.open(PAYMENT_URL, "_blank", "noopener")}>Pay now ↗</KeyButton>}
                                                </li>
                                            ))}
                                        </ol>
                                    </>
                                )}
                            </Modal.Body>
                            <Modal.Footer className="adv-modal-footer">
                                <p className="adv-send-hint">Send your request with</p>
                                <div className="adv-mail-row" role="group" aria-label="Open in an email app">
                                    <KeyButton variant="primary" size="lg" onPress={openGmail}><GmailLogo width={20} height={20} aria-hidden="true" />Gmail</KeyButton>
                                    <KeyButton variant="primary" size="lg" onPress={openOutlook}><OutlookLogo width={20} height={20} aria-hidden="true" />Outlook</KeyButton>
                                    <KeyButton variant="primary" size="lg" onPress={openMailApp}><MailIcon width={20} height={20} aria-hidden="true" />Mail app</KeyButton>
                                </div>
                                <p className="adv-send-foot">Opens a draft with your booking details pre-filled. By booking you agree to the <a href={TERMS_URL} target="_blank" rel="noopener noreferrer">advertising terms &amp; conditions</a> and the <a href={REFUND_URL} target="_blank" rel="noopener noreferrer">refund policy</a>.</p>
                            </Modal.Footer>
                        </Modal.Dialog>
                    </Modal.Container>
                </Modal.Backdrop>
            </Modal>
        </>
    );
}
