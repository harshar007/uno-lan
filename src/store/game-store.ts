import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { Card, CardColor, PublicGameState, PlayerStanding } from '@stack-uno/game-engine';

export interface RoomPublicState {
  code: string;
  hostId: string;
  gameMode: 'classic' | 'reverse';
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

interface GameStoreState {
  serverUrl: string;
  socket: Socket | null;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  errorMessage: string | null;

  // Session
  playerName: string;
  playerId: string | null;
  sessionToken: string | null;

  // Room & Game
  room: RoomPublicState | null;
  gameState: PublicGameState | null;
  myHand: Card[];
  legalCardIds: string[];
  canDraw: boolean;
  canDeclareUno: boolean;
  standings: PlayerStanding[];
  winnerId: string | null;

  // Local UI State
  selectedCardId: string | null;
  isColorPickerOpen: boolean;
  pendingWildCardId: string | null;
  penaltyNotification: string | null;

  // Actions
  setServerUrl: (url: string) => void;
  setPlayerName: (name: string) => void;
  clearError: () => void;
  clearPenaltyNotification: () => void;
  setSelectedCardId: (id: string | null) => void;
  setColorPickerOpen: (open: boolean, cardId?: string | null) => void;

  connectSocket: () => Socket;
  createRoom: (
    playerName: string,
    maxPlayers: number,
    gameMode: 'classic' | 'reverse',
    password?: string
  ) => Promise<boolean>;
  joinRoom: (roomCode: string, playerName: string, password?: string) => Promise<boolean>;
  startGame: () => Promise<boolean>;
  playCardAction: (cardId: string, chosenColor?: CardColor) => Promise<boolean>;
  drawCardAction: () => Promise<boolean>;
  chooseColorAction: (color: CardColor) => Promise<boolean>;
  declareUnoAction: () => Promise<boolean>;
  calloutUnoAction: (targetPlayerId: string) => Promise<boolean>;
  reconnectAction: () => Promise<boolean>;
  leaveRoom: () => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  serverUrl: 'http://localhost:3000',
  socket: null,
  connectionStatus: 'disconnected',
  errorMessage: null,

  playerName: 'Player',
  playerId: null,
  sessionToken: null,

  room: null,
  gameState: null,
  myHand: [],
  legalCardIds: [],
  canDraw: false,
  canDeclareUno: false,
  standings: [],
  winnerId: null,

  selectedCardId: null,
  isColorPickerOpen: false,
  pendingWildCardId: null,
  penaltyNotification: null,

  setServerUrl: (url: string) => {
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `http://${cleanUrl}`;
    }
    set({ serverUrl: cleanUrl });
  },

  setPlayerName: (name: string) => set({ playerName: name }),
  clearError: () => set({ errorMessage: null }),
  clearPenaltyNotification: () => set({ penaltyNotification: null }),
  setSelectedCardId: (id: string | null) => set({ selectedCardId: id }),
  setColorPickerOpen: (open: boolean, cardId = null) =>
    set({ isColorPickerOpen: open, pendingWildCardId: cardId }),

