import { GameMode, GameState } from '../game-engine';

export interface RoomPlayer {
  id: string;
  name: string;
  sessionToken: string;
  socketId?: string;
  isHost: boolean;
  isConnected: boolean;
  disconnectTimestamp?: number;
  avatarSeed?: string;
}

export interface RoomSettings {
  maxPlayers: number;
  gameMode: GameMode;
  password?: string;
}

export interface RoomPublicState {
  code: string;
  hostId: string;
  gameMode: GameMode;
  maxPlayers: number;
  playerCount: number;
  hasPassword: boolean;
  status: 'lobby' | 'in_game' | 'finished';
  players: Array<{
    id: string;
    name: string;
    isHost: boolean;
    isConnected: boolean;
    avatarSeed?: string;
  }>;
}

export interface Room {
  code: string;
  hostId: string;
  settings: RoomSettings;
  status: 'lobby' | 'in_game' | 'finished';
  players: Map<string, RoomPlayer>;
  gameState?: GameState;
  createdAt: number;
}
