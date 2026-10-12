import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, CardColor } from '@stack-uno/game-engine';
import { GameCard } from './GameCard';
import { COLORS } from '../theme/colors';

interface Props {
  topCard: Card;
  activeColor: CardColor;
  discardCount: number;
}

const COLOR_HEX: Record<CardColor, string> = {
  red: '#E71D36',
  blue: '#0066FF',
  green: '#00B894',
  yellow: '#FFB800',
};

export const DiscardPile: React.FC<Props> = ({ topCard, activeColor = 'red', discardCount = 1 }) => {
  const safeTopCard = topCard ?? { id: 'empty', type: 'number', value: 0 };
  const safeColor = activeColor ?? safeTopCard.color ?? 'red';
  const activeColorHex = COLOR_HEX[safeColor] || '#E71D36';

  return (
    <View style={styles.container}>
      {/* Physical Discard Stack Layers (Cards underneath with natural rotation) */}
      {discardCount > 2 && (
        <View style={[styles.underCard, styles.underCard2]} />
      )}
      {discardCount > 1 && (
        <View style={[styles.underCard, styles.underCard1]} />
      )}

      {/* Top Discarded Card */}
      <View style={[styles.topCardWrapper, { shadowColor: activeColorHex }]}>
        <GameCard card={safeTopCard} size="medium" disabled />
      </View>

      {/* Active Color Casino Marker */}
      <View style={styles.colorBadge}>
        <View style={[styles.colorDot, { backgroundColor: activeColorHex }]} />
        <Text style={styles.colorText}>{safeColor.toUpperCase()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    position: 'relative',
    width: 76,
    height: 122,
  },
  underCard: {
    position: 'absolute',
    width: 70,
    height: 104,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  underCard2: {
    top: 3,
    left: 2,
    transform: [{ rotate: '-7deg' }],
    backgroundColor: '#EAEAEA',
  },
  underCard1: {
    top: 1,
    left: -2,
    transform: [{ rotate: '5deg' }],
    backgroundColor: '#F5F5F5',
  },
  topCardWrapper: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
  colorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    position: 'absolute',
    bottom: 0,
    zIndex: 10,
    backgroundColor: '#121212',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  colorText: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
