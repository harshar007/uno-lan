import TcpSocket from 'react-native-tcp-socket';
import { PureRoomManager } from './pure-room-manager';
import { Room } from './room-types';
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
} from '../game-engine';

export interface TcpPacket {
  id?: string; // correlation id for request/response acks
  event: string;
  payload?: any;
}

class TcpClientConnection {
  public socketId: string;
  public socket: any; // TcpSocket.Socket
  private buffer: string = '';

  constructor(socketId: string, socket: any) {
    this.socketId = socketId;
    this.socket = socket;
  }

  public send(event: string, payload?: any, ackId?: string) {
    try {
      const packet: TcpPacket = {
        event,
        payload,
        id: ackId,
      };
      const data = JSON.stringify(packet) + '\n';
      this.socket.write(data, 'utf8');
    } catch (err) {
      console.warn(`[EmbeddedHost] Failed to send to ${this.socketId}:`, err);
    }
  }

  public appendData(chunk: string): string[] {
    this.buffer += chunk;
    const lines = this.buffer.split('\n');
    // The last element is either empty (if ended with \n) or incomplete
    this.buffer = lines.pop() || '';
    return lines.filter((l) => l.trim().length > 0);
  }
}

export class EmbeddedHostServer {
  private static instance: EmbeddedHostServer | null = null;
  private server: any = null; // TcpSocket.Server
  private roomManager: PureRoomManager = new PureRoomManager();
  private connections: Map<string, TcpClientConnection> = new Map();
  private isRunning: boolean = false;
  private hostPort: number = 3000;
  private nextClientId: number = 1;

  public static getInstance(): EmbeddedHostServer {
    if (!EmbeddedHostServer.instance) {
      EmbeddedHostServer.instance = new EmbeddedHostServer();
    }
    return EmbeddedHostServer.instance;
  }

  public get active(): boolean {
    return this.isRunning;
  }

  public get port(): number {
    return this.hostPort;
  }

  /**
   * Starts the embedded TCP server on the mobile phone hotspot interface (0.0.0.0:3000).
   */
  public async start(port: number = 3000): Promise<boolean> {
    if (this.isRunning) {
      return true;
    }

    this.hostPort = port;
    this.roomManager.reset();
    this.connections.clear();

    return new Promise((resolve) => {
      try {
        const server = TcpSocket.createServer((socket: any) => {
          const clientId = `tcp_client_${this.nextClientId++}`;
          const client = new TcpClientConnection(clientId, socket);
          this.connections.set(clientId, client);

          socket.setNoDelay(true);
          socket.setKeepAlive(true);

          socket.on('data', (data: any) => {
            const raw = typeof data === 'string' ? data : data.toString('utf8');
            const messages = client.appendData(raw);
            for (const msg of messages) {
              try {
                const packet: TcpPacket = JSON.parse(msg);
                this.handlePacket(client, packet);
              } catch (e) {
                console.warn('[EmbeddedHost] Invalid JSON packet received:', e);
              }
            }
          });

          socket.on('error', (err: any) => {
            console.warn(`[EmbeddedHost] Client socket error ${clientId}:`, err);
          });

          socket.on('close', () => {
            this.handleDisconnect(clientId);
          });
        });

        server.listen({ port, host: '0.0.0.0' }, () => {
          this.isRunning = true;
          this.server = server;
          resolve(true);
        });

        server.on('error', (err: any) => {
          console.error('[EmbeddedHost] Server error:', err);
          this.stop();
          resolve(false);
        });
      } catch (err) {
        console.error('[EmbeddedHost] Failed to initialize server:', err);
        resolve(false);
      }
    });
  }

  public stop(): void {
    if (this.server) {
      try {
        this.server.close();
      } catch {}
      this.server = null;
    }
    for (const client of this.connections.values()) {
      try {
        client.socket.destroy();
      } catch {}
    }
    this.connections.clear();
    this.roomManager.reset();
    this.isRunning = false;
  }

  private broadcastToRoom(roomCode: string, event: string, payload: any) {
    const room = this.roomManager.getRoom(roomCode);
    if (!room) return;

    for (const player of room.players.values()) {
      if (player.socketId && player.isConnected) {
        const client = this.connections.get(player.socketId);
        client?.send(event, payload);
      }
    }
  }

  private broadcastRoomState(room: Room) {
    const publicState = this.roomManager.getPublicRoomState(room);
    this.broadcastToRoom(room.code, 'room:updated', { room: publicState });
  }

