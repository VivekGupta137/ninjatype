import common from '../../src/data/words-1k.json';
import extended from '../../src/data/words-5k.json';
import short from '../../src/data/words-2k-short.json';
import long from '../../src/data/words-2k-long.json';
import medium from '../../src/data/words-5k-med.json';
import brainrot from '../../src/data/brainrot.json';
import type { DictionaryKey } from '../../src/lib/multiplayer/protocol';

const lists: Record<DictionaryKey, string[]> = { '1k': common.words, '5k': extended.words, '2k-short': short.words,
    '2k-long': long.words, '5k-medium': medium.words, brainrot: brainrot.words };
export function raceText(count: number, dictionary: DictionaryKey = '1k', duration?: number): string {
    const list = lists[dictionary];
    const pick = () => list[crypto.getRandomValues(new Uint32Array(1))[0] % list.length];
    if (duration === undefined) {
        // Multiword Brainrot entries still produce exactly the requested word count.
        const words: string[] = [];
        while (words.length < count) words.push(...pick().trim().split(/\s+/));
        return words.slice(0, count).join(' ');
    }
    // More text than the maximum accepted 1000-WPM pace can consume before the timer.
    const target = Math.ceil(duration / 60 * 5000) + 20;
    const words: string[] = [];
    let length = 0;
    while (length < target) { const word = pick().trim().replace(/\s+/g, ' '); words.push(word); length += word.length + 1; }
    return words.join(' ');
}
