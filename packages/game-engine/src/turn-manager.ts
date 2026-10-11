import { GameState, TurnDirection } from './types.js';

/**
 * Calculates the next player's seat index given the current index, total players, direction, and step count.
 */
export function calculateNextPlayerIndex(
  currentIndex: number,
  totalPlayers: number,
  direction: TurnDirection,
  step = 1
): number {
  if (totalPlayers <= 0) return 0;
  const delta = direction * step;
  return ((currentIndex + delta) % totalPlayers + totalPlayers) % totalPlayers;
}

/**
 * Returns the opposite direction.
 */
export function reverseDirection(direction: TurnDirection): TurnDirection {
  return direction === 1 ? -1 : 1;
}

/**
 * Advances the current player index in the game state.
 */
export function advanceTurn(state: GameState, step = 1): GameState {
  const nextIndex = calculateNextPlayerIndex(
    state.currentPlayerIndex,
    state.playerIds.length,
    state.direction,
    step
  );

  return {
    ...state,
    currentPlayerIndex: nextIndex,
    turnNumber: state.turnNumber + 1,
  };
}
