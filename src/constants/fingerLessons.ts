import { FINGER_KEYS, type FingerType } from './fingerKeys';

export const LEVEL_STAR_TARGET = 10;
export const LEVEL_ACCURACY_TARGET = 95;
export const FINGER_LEVEL_COUNT = 3;

export interface FingerLevel {
    name: string;
    keys: string[];
    cue: string;
}

export const FINGER_LEVELS: Record<FingerType, FingerLevel[]> = {
    pointer: [
        { name: 'Home anchors', keys: ['f', 'j'], cue: 'Use the bumps on F and J to find home without looking down.' },
        { name: 'Home and upper reaches', keys: ['f', 'j', 'g', 'h', 'r', 'u', 't', 'y'], cue: 'Add the inward and upper reaches. Return to F and J after each reach.' },
        { name: 'Lower reaches', keys: [...FINGER_KEYS.pointer], cue: 'Add V, B, N and M. Keep your wrists still and return home.' },
    ],
    middle: [
        { name: 'Home anchors', keys: ['d', 'k'], cue: 'Rest on D and K. Alternate hands with a light, steady touch.' },
        { name: 'Upper reaches', keys: ['d', 'k', 'e', 'i'], cue: 'Reach from D to E and K to I, then return home.' },
        { name: 'Lower reaches', keys: [...FINGER_KEYS.middle], cue: 'Add C and comma while keeping your upper and home keys steady.' },
    ],
    ring: [
        { name: 'Home anchors', keys: ['s', 'l'], cue: 'Rest on S and L. Keep your other fingers relaxed.' },
        { name: 'Upper reaches', keys: ['s', 'l', 'w', 'o'], cue: 'Reach from S to W and L to O without moving your whole hand.' },
        { name: 'Lower reaches', keys: [...FINGER_KEYS.ring], cue: 'Add X and period. Use a light touch and return to S and L.' },
    ],
    pinky: [
        { name: 'Home anchors', keys: ['a', ';'], cue: 'Rest on A and semicolon. Start slowly with a light touch.' },
        { name: 'Upper reaches', keys: ['a', ';', 'q', 'p'], cue: 'Reach to Q and P, then return home without stretching your hands.' },
        { name: 'Lower reaches', keys: [...FINGER_KEYS.pinky], cue: 'Add Z and slash. Keep the movement small and controlled.' },
    ],
};

export const getFingerLevel = (finger: FingerType, level: number): FingerLevel =>
    FINGER_LEVELS[finger][Math.max(0, Math.min(FINGER_LEVEL_COUNT - 1, level - 1))];

/** Balanced drills cover every required key; a shuffled cycle avoids fixed patterns. */
export const generateLevelSentence = (finger: FingerType, level: number): string => {
    const keys = getFingerLevel(finger, level).keys;
    let pool: string[] = [];
    return Array.from({ length: 10 }, () => {
        const length = 3 + Math.floor(Math.random() * 4);
        return Array.from({ length }, () => {
            if (!pool.length) {
                pool = [...keys];
                for (let i = pool.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [pool[i], pool[j]] = [pool[j], pool[i]];
                }
            }
            return pool.pop();
        }).join('');
    }).join(' ');
};
