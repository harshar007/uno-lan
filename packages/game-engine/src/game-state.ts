import {
  Card,
  CardColor,
  GameMode,
  GameRules,
  GameState,
  PlayerPrivateInfo,
  PlayerPublicInfo,
  PublicGameState,
  PlayerPrivateState,
} from './types.js';
import { createStandardDeck, shuffleDeck } from './deck.js';
import { createSeededRandom, RandomGenerator } from './shuffle.js';
import { getDefaultRules } from './rules.js';
import { isCardPlayable, isWildCard } from './cards.js';
import { calculateNextPlayerIndex, reverseDirection } from './turn-manager.js';

export interface CreateGameOptions {
  id?: string;
  roomId: string;
  mode?: GameMode;
  players: Array<{
    id: string;
    name: string;
    isHost?: boolean;
    avatarSeed?: string;
  }>;
  rules?: Partial<GameRules>;
  seed?: number;
}

/**
 * Creates and initializes a new authoritative game state.
 */
export function createGame(options: CreateGameOptions): GameState {
  const { id = `game_${Date.now()}`, roomId, mode = 'classic', players, rules: customRules, seed } = options;

  if (players.length < 2 || players.length > 10) {
    throw new Error(`Invalid player count: ${players.length}. STACK UNO requires 2 to 10 players.`);
  }

  const rules: GameRules = {
    ...getDefaultRules(mode),
    ...customRules,
  };

  const rng: RandomGenerator = seed !== undefined ? createSeededRandom(seed) : Math.random;

  // Create and shuffle 108-card deck
  let drawPile = shuffleDeck(createStandardDeck(), rng);

  // Deal hands
  const hands: Record<string, Card[]> = {};
  const playerMap: Record<string, PlayerPublicInfo> = {};
  const playerIds: string[] = players.map((p) => p.id);

  for (const player of players) {
    hands[player.id] = drawPile.splice(0, rules.startingHandSize);
    playerMap[player.id] = {
      id: player.id,
      name: player.name,
      cardCount: rules.startingHandSize,
      hasDeclaredUno: false,
      isHost: !!player.isHost,
      isConnected: true,
      avatarSeed: player.avatarSeed,
    };
  }

  // Draw opening card from remaining draw pile (must not be Wild Draw Four)
  let topDiscard: Card = drawPile.pop()!;
  while (topDiscard.type === 'wild_draw_four') {
    // Put back and re-draw
    drawPile.unshift(topDiscard);
    drawPile = shuffleDeck(drawPile, rng);
    topDiscard = drawPile.pop()!;
  }

  let activeColor: CardColor = topDiscard.color ?? 'red';
  let currentPlayerIndex = 0;
  let direction: 1 | -1 = 1;

  // Resolve opening card effects
  if (topDiscard.type === 'draw_two') {
    // First player draws 2 and loses turn
    const penalizedPlayerId = playerIds[0];
    const drawn = drawPile.splice(0, 2);
    hands[penalizedPlayerId].push(...drawn);
    playerMap[penalizedPlayerId].cardCount += 2;
    currentPlayerIndex = 1; // Advance to second player
  } else if (topDiscard.type === 'skip') {
    // First player is skipped
    currentPlayerIndex = 1;
  } else if (topDiscard.type === 'reverse') {
    direction = -1;
    if (players.length === 2 && rules.reverseInTwoPlayerSkips) {
      // In 2-player, dealer plays first (first player skipped)
      currentPlayerIndex = 1;
    } else {
      // With reverse, play goes counter-clockwise from dealer (i.e. last player in list)
      currentPlayerIndex = playerIds.length - 1;
    }
  }

  return {
    id,
    roomId,
    mode,
    status: 'in_progress',
    rules,
    playerIds,
    players: playerMap,
    hands,
    drawPile,
    discardPile: [topDiscard],
    activeColor,
    currentPlayerIndex,
    direction,
    lastPlayedCard: topDiscard,
    turnNumber: 1,
  };
}

/**
 * Checks if the game has ended with a winner.
 */
export function checkWinner(state: GameState): string | undefined {
  for (const playerId of state.playerIds) {
    if (state.hands[playerId]?.length === 0) {
      return playerId;
    }
  }
  return undefined;
}

/**
 * Returns cards in a player's hand that are legal to play.
 */
export function getLegalMoves(state: GameState, playerId: string): Card[] {
  if (state.status !== 'in_progress') return [];
  const currentPlayerId = state.playerIds[state.currentPlayerIndex];
  if (currentPlayerId !== playerId) return [];

  const hand = state.hands[playerId] || [];
  const topDiscard = state.discardPile[state.discardPile.length - 1];
  if (!topDiscard) return [];

  return hand.filter((card) => isCardPlayable(card, topDiscard, state.activeColor));
}

/**
 * Sanitizes game state into public state (zero opponent cards or hidden deck info leaked).
 */
export function getPublicGameState(state: GameState): PublicGameState {
  const topDiscard = state.discardPile[state.discardPile.length - 1] ?? {
    id: 'empty',
    color: 'red',
    type: 'number',
    value: 0,
  };

  const playersList: PlayerPublicInfo[] = state.playerIds.map((id) => {
    const p = state.players[id];
    const hand = state.hands[id] || [];
    return {
      id,
      name: p?.name || id,
      cardCount: hand.length,
      hasDeclaredUno: !!p?.hasDeclaredUno,
      isHost: !!p?.isHost,
      isConnected: p?.isConnected ?? true,
      avatarSeed: p?.avatarSeed,
    };
  });

  return {
    id: state.id,
    roomId: state.roomId,
    mode: state.mode,
    status: state.status,
    rules: state.rules,
    players: playersList,
    currentPlayerId: state.playerIds[state.currentPlayerIndex],
    topDiscardCard: topDiscard,
    activeColor: state.activeColor,
    direction: state.direction,
    drawPileCount: state.drawPile.length,
    discardPileCount: state.discardPile.length,
    pendingAction: state.pendingAction,
    winnerId: state.winnerId,
    lastPlayedCard: state.lastPlayedCard,
    turnNumber: state.turnNumber,
  };
}

/**
 * Produces private view tailored specifically for the requesting player.
 */
export function getPlayerPrivateState(state: GameState, playerId: string): PlayerPrivateState {
  const publicState = getPublicGameState(state);
  const myHand = state.hands[playerId] ? [...state.hands[playerId]] : [];
  const isMyTurn = publicState.currentPlayerId === playerId;
  const legalCards = isMyTurn ? getLegalMoves(state, playerId) : [];

  return {
    publicState,
    myHand,
    legalCardIds: legalCards.map((c) => c.id),
    canDraw: isMyTurn && !state.pendingAction,
    canPass: false, // Standard: drawing card either plays it or advances turn
    canDeclareUno: myHand.length <= 2 && !state.players[playerId]?.hasDeclaredUno,
  };
}
