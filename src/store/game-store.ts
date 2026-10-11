import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import Constants from 'expo-constants';
import {
  Card,
  CardColor,
  PublicGameState,
  PlayerStanding,
  GameState,
  createGame,
  playCard,
  drawCard,
  chooseWildColor,
  declareUno,
  calloutUno,
  getPublicGameState,
  getPlayerPrivateState,
  calculateStandings,
} from '@stack-uno/game-engine';
import { decideBotMove } from '../services/bot-ai';

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

export function detectDefaultServerUrl(): string {
  try {
    const hostUri =
      Constants.expoConfig?.hostUri ||
      (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost ||
      (Constants as any)?.manifest?.debuggerHost;

    if (hostUri && typeof hostUri === 'string') {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        return `http://${ip}:3000`;
      }
    }
  } catch {
    // fallback
  }
  return 'http://localhost:3000';
}

interface GameStoreState {
  // Multiplayer Connection
  serverUrl: string;
  socket: Socket | null;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  errorMessage: string | null;

  // Local Match Engine
  isLocalGame: boolean;
  localGameState: GameState | null;

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

  // Local Game Action
  startLocalGame: (options?: {
    mode?: 'classic' | 'reverse';
    playerCount?: number;
    playerName?: string;
  }) => void;

  // Multiplayer Actions
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

let botTurnTimeout: NodeJS.Timeout | null = null;
const BOT_NAMES = ['Aura (AI)', 'Midas (AI)', 'Cipher (AI)', 'Onyx (AI)', 'Sol (AI)'];

/**
 * Awaits socket connection state with a graceful timeout.
 */
function waitForSocketConnection(socket: Socket, timeoutMs = 5000): Promise<boolean> {
  if (socket.connected) return Promise.resolve(true);

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      cleanup();
      resolve(false);
    }, timeoutMs);

    const onConnect = () => {
      cleanup();
      resolve(true);
    };

    const onError = () => {
      cleanup();
      resolve(false);
    };

    const cleanup = () => {
      clearTimeout(timer);
      socket.off('connect', onConnect);
      socket.off('connect_error', onError);
    };

    socket.once('connect', onConnect);
    socket.once('connect_error', onError);
  });
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  serverUrl: detectDefaultServerUrl(),
  socket: null,
  connectionStatus: 'disconnected',
  errorMessage: null,

  isLocalGame: false,
  localGameState: null,

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

  // -------------------------------------------------------------
  // LOCAL MATCH ENGINE (Runs 100% on device, zero server needed)
  // -------------------------------------------------------------
  startLocalGame: (options = {}) => {
    if (botTurnTimeout) {
      clearTimeout(botTurnTimeout);
      botTurnTimeout = null;
    }

    const mode = options.mode || 'classic';
    const playerCount = Math.max(2, Math.min(6, options.playerCount || 4));
    const humanName = options.playerName || get().playerName || 'Player';
    const humanId = 'player_human';

    const playersList = [
      { id: humanId, name: humanName, isHost: true, avatarSeed: 'player' },
    ];

    for (let i = 1; i < playerCount; i++) {
      playersList.push({
        id: `bot_${i}`,
        name: BOT_NAMES[i - 1] || `Bot ${i}`,
        isHost: false,
        avatarSeed: `bot_${i}`,
      });
    }

    const newGameState = createGame({
      roomId: 'LOCAL',
      mode,
      players: playersList,
    });

    const publicState = getPublicGameState(newGameState);
    const privateState = getPlayerPrivateState(newGameState, humanId);

    const localRoom: RoomPublicState = {
      code: 'LOCAL',
      hostId: humanId,
      gameMode: mode,
      maxPlayers: playerCount,
      playerCount,
      hasPassword: false,
      status: 'in_game',
      players: playersList.map((p) => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        isConnected: true,
        avatarSeed: p.avatarSeed,
      })),
    };

    set({
      isLocalGame: true,
      localGameState: newGameState,
      playerId: humanId,
      sessionToken: 'local_session',
      room: localRoom,
      gameState: publicState,
      myHand: privateState.myHand,
      legalCardIds: privateState.legalCardIds,
      canDraw: privateState.canDraw,
      canDeclareUno: privateState.canDeclareUno,
      winnerId: null,
      standings: [],
      errorMessage: null,
      penaltyNotification: null,
    });

    // Check if the first player is a bot
    const currentPlayerId = publicState.currentPlayerId;
    if (currentPlayerId !== humanId) {
      scheduleLocalBotTurn();
    }
  },

  // -------------------------------------------------------------
  // MULTIPLAYER SOCKET CONNECTION (On-Demand)
  // -------------------------------------------------------------
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
      reconnectionAttempts: 4,
    });

    newSocket.on('connect', () => {
      set({ connectionStatus: 'connected', errorMessage: null });
    });

    newSocket.on('connect_error', () => {
      set({
        connectionStatus: 'error',
      });
    });

    newSocket.on('disconnect', () => {
      set({ connectionStatus: 'disconnected' });
    });

    newSocket.on('room:updated', (data: { room: RoomPublicState }) => {
      set({ room: data.room });
    });

    newSocket.on('game:state', (data: { gameState: PublicGameState }) => {
      set({
        gameState: data.gameState,
        winnerId: data.gameState.winnerId || null,
      });
    });

    newSocket.on(
      'game:hand',
      (data: { hand: Card[]; legalCardIds: string[]; canDraw: boolean; canDeclareUno: boolean }) => {
        set({
          myHand: data.hand,
          legalCardIds: data.legalCardIds,
          canDraw: data.canDraw,
          canDeclareUno: data.canDeclareUno,
        });
      }
    );

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
    set({ isLocalGame: false, localGameState: null });
    const socket = get().connectSocket();
    const { serverUrl } = get();

    const isConnected = await waitForSocketConnection(socket, 5000);
    if (!isConnected && !socket.connected) {
      set({
        errorMessage: `Cannot reach LAN server at ${serverUrl}. Please ensure 'npm run server' is running on the computer and phone is on the same Wi-Fi.`,
      });
      return false;
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        set({ errorMessage: 'Server timed out while creating room. Please try again.' });
        resolve(false);
      }, 7000);

      socket.emit(
        'room:create',
        { playerName, maxPlayers, gameMode, password },
        (res: any) => {
          clearTimeout(timeout);
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
    set({ isLocalGame: false, localGameState: null });
    const socket = get().connectSocket();
    const { serverUrl } = get();

    const isConnected = await waitForSocketConnection(socket, 5000);
    if (!isConnected && !socket.connected) {
      set({
        errorMessage: `Cannot reach LAN server at ${serverUrl}. Please verify host IP and make sure computer server is running.`,
      });
      return false;
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        set({ errorMessage: 'Server timed out while joining room. Please check the room code and IP.' });
        resolve(false);
      }, 7000);

      socket.emit(
        'room:join',
        { roomCode: roomCode.trim().toUpperCase(), playerName, password },
        (res: any) => {
          clearTimeout(timeout);
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
    const { isLocalGame, room } = get();
    if (isLocalGame) {
      get().startLocalGame({
        mode: room?.gameMode || 'classic',
        playerCount: room?.maxPlayers || 4,
        playerName: get().playerName,
      });
      return true;
    }

    const { socket, sessionToken } = get();
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
    const { isLocalGame, localGameState, playerId } = get();

    if (isLocalGame && localGameState && playerId) {
      const result = playCard(localGameState, playerId, cardId, chosenColor);
      if (!result.success) {
        set({ errorMessage: result.error || 'Invalid move' });
        return false;
      }

      syncLocalState(result.state);
      set({ selectedCardId: null, isColorPickerOpen: false, pendingWildCardId: null });

      if (result.state.status === 'in_progress') {
        scheduleLocalBotTurn();
      }
      return true;
    }

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
    const { isLocalGame, localGameState, playerId } = get();

    if (isLocalGame && localGameState && playerId) {
      const result = drawCard(localGameState, playerId);
      if (!result.success) {
        set({ errorMessage: result.error || 'Cannot draw card' });
        return false;
      }

      syncLocalState(result.state);
      if (result.state.status === 'in_progress') {
        scheduleLocalBotTurn();
      }
      return true;
    }

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
    const { pendingWildCardId, playCardAction, isLocalGame, localGameState, playerId } = get();
    if (pendingWildCardId) {
      return playCardAction(pendingWildCardId, color);
    }

    if (isLocalGame && localGameState && playerId) {
      const result = chooseWildColor(localGameState, playerId, color);
      if (!result.success) {
        set({ errorMessage: result.error || 'Failed to choose color' });
        return false;
      }

      syncLocalState(result.state);
      set({ isColorPickerOpen: false, pendingWildCardId: null });
      if (result.state.status === 'in_progress') {
        scheduleLocalBotTurn();
      }
      return true;
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
    const { isLocalGame, localGameState, playerId } = get();
    if (isLocalGame && localGameState && playerId) {
      const result = declareUno(localGameState, playerId);
      if (!result.success) {
        set({ errorMessage: result.error || 'Cannot declare UNO' });
        return false;
      }
      syncLocalState(result.state);
      return true;
    }

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
    const { isLocalGame, localGameState, playerId } = get();
    if (isLocalGame && localGameState && playerId) {
      const result = calloutUno(localGameState, playerId, targetPlayerId);
      if (!result.success) {
        set({ errorMessage: result.error || 'Cannot call out player' });
        return false;
      }
      syncLocalState(result.state);
      set({
        penaltyNotification: `Target player received +${result.state.rules.missedUnoPenaltyCards} penalty cards!`,
      });
      return true;
    }

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
    if (botTurnTimeout) {
      clearTimeout(botTurnTimeout);
      botTurnTimeout = null;
    }

    const { socket, room, sessionToken } = get();
    if (socket && room && sessionToken && !get().isLocalGame) {
      socket.emit('room:leave', { roomCode: room.code, sessionToken });
    }

    set({
      isLocalGame: false,
      localGameState: null,
      room: null,
      gameState: null,
      myHand: [],
      legalCardIds: [],
      standings: [],
      winnerId: null,
      selectedCardId: null,
      isColorPickerOpen: false,
      pendingWildCardId: null,
      penaltyNotification: null,
      errorMessage: null,
    });
  },
}));

