export const wordOffsets = (text: string): number[] => [...text.matchAll(/\S+/g)].map(match => match.index!);
export function typingWindow(text: string, typedText: string, offsets: number[], limit = 60) {
    let low = 0, high = offsets.length;
    while (low < high) { const middle = (low + high) >>> 1; if (offsets[middle] <= typedText.length) low = middle + 1; else high = middle; }
    const start = Math.max(0, low - 1 - 8), at = offsets[start] ?? 0, end = offsets[start + limit] ?? text.length;
    return { start: at, text: text.slice(at, end).trimEnd(), typedText: typedText.slice(at, end) };
}
