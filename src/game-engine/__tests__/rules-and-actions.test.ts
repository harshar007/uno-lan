import { describe, it, expect } from 'vitest';
import { createGame, getLegalMoves } from '../game-state';
import { playCard, drawCard, declareUno, calloutUno } from '../actions';
import { Card } from '../types';

describe('Game Rules and Actions Tests', () => {
  const players = [
    { id: 'p1', name: 'Alice' },
    { id: 'p2', name: 'Bob' },
    { id: 'p3', name: 'Charlie' },
  ];

  it('deals 7 cards to each player and starts game in progress', () => {
    const game = createGame({ roomId: 'ROOM1', players, seed: 42 });
    expect(game.status).toBe('in_progress');
    expect(game.hands['p1']).toHaveLength(7);
    expect(game.hands['p2']).toHaveLength(7);
    expect(game.hands['p3']).toHaveLength(7);
    expect(game.discardPile.length).toBeGreaterThanOrEqual(1);
  });

  it('enforces legal and illegal card plays', () => {
    const game = createGame({ roomId: 'ROOM1', players, seed: 42 });
    const currentPlayerId = game.playerIds[game.currentPlayerIndex];
    const otherPlayerId = game.playerIds[(game.currentPlayerIndex + 1) % 3];

    // Playing out of turn should be rejected
    const dummyCard: Card = { id: 'dummy', color: 'red', type: 'number', value: 5 };
    game.hands[otherPlayerId] = [dummyCard];

    const outOfTurn = playCard(game, otherPlayerId, dummyCard.id);
    expect(outOfTurn.success).toBe(false);
    expect(outOfTurn.error).toContain('not your turn');

    // Matching color or number plays successfully
    const top = game.discardPile[game.discardPile.length - 1];
    const legalCard: Card = {
      id: 'legal_1',
      color: game.activeColor,
      type: 'number',
      value: (top.value === 5 ? 6 : 5),
    };
    game.hands[currentPlayerId] = [legalCard];

    const validPlay = playCard(game, currentPlayerId, legalCard.id);
    expect(validPlay.success).toBe(true);
    expect(validPlay.state.discardPile[validPlay.state.discardPile.length - 1].id).toBe('legal_1');
  });

  it('applies Skip card effect advancing 2 turns', () => {
    const game = createGame({ roomId: 'ROOM1', players, seed: 42 });
    const p0 = game.playerIds[0];
    game.currentPlayerIndex = 0;
    game.direction = 1;

    const skipCard: Card = { id: 'skip_card', color: game.activeColor, type: 'skip' };
    game.hands[p0] = [skipCard, { id: 'filler', color: 'red', type: 'number', value: 1 }];

    const result = playCard(game, p0, skipCard.id);
    expect(result.success).toBe(true);
    // With 3 players, step 2 advances from index 0 -> index 2 (skipping index 1)
    expect(result.state.currentPlayerIndex).toBe(2);
  });

  it('applies Draw Two effect forcing next player to draw 2 and skips them', () => {
    const game = createGame({ roomId: 'ROOM1', players, seed: 42 });
    const p0 = game.playerIds[0];
    const p1 = game.playerIds[1];
    game.currentPlayerIndex = 0;
    game.direction = 1;

    const initialP1HandCount = game.hands[p1].length;
    const d2Card: Card = { id: 'd2_card', color: game.activeColor, type: 'draw_two' };
    game.hands[p0] = [d2Card, { id: 'filler', color: 'red', type: 'number', value: 1 }];

    const result = playCard(game, p0, d2Card.id);
    expect(result.success).toBe(true);
    expect(result.state.hands[p1].length).toBe(initialP1HandCount + 2);
    // Skips p1, moves to p2
    expect(result.state.currentPlayerIndex).toBe(2);
  });

  it('handles Wild Card color selection', () => {
    const game = createGame({ roomId: 'ROOM1', players, seed: 42 });
    const p0 = game.playerIds[0];
    game.currentPlayerIndex = 0;

    const wildCard: Card = { id: 'wild_c', type: 'wild' };
    game.hands[p0] = [wildCard, { id: 'filler', color: 'red', type: 'number', value: 1 }];

    // Playing wild card with color chosen
    const result = playCard(game, p0, wildCard.id, 'blue');
    expect(result.success).toBe(true);
    expect(result.state.activeColor).toBe('blue');
  });

  it('detects victory when player plays their final card', () => {
    const game = createGame({ roomId: 'ROOM1', players, seed: 42 });
    const p0 = game.playerIds[0];
    game.currentPlayerIndex = 0;

    const finalCard: Card = { id: 'final_c', color: game.activeColor, type: 'number', value: 9 };
    game.hands[p0] = [finalCard];

    const result = playCard(game, p0, finalCard.id);
    expect(result.success).toBe(true);
    expect(result.state.status).toBe('finished');
    expect(result.state.winnerId).toBe(p0);

    // No further actions accepted once finished
    const postPlay = drawCard(result.state, p0);
    expect(postPlay.success).toBe(false);
  });

  it('manages UNO declarations and callout penalties', () => {
    const game = createGame({ roomId: 'ROOM1', players, seed: 42 });
    const p1 = game.playerIds[0];
    const p2 = game.playerIds[1];

    // p1 has 1 card left
    game.hands[p1] = [{ id: 'c1', color: 'red', type: 'number', value: 1 }];
    game.players[p1].cardCount = 1;
    game.players[p1].hasDeclaredUno = false;

    // p2 calls out p1 for missing UNO
    const callout = calloutUno(game, p2, p1);
    expect(callout.success).toBe(true);
    // p1 should receive penalty cards (default 2)
    expect(callout.state.hands[p1].length).toBe(3);

    // Caller cannot call out themselves
    const selfCallout = calloutUno(game, p2, p2);
    expect(selfCallout.success).toBe(false);
    expect(selfCallout.error).toContain('yourself');
  });

  it('rejects wild card without chosen color without corrupting hand or discard pile', () => {
    const game = createGame({ roomId: 'ROOM1', players, seed: 42 });
    const p0 = game.playerIds[0];
    game.currentPlayerIndex = 0;

    const wildCard: Card = { id: 'wild_no_color', type: 'wild' };
    game.hands[p0] = [wildCard];
    const initialDiscardCount = game.discardPile.length;

    const result = playCard(game, p0, wildCard.id);
    expect(result.success).toBe(false);
    expect(result.error).toContain('choose a color');
    // Hand and discard pile should remain untouched
    expect(result.state.hands[p0]).toHaveLength(1);
    expect(result.state.discardPile).toHaveLength(initialDiscardCount);
  });

  it('advances turn cleanly without freezing when draw pile and discard pile are empty', () => {
    const game = createGame({ roomId: 'ROOM1', players, seed: 42 });
    const p0 = game.playerIds[0];
    game.currentPlayerIndex = 0;
    game.drawPile = [];
    game.discardPile = [game.discardPile[0]]; // only 1 top card

    const result = drawCard(game, p0);
    expect(result.success).toBe(true);
    expect(result.state.currentPlayerIndex).toBe(1); // turn successfully advanced
  });
});
