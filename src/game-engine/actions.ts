import { ActionResult, Card, CardColor, GameState } from './types';
import { isCardPlayable, isWildCard } from './cards';
import { calculateNextPlayerIndex, reverseDirection } from './turn-manager';
import { recycleDiscardPile } from './deck';
import { RandomGenerator } from './shuffle';

/**
 * Ensures cards are available in the draw pile, recycling the discard pile if needed.
 */
function ensureDrawPileCards(state: GameState, countNeeded: number, rng?: RandomGenerator): GameState {
  if (state.drawPile.length >= countNeeded) {
    return state;
  }

  const { drawPile: newDrawPile, topDiscard } = recycleDiscardPile(state.discardPile, rng);
  return {
    ...state,
    drawPile: [...state.drawPile, ...newDrawPile],
    discardPile: [topDiscard],
  };
}

/**
 * Executes a card play action by the active player.
 */
export function playCard(
  currentState: GameState,
  playerId: string,
  cardId: string,
  chosenColor?: CardColor,
  rng?: RandomGenerator
): ActionResult {
  if (currentState.status !== 'in_progress') {
    return { success: false, state: currentState, error: 'Game is not in progress.' };
  }

  const currentPlayerId = currentState.playerIds[currentState.currentPlayerIndex];
  if (currentPlayerId !== playerId) {
    return { success: false, state: currentState, error: 'It is not your turn.' };
  }

  if (currentState.pendingAction) {
    return {
      success: false,
      state: currentState,
      error: `Pending action '${currentState.pendingAction.type}' must be resolved first.`,
    };
  }

  const playerHand = currentState.hands[playerId] || [];
  const cardIndex = playerHand.findIndex((c) => c.id === cardId);
  if (cardIndex === -1) {
    return { success: false, state: currentState, error: 'Card not found in player hand.' };
  }

  const card = playerHand[cardIndex];
  const topDiscard = currentState.discardPile[currentState.discardPile.length - 1];

  if (!isCardPlayable(card, topDiscard, currentState.activeColor)) {
    return { success: false, state: currentState, error: 'Illegal card play.' };
  }

  // Handle wild card color choice requirement
  if (isWildCard(card) && !chosenColor) {
    return {
      success: false,
      state: {
        ...currentState,
        pendingAction: {
          type: 'choose_color',
          playerId,
        },
      },
      error: 'You must choose a color when playing a wild card.',
    };
  }

  // Clone state for mutation
  let state: GameState = {
    ...currentState,
    hands: { ...currentState.hands },
    players: { ...currentState.players },
    discardPile: [...currentState.discardPile],
    drawPile: [...currentState.drawPile],
  };

  // Remove card from hand
  const newHand = [...playerHand];
  newHand.splice(cardIndex, 1);
  state.hands[playerId] = newHand;

  // Prepare played card
  const playedCard: Card = {
    ...card,
    color: isWildCard(card) ? chosenColor : card.color,
  };

  state.discardPile.push(playedCard);
  state.lastPlayedCard = playedCard;
  state.activeColor = playedCard.color || state.activeColor;

  // Update public player info
  state.players[playerId] = {
    ...state.players[playerId],
    cardCount: newHand.length,
    // Reset UNO declaration flag if player now has >1 card
    hasDeclaredUno: newHand.length === 1 ? state.players[playerId].hasDeclaredUno : false,
  };

  // Check victory condition immediately
  if (newHand.length === 0) {
    state.status = 'finished';
    state.winnerId = playerId;
    return { success: true, state };
  }

  const numPlayers = state.playerIds.length;
  let turnStep = 1;

  // Mode B: UNO Reverse Special Mechanics - "Reverse Surge"
  // In UNO Reverse, playing a number card matching the top discard value flips direction
  if (
    state.rules.gameMode === 'reverse' &&
    state.rules.unoReverseSurgeAllowed &&
    card.type === 'number' &&
    topDiscard.type === 'number' &&
    card.value === topDiscard.value
  ) {
    state.direction = reverseDirection(state.direction);
  }

  // Resolve card effects
  switch (card.type) {
    case 'reverse': {
      state.direction = reverseDirection(state.direction);
      if (numPlayers === 2 && state.rules.reverseInTwoPlayerSkips) {
        // In 2-player, Reverse gives another turn to the player who played it
        turnStep = 2;
      } else {
        turnStep = 1;
      }
      break;
    }
    case 'skip': {
      // Skips the next player
      turnStep = 2;
      break;
    }
    case 'draw_two': {
      // Next player draws 2 cards and is skipped
      state = ensureDrawPileCards(state, 2, rng);
      const victimIndex = calculateNextPlayerIndex(state.currentPlayerIndex, numPlayers, state.direction, 1);
      const victimId = state.playerIds[victimIndex];
      const drawnCards = state.drawPile.splice(0, 2);

      state.hands[victimId] = [...(state.hands[victimId] || []), ...drawnCards];
      state.players[victimId] = {
        ...state.players[victimId],
        cardCount: state.hands[victimId].length,
        hasDeclaredUno: false,
      };

      turnStep = 2; // Skipped
      break;
    }
    case 'wild_draw_four': {
      // Next player draws 4 cards and is skipped
      state = ensureDrawPileCards(state, 4, rng);
      const victimIndex = calculateNextPlayerIndex(state.currentPlayerIndex, numPlayers, state.direction, 1);
      const victimId = state.playerIds[victimIndex];
      const drawnCards = state.drawPile.splice(0, 4);

      state.hands[victimId] = [...(state.hands[victimId] || []), ...drawnCards];
      state.players[victimId] = {
        ...state.players[victimId],
        cardCount: state.hands[victimId].length,
        hasDeclaredUno: false,
      };

      turnStep = 2; // Skipped
      break;
    }
    case 'wild':
    case 'number':
    default: {
      turnStep = 1;
      break;
    }
  }

  // Advance to next player
  state.currentPlayerIndex = calculateNextPlayerIndex(
    state.currentPlayerIndex,
    numPlayers,
    state.direction,
    turnStep
  );
  state.turnNumber += 1;

  return { success: true, state };
}