/**
 * Synchronizes pure GameEngine state with Zustand store for local player view.
 */
function syncLocalState(state: GameState) {
  const humanId = 'player_human';
  const publicState = getPublicGameState(state);
  const privateState = getPlayerPrivateState(state, humanId);

  const isFinished = state.status === 'finished';
  let standings: PlayerStanding[] = [];
  if (isFinished) {
    standings = calculateStandings(state);
  }

  useGameStore.setState({
    localGameState: state,
    gameState: publicState,
    myHand: privateState.myHand,
    legalCardIds: privateState.legalCardIds,
    canDraw: privateState.canDraw,
    canDeclareUno: privateState.canDeclareUno,
    winnerId: state.winnerId || null,
    standings: isFinished ? standings : [],
  });
}

/**
 * Executes tactical AI bot actions on a realistic delay.
 */
function scheduleLocalBotTurn() {
  if (botTurnTimeout) {
    clearTimeout(botTurnTimeout);
    botTurnTimeout = null;
  }

  botTurnTimeout = setTimeout(() => {
    const { isLocalGame, localGameState } = useGameStore.getState();
    if (!isLocalGame || !localGameState || localGameState.status !== 'in_progress') {
      return;
    }

    const currentBotId = localGameState.playerIds[localGameState.currentPlayerIndex];
    if (currentBotId === 'player_human') {
      return; // Human turn
    }

    // 1. Bot makes tactical decision
    const decision = decideBotMove(localGameState, currentBotId);
    let currentState = localGameState;

    // Optional callout against human or other bot
    if (decision.calloutTargetId) {
      const calloutRes = calloutUno(currentState, currentBotId, decision.calloutTargetId);
      if (calloutRes.success) {
        currentState = calloutRes.state;
      }
    }

    // Declare UNO if 2 cards
    if (decision.declareUnoFirst) {
      const declareRes = declareUno(currentState, currentBotId);
      if (declareRes.success) {
        currentState = declareRes.state;
      }
    }

    // Execute play or draw
    if (decision.action === 'play' && decision.cardId) {
      const playRes = playCard(currentState, currentBotId, decision.cardId, decision.chosenColor);
      if (playRes.success) {
        syncLocalState(playRes.state);
        if (playRes.state.status === 'in_progress') {
          scheduleLocalBotTurn();
        }
      } else {
        // Fallback draw
        const drawRes = drawCard(currentState, currentBotId);
        if (drawRes.success) {
          syncLocalState(drawRes.state);
          if (drawRes.state.status === 'in_progress') {
            scheduleLocalBotTurn();
          }
        }
      }
    } else {
      const drawRes = drawCard(currentState, currentBotId);
      if (drawRes.success) {
        syncLocalState(drawRes.state);
        if (drawRes.state.status === 'in_progress') {
          scheduleLocalBotTurn();
        }
      }
    }
  }, 900); // 900ms realistic turn delay
}
