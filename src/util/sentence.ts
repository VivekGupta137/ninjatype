export const createSentenceFromWords = (
    words: string[] | undefined,
    maxWords: number
): string => {
    if (!words || words.length === 0) {
        return "";
    }
    let sentence = "";
    for (let i = 0; i < maxWords; i++) {
        const randomIndex = Math.floor(Math.random() * words.length);
        sentence += words[randomIndex] + " ";
    }
    return sentence.trim();
};

export const genOneWord = (words: string[] | undefined): string => {
    if (!words || words.length === 0) {
        return "";
    }
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
}