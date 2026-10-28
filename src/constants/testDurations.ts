/** Shared timed-test choices for practice and multiplayer races. */
export const TEST_DURATIONS = [
    { label: '25s', seconds: 25 },
    { label: '45s', seconds: 45 },
    { label: '1m', seconds: 60 },
    { label: '2m', seconds: 120 },
    { label: '5m', seconds: 300 },
] as const;

export function migrateTestDuration(seconds: unknown): unknown {
    return seconds === 15 ? 25 : seconds === 30 ? 45 : seconds;
}
