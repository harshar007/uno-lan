import { GameState } from './types.js';
import { getCardPoints } from './cards.js';

export interface PlayerStanding {
  playerId: string;
  playerName: string;
  cardCount: number;
  points: number;
  rank: number;
}

/**
 * Calculates end-of-game points and standings.
 * Winner gets 0 penalty points (or points based on opponents' cards).
 * Opponents receive penalty points equal to the cards left in their hand.
 */
export function calculateStandings(state: GameState): PlayerStanding[] {
  const standings = state.playerIds.map((playerId) => {
    const hand = state.hands[playerId] || [];
    const points = hand.reduce((sum, card) => sum + getCardPoints(card), 0);
    const player = state.players[playerId];

    return {
      playerId,
      playerName: player?.name || playerId,
      cardCount: hand.length,
      points,
      rank: 0,
    };
  });

  // Sort by card count ascending, then points ascending
  standings.sort((a, b) => {
    if (a.cardCount !== b.cardCount) {
      return a.cardCount - b.cardCount;
    }
    return a.points - b.points;
  });

  // Assign ranks
  standings.forEach((standing, index) => {
    standing.rank = index + 1;
  });

  return standings;
}
