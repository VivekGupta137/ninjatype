import { SLOT_MS, activeAt, buildSchedule, dayKey, msToNextSlot, withUtm } from "./sponsorRotation";
import type { Sponsor } from "./sponsors";

interface Options { slot?: string; label?: string; interval?: number }

const SVG_NS = "http://www.w3.org/2000/svg";

function infoIcon(size: number, className?: string): SVGElement {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", String(size));
    svg.setAttribute("height", String(size));
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    if (className) svg.setAttribute("class", className);
    for (const [tag, attrs] of [["circle", { cx: "12", cy: "12", r: "10" }], ["path", { d: "M12 16v-4" }], ["path", { d: "M12 8h.01" }]] as const) {
        const n = document.createElementNS(SVG_NS, tag);
        for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
        svg.append(n);
    }
    return svg;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (text !== undefined) n.textContent = text;
    return n;
}

function externalAttrs(a: HTMLAnchorElement, href: string) {
    a.href = href;
    a.target = "_blank";
    a.rel = "sponsored nofollow noopener noreferrer";
}

function buildItem(s: Sponsor, o: Required<Options>): HTMLElement {
    const href = withUtm(s.url, o.slot);
    const item = el("div", "fss-item");

    const link = el("a", "fss-link");
    externalAttrs(link, href);
    link.setAttribute("aria-label", `${o.label}: ninjatype × ${s.name}${s.description ? `. ${s.description}` : ""}`);
    const brand = el("span", "fss-brand");
    const x = el("span", undefined, "×");
    x.setAttribute("aria-hidden", "true");
    brand.append("ninjatype ", x, " ", el("strong", undefined, s.name));
    const ext = el("span", "fss-ext", "↗");
    ext.setAttribute("aria-hidden", "true");
    link.append(infoIcon(14), brand, ext);

    const tip = el("div", "fss-tip");
    tip.setAttribute("aria-hidden", "true");
    const card = el("a", "fss-card");
    externalAttrs(card, href);
    card.tabIndex = -1;
    const body = el("div", "fss-card-body");
    body.append(el("span", "fss-card-label", o.label), el("strong", undefined, s.name));
    if (s.description) body.append(el("span", "fss-card-text", s.description));
    card.append(infoIcon(18, "fss-card-icon"), body, el("span", "fss-card-go", "↗"));
    tip.append(card);

    item.append(link, tip);
    return item;
}

/**
 * Renders the footer sponsor strip into `host` and starts the rotation: autoplay,
 * pause on hover/focus/touch/hidden tab, start sponsor moves every 15 minutes.
 * Returns a cleanup function. An empty list leaves the host hidden.
 */
export function mountSponsorStrip(host: HTMLElement, sponsors: Sponsor[], options: Options = {}): () => void {
    const o = { slot: "footer", label: "Sponsored", interval: SLOT_MS, ...options };
    host.replaceChildren();
    host.hidden = sponsors.length === 0;
    if (sponsors.length === 0) return () => {};

    host.setAttribute("role", "complementary");
    host.setAttribute("aria-label", o.label);
    const items = sponsors.map(s => buildItem(s, o));
    host.append(...items);

    // Wall-clock schedule: everyone sees the same sponsor at the same moment (see lib/sponsorRotation).
    const schedule = buildSchedule(sponsors, dayKey());
    let index = activeAt(schedule, Date.now(), o.interval);
    let paused = false;
    let timer: number | undefined;
    let touch: number | undefined;
    const cleanups: (() => void)[] = [];

    const show = () => items.forEach((item, i) => {
        const on = i === index;
        item.dataset.active = String(on);
        item.setAttribute("aria-hidden", String(!on));
        item.querySelector<HTMLElement>(".fss-link")!.tabIndex = on ? 0 : -1;
    });
    const stop = () => { window.clearTimeout(timer); timer = undefined; };
    // Wakes at each slot boundary and follows the clock. While paused or hidden it holds the current sponsor.
    const arm = () => {
        stop();
        if (items.length < 2 || paused || document.hidden) return;
        timer = window.setTimeout(() => { index = activeAt(schedule, Date.now(), o.interval); show(); arm(); }, msToNextSlot(Date.now(), o.interval));
    };
    const pause = (v: boolean) => { paused = v; arm(); };
    const on = (t: EventTarget, e: string, fn: EventListener) => { t.addEventListener(e, fn); cleanups.push(() => t.removeEventListener(e, fn)); };
    const onVisible = () => { if (!document.hidden && !paused) { index = activeAt(schedule, Date.now(), o.interval); show(); } arm(); };

    on(host, "mouseenter", () => pause(true));
    on(host, "mouseleave", () => pause(false));
    on(host, "focusin", () => pause(true));
    on(host, "focusout", () => pause(false));
    on(host, "touchstart", () => { pause(true); window.clearTimeout(touch); touch = window.setTimeout(() => pause(false), 8000); });
    on(document, "visibilitychange", onVisible);
    show();
    arm();

    return () => { stop(); window.clearTimeout(touch); cleanups.forEach(fn => fn()); host.replaceChildren(); host.hidden = true; };
}
