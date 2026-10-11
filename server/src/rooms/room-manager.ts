import crypto from 'crypto';
import { Room, RoomPlayer, RoomPublicState, RoomSettings } from './types';
import { createGame, GameMode, GameState } from '@stack-uno/game-engine';
import { SERVER_CONFIG } from '../config/index';

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  // Map socketId -> { roomCode, playerId }
  private socketIndex: Map<string, { roomCode: string; playerId: string }> = new Map();

  /**
   * Generates a distinct 5-character uppercase alphanumeric room code.
   */
  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // omits confusing I, 1, O, 0
    let code: string;
    do {
      code = Array.from(crypto.randomBytes(5))
        .map((byte) => chars[byte % chars.length])
        .join('');
    } while (this.rooms.has(code));
    return code;
  }

  public createRoom(
    hostName: string,
    settings: Partial<RoomSettings>,
    socketId: string,
    avatarSeed?: string
  ): { room: Room; hostPlayer: RoomPlayer } {
    const code = this.generateRoomCode();
    const hostId = `usr_${crypto.randomBytes(4).toString('hex')}`;
    const sessionToken = `sess_${crypto.randomBytes(16).toString('hex')}`;

    const hostPlayer: RoomPlayer = {
      id: hostId,
      name: hostName.trim() || 'Host',
      sessionToken,
      socketId,
      isHost: true,
      isConnected: true,
      avatarSeed,
    };

    const roomSettings: RoomSettings = {
      maxPlayers: Math.min(Math.max(settings.maxPlayers || 10, 2), SERVER_CONFIG.MAX_PLAYERS_PER_ROOM),
      gameMode: settings.gameMode || 'classic',
      password: settings.password,
    };

    const room: Room = {
      code,
      hostId,
      settings: roomSettings,
      status: 'lobby',
      players: new Map([[hostId, hostPlayer]]),
      createdAt: Date.now(),
    };

    this.rooms.set(code, room);
    this.socketIndex.set(socketId, { roomCode: code, playerId: hostId });

    return { room, hostPlayer };
  }

  public joinRoom(
    code: string,
    playerName: string,
    socketId: string,
    password?: string,
    avatarSeed?: string
  ): { room: Room; player: RoomPlayer } {
    const normalizedCode = code.toUpperCase().trim();
    const room = this.rooms.get(normalizedCode);

    if (!room) {
      throw new Error(`Room '${normalizedCode}' not found.`);
    }

    if (room.status !== 'lobby') {
      throw new Error('Game is already in progress or finished.');
    }

    if (room.players.size >= room.settings.maxPlayers) {
      throw new Error(`Room is full (${room.players.size}/${room.settings.maxPlayers} players).`);
    }

    if (room.settings.password && room.settings.password !== password) {
      throw new Error('Incorrect room password.');
    }

    const playerId = `usr_${crypto.randomBytes(4).toString('hex')}`;
    const sessionToken = `sess_${crypto.randomBytes(16).toString('hex')}`;

    const player: RoomPlayer = {
      id: playerId,
      name: playerName.trim() || `Player ${room.players.size + 1}`,
      sessionToken,
      socketId,
      isHost: false,
      isConnected: true,
      avatarSeed,
    };

    room.players.set(playerId, player);
    this.socketIndex.set(socketId, { roomCode: normalizedCode, playerId });

    return { room, player };
  }

  public reconnect(
    code: string,
    sessionToken: string,
    newSocketId: string
  ): { room: Room; player: RoomPlayer } {
    const room = this.rooms.get(code.toUpperCase().trim());
    if (!room) {
      throw new Error('Room not found.');
    }

    let foundPlayer: RoomPlayer | undefined;
    for (const player of room.players.values()) {
      if (player.sessionToken === sessionToken) {
        foundPlayer = player;
        break;
      }
    }

    if (!foundPlayer) {
      throw new Error('Invalid or expired session token.');
    }

    // Clean up old socket reference if any
    if (foundPlayer.socketId) {
      this.socketIndex.delete(foundPlayer.socketId);
    }

    foundPlayer.socketId = newSocketId;
    foundPlayer.isConnected = true;
    foundPlayer.disconnectTimestamp = undefined;

    this.socketIndex.set(newSocketId, { roomCode: room.code, playerId: foundPlayer.id });

    return { room, player: foundPlayer };
  }

  public handleSocketDisconnect(socketId: string): { room?: Room; player?: RoomPlayer } {
    const mapping = this.socketIndex.get(socketId);
    if (!mapping) return {};

    this.socketIndex.delete(socketId);
    const room = this.rooms.get(mapping.roomCode);
    if (!room) return {};

    const player = room.players.get(mapping.playerId);
    if (!player) return { room };

    player.isConnected = false;
    player.disconnectTimestamp = Date.now();
    player.socketId = undefined;

    return { room, player };
  }

  public startGame(code: string, hostSessionToken: string, seed?: number): { room: Room; gameState: GameState } {
    const room = this.rooms.get(code.toUpperCase().trim());
    if (!room) throw new Error('Room not found.');

    const host = room.players.get(room.hostId);
    if (!host || host.sessionToken !== hostSessionToken) {
      throw new Error('Only the room host can start the game.');
    }

    if (room.players.size < SERVER_CONFIG.MIN_PLAYERS_TO_START) {
      throw new Error(`At least ${SERVER_CONFIG.MIN_PLAYERS_TO_START} players are required to start.`);
    }

    const playerConfigs = Array.from(room.players.values()).map((p) => ({
      id: p.id,
      name: p.name,
      isHost: p.isHost,
      avatarSeed: p.avatarSeed,
    }));

    const gameState = createGame({
      roomId: room.code,
      mode: room.settings.gameMode,
      players: playerConfigs,
      seed,
    });

    room.status = 'in_game';
    room.gameState = gameState;

    return { room, gameState };
  }

  public getRoom(code: string): Room | undefined {
    return this.rooms.get(code.toUpperCase().trim());
  }

  public getPublicRoomState(room: Room): RoomPublicState {
    const playerList = Array.from(room.players.values()).map((p) => ({
      id: p.id,
      name: p.name,
      isHost: p.isHost,
      isConnected: p.isConnected,
      avatarSeed: p.avatarSeed,
    }));

    return {
      code: room.code,
      hostId: room.hostId,
      gameMode: room.settings.gameMode,
      maxPlayers: room.settings.maxPlayers,
      playerCount: room.players.size,
      hasPassword: !!room.settings.password,
      status: room.status,
      players: playerList,
    };
  }

  public getAllRoomsCount(): number {
    return this.rooms.size;
  }
}
