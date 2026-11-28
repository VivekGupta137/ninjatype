import { useEffect, useRef, useState } from "react";
import {
    Accordion, Alert, Avatar, Card, Chip, ColorSwatch, Kbd, Label, ProgressBar, Separator, Skeleton,
    Switch, Tabs, TextField, ToggleButton, ToggleButtonGroup, Popover, Input,
} from "@heroui/react";
import { ArrowRight, Bell, Check, Heart, Pencil, Play, Plus, Settings, Trash2 } from "lucide-react";
import KeyButton from "./KeyButton";
import { Hint, InfoTip } from "./InfoTip";
import KeyLink from "./KeyLink";
import { ProBadge, ProGate } from "./ProBadge";
import { mountSponsorStrip } from "@/lib/sponsorStrip";
import type { Sponsor } from "@/lib/sponsors";
import SponsorCarousel from "./SponsorCarousel";
import TextLink from "./TextLink";
import { FaqList, FaqSection, HelpTrigger, type FaqEntry } from "./Faq";
import { Eye, EyeOff } from "lucide-react";
import "@/styles/account.css";

const FAQS: FaqEntry[] = [
    { question: "How is WPM calculated?", answer: "Words per minute counts every five correct characters as one word, divided by the time you typed." },
    { question: "Do I need an account?", answer: "No. Practice, lessons and results are saved locally in your browser." },
    { question: "What are star ratings?", answer: "Lessons award up to three stars based on your speed and accuracy." },
];

const SECTIONS = [
    ["buttons", "Buttons"], ["links", "Links"], ["tips", "Tooltips & popovers"], ["faq", "FAQ"], ["sponsors", "Sponsor carousel"], ["forms", "Forms"], ["heroui", "Other components"], ["layouts", "Page layouts"],
] as const;

const SAMPLE_SPONSORS: Sponsor[] = [
    { name: "Keyboard Co.", url: "https://example.com/keyboards", description: "Mechanical keyboards built for fast typists" },
    { name: "Touch Typing Academy", url: "https://example.com/academy", description: "Structured courses from 30 to 100 WPM" },
    { name: "Ergo Desk", url: "https://example.com/desk", description: "Wrist-friendly desks and chairs" },
];

/** Live demo of the footer strip (the real one is filled from /sponsor.json by SponsorStripRotator). */
function StripDemo({ interval }: { interval: number }) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => (ref.current ? mountSponsorStrip(ref.current, SAMPLE_SPONSORS, { slot: "components-demo", interval }) : undefined), [interval]);
    return <div className="fss" ref={ref} hidden />;
}

const TOKENS = ["--bg-color", "--alt-bg-color", "--main-color", "--text-color", "--sub-text-color", "--sub-alt-text-color", "--error-color", "--success-color"];

function Demo({ title, children, code }: { title: string; children: React.ReactNode; code?: string }) {
    return (
        <div className="cmp-demo">
            <h3>{title}</h3>
            {children}
            {code && <code className="cmp-code">{code}</code>}
        </div>
    );
}

function Section({ id, title, text, children }: { id: string; title: string; text: string; children: React.ReactNode }) {
    return (
        <section id={id} className="cmp-section" aria-labelledby={`${id}-title`}>
            <header><h2 id={`${id}-title`}>{title}</h2><p className="cmp-sub">{text}</p></header>
            {children}
        </section>
    );
}

