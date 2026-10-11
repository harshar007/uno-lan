import { Card, CardColor } from './types';
import { RandomGenerator, shuffleArray } from './shuffle';

const COLORS: CardColor[] = ['red', 'blue', 'green', 'yellow'];

/**
 * Creates the standard 108-card UNO deck:
 * - 76 Number cards (one 0 per color, two 1-9 per color)
 * - 24 Action cards (two Skips, two Reverses, two Draw Twos per color)
 * - 8 Wild cards (four Wild, four Wild Draw Four)
 */
export function createStandardDeck(): Card[] {
  const deck: Card[] = [];
  let idCounter = 0;

  for (const color of COLORS) {
    // 1x Zero per color
    deck.push({
      id: `c_${color}_0_${++idCounter}`,
      color,
      type: 'number',
      value: 0,
    });

    // 2x 1-9 per color
    for (let val = 1; val <= 9; val++) {
      deck.push({
        id: `c_${color}_${val}_a_${++idCounter}`,
        color,
        type: 'number',
        value: val,
      });
      deck.push({
        id: `c_${color}_${val}_b_${++idCounter}`,
        color,
        type: 'number',
        value: val,
      });
    }

    // 2x Skip per color
    deck.push({ id: `c_${color}_skip_a_${++idCounter}`, color, type: 'skip' });
    deck.push({ id: `c_${color}_skip_b_${++idCounter}`, color, type: 'skip' });

    // 2x Reverse per color
    deck.push({ id: `c_${color}_rev_a_${++idCounter}`, color, type: 'reverse' });
    deck.push({ id: `c_${color}_rev_b_${++idCounter}`, color, type: 'reverse' });

    // 2x Draw Two per color
    deck.push({ id: `c_${color}_d2_a_${++idCounter}`, color, type: 'draw_two' });
    deck.push({ id: `c_${color}_d2_b_${++idCounter}`, color, type: 'draw_two' });
  }

  // 4x Wild cards
  for (let i = 1; i <= 4; i++) {
    deck.push({ id: `c_wild_${i}_${++idCounter}`, type: 'wild' });
  }

  // 4x Wild Draw Four cards
  for (let i = 1; i <= 4; i++) {
    deck.push({ id: `c_wd4_${i}_${++idCounter}`, type: 'wild_draw_four' });
  }

  return deck;
}

/**
 * Shuffles a card deck.
 */
export function shuffleDeck(deck: readonly Card[], rng?: RandomGenerator): Card[] {
  return shuffleArray(deck, rng);
}

/**
 * Recycles the discard pile when the draw pile is depleted.
 * Preserves the top card of the discard pile and reshuffles the remaining cards
 * to form the new draw pile. Wild cards have their temporary chosen color reset.
 */
export function recycleDiscardPile(
  discardPile: readonly Card[],
  rng?: RandomGenerator
): { drawPile: Card[]; topDiscard: Card } {
  if (discardPile.length <= 1) {
    return {
      drawPile: [],
      topDiscard: discardPile[0] ?? { id: 'fallback', color: 'red', type: 'number', value: 0 },
    };
  }

  const topDiscard = discardPile[discardPile.length - 1];
  const cardsToRecycle = discardPile.slice(0, -1).map((card) => {
    // Reset wild card color back to undefined for redraw
    if (card.type === 'wild' || card.type === 'wild_draw_four') {
      return { ...card, color: undefined };
    }
    return { ...card };
  });

  return {
    drawPile: shuffleArray(cardsToRecycle, rng),
    topDiscard,
  };
}
