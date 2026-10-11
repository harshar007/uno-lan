import { describe, it, expect } from 'vitest';
import { createGame, getPublicGameState, getPlayerPrivateState } from '../game-state';
import { playCard } from '../actions';
import { calculateNextPlayerIndex } from '../turn-manager';
import { Card } from '../types';

describe('Turn Management, Seating, and Privacy Isolation', () => {
  it('supports 10 players and cycles turns clockwise and counter-clockwise', () => {
    const tenPlayers = Array.from({ length: 10 }, (_, i) => ({
      id: `p_${i}`,
      name: `Player ${i}`,
    }));

    const game = createGame({ roomId: 'ROOM10', players: tenPlayers, seed: 99 });
    expect(game.playerIds).toHaveLength(10);

    // Clockwise progression
    expect(calculateNextPlayerIndex(0, 10, 1, 1)).toBe(1);
    expect(calculateNextPlayerIndex(9, 10, 1, 1)).toBe(0);

    // Counter-clockwise progression
    expect(calculateNextPlayerIndex(0, 10, -1, 1)).toBe(9);
    expect(calculateNextPlayerIndex(1, 10, -1, 1)).toBe(0);
  });

  it('acts as skip/extra turn in 2-player mode when Reverse is played', () => {
    const twoPlayers = [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
    ];
    const game = createGame({ roomId: 'ROOM2', players: twoPlayers, seed: 10 });
    game.currentPlayerIndex = 0;
    game.direction = 1;

    const revCard: Card = { id: 'rev_c', color: game.activeColor, type: 'reverse' };
    game.hands['p1'] = [revCard, { id: 'card2', color: 'red', type: 'number', value: 1 }];

    const result = playCard(game, 'p1', revCard.id);
    expect(result.success).toBe(true);
    // In 2-player with reverseInTwoPlayerSkips, turn returns back to p1 (index 0)
    expect(result.state.currentPlayerIndex).toBe(0);
  });

  it('strictly isolates private hands in public state projection', () => {
    const players = [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
      { id: 'p3', name: 'Charlie' },
    ];
    const game = createGame({ roomId: 'SECRET', players, seed: 55 });

    const publicState = getPublicGameState(game);
    // Ensure publicState contains no hand arrays or raw card lists of players
    expect((publicState as any).hands).toBeUndefined();
    expect((publicState as any).drawPile).toBeUndefined();
    publicState.players.forEach((p) => {
      expect((p as any).hand).toBeUndefined();
      expect(p.cardCount).toBe(game.hands[p.id].length);
    });

    // Private state for p1 only reveals p1's hand
    const p1Private = getPlayerPrivateState(game, 'p1');
    expect(p1Private.myHand).toHaveLength(game.hands['p1'].length);
    expect((p1Private as any).hands).toBeUndefined();
  });
});