/** Auth form card as used on /account/: mode switch, labelled fields, password reveal, error alert and a full-width submit. Demo only: it never submits. */
function FormCardDemo() {
    const [mode, setMode] = useState<"signIn" | "signUp">("signUp");
    const [show, setShow] = useState(false);
    const [error, setError] = useState(false);
    const signUp = mode === "signUp";
    return (
        <Card className="acct-card cmp-form-card">
            <ToggleButtonGroup className="key-group acct-switch" selectionMode="single" disallowEmptySelection aria-label="Sign in or create an account"
                selectedKeys={new Set([mode])} onSelectionChange={keys => { const key = [...keys][0] as "signIn" | "signUp" | undefined; if (key) { setMode(key); setError(false); } }}>
                <ToggleButton id="signIn" className="key-btn key-btn--ghost">Sign in</ToggleButton>
                <ToggleButton id="signUp" className="key-btn key-btn--ghost">Create account</ToggleButton>
            </ToggleButtonGroup>
            <div>
                <h2>{signUp ? "Create your free account" : "Welcome back"}</h2>
                <p className="acct-note">{signUp ? "Takes a few seconds. No card needed." : "Sign in to sync your history and manage Pro."}</p>
            </div>
            <form className="acct-form" noValidate onSubmit={e => { e.preventDefault(); setError(true); }}>
                {signUp && <TextField name="demo-name" isRequired><Label>Display name</Label><Input placeholder="Your name" maxLength={40} /></TextField>}
                <TextField name="demo-email" type="email" isRequired><Label>Email</Label><Input placeholder="you@example.com" /></TextField>
                <TextField name="demo-password" type={show ? "text" : "password"} isRequired>
                    <Label>Password</Label>
                    <div className="acct-pw">
                        <Input placeholder="At least 10 characters" />
                        <button type="button" className="acct-pw-toggle" aria-label={show ? "Hide password" : "Show password"} aria-pressed={show} onClick={() => setShow(!show)}>
                            {show ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                        </button>
                    </div>
                    {signUp && <p className="acct-hint">Use 10+ characters. There is no password reset yet, so keep it somewhere safe.</p>}
                </TextField>
                {error && (
                    <Alert status="danger" role="alert"><Alert.Indicator /><Alert.Content><Alert.Title>Something went wrong</Alert.Title><Alert.Description>This is a demo form, so nothing was sent.</Alert.Description></Alert.Content></Alert>
                )}
                <KeyButton type="submit" variant="primary" className="acct-submit">{signUp ? "Create account" : "Sign in"}</KeyButton>
            </form>
        </Card>
    );
}

const Wire = ({ title, used, note, children }: { title: string; used: string; note: string; children: React.ReactNode }) => (
    <Card className="cmp-layout">
        <Card.Content>
            <h3>{title}</h3>
            <p>{note} Used by <code>{used}</code></p>
            <div className="wf" aria-hidden="true">{children}</div>
        </Card.Content>
    </Card>
);

export default function ComponentsShowcase() {
    const [active, setActive] = useState<Set<string>>(new Set(["a"]));
    const [on, setOn] = useState(true);

    return (
        <>
            <section>
                <Chip size="sm" variant="soft">Design system</Chip>
                <h1>Components</h1>
                <p className="cmp-lede">A living reference for building NinjaType pages. Every component here is themed through the app's variables, so it follows whichever theme is selected. Excludes Web Stories, product comparisons and Hacker Typer.</p>
                <nav className="cmp-toc" aria-label="Sections">
                    {SECTIONS.map(([id, label]) => <KeyButton key={id} size="sm" onPress={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}>{label}</KeyButton>)}
                </nav>
            </section>

            {/* 1. Buttons */}
            <Section id="buttons" title="Buttons" text="Keyboard-styled keycaps. Always use KeyButton from components/ui instead of styling Button directly.">
                <div className="cmp-grid">
                    <Demo title="Primary" code={'<KeyButton variant="primary">Start typing</KeyButton>'}>
                        <div className="cmp-row">
                            <KeyButton variant="primary">Start typing</KeyButton>
                            <KeyButton variant="primary"><Play size={14} /> With icon</KeyButton>
                            <KeyButton variant="primary" isDisabled>Disabled</KeyButton>
                        </div>
                    </Demo>
                    <Demo title="Secondary (default)" code={'<KeyButton>Reset</KeyButton>'}>
                        <div className="cmp-row">
                            <KeyButton>Reset</KeyButton>
                            <KeyButton><Plus size={14} /> Add</KeyButton>
                            <KeyButton isDisabled>Disabled</KeyButton>
                        </div>
                    </Demo>
                    <Demo title="Active / selected" code={'<KeyButton isActive>Words</KeyButton>'}>
                        <div className="cmp-row">
                            <KeyButton isActive>Words</KeyButton>
                            <ToggleButtonGroup aria-label="Demo toggle" selectionMode="single" disallowEmptySelection selectedKeys={active}
                                onSelectionChange={keys => { const v = Array.from(keys)[0] as string | undefined; if (v) setActive(new Set([v])); }} className="key-group">
                                {["a", "b", "c"].map(k => <ToggleButton key={k} id={k} className="key-btn">{`Option ${k.toUpperCase()}`}</ToggleButton>)}
                            </ToggleButtonGroup>
                        </div>
                    </Demo>
                    <Demo title="Ghost" code={'<KeyButton variant="ghost">Skip</KeyButton>'}>
                        <div className="cmp-row">
                            <KeyButton variant="ghost">Skip</KeyButton>
                            <KeyButton variant="ghost">Cancel <ArrowRight size={14} /></KeyButton>
                        </div>
                    </Demo>
                    <Demo title="Ghost + active" code={'<KeyButton variant="ghost" isActive>Learn</KeyButton>'}>
                        <div className="cmp-row">
                            <KeyButton variant="ghost">Practice</KeyButton>
                            <KeyButton variant="ghost" isActive>Learn</KeyButton>
                            <KeyButton variant="ghost">Blog</KeyButton>
                            <KeyButton variant="ghost" isIconOnly isActive aria-label="Settings"><Settings size={18} /></KeyButton>
                        </div>
                        <p className="cmp-sub" style={{ margin: ".75rem 0 0" }}>The current item in navigation. It keeps its fill on hover.</p>
                    </Demo>
                    <Demo title="Link keycap (KeyLink)" code={'<KeyLink href="/learn/" variant="ghost" isActive>Learn</KeyLink>'}>
                        <div className="cmp-row">
                            <KeyLink href="/components/#buttons" variant="primary">Primary link</KeyLink>
                            <KeyLink href="/components/#buttons">Secondary link</KeyLink>
                            <KeyLink href="/components/#buttons" variant="ghost" isActive>Active link</KeyLink>
                        </div>
                        <p className="cmp-sub" style={{ margin: ".75rem 0 0" }}>A real &lt;a&gt; for navigation. Use KeyButton for actions.</p>
                    </Demo>
                    <Demo title="Pro pill (ProBadge, ProGate)" code={'<ProGate><KeyLink href="/pro/">Sync history</KeyLink></ProGate>'}>
                        <div className="cmp-row">
                            <ProBadge />
                            <ProGate><KeyLink href="/components/#buttons">Sync history</KeyLink></ProGate>
                            <ProGate><KeyButton variant="primary">Custom themes</KeyButton></ProGate>
                        </div>
                        <p className="cmp-sub" style={{ margin: ".75rem 0 0" }}>Pin the pill to any control that needs Pro, and hide it for Pro users with show=false.</p>
                    </Demo>
                    <Demo title="Streak chip" code={'<Chip color="success|warning">'}>
                        <div className="cmp-row">
                            <Chip color="success" variant="soft">Practised today</Chip>
                            <Chip color="warning" variant="soft">Not practised yet</Chip>
                        </div>
                        <p className="cmp-sub" style={{ margin: ".75rem 0 0" }}>Status chips colour by state; the navbar streak is green once you've practised today and yellow until then.</p>
                    </Demo>
                    <Demo title="Icon only" code={'<KeyButton isIconOnly aria-label="Settings">…</KeyButton>'}>
                        <div className="cmp-row">
                            <KeyButton isIconOnly aria-label="Settings"><Settings size={18} /></KeyButton>
                            <KeyButton isIconOnly variant="primary" aria-label="Add"><Plus size={18} /></KeyButton>
                            <KeyButton isIconOnly variant="ghost" aria-label="Delete"><Trash2 size={18} /></KeyButton>
                            <KeyButton isIconOnly isActive aria-label="Favourite"><Heart size={18} /></KeyButton>
                        </div>
                    </Demo>
                    <Demo title="Sizes" code={'<KeyButton size="sm" | "md" | "lg">'}>
                        <div className="cmp-row">
                            <KeyButton size="sm">Small</KeyButton>
                            <KeyButton size="md">Medium</KeyButton>
                            <KeyButton size="lg">Large</KeyButton>
                        </div>
                    </Demo>
                </div>
            </Section>

            {/* Links */}
            <Section id="links" title="Links" text="Use TextLink for every anchor in text, lists and the footer. Variants set the emphasis; external links open in a new tab and get a ↗ marker automatically.">
                <div className="cmp-grid">
                    <Demo title="Accent (default)" code={'<TextLink href="/help/">Read the guide</TextLink>'}>
                        <p className="cmp-sub" style={{ margin: 0 }}>Inline in a sentence: <TextLink href="/help/">read the guide</TextLink> to learn more.</p>
                    </Demo>
                    <Demo title="Muted" code={'<TextLink variant="muted" size="sm" href="/blog/">Blog</TextLink>'}>
                        <div className="cmp-row">
                            <TextLink variant="muted" size="sm" href="/blog/">Blog</TextLink>
                            <TextLink variant="muted" size="sm" href="/about/">About</TextLink>
                            <TextLink variant="muted" size="sm" href="/help/">Help</TextLink>
                        </div>
                        <p className="cmp-sub" style={{ margin: ".75rem 0 0" }}>Quiet by default, accent on hover. Used for footer and list links.</p>
                    </Demo>
                    <Demo title="Text" code={'<TextLink variant="text" href="/learn/">Touch typing lessons</TextLink>'}>
                        <TextLink variant="text" href="/learn/">Touch typing lessons</TextLink>
                    </Demo>
                    <Demo title="Underline" code={'<TextLink variant="underline" href="/terms-of-service/">Terms</TextLink>'}>
                        <p className="cmp-sub" style={{ margin: 0 }}>Always underlined, for prose: see the <TextLink variant="underline" href="/terms-of-service/">Terms of Service</TextLink>.</p>
                    </Demo>
                    <Demo title="With icon" code={'<TextLink icon={<Heart size={14} />} href="…">Sponsor</TextLink>'}>
                        <div className="cmp-row">
                            <TextLink variant="muted" href="/help/" icon={<Check size={14} />}>With icon</TextLink>
                            <TextLink variant="accent" href="/help/" icon={<ArrowRight size={14} />}>Accent with icon</TextLink>
                        </div>
                    </Demo>
                    <Demo title="External" code={'<TextLink href="https://github.com/…">GitHub</TextLink>'}>
                        <div className="cmp-row">
                            <TextLink href="https://github.com/VivekGupta137/ninjatype">GitHub</TextLink>
                            <TextLink variant="muted" href="https://discord.gg/EvugGkSNeN">Discord</TextLink>
                        </div>
                        <p className="cmp-sub" style={{ margin: ".75rem 0 0" }}>Detected from http(s); adds target="_blank", rel and ↗.</p>
                    </Demo>
                </div>
            </Section>

            {/* 2. Tooltips, popovers, info alerts */}
            <Section id="tips" title="Tooltips, popovers & info alerts" text="Tooltips name icon-only controls. For explanatory text such as 'How star ratings work', use InfoTip: a small link that opens a mini info alert.">
                <div className="cmp-grid">
                    <Demo title="Tooltip" code={'<Hint text="Settings"><KeyButton isIconOnly …/></Hint>'}>
                        <div className="cmp-row">
                            <Hint text="Settings"><KeyButton isIconOnly aria-label="Settings"><Settings size={18} /></KeyButton></Hint>
                            <Hint text="Notifications"><KeyButton isIconOnly aria-label="Notifications"><Bell size={18} /></KeyButton></Hint>
                            <Hint text="Edit"><KeyButton isIconOnly variant="ghost" aria-label="Edit"><Pencil size={18} /></KeyButton></Hint>
                        </div>
                    </Demo>
                    <Demo title="Info tip → mini alert" code={'<InfoTip label="How star ratings work" href="/stars/">…</InfoTip>'}>
                        <InfoTip label="How star ratings work" href="/stars/" hrefLabel="Read the full guide →">
                            Each lesson awards one to three stars based on your speed and accuracy.
                        </InfoTip>
                    </Demo>
                    <Demo title="Popover">
                        <Popover>
                            <Popover.Trigger<"button"> render={p => <KeyButton {...(p as object)} />}>Open popover</Popover.Trigger>
                            <Popover.Content placement="bottom start" offset={8}>
                                <Popover.Dialog aria-label="Example popover">
                                    <Popover.Heading>Quick settings</Popover.Heading>
                                    <p className="cmp-sub" style={{ margin: ".4rem 0 0" }}>Popovers hold small, optional content anchored to a control.</p>
                                </Popover.Dialog>
                            </Popover.Content>
                        </Popover>
                    </Demo>
                    <Demo title="Inline alerts" code={'<Alert status="accent|success|warning|danger">'}>
                        <div className="cmp-stack">
                            {(["accent", "success", "warning", "danger"] as const).map(status => (
                                <Alert key={status} status={status}>
                                    <Alert.Indicator />
                                    <Alert.Content><Alert.Title>{status[0].toUpperCase() + status.slice(1)}</Alert.Title><Alert.Description>Short, single-sentence message.</Alert.Description></Alert.Content>
                                </Alert>
                            ))}
                        </div>
                    </Demo>
                </div>
            </Section>

            {/* 3. FAQ */}
            <Section id="faq" title="FAQ" text="Page FAQs use FaqSection (as on /help). Pages with a tool use HelpTrigger, the round “?” key that opens the FAQ in a modal (the practice-help-trigger pattern).">
                <div className="cmp-stack">
                    <FaqSection title="Typing practice" description="Tests, settings, WPM, and saved results."
                        action={<KeyButton size="sm" variant="primary">Open app <ArrowRight size={14} /></KeyButton>} faqs={FAQS} />
                    <Demo title="Help trigger" code={'<HelpTrigger title="Typing help" faqs={faqs} floating />'}>
                        <div className="cmp-row">
                            <HelpTrigger title="Typing help" faqs={FAQS} />
                            <span className="cmp-sub" style={{ margin: 0 }}>Pass <code>floating</code> to pin it bottom-right on tool pages. It hides while typing.</span>
                        </div>
                    </Demo>
                </div>
            </Section>

            {/* 4. Other components */}
            {/* Sponsor carousel */}
            <Section id="sponsors" title="Sponsor carousel" text="The footer strip (filled from /sponsor.json) is the one-line footer version: ⓘ ninjatype × Brand ↗, with a hover or focus card (styled like an inline alert) showing the sponsor and tagline. SponsorCarousel cycles sponsors in an alert-style card ([logo] title, description, ↗): autoplay (30s each), crossfade, no controls. Hover, focus or touch pauses it (reduced motion removes the fade but keeps cycling); the whole card links to the sponsor. The first sponsor changes every 15 minutes so first impressions are shared equally. Use it only in persistent slots (header, footer), never in the typing area.">
                <div className="cmp-grid">
                    <Demo title="Three sponsors" code={'<SponsorCarousel sponsors={sponsors} slot="header" client:visible />'}>
                        <SponsorCarousel sponsors={SAMPLE_SPONSORS} slot="components-demo" />
                    </Demo>
                    <Demo title="Fast preview (4s per sponsor, demo only)">
                        <SponsorCarousel sponsors={SAMPLE_SPONSORS} slot="components-demo" interval={4000} />
                    </Demo>
                    <Demo title="Footer sponsor strip (4s per sponsor, demo only)" code={'<div className="fss" data-sponsor-strip="footer" hidden />'}>
                        <StripDemo interval={4000} />
                    </Demo>
                    <Demo title="One sponsor (no timer)">
                        <SponsorCarousel sponsors={SAMPLE_SPONSORS.slice(0, 1)} slot="components-demo" />
                    </Demo>
                </div>
            </Section>

            <Section id="forms" title="Forms" text="Forms live on a card: a heading, labelled TextFields, inline hints, an inline danger Alert for errors and one full-width primary KeyButton. Use a ToggleButtonGroup (key-group) to switch between related forms, as /account/ does. Styles come from account.css (acct-card, acct-form, acct-pw).">
                <div className="cmp-grid">
                    <Demo title="Sign-up / sign-in card" code={'<Card className="acct-card"> <ToggleButtonGroup/> <form className="acct-form"> <TextField/> … <KeyButton type="submit"/>'}>
                        <FormCardDemo />
                    </Demo>
                    <Demo title="Field anatomy" code={'<TextField isRequired><Label/><Input/></TextField>'}>
                        <ul className="cmp-sub" style={{ margin: 0, paddingInlineStart: "1.1rem", display: "grid", gap: ".4rem" }}>
                            <li>Label above the input; a red * marks required fields.</li>
                            <li>Placeholder shows an example, never the instruction itself.</li>
                            <li>Hints (<code>acct-hint</code>) sit under the field in small muted text.</li>
                            <li>Password fields get a show/hide toggle with <code>aria-pressed</code>.</li>
                            <li>Errors appear in one inline danger Alert above the submit key, not per-field popups.</li>
                            <li>The submit key is full width and disabled with “Please wait…” while busy.</li>
                        </ul>
                    </Demo>
                </div>
            </Section>

            <Section id="heroui" title="Other components" text="HeroUI v3 components, already themed. Prefer these over custom markup.">
                <div className="cmp-grid">
                    <Demo title="Chips" code={'<Chip color="accent|success|warning|danger" variant="soft|primary">'}>
                        <div className="cmp-row">
                            <Chip size="sm" variant="soft" color="accent">Accent</Chip>
                            <Chip size="sm" variant="soft" color="success">Success</Chip>
                            <Chip size="sm" variant="soft" color="warning">Warning</Chip>
                            <Chip size="sm" variant="soft" color="danger">Danger</Chip>
                            <Chip size="sm" variant="primary" color="accent">Primary</Chip>
                            <Chip size="sm" variant="soft">Default</Chip>
                        </div>
                    </Demo>
                    <Demo title="Keyboard keys (Kbd)" code={'<Kbd><Kbd.Content>Space</Kbd.Content></Kbd>'}>
                        <div className="cmp-row">
                            <span>Press</span><Kbd><Kbd.Content>Tab</Kbd.Content></Kbd><span>then</span><Kbd><Kbd.Content>Enter</Kbd.Content></Kbd>
                        </div>
                    </Demo>
                    <Demo title="Tabs">
                        <Tabs defaultSelectedKey="one">
                            <Tabs.ListContainer>
                                <Tabs.List aria-label="Demo tabs">
                                    <Tabs.Tab id="one">Overview<Tabs.Indicator /></Tabs.Tab>
                                    <Tabs.Tab id="two">Details<Tabs.Indicator /></Tabs.Tab>
                                </Tabs.List>
                            </Tabs.ListContainer>
                            <Tabs.Panel id="one"><p className="cmp-sub" style={{ margin: ".75rem 0 0" }}>Overview content.</p></Tabs.Panel>
                            <Tabs.Panel id="two"><p className="cmp-sub" style={{ margin: ".75rem 0 0" }}>Details content.</p></Tabs.Panel>
                        </Tabs>
                    </Demo>
                    <Demo title="Switch & progress">
                        <div className="cmp-stack">
                            <Switch isSelected={on} onChange={setOn}>
                                <Switch.Control><Switch.Thumb /></Switch.Control>
                                <Switch.Content><Label>Sound effects</Label></Switch.Content>
                            </Switch>
                            <ProgressBar aria-label="Progress" value={64}><Label>Lesson progress</Label><ProgressBar.Output /><ProgressBar.Track><ProgressBar.Fill /></ProgressBar.Track></ProgressBar>
                        </div>
                    </Demo>
                    <Demo title="Text field" code={'<TextField><Label/><Input/></TextField>'}>
                        <TextField>
                            <Label>Nickname</Label>
                            <Input placeholder="Your nickname" />
                        </TextField>
                    </Demo>
                    <Demo title="Card" code={'<Card.Footer> <KeyButton variant="primary" isActive/> <KeyButton/> </Card.Footer>'}>
                        <Card>
                            <Card.Header><Card.Title>Card title</Card.Title><Card.Description>Supporting description.</Card.Description></Card.Header>
                            <Card.Content><p className="cmp-sub" style={{ margin: 0 }}>Body content goes here.</p></Card.Content>
                            <Card.Footer>
                                <div className="cmp-row">
                                    <KeyButton size="sm" variant="primary" isActive><Check size={14} /> Confirm</KeyButton>
                                    <KeyButton size="sm">Cancel</KeyButton>
                                </div>
                            </Card.Footer>
                        </Card>
                    </Demo>
                    <Demo title="Avatar, separator, skeleton">
                        <div className="cmp-stack">
                            <div className="cmp-row"><Avatar><Avatar.Fallback>NT</Avatar.Fallback></Avatar><span className="cmp-sub" style={{ margin: 0 }}>NinjaType</span></div>
                            <Separator />
                            <Skeleton className="h-4 w-3/4 rounded" /><Skeleton className="h-4 w-1/2 rounded" />
                        </div>
                    </Demo>
                    <Demo title="Theme tokens (read-only)" code="Use var(--token); never hard-code colors.">
                        <div className="cmp-tokens">
                            {TOKENS.map(t => <div className="cmp-token" key={t}><i style={{ background: `var(${t})` }} />{t}</div>)}
                        </div>
                        <div className="cmp-swatches" style={{ marginTop: ".75rem" }}>
                            <ColorSwatch color="#888" size="sm" /> <span className="cmp-sub" style={{ margin: 0 }}>ColorSwatch is used by the navbar theme picker.</span>
                        </div>
                    </Demo>
                </div>
            </Section>

            {/* 5. Page layouts */}
            <Section id="layouts" title="Page layouts" text="Four layouts cover most pages. Content is centred at max 960px with 3rem between sections; headers and footers come from the shared Header/Footer.">
                <div className="cmp-layouts">
                    <Wire title="Tool page" used="/, /learn/, /multiplayer-typing-race/" note="Full-width workspace; help is a floating HelpTrigger.">
                        <div>Header · primary nav</div><div className="fill">Workspace (typing area, toolbar)</div><div>Results / history</div><div>Footer</div>
                    </Wire>
                    <Wire title="Information page" used="/help/, /about/, /contact/" note="Title, lede, then bordered section cards.">
                        <div>Header</div><div className="hero">Eyebrow · H1 · lede</div>
                        <div className="cols c2"><div>Section card</div><div>Section card</div></div><div>FAQ</div><div>Footer</div>
                    </Wire>
                    <Wire title="Marketing page" used="/advertise/" note="Hero, stats row, two-up cards, full-width card, FAQ.">
                        <div>Header</div><div className="hero">Chip · H1 · lede</div>
                        <div className="cols c2"><div>Stat</div><div>Stat</div></div>
                        <div className="cols c2"><div>Card</div><div>Card</div></div><div>Wide card</div><div>FAQ</div><div>Footer</div>
                    </Wire>
                    <Wire title="Article page" used="/blog/*, /terms-of-service/, /privacy-policy/" note="Sidebar navigation plus a readable prose column.">
                        <div>Header</div>
                        <div className="side"><div>Sidebar nav</div><div className="fill">Prose (H1, body, related)</div></div>
                        <div>Footer</div>
                    </Wire>
                </div>
            </Section>
        </>
    );
}
