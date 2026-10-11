import { Card, CardColor, GameState, getLegalMoves, isWildCard } from '@stack-uno/game-engine';

export interface BotDecision {
  action: 'play' | 'draw';
  cardId?: string;
  chosenColor?: CardColor;
  declareUnoFirst?: boolean;
  calloutTargetId?: string;
}

const ALL_COLORS: CardColor[] = ['red', 'blue', 'green', 'yellow'];

/**
 * Determines the most dominant color in a bot's hand.
 */
export function getBotDominantColor(hand: Card[]): CardColor {
  const colorCounts: Record<CardColor, number> = {
    red: 0,
    blue: 0,
    green: 0,
    yellow: 0,
  };

  for (const card of hand) {
    if (card.color && card.color in colorCounts) {
      colorCounts[card.color]++;
    }
  }

  let bestColor: CardColor = 'red';
  let maxCount = -1;

  for (const color of ALL_COLORS) {
    if (colorCounts[color] > maxCount) {
      maxCount = colorCounts[color];
      bestColor = color;
    }
  }

  return bestColor;
}

/**
 * Calculates the next player ID in sequence.
 */
function getNextPlayerId(state: GameState): string {
  const count = state.playerIds.length;
  const nextIdx = (state.currentPlayerIndex + state.direction + count) % count;
  return state.playerIds[nextIdx];
}

/**
 * Decides the bot's move based on game state and hand.
 */
export function decideBotMove(state: GameState, botPlayerId: string): BotDecision {
  const hand = state.hands[botPlayerId] || [];
  const botInfo = state.players[botPlayerId];

  // 1. Check if bot needs to declare UNO before playing down to 1 card
  const declareUnoFirst = hand.length === 2 && !botInfo?.hasDeclaredUno;

  // 2. Check if an opponent missed UNO declaration and can be called out
  let calloutTargetId: string | undefined;
  for (const pId of state.playerIds) {
    if (pId !== botPlayerId) {
      const oppHand = state.hands[pId] || [];
      const oppInfo = state.players[pId];
      if (oppHand.length === 1 && !oppInfo?.hasDeclaredUno) {
        // 80% bot callout chance
        if (Math.random() < 0.8) {
          calloutTargetId = pId;
          break;
        }
      }
    }
  }

  // 3. Get legal cards to play
  const legalCards = getLegalMoves(state, botPlayerId);

  // If no legal card, must draw
  if (legalCards.length === 0) {
    return {
      action: 'draw',
      calloutTargetId,
    };
  }

  const nextPlayerId = getNextPlayerId(state);
  const nextPlayerHand = state.hands[nextPlayerId] || [];
  const nextPlayerIsThreat = nextPlayerHand.length <= 2;

  // Sort legal cards by tactical priority:
  // Threat defense: draw_two, wild_draw_four, skip, reverse
  // Standard: number cards first (to preserve actions), then colored action cards, then wild cards
  const scoredCards = legalCards.map((card) => {
    let score = 0;

    if (card.type === 'number') {
      score += 10 + (card.value ?? 0);
    } else if (card.type === 'skip') {
      score += nextPlayerIsThreat ? 80 : 30;
    } else if (card.type === 'reverse') {
      score += nextPlayerIsThreat ? 75 : 25;
    } else if (card.type === 'draw_two') {
      score += nextPlayerIsThreat ? 90 : 40;
    } else if (card.type === 'wild') {
      // Save wilds unless necessary or few cards left
      score += hand.length <= 3 ? 50 : 15;
    } else if (card.type === 'wild_draw_four') {
      score += nextPlayerIsThreat ? 95 : 20;
    }

    return { card, score };
  });

  scoredCards.sort((a, b) => b.score - a.score);
  const bestCard = scoredCards[0].card;

  let chosenColor: CardColor | undefined;
  if (isWildCard(bestCard)) {
    // Pick the color the bot has the most of among non-wild cards
    const remainingCards = hand.filter((c) => c.id !== bestCard.id);
    chosenColor = getBotDominantColor(remainingCards);
  }

  return {
    action: 'play',
    cardId: bestCard.id,
    chosenColor,
    declareUnoFirst,
    calloutTargetId,
  };
}
