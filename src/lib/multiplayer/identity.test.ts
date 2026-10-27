import { expect, test } from 'bun:test';
import { defaultNickname, defaultRoomName } from './identity';
import { avatarSettings, DEFAULT_AVATAR, nickname, roomName } from './protocol';
test('generated two-word defaults pass room and nickname validation', () => {
    for (let i = 0; i < 100; i++) {
        const name = defaultNickname(), room = defaultRoomName();
        expect(nickname(name)).toBe(name);
        expect(roomName(room)).toBe(room);
        expect(name).toMatch(/^Ninja-[A-Za-z]+$/);
        expect(room).toMatch(/^The-[A-Za-z0-9]+$/);
    }
});
test('avatar settings accept legacy defaults and bound styles, colors and variation', () => {
    expect(avatarSettings(undefined)).toEqual(DEFAULT_AVATAR);
    expect(avatarSettings({ style: 'fun-emoji', background: 'c0aede', variant: 31, extra: 'ignored' })).toEqual({ style: 'fun-emoji', background: 'c0aede', variant: 31 });
    for (const value of [null, [], { ...DEFAULT_AVATAR, style: 'unknown' }, { ...DEFAULT_AVATAR, background: 'url(external)' }, { ...DEFAULT_AVATAR, variant: 32 }, { ...DEFAULT_AVATAR, variant: -1 }, { ...DEFAULT_AVATAR, variant: 0.5 }])
        expect(() => avatarSettings(value)).toThrow();
});
test('avatar seeds survive nickname-independent transport and reject oversized or invalid values', () => {
    const settings = { ...DEFAULT_AVATAR, seed: 'random-1234_seed' };
    expect(avatarSettings(settings)).toEqual(settings);
    for (const seed of ['', 'a'.repeat(65), '<script>', 42, null]) expect(() => avatarSettings({ ...DEFAULT_AVATAR, seed })).toThrow();
});
