import { describe, expect, test } from "bun:test";
import { activeAt, buildSchedule, dayKey, hash32, msToNextSlot, withUtm } from "./sponsorRotation";

const S = (id: string, weight?: number) => ({ id, name: id, weight });
const DAY = "2027-06-15";

describe("buildSchedule", () => {
    test("includes everyone once by default", () => {
        const sch = buildSchedule([S("a"), S("b"), S("c")], DAY);
        expect([...sch].sort()).toEqual([0, 1, 2]);
    });
    test("is deterministic and independent of list order", () => {
        const ids = ["a", "b", "c", "d"];
        const names = (list: string[]) => buildSchedule(list.map(i => S(i)), DAY).map(i => list[i]);
        expect(names(ids)).toEqual(names([...ids].reverse()));
        expect(names(ids)).toEqual(names(ids));
    });
    test("order changes between days", () => {
        const items = ["a", "b", "c", "d", "e", "f"].map(i => S(i));
        const orders = new Set(["2027-06-15", "2027-06-16", "2027-06-17", "2027-06-18"].map(d => buildSchedule(items, d).join()));
        expect(orders.size).toBeGreaterThan(1);
    });
    test("weight repeats a sponsor, spread out", () => {
        const items = [S("a", 2), S("b"), S("c")];
        const sch = buildSchedule(items, DAY);
        expect(sch.length).toBe(4);
        expect(sch.filter(i => i === 0).length).toBe(2);
        expect(sch[0] === sch[1]).toBe(false);
        expect(sch[1] === sch[2]).toBe(false);
    });
    test("no sponsor twice in a row when avoidable, wrap included", () => {
        for (const day of ["2027-06-15", "2027-06-16", "2027-06-17", "2027-06-18", "2027-06-19"]) {
            const sch = buildSchedule([S("a", 2), S("b"), S("c"), S("d", 2), S("e")], day);
            expect(sch.length).toBe(7);
            sch.forEach((v, k) => expect(v).not.toBe(sch[(k + 1) % sch.length]));
        }
    });
    test("bad weights fall back to 1 and are capped", () => {
        expect(buildSchedule([S("a", 0), S("b", 1.5), S("c", -2)], DAY).length).toBe(3);
        expect(buildSchedule([S("a", 999)], DAY).length).toBe(10);
    });
    test("empty list", () => expect(buildSchedule([], DAY)).toEqual([]));
});

describe("activeAt", () => {
    const sch = [2, 0, 1];
    test("same sponsor within a slot, next one after", () => {
        const t = 30_000 * 1000;
        expect(activeAt(sch, t)).toBe(activeAt(sch, t + 29_999));
        expect(activeAt(sch, t + 30_000)).toBe(sch[(1000 + 1) % 3]);
    });
    test("equal share across a full cycle", () => {
        const counts = [0, 0, 0];
        for (let k = 0; k < 300; k++) counts[activeAt(sch, k * 30_000)]++;
        expect(counts).toEqual([100, 100, 100]);
    });
    test("empty schedule is safe", () => expect(activeAt([], 123)).toBe(0));
});

describe("helpers", () => {
    test("dayKey is the UTC day", () => expect(dayKey(Date.parse("2027-06-15T23:59:59Z"))).toBe("2027-06-15"));
    test("hash32 is stable", () => expect(hash32("a|2027-06-15")).toBe(hash32("a|2027-06-15")));
    test("msToNextSlot is within (0, slot]", () => {
        expect(msToNextSlot(30_000)).toBe(30_000);
        expect(msToNextSlot(30_001)).toBe(29_999);
    });
    test("withUtm adds tags and keeps existing ones", () => {
        const u = new URL(withUtm("https://example.com/?utm_source=x", "header"));
        expect(u.searchParams.get("utm_source")).toBe("x");
        expect(u.searchParams.get("utm_campaign")).toBe("header");
    });
    test("withUtm leaves invalid input unchanged", () => expect(withUtm("nope", "a")).toBe("nope"));
});
