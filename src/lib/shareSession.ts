import { QUOTE_TYPES, WORD_TYPES } from '@/constants/wordTypes';
import type { TypingSession } from '@/store/history';
import { isShareDictionary, type ResultSnapshot } from './shareResult';
import { readPracticeSettings, settingsLabel } from './practiceJourney';

export function practiceShareSnapshot(session: TypingSession): ResultSnapshot {
    const settings = readPracticeSettings(session.practiceSettings);
    const challenge = session.mode === 'time' ? 'time' : session.mode === 'quotes' ? 'quotes' : 'words';
    const sources = { ...WORD_TYPES, ...QUOTE_TYPES };
    const source = session.source && Object.hasOwn(sources, session.source) ? sources[session.source as keyof typeof sources].label : undefined;
    return {
        challenge, wpm: session.wpm, accuracy: session.accuracy, speed: 'raw', duration: session.duration,
        ...(isShareDictionary(session.source) ? { dictionary: session.source } : {}),
        ...(settings ? { detail: settingsLabel(settings) } : source ? { detail: source } : {}),
    };
}
