import { describe, it, expect } from 'vitest';
import { createGame } from '../game-state.js';
import { playCard } from '../actions.js';
import { Card } from '../types.js';

describe('UNO Reverse Mode Specific Tests', () => {
  const players = [
    { id: 'p1', name: 'Alice' },
    { id: 'p2', name: 'Bob' },
    { id: 'p3', name: 'Charlie' },
    { id: 'p4', name: 'Dave' },
  ];

  it('triggers Reverse Surge when a matching number card is played in UNO Reverse mode', () => {
    const game = createGame({ roomId: 'REV1', mode: 'reverse', players, seed: 123 });
    expect(game.rules.gameMode).toBe('reverse');
    expect(game.rules.unoReverseSurgeAllowed).toBe(true);

    game.currentPlayerIndex = 0;
    game.direction = 1;

    // Set top discard to Red 7
    const topDiscard: Card = { id: 'top_7', color: 'red', type: 'number', value: 7 };
    game.discardPile = [topDiscard];
    game.activeColor = 'red';

    // Player 1 plays Blue 7 (same number -> triggers Reverse Surge!)
    const matchingNumberCard: Card = { id: 'blue_7', color: 'blue', type: 'number', value: 7 };
    game.hands['p1'] = [matchingNumberCard, { id: 'extra', color: 'green', type: 'number', value: 2 }];

    const result = playCard(game, 'p1', matchingNumberCard.id);
    expect(result.success).toBe(true);
    // Direction should have flipped from 1 to -1!
    expect(result.state.direction).toBe(-1);
    // And next player should be index (0 + (-1 * 1) + 4) % 4 = 3 (Dave)
    expect(result.state.currentPlayerIndex).toBe(3);
  });
});