  connectSocket: () => {
    const { socket, serverUrl } = get();
    if (socket && socket.connected) {
      return socket;
    }

    if (socket) {
      socket.disconnect();
    }

    set({ connectionStatus: 'connecting', errorMessage: null });

    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 8000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      set({ connectionStatus: 'connected', errorMessage: null });
    });

    newSocket.on('connect_error', (err) => {
      set({
        connectionStatus: 'error',
        errorMessage: `Cannot connect to server at ${serverUrl}. Ensure the host server is running.`,
      });
    });

    newSocket.on('disconnect', () => {
      set({ connectionStatus: 'disconnected' });
    });

    // Listeners for game events
    newSocket.on('room:updated', (data: { room: RoomPublicState }) => {
      set({ room: data.room });
    });

    newSocket.on('game:state', (data: { gameState: PublicGameState }) => {
      set({
        gameState: data.gameState,
        winnerId: data.gameState.winnerId || null,
      });
    });

    newSocket.on('game:hand', (data: { hand: Card[]; legalCardIds: string[]; canDraw: boolean; canDeclareUno: boolean }) => {
      set({
        myHand: data.hand,
        legalCardIds: data.legalCardIds,
        canDraw: data.canDraw,
        canDeclareUno: data.canDeclareUno,
      });
    });

    newSocket.on('game:finished', (data: { winnerId: string; standings: PlayerStanding[] }) => {
      set({
        winnerId: data.winnerId,
        standings: data.standings,
      });
    });

    newSocket.on('game:penalty', (data: { playerId: string; reason: string; count: number }) => {
      set({
        penaltyNotification: `${data.reason}: +${data.count} cards penalty!`,
      });
    });

    set({ socket: newSocket });
    return newSocket;
  },

  createRoom: async (playerName, maxPlayers, gameMode, password) => {
    const socket = get().connectSocket();
    return new Promise((resolve) => {
      socket.emit(
        'room:create',
        { playerName, maxPlayers, gameMode, password },
        (res: any) => {
          if (res?.success) {
            set({
              playerName,
              playerId: res.playerId,
              sessionToken: res.sessionToken,
              room: res.room,
              errorMessage: null,
            });
            resolve(true);
          } else {
            set({ errorMessage: res?.error || 'Failed to create room' });
            resolve(false);
          }
        }
      );
    });
  },

  joinRoom: async (roomCode, playerName, password) => {
    const socket = get().connectSocket();
    return new Promise((resolve) => {
      socket.emit(
        'room:join',
        { roomCode: roomCode.trim().toUpperCase(), playerName, password },
        (res: any) => {
          if (res?.success) {
            set({
              playerName,
              playerId: res.playerId,
              sessionToken: res.sessionToken,
              room: res.room,
              errorMessage: null,
            });
            resolve(true);
          } else {
            set({ errorMessage: res?.error || 'Failed to join room' });
            resolve(false);
          }
        }
      );
    });
  },

  startGame: async () => {
    const { socket, room, sessionToken } = get();
    if (!socket || !room || !sessionToken) return false;

    return new Promise((resolve) => {
      socket.emit('room:start', { roomCode: room.code, sessionToken }, (res: any) => {
        if (res?.success) {
          resolve(true);
        } else {
          set({ errorMessage: res?.error || 'Failed to start game' });
          resolve(false);
        }
      });
    });
  },

  playCardAction: async (cardId, chosenColor) => {
    const { socket, room, sessionToken } = get();
    if (!socket || !room || !sessionToken) return false;

    return new Promise((resolve) => {
      socket.emit(
        'game:play-card',
        { roomCode: room.code, sessionToken, cardId, chosenColor },
        (res: any) => {
          if (res?.success) {
            set({ selectedCardId: null, isColorPickerOpen: false, pendingWildCardId: null });
            resolve(true);
          } else {
            set({ errorMessage: res?.error || 'Invalid move' });
            resolve(false);
          }
        }
      );
    });
  },

  drawCardAction: async () => {
    const { socket, room, sessionToken } = get();
    if (!socket || !room || !sessionToken) return false;

    return new Promise((resolve) => {
      socket.emit('game:draw-card', { roomCode: room.code, sessionToken }, (res: any) => {
        if (res?.success) {
          resolve(true);
        } else {
          set({ errorMessage: res?.error || 'Cannot draw card' });
          resolve(false);
        }
      });
    });
  },

  chooseColorAction: async (color) => {
    const { pendingWildCardId, playCardAction } = get();
    if (pendingWildCardId) {
      return playCardAction(pendingWildCardId, color);
    }
    const { socket, room, sessionToken } = get();
    if (!socket || !room || !sessionToken) return false;

    return new Promise((resolve) => {
      socket.emit('game:choose-color', { roomCode: room.code, sessionToken, color }, (res: any) => {
        if (res?.success) {
          set({ isColorPickerOpen: false, pendingWildCardId: null });
          resolve(true);
        } else {
          set({ errorMessage: res?.error || 'Failed to choose color' });
          resolve(false);
        }
      });
    });
  },

  declareUnoAction: async () => {
    const { socket, room, sessionToken } = get();
    if (!socket || !room || !sessionToken) return false;

    return new Promise((resolve) => {
      socket.emit('game:declare-uno', { roomCode: room.code, sessionToken }, (res: any) => {
        if (res?.success) {
          resolve(true);
        } else {
          set({ errorMessage: res?.error || 'Cannot declare UNO' });
          resolve(false);
        }
      });
    });
  },

  calloutUnoAction: async (targetPlayerId) => {
    const { socket, room, sessionToken } = get();
    if (!socket || !room || !sessionToken) return false;

    return new Promise((resolve) => {
      socket.emit(
        'game:callout-uno',
        { roomCode: room.code, sessionToken, targetPlayerId },
        (res: any) => {
          if (res?.success) {
            resolve(true);
          } else {
            set({ errorMessage: res?.error || 'Failed to call out player' });
            resolve(false);
          }
        }
      );
    });
  },

  reconnectAction: async () => {
    const { socket, room, sessionToken } = get();
    if (!socket || !room || !sessionToken) return false;

    return new Promise((resolve) => {
      socket.emit(
        'player:reconnect',
        { roomCode: room.code, sessionToken },
        (res: any) => {
          if (res?.success) {
            set({
              room: res.room,
              gameState: res.gameState,
              myHand: res.hand || [],
              legalCardIds: res.legalCardIds || [],
            });
            resolve(true);
          } else {
            set({ errorMessage: res?.error || 'Reconnection failed' });
            resolve(false);
          }
        }
      );
    });
  },

  leaveRoom: () => {
    const { socket, room, sessionToken } = get();
    if (socket && room && sessionToken) {
      socket.emit('room:leave', { roomCode: room.code, sessionToken });
    }
    set({
      room: null,
      gameState: null,
      myHand: [],
      legalCardIds: [],
      standings: [],
      winnerId: null,
      selectedCardId: null,
      isColorPickerOpen: false,
    });
  },
}));
