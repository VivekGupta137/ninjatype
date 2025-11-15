/**
 * Touch Typing Finger Key Mappings
 * 
 * Defines which keyboard keys each finger should type in the standard
 * QWERTY touch typing system (home row position).
 * 
 * Based on standard touch typing conventions:
 * - Left hand: ASDF (pinky to index)
 * - Right hand: JKL; (index to pinky)
 * 
 * @module fingerKeys
 */

/**
 * The four primary finger types used in touch typing
 */
export type FingerType = 'pointer' | 'middle' | 'ring' | 'pinky';

/**
 * Keyboard key assignments for each finger type
 * 
 * Layout follows standard QWERTY touch typing system:
 * - Index fingers: Cover F/J home keys plus adjacent keys (most keys)
 * - Middle fingers: Cover D/K home keys plus adjacent keys
 * - Ring fingers: Cover S/L home keys plus adjacent keys
 * - Pinky fingers: Cover A/; home keys plus edge keys
 * 
 * Note: Special keys (Shift, Ctrl, Space, etc.) are excluded for simplicity
 * 
 * @example
 * FINGER_KEYS.index // ['f', 'g', 'r', 't', 'v', 'b', 'j', 'h', 'u', 'y', 'n', 'm']
 */
export const FINGER_KEYS: Record<FingerType, string[]> = {
    // Index fingers handle the most keys (F/J home position)
    // Left: F, R, T, V, B, G
    // Right: J, U, Y, H, N, M
    pointer: ['f', 'g', 'r', 't', 'v', 'b', 'j', 'h', 'u', 'y', 'n', 'm'],
    
    // Middle fingers (D/K home position)
    // Left: D, E, C
    // Right: K, I, comma
    middle: ['d', 'e', 'c', 'k', 'i', ','],
    
    // Ring fingers (S/L home position)
    // Left: S, W, X
    // Right: L, O, period
    ring: ['s', 'w', 'x', 'l', 'o', '.'],
    
    // Pinky fingers (A/; home position)
    // Left: A, Q, Z
    // Right: semicolon, P, slash
    pinky: ['a', 'q', 'z', ';', 'p', '/']
};

/**
 * Display names for each finger type
 * Used in UI components for better readability
 * 
 * @example
 * FINGER_NAMES.pointer // "Index Finger"
 */
export const FINGER_NAMES: Record<FingerType, string> = {
    pointer: 'Index Finger',
    middle: 'Middle Finger',
    ring: 'Ring Finger',
    pinky: 'Pinky Finger'
};

/**
 * Get all keys assigned to a specific finger
 * 
 * @param finger - The finger type to get keys for
 * @returns Array of lowercase key strings for that finger
 * 
 * @example
 * getFingerKeys('index') // ['f', 'g', 'r', 't', 'v', 'b', 'j', 'h', 'u', 'y', 'n', 'm']
 * getFingerKeys('pinky') // ['a', 'q', 'z', ';', 'p', '/']
 */
export const getFingerKeys = (finger: FingerType): string[] => {
    return FINGER_KEYS[finger] || [];
};

/**
 * Check if a keyboard key belongs to a specific finger
 * Case-insensitive comparison
 * 
 * @param key - The keyboard key to check
 * @param finger - The finger type to check against
 * @returns true if the key is assigned to that finger, false otherwise
 * 
 * @example
 * isKeyForFinger('f', 'index') // true
 * isKeyForFinger('F', 'index') // true (case-insensitive)
 * isKeyForFinger('a', 'index') // false
 */
export const isKeyForFinger = (key: string, finger: FingerType): boolean => {
    return FINGER_KEYS[finger].includes(key.toLowerCase());
};

/**
 * Get all valid finger types in order
 * Useful for iteration and mapping operations
 * 
 * @returns Array of all four finger types
 * 
 * @example
 * getAllFingers().map(finger => ({
 *   name: FINGER_NAMES[finger],
 *   keys: getFingerKeys(finger)
 * }))
 */
export const getAllFingers = (): FingerType[] => {
    return ['pointer', 'middle', 'ring', 'pinky'];
};
