import { expect, mock, test } from 'bun:test';
import { RoomEngine } from './engine';

// Fault injection unavailable in local workerd quotas: preserve its adapter interface and fail the storage write.
mock.module('cloudflare:workers', () => ({ DurableObject: class {
    constructor(public ctx: unknown, public env: unknown) {}
} }));
const { Room } = await import('./room');

test('storage quota failure closes sockets and cannot acknowledge an unpersisted winner on retry', async () => {
    const now = Date.now();
    let nextId = 0;
    const state = RoomEngine.create('Quota-test', 15, now - 10_000, 'original-epoch');
    const engine = new RoomEngine(state, () => 'one two', () => `member-${++nextId}`);
    const a = engine.join({ name: state.name, nickname: 'A', browserId: 'browser-a' }, now - 8000);
    const b = engine.join({ name: state.name, nickname: 'B', browserId: 'browser-b' }, now - 8000);
    engine.command(a, { type: 'ready', value: true }, now - 8000);
    engine.command(b, { type: 'ready', value: true }, now - 8000);
    engine.command(a, { type: 'start' }, now - 8000);
    engine.advance(now - 5000);
    const outputs: string[] = [], closures: number[] = [];
    const socket = (id: string) => {
        let attachment = { id, epoch: state.epoch, window: now, commands: 0, syncs: 0 };
        return { readyState: 1, deserializeAttachment: () => attachment, serializeAttachment: (value: typeof attachment) => { attachment = value; },
            send: (message: string) => outputs.push(message), close: (code: number) => closures.push(code) };
    };
    const sockets = [socket(a), socket(b)];
    let initialization: Promise<unknown> | null = null;
    const context = {
        blockConcurrencyWhile: (callback: () => Promise<unknown>) => { const result = callback(); initialization ??= result; return result; },
        getWebSockets: () => sockets,
        storage: { get: async () => ({ state: structuredClone(state), previousResults: null, receipts: [] }),
            put: async () => { throw new Error('storage quota exhausted'); }, getAlarm: async () => null, setAlarm: async () => {} },
    };
    const room = new Room(context as never, { MULTIPLAYER_ENABLED: 'true' } as never);
    await initialization;
    const command = JSON.stringify({ type: 'finish', roundId: state.round!.id, typedText: state.round!.text, attempts: state.round!.text.length, errors: 0 });
    await expect(room.webSocketMessage(sockets[0] as never, command)).rejects.toThrow('storage quota exhausted');
    expect(outputs).toEqual([]);
    expect(closures).toEqual([1011, 1011]);
    const response = await room.fetch(new Request('https://room/join'));
    expect(response.status).toBe(503);
    expect((await response.json() as { code: string }).code).toBe('unavailable');
    expect(outputs).toEqual([]);
});
