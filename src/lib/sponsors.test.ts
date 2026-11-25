import { describe, expect, test } from "bun:test";
import { isActive, parseSponsors, resolvePreview, customSponsor, parseCountdown, sponsorsForSlot, type SponsorEntry } from "./sponsors";

const raw = (o: object = {}) => ({ id: "acme", name: "Acme", tagline: "Hi", url: "https://acme.com", enabled: true, ...o });
const entry = (o: Partial<SponsorEntry> = {}) => parseSponsors({ sponsors: [raw(o)] })[0];
const NOW = Date.parse("2027-06-15T12:00:00Z");

describe("parseSponsors", () => {
    test("maps tagline to description and defaults slots", () => {
        const e = entry();
        expect(e.description).toBe("Hi");
        expect(e.slots).toEqual(["footer", "results"]);
    });
    test("drops invalid entries and duplicates", () => {
        const list = parseSponsors({ sponsors: [raw(), raw(), raw({ id: "b", url: "http://x.com" }), raw({ id: "c", name: "" }), raw({ id: "Bad Id" }), null] });
        expect(list.map(s => s.id)).toEqual(["acme"]);
    });
    test("only local logo paths and valid dates", () => {
        expect(entry({ logo: "https://evil.com/x.png" }).logo).toBeUndefined();
        expect(entry({ logo: "//evil.com/x.png" }).logo).toBeUndefined();
        expect(entry({ logo: "/sponsors/a.png" }).logo).toBe("/sponsors/a.png");
        expect(entry({ endDate: "soon" }).endDate).toBeUndefined();
        expect(entry({ startDate: "2027-13-45" }).startDate).toBeUndefined();
    });
    test("enabled must be literally true; bad input gives []", () => {
        expect(entry({ enabled: "yes" as never }).enabled).toBe(false);
        expect(parseSponsors(null)).toEqual([]);
        expect(parseSponsors({ sponsors: "x" })).toEqual([]);
    });
});

describe("weight", () => {
    test("defaults to 1, accepts 1-10, rejects junk", () => {
        expect(entry().weight).toBe(1);
        expect(entry({ weight: 3 }).weight).toBe(3);
        expect(entry({ weight: 99 }).weight).toBe(10);
        expect(entry({ weight: 0 }).weight).toBe(1);
        expect(entry({ weight: 1.5 }).weight).toBe(1);
        expect(entry({ weight: "2" as never }).weight).toBe(1);
    });
});

describe("isActive", () => {
    test("disabled is inactive", () => expect(isActive(entry({ enabled: false }), NOW)).toBe(false));
    test("no expiry stays active", () => expect(isActive(entry(), NOW)).toBe(true));
    test("end date is inclusive", () => {
        expect(isActive(entry({ endDate: "2027-06-15" }), NOW)).toBe(true);
        expect(isActive(entry({ endDate: "2027-06-14" }), NOW)).toBe(false);
    });
    test("start date is inclusive", () => {
        expect(isActive(entry({ startDate: "2027-06-15" }), NOW)).toBe(true);
        expect(isActive(entry({ startDate: "2027-06-16" }), NOW)).toBe(false);
    });
    test("window with both dates", () => {
        const e = entry({ startDate: "2027-06-01", endDate: "2027-06-30" });
        expect(isActive(e, NOW)).toBe(true);
        expect(isActive(e, Date.parse("2027-05-31T23:59:59Z"))).toBe(false);
        expect(isActive(e, Date.parse("2027-07-01T00:00:00Z"))).toBe(false);
    });
});

describe("sponsorsForSlot", () => {
    const list = parseSponsors({ sponsors: [raw(), raw({ id: "off", name: "Off", enabled: false }), raw({ id: "foot", name: "Foot", slots: ["footer"] })] });
    test("active sponsors for the slot", () => {
        expect(sponsorsForSlot(list, "results", NOW).map(s => s.name)).toEqual(["Acme"]);
        expect(sponsorsForSlot(list, "footer", NOW).map(s => s.name)).toEqual(["Acme", "Foot"]);
    });
    test("preview shows a disabled sponsor alone", () => {
        expect(sponsorsForSlot(list, "footer", NOW, { tag: "off", countdown: null }).map(s => s.name)).toEqual(["Off"]);
    });
    test("preview ignored when unknown or slot not booked", () => {
        expect(sponsorsForSlot(list, "footer", NOW, { tag: "nope", countdown: null }).length).toBe(2);
        expect(sponsorsForSlot(list, "results", NOW, { tag: "foot", countdown: null }).map(s => s.name)).toEqual(["Acme"]);
    });
});