  private broadcastGameState(room: Room) {
    if (!room.gameState) return;

    const publicGameState = getPublicGameState(room.gameState);
    this.broadcastToRoom(room.code, 'game:state', { gameState: publicGameState });

    // Send private hands directly to each individual player's socket
    for (const player of room.players.values()) {
      if (player.socketId && player.isConnected) {
        const client = this.connections.get(player.socketId);
        if (client) {
          const privateState = getPlayerPrivateState(room.gameState, player.id);
          client.send('game:hand', {
            hand: privateState.myHand,
            legalCardIds: privateState.legalCardIds,
            canDraw: privateState.canDraw,
            canDeclareUno: privateState.canDeclareUno,
          });
        }
      }
    }

    if (room.gameState.status === 'finished') {
      const standings = calculateStandings(room.gameState);
      this.broadcastToRoom(room.code, 'game:finished', {
        winnerId: room.gameState.winnerId,
        standings,
      });
    }
  }

  private handlePacket(client: TcpClientConnection, packet: TcpPacket) {
    const { event, payload, id: reqId } = packet;

    const ack = (response: any) => {
      client.send('ack', response, reqId);
    };

    switch (event) {
      case 'room:create': {
        try {
          const { playerName, maxPlayers, gameMode, password, avatarSeed } = payload || {};
          const { room, hostPlayer } = this.roomManager.createRoom(
            playerName,
            { maxPlayers, gameMode, password },
            client.socketId,
            avatarSeed
          );
          const publicRoom = this.roomManager.getPublicRoomState(room);
          ack({
            success: true,
            room: publicRoom,
            playerId: hostPlayer.id,
            sessionToken: hostPlayer.sessionToken,
          });
          this.broadcastRoomState(room);
        } catch (err: any) {
          ack({ success: false, error: err.message || 'Failed to create room' });
        }
        break;
      }

      case 'room:join': {
        try {
          const { roomCode, playerName, password, avatarSeed } = payload || {};
          const { room, player } = this.roomManager.joinRoom(
            roomCode,
            playerName,
            client.socketId,
            password,
            avatarSeed
          );
          const publicRoom = this.roomManager.getPublicRoomState(room);
          ack({
            success: true,
            room: publicRoom,
            playerId: player.id,
            sessionToken: player.sessionToken,
          });
          this.broadcastRoomState(room);
        } catch (err: any) {
          ack({ success: false, error: err.message || 'Failed to join room' });
        }
        break;
      }

      case 'room:start': {
        try {
          const { roomCode, sessionToken } = payload || {};
          const { room } = this.roomManager.startGame(roomCode, sessionToken);
          ack({ success: true });
          this.broadcastRoomState(room);
          this.broadcastGameState(room);
        } catch (err: any) {
          ack({ success: false, error: err.message || 'Failed to start game' });
        }
        break;
      }

      case 'player:reconnect': {
        try {
          const { roomCode, sessionToken } = payload || {};
          const { room, player } = this.roomManager.reconnect(roomCode, sessionToken, client.socketId);
          const publicRoom = this.roomManager.getPublicRoomState(room);
          const publicGameState = room.gameState ? getPublicGameState(room.gameState) : undefined;
          const privateState = room.gameState ? getPlayerPrivateState(room.gameState, player.id) : undefined;

          ack({
            success: true,
            room: publicRoom,
            gameState: publicGameState,
            hand: privateState?.myHand,
            legalCardIds: privateState?.legalCardIds,
          });
          this.broadcastRoomState(room);
        } catch (err: any) {
          ack({ success: false, error: err.message || 'Reconnection failed' });
        }
        break;
      }

      case 'game:play-card': {
        try {
          const { roomCode, sessionToken, cardId, chosenColor } = payload || {};
          const room = this.roomManager.getRoom(roomCode);
          if (!room || !room.gameState) {
            ack({ success: false, error: 'Game not active' });
            return;
          }

          const player = Array.from(room.players.values()).find((p) => p.sessionToken === sessionToken);
          if (!player) {
            ack({ success: false, error: 'Invalid session' });
            return;
          }

          const result = playCard(room.gameState, player.id, cardId, chosenColor as CardColor | undefined);
          if (!result.success) {
            ack({ success: false, error: result.error });
            return;
          }

          room.gameState = result.state;
          ack({ success: true });
          this.broadcastGameState(room);
        } catch (err: any) {
          ack({ success: false, error: err.message || 'Failed to play card' });
        }
        break;
      }

      case 'game:draw-card': {
        try {
          const { roomCode, sessionToken } = payload || {};
          const room = this.roomManager.getRoom(roomCode);
          if (!room || !room.gameState) {
            ack({ success: false, error: 'Game not active' });
            return;
          }

          const player = Array.from(room.players.values()).find((p) => p.sessionToken === sessionToken);
          if (!player) {
            ack({ success: false, error: 'Invalid session' });
            return;
          }

          const result = drawCard(room.gameState, player.id);
          if (!result.success) {
            ack({ success: false, error: result.error });
            return;
          }

          room.gameState = result.state;
          ack({ success: true });
          this.broadcastGameState(room);
        } catch (err: any) {
          ack({ success: false, error: err.message || 'Failed to draw card' });
        }
        break;
      }

      case 'game:choose-color': {
        try {
          const { roomCode, sessionToken, color } = payload || {};
          const room = this.roomManager.getRoom(roomCode);
          if (!room || !room.gameState) {
            ack({ success: false, error: 'Game not active' });
            return;
          }

          const player = Array.from(room.players.values()).find((p) => p.sessionToken === sessionToken);
          if (!player) {
            ack({ success: false, error: 'Invalid session' });
            return;
          }

          const result = chooseWildColor(room.gameState, player.id, color as CardColor);
          if (!result.success) {
            ack({ success: false, error: result.error });
            return;
          }

          room.gameState = result.state;
          ack({ success: true });
          this.broadcastGameState(room);
        } catch (err: any) {
          ack({ success: false, error: err.message || 'Failed to choose color' });
        }
        break;
      }

      case 'game:declare-uno': {
        try {
          const { roomCode, sessionToken } = payload || {};
          const room = this.roomManager.getRoom(roomCode);
          if (!room || !room.gameState) {
            ack({ success: false, error: 'Game not active' });
            return;
          }

          const player = Array.from(room.players.values()).find((p) => p.sessionToken === sessionToken);
          if (!player) {
            ack({ success: false, error: 'Invalid session' });
            return;
          }

          const result = declareUno(room.gameState, player.id);
          if (!result.success) {
            ack({ success: false, error: result.error });
            return;
          }

          room.gameState = result.state;
          ack({ success: true });
          this.broadcastToRoom(room.code, 'game:uno-declared', { playerId: player.id });
          this.broadcastGameState(room);
        } catch (err: any) {
          ack({ success: false, error: err.message || 'Failed to declare UNO' });
        }
        break;
      }

      case 'game:callout-uno': {
        try {
          const { roomCode, sessionToken, targetPlayerId } = payload || {};
          const room = this.roomManager.getRoom(roomCode);
          if (!room || !room.gameState) {
            ack({ success: false, error: 'Game not active' });
            return;
          }

          const player = Array.from(room.players.values()).find((p) => p.sessionToken === sessionToken);
          if (!player) {
            ack({ success: false, error: 'Invalid session' });
            return;
          }

          const result = calloutUno(room.gameState, player.id, targetPlayerId);
          if (!result.success) {
            ack({ success: false, error: result.error });
            return;
          }

          room.gameState = result.state;
          ack({ success: true });
          this.broadcastToRoom(room.code, 'game:penalty', {
            playerId: targetPlayerId,
            reason: 'Missed UNO declaration',
            count: room.gameState.rules.missedUnoPenaltyCards,
          });
          this.broadcastGameState(room);
        } catch (err: any) {
          ack({ success: false, error: err.message || 'Failed to callout UNO' });
        }
        break;
      }

      case 'room:leave': {
        try {
          const { roomCode, sessionToken } = payload || {};
          const { room, deleted } = this.roomManager.leaveRoom(roomCode, sessionToken);
          ack({ success: true });
          if (room && !deleted) {
            this.broadcastRoomState(room);
          }
        } catch (err: any) {
          ack({ success: false, error: err.message || 'Failed to leave room' });
        }
        break;
      }

      default:
        console.warn(`[EmbeddedHost] Unknown event: ${event}`);
    }
  }

