import { describe, it, expect } from 'vitest';
import { createStandardDeck, shuffleDeck, recycleDiscardPile } from '../deck';
import { createSeededRandom } from '../shuffle';
import { CardColor } from '../types';

describe('Deck Engine Tests', () => {
  it('creates exact 108 cards matching official UNO specifications', () => {
    const deck = createStandardDeck();
    expect(deck).toHaveLength(108);

    const colors: CardColor[] = ['red', 'blue', 'green', 'yellow'];

    // 76 number cards: 1x 0 per color (4), 2x 1-9 per color (72)
    const numberCards = deck.filter((c) => c.type === 'number');
    expect(numberCards).toHaveLength(76);

    for (const color of colors) {
      const zeros = numberCards.filter((c) => c.color === color && c.value === 0);
      expect(zeros).toHaveLength(1);

      for (let v = 1; v <= 9; v++) {
        const valCards = numberCards.filter((c) => c.color === color && c.value === v);
        expect(valCards).toHaveLength(2);
      }
    }

    // 24 action cards: 2x Skip, 2x Reverse, 2x Draw Two per color
    const skips = deck.filter((c) => c.type === 'skip');
    const reverses = deck.filter((c) => c.type === 'reverse');
    const drawTwos = deck.filter((c) => c.type === 'draw_two');
    expect(skips).toHaveLength(8);
    expect(reverses).toHaveLength(8);
    expect(drawTwos).toHaveLength(8);

    // 8 wild cards: 4x Wild, 4x Wild Draw Four
    const wilds = deck.filter((c) => c.type === 'wild');
    const wildDrawFours = deck.filter((c) => c.type === 'wild_draw_four');
    expect(wilds).toHaveLength(4);
    expect(wildDrawFours).toHaveLength(4);
  });

  it('shuffles deterministically with a seeded PRNG', () => {
    const deck = createStandardDeck();
    const seed = 12345;

    const shuffled1 = shuffleDeck(deck, createSeededRandom(seed));
    const shuffled2 = shuffleDeck(deck, createSeededRandom(seed));

    expect(shuffled1.map((c) => c.id)).toEqual(shuffled2.map((c) => c.id));
    expect(shuffled1.map((c) => c.id)).not.toEqual(deck.map((c) => c.id));
  });

  it('recycles discard pile preserving the top discard card', () => {
    const discard = [
      { id: '1', color: 'red' as CardColor, type: 'number' as const, value: 5 },
      { id: '2', color: 'blue' as CardColor, type: 'number' as const, value: 7 },
      { id: '3', color: 'green' as CardColor, type: 'skip' as const },
    ];

    const { drawPile, topDiscard } = recycleDiscardPile(discard);
    expect(topDiscard.id).toBe('3');
    expect(drawPile).toHaveLength(2);
    expect(drawPile.map((c) => c.id).sort()).toEqual(['1', '2']);
  });
});