describe("resolvePreview", () => {
    test("no param, empty or off means no preview", () => {
        expect(resolvePreview("")).toBeNull();
        expect(resolvePreview("?preview=")).toBeNull();
        expect(resolvePreview("?preview=off")).toBeNull();
        expect(resolvePreview("?other=1")).toBeNull();
    });
    test("id is lower-cased", () => expect(resolvePreview("?preview=Acme")?.tag).toBe("acme"));
    test("any other value still turns preview on", () => {
        expect(resolvePreview("?preview=whatever")?.tag).toBe("whatever");
        expect(resolvePreview("?preview=<script>")?.tag).toBe("unknown");
    });
    test("custom sponsor from the URL", () => {
        const st = resolvePreview("?preview=custom&name=Acme%20Keys&tagline=Fast%20boards&slots=footer");
        expect(st?.custom?.name).toBe("Acme Keys");
        expect(st?.custom?.slots).toEqual(["footer"]);
        expect(st?.custom?.description).toBe("Fast boards");
    });
    test("custom without a name is badge-only", () => expect(resolvePreview("?preview=custom")).toEqual({ tag: "custom", countdown: 120 }));
});

describe("preview=ads", () => {
    test("shows a sample sponsor in both spots", () => {
        const st = resolvePreview("?preview=ads");
        expect(st?.custom?.name).toBe("Your brand");
        expect(sponsorsForSlot([], "footer", NOW, st).length).toBe(1);
        expect(sponsorsForSlot([], "results", NOW, st).length).toBe(1);
    });
    test("id is reserved", () => expect(parseSponsors({ sponsors: [raw({ id: "ads" })] })).toEqual([]));
});

describe("countdown", () => {
    test("120 seconds by default", () => expect(resolvePreview("?preview=x")?.countdown).toBe(120));
    test("can be turned off or set", () => {
        expect(resolvePreview("?preview=x&countdown=off")?.countdown).toBeNull();
        expect(resolvePreview("?preview=x&countdown=0")?.countdown).toBeNull();
        expect(resolvePreview("?preview=x&countdown=300")?.countdown).toBe(300);
    });
    test("clamped, junk falls back to default", () => {
        expect(parseCountdown("2")).toBe(10);
        expect(parseCountdown("99999")).toBe(1800);
        expect(parseCountdown("soon")).toBe(120);
    });
});

describe("customSponsor", () => {
    test("defaults and limits", () => {
        const c = customSponsor({ name: "  A".padEnd(80, "x"), tagline: "t".repeat(300), slots: "bogus", url: "http://nope.com" })!;
        expect(c.name.length).toBe(40);
        expect(c.description.length).toBe(100);
        expect(c.slots).toEqual(["footer", "results"]);
        expect(c.url).toBe("https://www.ninjatype.com/advertise/");
    });
    test("accepts https url and both slots", () => {
        const c = customSponsor({ name: "A", url: "https://acme.com/x", slots: "results, footer" })!;
        expect(c.url).toBe("https://acme.com/x");
        expect(c.slots).toEqual(["footer", "results"]);
    });
    test("needs a name", () => expect(customSponsor({ tagline: "x" })).toBeNull());
    test("custom preview shows only in its slots", () => {
        const c = customSponsor({ name: "A", slots: "footer" })!;
        expect(sponsorsForSlot([], "footer", NOW, { tag: "custom", custom: c, countdown: null }).map(s => s.name)).toEqual(["A"]);
        expect(sponsorsForSlot([], "results", NOW, { tag: "custom", custom: c, countdown: null })).toEqual([]);
    });
});
