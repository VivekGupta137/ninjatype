import type { FetchWordListType } from "@/store/fetcher";
import { FINGER_KEYS, type FingerType } from "@/constants/fingerKeys";

// Configuration constants for word generation
const WORD_GENERATION_CONFIG = {
    MIN_WORD_LENGTH: 3,
    MAX_WORD_LENGTH: 6,
    DEFAULT_WORD_COUNT: 25,
} as const;

/**
 * Creates a sentence from a fetched word list
 * @param fetchedWords - The fetched word list data
 * @param maxWords - Maximum number of words to include in the sentence
 * @returns A sentence string with the specified number of words
 */
export const createSentenceFromWords = (
    fetchedWords: FetchWordListType | null,
    maxWords: number
): string => {
    if (!fetchedWords || fetchedWords.length === 0) {
        return "";
    }
    if( fetchedWords.type !== "wordlist") {
        return "";
    }
    let sentence = "";
    let wordCount = 0;

    while(wordCount < maxWords) {
        const randomIndex = Math.floor(Math.random() * fetchedWords.words.length);
        sentence += fetchedWords.words[randomIndex] + " ";
        wordCount = sentence.trim().split(" ").length;
    }

    if( wordCount > maxWords ) {
        const wordsArray = sentence.trim().split(" ");
        sentence = wordsArray.slice(0, maxWords).join(" ");
    }

    return sentence.trim();
};

/**
 * Creates a sentence from a fetched quotes list
 * @param fetchedQuotes - The fetched quotes data
 * @returns A random quote from the list
 */
export const createSentenceFromQuotes = (
    fetchedQuotes: FetchWordListType | null): string => {
    if (!fetchedQuotes || fetchedQuotes.length === 0) {
        return "";
    }
    if( fetchedQuotes.type !== "quotelist") {
        return "";
    }
    const randomIndex = Math.floor(Math.random() * fetchedQuotes.quotes.length);
    return fetchedQuotes.quotes[randomIndex].quote;
};

/**
 * Generates a single random word from a word list
 * @param fetchedWords - The fetched word list data
 * @returns A random word from the list
 */
export const genOneWord = (fetchedWords: FetchWordListType | null): string => {
    if (!fetchedWords || fetchedWords.length === 0) {
        return "";
    }
    if( fetchedWords.type !== "wordlist") {
        return "";
    }
    const randomIndex = Math.floor(Math.random() * fetchedWords.words.length);
    return fetchedWords.words[randomIndex];
}

/**
 * Generates a random integer between min and max (inclusive)
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Random integer in the specified range
 */
const getRandomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Selects a random element from an array
 * @param array - The array to select from
 * @returns A random element from the array
 */
const getRandomElement = <T>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)];
};

/**
 * Generates a random word using only keys assigned to a specific finger
 * Used for touch typing practice to isolate finger movements
 * 
 * @param finger - The finger type (index, middle, ring, or pinky)
 * @param allowedKeys - Optional subset of keys to use (for customization)
 * @returns A random word composed only of keys for that finger
 * 
 * @example
 * generateFingerWord('index') // might return "fjhbr" or "mtyng"
 * generateFingerWord('pinky') // might return "qaz" or "paqa"
 * generateFingerWord('index', ['f', 'j']) // only uses 'f' and 'j'
 */
export const generateFingerWord = (finger: FingerType, allowedKeys?: string[]): string => {
    const keys = allowedKeys || FINGER_KEYS[finger];
    
    if (!keys || keys.length === 0) {
        console.warn(`No keys found for finger: ${finger}`);
        return "";
    }
    
    const wordLength = getRandomInt(
        WORD_GENERATION_CONFIG.MIN_WORD_LENGTH,
        WORD_GENERATION_CONFIG.MAX_WORD_LENGTH
    );
    
    let word = "";
    for (let i = 0; i < wordLength; i++) {
        word += getRandomElement(keys);
    }
    
    return word;
};

/**
 * Generates a complete sentence for finger-specific typing practice
 * Creates multiple random words using only the keys assigned to the specified finger
 * 
 * @param finger - The finger type to generate practice text for
 * @param wordCount - Number of words to include in the sentence (default: 25)
 * @param allowedKeys - Optional subset of keys to use (for customization)
 * @returns A space-separated sentence of random words for the specified finger
 * 
 * @example
 * generateFingerSentence('index', 10) 
 * // might return "fjh bygr mhtn bfrj tyng..."
 * generateFingerSentence('index', 10, ['f', 'j'])
 * // only uses 'f' and 'j' keys
 * 
 * @remarks
 * - Each word is 3-6 characters long
 * - Words are composed only of keys for the specified finger
 * - Useful for building muscle memory in touch typing practice
 */
export const generateFingerSentence = (
    finger: FingerType, 
    wordCount: number = WORD_GENERATION_CONFIG.DEFAULT_WORD_COUNT,
    allowedKeys?: string[]
): string => {
    if (wordCount <= 0) {
        console.warn(`Invalid word count: ${wordCount}. Must be positive.`);
        return "";
    }
    
    const words: string[] = [];
    
    for (let i = 0; i < wordCount; i++) {
        const word = generateFingerWord(finger, allowedKeys);
        if (word) {
            words.push(word);
        }
    }
    
    return words.join(" ");
};