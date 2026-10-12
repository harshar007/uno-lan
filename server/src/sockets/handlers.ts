import { Server, Socket } from 'socket.io';
import { z } from 'zod';
import { RoomManager } from '../rooms/room-manager';
import {
  getPublicGameState,
  getPlayerPrivateState,
  playCard,
  drawCard,
  chooseWildColor,
  declareUno,
  calloutUno,
  calculateStandings,
  CardColor,
} from '@stack-uno/game-engine';
import { Room } from '../rooms/types';

// Input Schemas
const CreateRoomSchema = z.object({
  playerName: z.string().min(1).max(25),
  maxPlayers: z.number().int().min(2).max(10).optional(),
  gameMode: z.enum(['classic', 'reverse']).default('classic'),
  password: z.string().max(20).optional(),
  avatarSeed: z.string().optional(),
});

const JoinRoomSchema = z.object({
  roomCode: z.string().min(3).max(10),
  playerName: z.string().min(1).max(25),
  password: z.string().optional(),
  avatarSeed: z.string().optional(),
});

const StartRoomSchema = z.object({
  roomCode: z.string(),
  sessionToken: z.string(),
});

const ReconnectSchema = z.object({
  roomCode: z.string(),
  sessionToken: z.string(),
});

const PlayCardSchema = z.object({
  roomCode: z.string(),
  sessionToken: z.string(),
  cardId: z.string(),
  chosenColor: z.enum(['red', 'blue', 'green', 'yellow']).optional(),
});

const DrawCardSchema = z.object({
  roomCode: z.string(),
  sessionToken: z.string(),
});

const ChooseColorSchema = z.object({
  roomCode: z.string(),
  sessionToken: z.string(),
  color: z.enum(['red', 'blue', 'green', 'yellow']),
});

const DeclareUnoSchema = z.object({
  roomCode: z.string(),
  sessionToken: z.string(),
});

const CalloutUnoSchema = z.object({
  roomCode: z.string(),
  sessionToken: z.string(),
  targetPlayerId: z.string(),
});

const LeaveRoomSchema = z.object({
  roomCode: z.string(),
  sessionToken: z.string(),
});

