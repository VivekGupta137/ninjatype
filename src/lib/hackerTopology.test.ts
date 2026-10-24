import { describe, expect, test } from "bun:test";
import {
    NETWORK_LINKS,
    NETWORK_POSITIONS,
    networkRoute,
} from "./hackerTopology";
describe("topology routes", () => {
    test("every displayed host has a real, non-looping route from the relay", () => {
        for (const target of Object.keys(NETWORK_POSITIONS)) {
            const route = networkRoute(target);
            expect(route[0]).toBe("n2");
            expect(route.at(-1)).toBe(target);
            expect(new Set(route).size).toBe(route.length);
            for (let i = 0; i < route.length - 1; i++) {
                expect(
                    NETWORK_LINKS.some(
                        ([a, b]) =>
                            (a === route[i] && b === route[i + 1]) ||
                            (b === route[i] && a === route[i + 1]),
                    ),
                ).toBe(true);
            }
        }
    });
    test("vault traffic follows gateways while same-host routes have no invented hop", () => {
        expect(networkRoute("n5")).toEqual(["n2", "n3", "n4", "n5"]);
        expect(networkRoute("n2")).toEqual(["n2"]);
        expect(networkRoute("unknown")).toEqual([]);
    });
});