  private handleDisconnect(socketId: string) {
    this.connections.delete(socketId);
    const { room, player } = this.roomManager.handleSocketDisconnect(socketId);
    if (room) {
      this.broadcastRoomState(room);
      if (room.gameState) {
        this.broadcastGameState(room);

        // Auto draw after grace if the player who disconnected has current turn
        if (room.gameState.status === 'in_progress' && player) {
          const currentTurnPlayerId = room.gameState.playerIds[room.gameState.currentPlayerIndex];
          if (currentTurnPlayerId === player.id) {
            setTimeout(() => {
              const refreshedRoom = this.roomManager.getRoom(room.code);
              if (refreshedRoom && refreshedRoom.gameState && refreshedRoom.gameState.status === 'in_progress') {
                const checkPlayer = refreshedRoom.players.get(player.id);
                if (checkPlayer && !checkPlayer.isConnected) {
                  const currentId = refreshedRoom.gameState.playerIds[refreshedRoom.gameState.currentPlayerIndex];
                  if (currentId === player.id) {
                    const drawRes = drawCard(refreshedRoom.gameState, player.id);
                    if (drawRes.success) {
                      refreshedRoom.gameState = drawRes.state;
                      this.broadcastGameState(refreshedRoom);
                    }
                  }
                }
              }
            }, 10000);
          }
        }
      }
    }
  }
}
