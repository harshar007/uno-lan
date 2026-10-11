import { Card, CardColor } from './types.js';

export function isWildCard(card: Card): boolean {
  return card.type === 'wild' || card.type === 'wild_draw_four';
}

export function isActionCard(card: Card): boolean {
  return card.type === 'skip' || card.type === 'reverse' || card.type === 'draw_two';
}

export function isNumberCard(card: Card): boolean {
  return card.type === 'number';
}

/**
 * Checks if a candidate card can be legally played on top of the discard pile
 * given the currently active color.
 */
export function isCardPlayable(card: Card, topDiscard: Card, activeColor: CardColor): boolean {
  // Wild cards can always be played
  if (isWildCard(card)) {
    return true;
  }

  // Matches the active color chosen (or existing card color)
  if (card.color === activeColor) {
    return true;
  }

  // Matches number value
  if (isNumberCard(card) && isNumberCard(topDiscard) && card.value === topDiscard.value) {
    return true;
  }

  // Matches action type (e.g. Blue Skip on Red Skip)
  if (isActionCard(card) && card.type === topDiscard.type) {
    return true;
  }

  return false;
}

/**
 * Returns score points for a card (official UNO scoring standard):
 * - Number cards: Face value (0-9)
 * - Action cards (Skip, Reverse, Draw Two): 20 points
 * - Wild / Wild Draw Four: 50 points
 */
export function getCardPoints(card: Card): number {
  if (isNumberCard(card)) {
    return card.value ?? 0;
  }
  if (isActionCard(card)) {
    return 20;
  }
  if (isWildCard(card)) {
    return 50;
  }
  return 0;
}

export function formatCardLabel(card: Card): string {
  if (card.type === 'wild') return 'Wild';
  if (card.type === 'wild_draw_four') return 'Wild Draw +4';
  const colorName = card.color ? card.color.toUpperCase() : '';
  if (card.type === 'number') return `${colorName} ${card.value}`;
  if (card.type === 'skip') return `${colorName} Skip`;
  if (card.type === 'reverse') return `${colorName} Reverse`;
  if (card.type === 'draw_two') return `${colorName} +2`;
  return `${colorName} ${card.type}`;
}
