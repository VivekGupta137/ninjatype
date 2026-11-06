import type { ShareResult } from './shareResult';

type MessageResult = Pick<ShareResult, 'wpm' | 'speed' | 'streak' | 'message'>;

// IDs are part of shared URLs. Keep their meaning stable; append new variants.
const SPEED_MESSAGES = [
    { lead: 'Hi I can now type at', unit: 'wpm', suffix: '' },
    { lead: 'Just hit', unit: 'wpm!', suffix: '' },
    { lead: 'Reached', unit: 'wpm!', suffix: '' },
    { lead: 'Typing speed:', unit: 'wpm', suffix: '' },
    { lead: 'I can now type', unit: '', suffix: 'words per minute.' },
    { lead: 'Just hit a new milestone:', unit: 'wpm!', suffix: '' },
    { lead: 'Current typing speed:', unit: 'wpm', suffix: '' },
    { lead: 'Achieved', unit: 'wpm', suffix: 'milestone.' },
] as const;
const STREAK_MESSAGES = [
    '{n} {days} streak. Still growing.',
    '{n}-day streak. One day at a time.',
    'Building my habit: {n}-day streak.',
    'Small steps. A {n}-day streak.',
    'My practice streak: {n} {days}.',
    'Showing up adds up: {n}-day streak.',
] as const;

export function isShareMessage(value: unknown, streak: boolean): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value >= 0 &&
        value < (streak ? STREAK_MESSAGES.length : SPEED_MESSAGES.length);
}

/** Plain strings only; no message text from the URL is ever interpreted as markup. */
export function shareMessage(result: MessageResult) {
    const id = isShareMessage(result.message, result.streak !== undefined) ? result.message : 0;
    const expandedUnit = result.speed === 'correct' ? 'correct words per minute' : 'words per minute';
    if (result.streak !== undefined) {
        const lead = STREAK_MESSAGES[id].replace('{n}', String(result.streak)).replace('{days}', result.streak === 1 ? 'day' : 'days');
        return { lead, unit: 'wpm', subtitle: `all-time best · ${expandedUnit}`, text: lead };
    }
    const { lead, unit, suffix } = SPEED_MESSAGES[id];
    const text = [lead, result.wpm, result.speed === 'correct' ? 'correct' : '', unit, suffix].filter(value => value !== '').join(' ');
    const subtitle = id === 4 ? `${expandedUnit}.` : suffix ? `${suffix}${result.speed === 'correct' ? ` · ${expandedUnit}` : ''}` : expandedUnit;
    return { lead, unit, subtitle, text };
}

export function shareMessageOptions(result: MessageResult) {
    const variants = result.streak !== undefined ? STREAK_MESSAGES : SPEED_MESSAGES;
    return variants.map((_, id) => ({ id, text: shareMessage({ ...result, message: id }).text }));
}
