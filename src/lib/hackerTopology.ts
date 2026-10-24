export const NETWORK_POSITIONS: Record<string, { x: number; y: number }> = {
    n1: { x: 60, y: 180 },
    n2: { x: 200, y: 180 },
    n3: { x: 350, y: 180 },
    n4: { x: 490, y: 120 },
    n5: { x: 620, y: 75 },
    n6: { x: 170, y: 65 },
    n7: { x: 340, y: 60 },
    n8: { x: 475, y: 35 },
    n9: { x: 485, y: 230 },
    n10: { x: 485, y: 305 },
    n11: { x: 340, y: 300 },
    n12: { x: 200, y: 300 },
    n13: { x: 620, y: 180 },
    n14: { x: 620, y: 290 },
};
export const NETWORK_LINKS: [string, string][] = [
    ["n1", "n2"],
    ["n2", "n3"],
    ["n3", "n4"],
    ["n4", "n5"],
    ["n2", "n6"],
    ["n3", "n7"],
    ["n4", "n8"],
    ["n3", "n9"],
    ["n3", "n10"],
    ["n3", "n11"],
    ["n2", "n12"],
    ["n3", "n13"],
    ["n5", "n14"],
];
/** Return the actual connected route, including both endpoints. */
export function networkRoute(targetId: string, sourceId = "n2"): string[] {
    if (!NETWORK_POSITIONS[targetId] || !NETWORK_POSITIONS[sourceId]) return [];
    const queue = [[sourceId]];
    const seen = new Set([sourceId]);
    while (queue.length) {
        const path = queue.shift()!;
        const current = path.at(-1)!;
        if (current === targetId) return path;
        for (const [a, b] of NETWORK_LINKS) {
            const next = a === current ? b : b === current ? a : null;
            if (!next || seen.has(next)) continue;
            seen.add(next);
            queue.push([...path, next]);
        }
    }
    return [];
}
