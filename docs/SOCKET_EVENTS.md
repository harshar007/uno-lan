# STACK UNO — Socket.IO Event Contract

## Transport Protocol
- WebSocket / Socket.IO v4
- Server binds to `0.0.0.0:3000` (configurable via `PORT` environment variable).

---

## Client to Server Events

### Room Management
- `room:create`
  - Payload: `{ playerName: string, maxPlayers?: number, gameMode: 'classic' | 'reverse', password?: string }`
  - Ack: `{ success: boolean, room?: RoomPublicState, playerId: string, sessionToken: string, error?: string }`
- `room:join`
  - Payload: `{ roomCode: string, playerName: string, password?: string }`
  - Ack: `{ success: boolean, room?: RoomPublicState, playerId: string, sessionToken: string, error?: string }`
- `room:leave`
  - Payload: `{ roomCode: string, sessionToken: string }`
- `room:update-settings`
  - Payload: `{ roomCode: string, sessionToken: string, settings: RoomSettings }`
- `room:start`
  - Payload: `{ roomCode: string, sessionToken: string }`
- `player:reconnect`
  - Payload: `{ roomCode: string, sessionToken: string }`
  - Ack: `{ success: boolean, room?: RoomPublicState, gameState?: GamePublicState, hand?: Card[], error?: string }`

### Gameplay Actions
- `game:play-card`
  - Payload: `{ roomCode: string, sessionToken: string, cardId: string, chosenColor?: CardColor }`
  - Ack: `{ success: boolean, error?: string }`
- `game:draw-card`
  - Payload: `{ roomCode: string, sessionToken: string }`
  - Ack: `{ success: boolean, error?: string }`
- `game:pass-turn`
  - Payload: `{ roomCode: string, sessionToken: string }`
  - Ack: `{ success: boolean, error?: string }`
- `game:declare-uno`
  - Payload: `{ roomCode: string, sessionToken: string }`
  - Ack: `{ success: boolean, error?: string }`
- `game:callout-uno`
  - Payload: `{ roomCode: string, sessionToken: string, targetPlayerId: string }`
  - Ack: `{ success: boolean, error?: string }`

---

## Server to Client Events

- `room:updated`
  - Payload: `{ room: RoomPublicState }`
- `room:error`
  - Payload: `{ message: string, code?: string }`
- `game:started`
  - Payload: `{ gameState: GamePublicState, hand: Card[] }`
- `game:state`
  - Broadcast: `{ gameState: GamePublicState }`
- `game:hand`
  - Direct message to player socket: `{ hand: Card[] }`
- `game:card-played`
  - Broadcast: `{ playerId: string, card: Card, nextPlayerId: string }`
- `game:card-drawn`
  - Broadcast: `{ playerId: string, count: number }`
- `game:uno-declared`
  - Broadcast: `{ playerId: string }`
- `game:penalty`
  - Broadcast: `{ playerId: string, reason: string, count: number }`
- `game:finished`
  - Broadcast: `{ winnerId: string, standings: PlayerStanding[] }`