export function registerSocketHandlers(io: Server, roomManager: RoomManager) {
  function broadcastRoomState(room: Room) {
    const publicState = roomManager.getPublicRoomState(room);
    io.to(room.code).emit('room:updated', { room: publicState });
  }

  function broadcastGameState(room: Room) {
    if (!room.gameState) return;

    const publicGameState = getPublicGameState(room.gameState);
    io.to(room.code).emit('game:state', { gameState: publicGameState });

    // Send private hands directly to each individual player's socket
    for (const player of room.players.values()) {
      if (player.socketId && player.isConnected) {
        const privateState = getPlayerPrivateState(room.gameState, player.id);
        io.to(player.socketId).emit('game:hand', {
          hand: privateState.myHand,
          legalCardIds: privateState.legalCardIds,
          canDraw: privateState.canDraw,
          canDeclareUno: privateState.canDeclareUno,
        });
      }
    }

    if (room.gameState.status === 'finished') {
      const standings = calculateStandings(room.gameState);
      io.to(room.code).emit('game:finished', {
        winnerId: room.gameState.winnerId,
        standings,
      });
    }
  }

  io.on('connection', (socket: Socket) => {
    // 1. Create Room
    socket.on('room:create', (payload: unknown, ack?: (res: any) => void) => {
      try {
        const data = CreateRoomSchema.parse(payload);
        const { room, hostPlayer } = roomManager.createRoom(
          data.playerName,
          {
            maxPlayers: data.maxPlayers,
            gameMode: data.gameMode,
            password: data.password,
          },
          socket.id,
          data.avatarSeed
        );

        socket.join(room.code);
        const publicRoom = roomManager.getPublicRoomState(room);

        ack?.({
          success: true,
          room: publicRoom,
          playerId: hostPlayer.id,
          sessionToken: hostPlayer.sessionToken,
        });
        broadcastRoomState(room);
      } catch (err: any) {
        ack?.({ success: false, error: err.message || 'Failed to create room' });
      }
    });

    // 2. Join Room
    socket.on('room:join', (payload: unknown, ack?: (res: any) => void) => {
      try {
        const data = JoinRoomSchema.parse(payload);
        const { room, player } = roomManager.joinRoom(
          data.roomCode,
          data.playerName,
          socket.id,
          data.password,
          data.avatarSeed
        );

        socket.join(room.code);
        const publicRoom = roomManager.getPublicRoomState(room);

        ack?.({
          success: true,
          room: publicRoom,
          playerId: player.id,
          sessionToken: player.sessionToken,
        });
        broadcastRoomState(room);
      } catch (err: any) {
        ack?.({ success: false, error: err.message || 'Failed to join room' });
      }
    });

    // 3. Start Game
    socket.on('room:start', (payload: unknown, ack?: (res: any) => void) => {
      try {
        const data = StartRoomSchema.parse(payload);
        const { room } = roomManager.startGame(data.roomCode, data.sessionToken);

        ack?.({ success: true });
        broadcastRoomState(room);
        broadcastGameState(room);
      } catch (err: any) {
        ack?.({ success: false, error: err.message || 'Failed to start game' });
      }
    });

    // 4. Reconnect
    socket.on('player:reconnect', (payload: unknown, ack?: (res: any) => void) => {
      try {
        const data = ReconnectSchema.parse(payload);
        const { room, player } = roomManager.reconnect(data.roomCode, data.sessionToken, socket.id);

        socket.join(room.code);
        const publicRoom = roomManager.getPublicRoomState(room);
        const publicGameState = room.gameState ? getPublicGameState(room.gameState) : undefined;
        const privateState = room.gameState ? getPlayerPrivateState(room.gameState, player.id) : undefined;

        ack?.({
          success: true,
          room: publicRoom,
          gameState: publicGameState,
          hand: privateState?.myHand,
          legalCardIds: privateState?.legalCardIds,
        });
        broadcastRoomState(room);
      } catch (err: any) {
        ack?.({ success: false, error: err.message || 'Reconnection failed' });
      }
    });

    // 5. Play Card
    socket.on('game:play-card', (payload: unknown, ack?: (res: any) => void) => {
      try {
        const data = PlayCardSchema.parse(payload);
        const room = roomManager.getRoom(data.roomCode);
        if (!room || !room.gameState) {
          ack?.({ success: false, error: 'Game not active' });
          return;
        }

        const player = Array.from(room.players.values()).find((p) => p.sessionToken === data.sessionToken);
        if (!player) {
          ack?.({ success: false, error: 'Invalid session' });
          return;
        }

        const result = playCard(
          room.gameState,
          player.id,
          data.cardId,
          data.chosenColor as CardColor | undefined
        );

        if (!result.success) {
          ack?.({ success: false, error: result.error });
          return;
        }

        room.gameState = result.state;
        ack?.({ success: true });
        broadcastGameState(room);
      } catch (err: any) {
        ack?.({ success: false, error: err.message || 'Failed to play card' });
      }
    });

    // 6. Draw Card
    socket.on('game:draw-card', (payload: unknown, ack?: (res: any) => void) => {
      try {
        const data = DrawCardSchema.parse(payload);
        const room = roomManager.getRoom(data.roomCode);
        if (!room || !room.gameState) {
          ack?.({ success: false, error: 'Game not active' });
          return;
        }

        const player = Array.from(room.players.values()).find((p) => p.sessionToken === data.sessionToken);
        if (!player) {
          ack?.({ success: false, error: 'Invalid session' });
          return;
        }

        const result = drawCard(room.gameState, player.id);
        if (!result.success) {
          ack?.({ success: false, error: result.error });
          return;
        }

        room.gameState = result.state;
        ack?.({ success: true });
        broadcastGameState(room);
      } catch (err: any) {
        ack?.({ success: false, error: err.message || 'Failed to draw card' });
      }
    });

    // 7. Choose Wild Color
    socket.on('game:choose-color', (payload: unknown, ack?: (res: any) => void) => {
      try {
        const data = ChooseColorSchema.parse(payload);
        const room = roomManager.getRoom(data.roomCode);
        if (!room || !room.gameState) {
          ack?.({ success: false, error: 'Game not active' });
          return;
        }

        const player = Array.from(room.players.values()).find((p) => p.sessionToken === data.sessionToken);
        if (!player) {
          ack?.({ success: false, error: 'Invalid session' });
          return;
        }

        const result = chooseWildColor(room.gameState, player.id, data.color as CardColor);
        if (!result.success) {
          ack?.({ success: false, error: result.error });
          return;
        }

        room.gameState = result.state;
        ack?.({ success: true });
        broadcastGameState(room);
      } catch (err: any) {
        ack?.({ success: false, error: err.message || 'Failed to choose color' });
      }
    });

    // 8. Declare UNO
    socket.on('game:declare-uno', (payload: unknown, ack?: (res: any) => void) => {
      try {
        const data = DeclareUnoSchema.parse(payload);
        const room = roomManager.getRoom(data.roomCode);
        if (!room || !room.gameState) {
          ack?.({ success: false, error: 'Game not active' });
          return;
        }

        const player = Array.from(room.players.values()).find((p) => p.sessionToken === data.sessionToken);
        if (!player) {
          ack?.({ success: false, error: 'Invalid session' });
          return;
        }

        const result = declareUno(room.gameState, player.id);
        if (!result.success) {
          ack?.({ success: false, error: result.error });
          return;
        }

        room.gameState = result.state;
        ack?.({ success: true });
        io.to(room.code).emit('game:uno-declared', { playerId: player.id });
        broadcastGameState(room);
      } catch (err: any) {
        ack?.({ success: false, error: err.message || 'Failed to declare UNO' });
      }
    });

    // 9. Callout UNO
    socket.on('game:callout-uno', (payload: unknown, ack?: (res: any) => void) => {
      try {
        const data = CalloutUnoSchema.parse(payload);
        const room = roomManager.getRoom(data.roomCode);
        if (!room || !room.gameState) {
          ack?.({ success: false, error: 'Game not active' });
          return;
        }

        const player = Array.from(room.players.values()).find((p) => p.sessionToken === data.sessionToken);
        if (!player) {
          ack?.({ success: false, error: 'Invalid session' });
          return;
        }

        const result = calloutUno(room.gameState, player.id, data.targetPlayerId);
        if (!result.success) {
          ack?.({ success: false, error: result.error });
          return;
        }

        room.gameState = result.state;
        ack?.({ success: true });
        io.to(room.code).emit('game:penalty', {
          playerId: data.targetPlayerId,
          reason: 'Missed UNO declaration',
          count: room.gameState.rules.missedUnoPenaltyCards,
        });
        broadcastGameState(room);
      } catch (err: any) {
        ack?.({ success: false, error: err.message || 'Failed to callout UNO' });
      }
    });

    // 10. Leave Room
    socket.on('room:leave', (payload: unknown, ack?: (res: any) => void) => {
      try {
        const data = LeaveRoomSchema.parse(payload);
        const { room, deleted } = roomManager.leaveRoom(data.roomCode, data.sessionToken);
        socket.leave(data.roomCode.toUpperCase().trim());
        ack?.({ success: true });
        if (room && !deleted) {
          broadcastRoomState(room);
        }
      } catch (err: any) {
        ack?.({ success: false, error: err.message || 'Failed to leave room' });
      }
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      const { room, player } = roomManager.handleSocketDisconnect(socket.id);
      if (room) {
        broadcastRoomState(room);
        if (room.gameState) {
          broadcastGameState(room);

          // If the player who disconnected has the active turn, auto-draw after 10s grace
          if (room.gameState.status === 'in_progress' && player) {
            const currentTurnPlayerId = room.gameState.playerIds[room.gameState.currentPlayerIndex];
            if (currentTurnPlayerId === player.id) {
              setTimeout(() => {
                const refreshedRoom = roomManager.getRoom(room.code);
                if (refreshedRoom && refreshedRoom.gameState && refreshedRoom.gameState.status === 'in_progress') {
                  const checkPlayer = refreshedRoom.players.get(player.id);
                  if (checkPlayer && !checkPlayer.isConnected) {
                    const currentId = refreshedRoom.gameState.playerIds[refreshedRoom.gameState.currentPlayerIndex];
                    if (currentId === player.id) {
                      const drawRes = drawCard(refreshedRoom.gameState, player.id);
                      if (drawRes.success) {
                        refreshedRoom.gameState = drawRes.state;
                        broadcastGameState(refreshedRoom);
                      }
                    }
                  }
                }
              }, 10000);
            }
          }
        }
      }
    });
  });
}