/**
 * Active player draws a card from the draw pile.
 * If the draw pile is empty, the discard pile is recycled.
 * Turn then advances to the next player.
 */
export function drawCard(currentState: GameState, playerId: string, rng?: RandomGenerator): ActionResult {
  if (currentState.status !== 'in_progress') {
    return { success: false, state: currentState, error: 'Game is not in progress.' };
  }

  const currentPlayerId = currentState.playerIds[currentState.currentPlayerIndex];
  if (currentPlayerId !== playerId) {
    return { success: false, state: currentState, error: 'It is not your turn to draw.' };
  }

  let state = ensureDrawPileCards(currentState, 1, rng);
  if (state.drawPile.length === 0) {
    return { success: false, state, error: 'No cards available to draw.' };
  }

  state = {
    ...state,
    hands: { ...state.hands },
    players: { ...state.players },
    drawPile: [...state.drawPile],
  };

  const drawnCard = state.drawPile.pop()!;
  state.hands[playerId] = [...(state.hands[playerId] || []), drawnCard];
  state.players[playerId] = {
    ...state.players[playerId],
    cardCount: state.hands[playerId].length,
    hasDeclaredUno: false,
  };

  // Turn passes to next player
  state.currentPlayerIndex = calculateNextPlayerIndex(
    state.currentPlayerIndex,
    state.playerIds.length,
    state.direction,
    1
  );
  state.turnNumber += 1;

  return { success: true, state };
}

/**
 * Resolves a pending wild color selection.
 */
export function chooseWildColor(
  currentState: GameState,
  playerId: string,
  chosenColor: CardColor
): ActionResult {
  if (!currentState.pendingAction || currentState.pendingAction.type !== 'choose_color') {
    return { success: false, state: currentState, error: 'No pending color selection.' };
  }

  if (currentState.pendingAction.playerId !== playerId) {
    return { success: false, state: currentState, error: 'Not authorized to choose color.' };
  }

  const topDiscard = currentState.discardPile[currentState.discardPile.length - 1];
  const updatedDiscard: Card = {
    ...topDiscard,
    color: chosenColor,
  };

  const discardPile = [...currentState.discardPile];
  discardPile[discardPile.length - 1] = updatedDiscard;

  const state: GameState = {
    ...currentState,
    discardPile,
    activeColor: chosenColor,
    pendingAction: undefined,
  };

  return { success: true, state };
}

/**
 * Player explicitly declares UNO when holding 1 or 2 cards.
 */
export function declareUno(currentState: GameState, playerId: string): ActionResult {
  const hand = currentState.hands[playerId] || [];
  if (hand.length > 2) {
    return {
      success: false,
      state: currentState,
      error: 'Cannot declare UNO with more than 2 cards.',
    };
  }

  const state: GameState = {
    ...currentState,
    players: {
      ...currentState.players,
      [playerId]: {
        ...currentState.players[playerId],
        hasDeclaredUno: true,
      },
    },
  };

  return { success: true, state };
}

/**
 * Any player calls out an opponent who has 1 card but failed to declare UNO.
 * Penalizes the target player with penalty cards.
 */
export function calloutUno(
  currentState: GameState,
  callerPlayerId: string,
  targetPlayerId: string,
  rng?: RandomGenerator
): ActionResult {
  if (currentState.status !== 'in_progress') {
    return { success: false, state: currentState, error: 'Game is not in progress.' };
  }

  const targetHand = currentState.hands[targetPlayerId] || [];
  const targetPlayer = currentState.players[targetPlayerId];

  if (targetHand.length !== 1 || targetPlayer?.hasDeclaredUno) {
    return {
      success: false,
      state: currentState,
      error: 'Target player has not missed an UNO declaration.',
    };
  }

  const penaltyCount = currentState.rules.missedUnoPenaltyCards;
  let state = ensureDrawPileCards(currentState, penaltyCount, rng);

  state = {
    ...state,
    hands: { ...state.hands },
    players: { ...state.players },
    drawPile: [...state.drawPile],
  };

  const penaltyCards = state.drawPile.splice(0, penaltyCount);
  state.hands[targetPlayerId] = [...targetHand, ...penaltyCards];
  state.players[targetPlayerId] = {
    ...state.players[targetPlayerId],
    cardCount: state.hands[targetPlayerId].length,
    hasDeclaredUno: false,
  };

  return { success: true, state };
}
