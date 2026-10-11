export type CardColor = 'red' | 'blue' | 'green' | 'yellow';

export type CardType = 'number' | 'skip' | 'reverse' | 'draw_two' | 'wild' | 'wild_draw_four';

export interface Card {
  id: string;
  color?: CardColor; // undefined for unplayed wild cards
  type: CardType;
  value?: number; // 0-9 for number cards
}

export type GameMode = 'classic' | 'reverse';

export type TurnDirection = 1 | -1; // 1 = clockwise, -1 = counter-clockwise

export type GameStatus = 'waiting' | 'in_progress' | 'finished';

export interface PlayerPublicInfo {
  id: string;
  name: string;
  cardCount: number;
  hasDeclaredUno: boolean;
  isHost: boolean;
  isConnected: boolean;
  avatarSeed?: string;
}

export interface PlayerPrivateInfo extends PlayerPublicInfo {
  hand: Card[];
}

export interface PendingAction {
  type: 'choose_color' | 'challenge_wild_draw_four' | 'resolve_penalty';
  playerId: string;
  targetPlayerId?: string;
  cardsToDraw?: number;
}

export interface GameRules {
  gameMode: GameMode;
  startingHandSize: number;
  allowDrawStacking: boolean; // house rule
  drawUntilPlayable: boolean; // false = draw 1 and pass/play
  reverseInTwoPlayerSkips: boolean;
  unoReverseSurgeAllowed: boolean; // in UNO Reverse mode: matching number flips direction
  unoReverseDeflectionAllowed: boolean; // in UNO Reverse mode: reverse deflects draw attack
  missedUnoPenaltyCards: number;
}

export interface GameState {
  id: string;
  roomId: string;
  mode: GameMode;
  status: GameStatus;
  rules: GameRules;
  playerIds: string[];
  players: Record<string, PlayerPublicInfo>;
  hands: Record<string, Card[]>; // private to server
  drawPile: Card[];
  discardPile: Card[];
  activeColor: CardColor;
  currentPlayerIndex: number;
  direction: TurnDirection;
  pendingAction?: PendingAction;
  winnerId?: string;
  lastPlayedCard?: Card;
  turnNumber: number;
}

export interface PublicGameState {
  id: string;
  roomId: string;
  mode: GameMode;
  status: GameStatus;
  rules: GameRules;
  players: PlayerPublicInfo[];
  currentPlayerId: string;
  topDiscardCard: Card;
  activeColor: CardColor;
  direction: TurnDirection;
  drawPileCount: number;
  discardPileCount: number;
  pendingAction?: PendingAction;
  winnerId?: string;
  lastPlayedCard?: Card;
  turnNumber: number;
}

export interface PlayerPrivateState {
  publicState: PublicGameState;
  myHand: Card[];
  legalCardIds: string[];
  canDraw: boolean;
  canPass: boolean;
  canDeclareUno: boolean;
}

export interface ActionResult<T = GameState> {
  success: boolean;
  state: T;
  error?: string;
}
