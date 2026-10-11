import { GameMode, GameRules } from './types.js';

export function getDefaultRules(mode: GameMode): GameRules {
  if (mode === 'reverse') {
    return {
      gameMode: 'reverse',
      startingHandSize: 7,
      allowDrawStacking: true,
      drawUntilPlayable: false,
      reverseInTwoPlayerSkips: true,
      unoReverseSurgeAllowed: true,
      unoReverseDeflectionAllowed: true,
      missedUnoPenaltyCards: 2,
    };
  }

  // Classic UNO default rules
  return {
    gameMode: 'classic',
    startingHandSize: 7,
    allowDrawStacking: false,
    drawUntilPlayable: false,
    reverseInTwoPlayerSkips: true,
    unoReverseSurgeAllowed: false,
    unoReverseDeflectionAllowed: false,
    missedUnoPenaltyCards: 2,
  };
}
