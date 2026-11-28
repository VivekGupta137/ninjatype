import { expect, test } from "bun:test";
import { drillTitle, saveDrill } from "./trainingDrill";
import { $activeRun, $lowercase, $materials, loadMaterials } from "./customMaterial";

test("drill titles carry the keys and a readable date", () => {
    expect(drillTitle("2026-11-28", ["e", "t"])).toBe("Training drill · E, T · 28 Nov 2026");
    expect(drillTitle("2026-01-05", ["q"])).toBe("Training drill · Q · 5 Jan 2026");
});

test("starting the same drill again reuses its normalized material title", () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
    const previous = { materials: $materials.get(), active: $activeRun.get(), lowercase: $lowercase.get() };
    const values = new Map<string, string>();
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
    } });
    try {
        const first = saveDrill("tree test", "2026-11-28", ["t"]);
        const second = saveDrill("test tree", "2026-11-28", ["t"]);
        expect(first).toBeTruthy();
        expect(second).toBe(first);
        expect(loadMaterials()).toHaveLength(1);
        expect(loadMaterials()[0].text).toBe("test tree");
    } finally {
        if (original) Object.defineProperty(globalThis, "localStorage", original);
        else Reflect.deleteProperty(globalThis, "localStorage");
        $materials.set(previous.materials);
        $activeRun.set(previous.active);
        $lowercase.set(previous.lowercase);
    }
});
