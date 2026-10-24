import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { $config } from './config';
import { $history } from './history';
import { $kbSentence, $kbTypedText } from './keyboard';
import {
    $onlineLobbyState, $onlinePlayers, $onlineSentence, $onlineTypedText,
    $onlineCountdown, $onlineWpm, $onlineAccuracy, $onlineErrors,
    $onlineTargetWords, prepareOnlineRace, startOnlineRace, tickOnlineRace,
    typeOnlineText, stopOnlineLobby,
} from './online';
import { completedRaceWords, rankRacePlayers, recordedRacePlayers } from '../lib/onlineRace';

const baseTime = 100_000;
const config = { ...$config.get() };
const history = $history.get();

const recordedHistory = { sessions: [30, 40, 50, 60].map((wpm, index) => ({
    id: `saved-${index}`, timestamp: baseTime - index * 1000, wpm, cpm: wpm * 5,
    duration: 30, accuracy: 95, errors: 2, mode: 'words',
})) };

beforeEach(() => { $history.set(recordedHistory); prepareOnlineRace(15); });
afterEach(() => { stopOnlineLobby(); $history.set(history); });

const start = () => { startOnlineRace(baseTime); tickOnlineRace(baseTime + 3000); };

describe('recorded-attempt race lifecycle', () => {
    test('uses real saved speeds and carries their provenance into the race', () => {
        const opponents = $onlinePlayers.get().filter(player => !player.isYou);
        expect(opponents.map(player => player.avgWpm)).toEqual([30, 40, 50, 60]);
        expect(opponents.map(player => player.recordedAttempt?.id)).toEqual(['saved-0', 'saved-1', 'saved-2', 'saved-3']);
        tickOnlineRace(baseTime + 1000);
        expect(opponents.every(player => player.recordedAttempt?.accuracy === 95)).toBe(true);
    });

    test('empty or sparse history never creates invented opponents', () => {
        $history.set({ sessions: [] });
        prepareOnlineRace();
        expect($onlinePlayers.get()).toHaveLength(1);
        expect($onlinePlayers.get()[0].isYou).toBe(true);
        $history.set({ sessions: recordedHistory.sessions.slice(0, 1) });
        prepareOnlineRace();
        expect($onlinePlayers.get()).toHaveLength(2);
    });

    test('invalid records and duplicate attempts cannot fill race lanes', () => {
        const valid = recordedHistory.sessions[0];
        const opponents = recordedRacePlayers([
            valid, valid, { ...valid, id: 'invalid', wpm: NaN },
            { ...valid, id: 'missing-time', duration: 0 },
            { ...valid, id: 'invalid-date', timestamp: 1e100 },
            { ...valid, id: 'invalid-accuracy', accuracy: 101 },
        ]);
        expect(opponents).toHaveLength(1);
        expect(opponents[0].recordedAttempt?.id).toBe(valid.id);
    });

    test('recorded pace projects onto track length without random speed changes', () => {
        start();
        $onlineSentence.set('the quick fox');
        $onlineTargetWords.set(3);
        tickOnlineRace(baseTime + 7000);
        const previous = $onlinePlayers.get().find(player => player.recordedAttempt?.id === 'saved-0')!;
        expect(previous.currentWpm).toBe(30);
        expect(previous.finishedAt).toBeNull();
        tickOnlineRace(baseTime + 9000);
        const finished = $onlinePlayers.get().find(player => player.recordedAttempt?.id === 'saved-0')!;
        expect(finished.currentWpm).toBe(30);
        expect(finished.finishedAt).toBeCloseTo(5.2);
        expect(finished.progressWords).toBe(3);
    });

    test('prepares a complete track without changing solo settings or text', () => {
        const soloSentence = $kbSentence.get();
        const soloText = $kbTypedText.get();
        prepareOnlineRace(50);
        expect($onlineSentence.get().split(' ')).toHaveLength(50);
        expect($onlinePlayers.get()).toHaveLength(5);
        expect($onlineTargetWords.get()).toBe(50);
        expect($config.get()).toEqual(config);
        expect($kbSentence.get()).toBe(soloSentence);
        expect($kbTypedText.get()).toBe(soloText);
    });

    test('typing and recorded pace progress are blocked until the shared countdown ends', () => {
        startOnlineRace(baseTime);
        typeOnlineText('the', baseTime + 1000);
        tickOnlineRace(baseTime + 1999);
        expect($onlineCountdown.get()).toBe(2);
        expect($onlineLobbyState.get()).toBe('countdown');
        expect($onlineTypedText.get()).toBe('');
        expect($onlinePlayers.get().every(player => player.progressWords === 0)).toBe(true);
        tickOnlineRace(baseTime + 3000);
        expect($onlineLobbyState.get()).toBe('racing');
        expect($onlinePlayers.get().every(player => player.progressWords === 0)).toBe(true);
        tickOnlineRace(baseTime + 4000);
        expect($onlinePlayers.get().filter(player => !player.isYou).every(player => player.progressWords > 0)).toBe(true);
    });

    test('partial and incorrect words do not count as completed words', () => {
        start();
        $onlineSentence.set('the quick fox');
        typeOnlineText('the q', baseTime + 4000);
        expect(completedRaceWords($onlineSentence.get(), $onlineTypedText.get())).toBe(1);
        typeOnlineText('the quix ', baseTime + 4100);
        expect($onlineTypedText.get()).toBe('the quix');
        expect($onlineLobbyState.get()).toBe('racing');
        expect(completedRaceWords($onlineSentence.get(), $onlineTypedText.get())).toBe(1);
    });

    test('correcting an error allows completion while preserving the accuracy cost', () => {
        start();
        $onlineSentence.set('the quick fox');
        $onlineTargetWords.set(3);
        typeOnlineText('x', baseTime + 4000);
        typeOnlineText('', baseTime + 4100);
        typeOnlineText('the quick fox', baseTime + 5000);
        expect($onlineLobbyState.get()).toBe('finished');
        expect($onlineErrors.get()).toBe(1);
        expect($onlineAccuracy.get()).toBeLessThan(100);
        expect($onlinePlayers.get().find(player => player.isYou)?.finishedAt).toBe(2);
        expect($onlinePlayers.get().find(player => player.isYou)?.progressWords).toBe(3);
        expect($onlineWpm.get()).toBe(78);
        expect($history.get().sessions).toHaveLength(recordedHistory.sessions.length + 1);
        typeOnlineText('changed after finish', baseTime + 6000);
        expect($onlineTypedText.get()).toBe('the quick fox');
        expect($history.get().sessions).toHaveLength(recordedHistory.sessions.length + 1);
    });

    test('reset during countdown clears stale progress and prevents a delayed start', () => {
        startOnlineRace(baseTime);
        prepareOnlineRace(30);
        tickOnlineRace(baseTime + 4000);
        expect($onlineLobbyState.get()).toBe('idle');
        expect($onlineTargetWords.get()).toBe(30);
        expect($onlineTypedText.get()).toBe('');
        expect($onlinePlayers.get().every(player => player.progressWords === 0)).toBe(true);
    });

    test('leaving the page stops the race and further ticks or input have no effect', () => {
        start();
        stopOnlineLobby();
        tickOnlineRace(baseTime + 5000);
        typeOnlineText('the', baseTime + 5000);
        expect($onlineLobbyState.get()).toBe('idle');
        expect($onlinePlayers.get()).toEqual([]);
        expect($onlineTypedText.get()).toBe('');
    });

    test('finished racers stay ahead and finish time outranks a higher WPM', () => {
        const player = $onlinePlayers.get()[1];
        const racers = [
            { ...player, id: 'fast', currentWpm: 120, progressWords: 15, finishedAt: 20 },
            { ...player, id: 'early', currentWpm: 80, progressWords: 15, finishedAt: 18 },
            { ...player, id: 'unfinished', currentWpm: 180, progressWords: 14.9, finishedAt: null },
        ];
        expect(rankRacePlayers(racers).map(item => item.id)).toEqual(['early', 'fast', 'unfinished']);
    });
});
