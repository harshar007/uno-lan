import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { io as ClientSocket, Socket as ClientSocketType } from 'socket.io-client';
import { createServerApp } from '../index';
import http from 'http';

describe('STACK UNO Multiplayer Server Integration', () => {
  let server: http.Server;
  let serverPort: number;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const serverApp = createServerApp();
    server = serverApp.server;

    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const address = server.address();
        if (address && typeof address !== 'string') {
          serverPort = address.port;
        }
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  function createClient(): Promise<ClientSocketType> {
    return new Promise((resolve) => {
      const socket = ClientSocket(`http://127.0.0.1:${serverPort}`, {
        transports: ['websocket'],
        forceNew: true,
      });
      socket.on('connect', () => resolve(socket));
    });
  }

  it('allows host to create a room and receive session token', async () => {
    const client = await createClient();

    const response = await new Promise<any>((resolve) => {
      client.emit(
        'room:create',
        { playerName: 'HostAlice', gameMode: 'classic', maxPlayers: 4 },
        resolve
      );
    });

    expect(response.success).toBe(true);
    expect(response.room.code).toBeDefined();
    expect(response.room.playerCount).toBe(1);
    expect(response.playerId).toBeDefined();
    expect(response.sessionToken).toBeDefined();

    client.disconnect();
  });

  it('allows second player to join and prevents exceeding player limit', async () => {
    const host = await createClient();
    const guest = await createClient();
    const guest2 = await createClient();

    const createRes = await new Promise<any>((resolve) => {
      host.emit(
        'room:create',
        { playerName: 'HostPlayer', maxPlayers: 2 },
        resolve
      );
    });
    const code = createRes.room.code;

    const joinRes = await new Promise<any>((resolve) => {
      guest.emit('room:join', { roomCode: code, playerName: 'Guest1' }, resolve);
    });

    expect(joinRes.success).toBe(true);
    expect(joinRes.room.playerCount).toBe(2);

    // Third player tries to join room with maxPlayers=2
    const fullRes = await new Promise<any>((resolve) => {
      guest2.emit('room:join', { roomCode: code, playerName: 'Guest2' }, resolve);
    });

    expect(fullRes.success).toBe(false);
    expect(fullRes.error).toContain('full');

    host.disconnect();
    guest.disconnect();
    guest2.disconnect();
  });

  it('enforces host permission when starting a game', async () => {
    const host = await createClient();
    const guest = await createClient();

    const createRes = await new Promise<any>((resolve) => {
      host.emit('room:create', { playerName: 'Host' }, resolve);
    });
    const code = createRes.room.code;

    const joinRes = await new Promise<any>((resolve) => {
      guest.emit('room:join', { roomCode: code, playerName: 'Guest' }, resolve);
    });

    // Guest tries to start room -> rejected
    const guestStart = await new Promise<any>((resolve) => {
      guest.emit('room:start', { roomCode: code, sessionToken: joinRes.sessionToken }, resolve);
    });
    expect(guestStart.success).toBe(false);
    expect(guestStart.error).toContain('Only the room host');

    // Host starts room -> succeeds
    const hostStart = await new Promise<any>((resolve) => {
      host.emit('room:start', { roomCode: code, sessionToken: createRes.sessionToken }, resolve);
    });
    expect(hostStart.success).toBe(true);

    host.disconnect();
    guest.disconnect();
  });

  it('delivers private hands to respective players and isolates opponent cards', async () => {
    const host = await createClient();
    const guest = await createClient();

    const createRes = await new Promise<any>((resolve) => {
      host.emit('room:create', { playerName: 'Host' }, resolve);
    });
    const code = createRes.room.code;

    const joinRes = await new Promise<any>((resolve) => {
      guest.emit('room:join', { roomCode: code, playerName: 'Guest' }, resolve);
    });

    // Listen for private hands
    const hostHandPromise = new Promise<any>((resolve) => {
      host.on('game:hand', resolve);
    });
    const guestHandPromise = new Promise<any>((resolve) => {
      guest.on('game:hand', resolve);
    });

    // Host starts game
    await new Promise<any>((resolve) => {
      host.emit('room:start', { roomCode: code, sessionToken: createRes.sessionToken }, resolve);
    });

    const hostHand = await hostHandPromise;
    const guestHand = await guestHandPromise;

    expect(hostHand.hand.length).toBeGreaterThanOrEqual(7);
    expect(guestHand.hand.length).toBeGreaterThanOrEqual(7);

    // Host hand cards must not match guest hand cards (each has distinct private cards)
    const hostCardIds = new Set(hostHand.hand.map((c: any) => c.id));
    guestHand.hand.forEach((card: any) => {
      expect(hostCardIds.has(card.id)).toBe(false);
    });

    host.disconnect();
    guest.disconnect();
  });

  it('supports player reconnection with session token', async () => {
    const host = await createClient();
    const guest = await createClient();

    const createRes = await new Promise<any>((resolve) => {
      host.emit('room:create', { playerName: 'Host' }, resolve);
    });
    const code = createRes.room.code;

    const joinRes = await new Promise<any>((resolve) => {
      guest.emit('room:join', { roomCode: code, playerName: 'Guest' }, resolve);
    });

    // Guest disconnects
    guest.disconnect();

    // Guest reconnects on a new socket using sessionToken
    const newGuestSocket = await createClient();
    const reconnectRes = await new Promise<any>((resolve) => {
      newGuestSocket.emit(
        'player:reconnect',
        { roomCode: code, sessionToken: joinRes.sessionToken },
        resolve
      );
    });

    expect(reconnectRes.success).toBe(true);
    expect(reconnectRes.room.code).toBe(code);

    host.disconnect();
    newGuestSocket.disconnect();
  });

  it('handles room:leave and promotes new host if host leaves lobby', async () => {
    const host = await createClient();
    const guest = await createClient();

    const createRes = await new Promise<any>((resolve) => {
      host.emit('room:create', { playerName: 'HostUser' }, resolve);
    });
    const code = createRes.room.code;

    const joinRes = await new Promise<any>((resolve) => {
      guest.emit('room:join', { roomCode: code, playerName: 'GuestUser' }, resolve);
    });

    // Host leaves lobby
    const leaveRes = await new Promise<any>((resolve) => {
      host.emit('room:leave', { roomCode: code, sessionToken: createRes.sessionToken }, resolve);
    });

    expect(leaveRes.success).toBe(true);

    // Guest should now be promoted to host
    const guestReconnect = await new Promise<any>((resolve) => {
      guest.emit('player:reconnect', { roomCode: code, sessionToken: joinRes.sessionToken }, resolve);
    });

    expect(guestReconnect.success).toBe(true);
    expect(guestReconnect.room.playerCount).toBe(1);
    expect(guestReconnect.room.hostId).toBe(joinRes.playerId);

    host.disconnect();
    guest.disconnect();
  });
});
