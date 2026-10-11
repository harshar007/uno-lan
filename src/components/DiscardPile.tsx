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

export const DiscardPile: React.FC<Props> = ({ topCard, activeColor, discardCount }) => {
  const getActiveColorHex = (color: CardColor): string => {
    switch (color) {
      case 'red':
        return COLORS.cardRed;
      case 'blue':
        return COLORS.cardBlue;
      case 'green':
        return COLORS.cardGreen;
      case 'yellow':
        return COLORS.cardYellow;
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.activeColorRing,
          { borderColor: getActiveColorHex(activeColor) },
        ]}
      >
        <GameCard card={topCard} size="medium" disabled />
      </View>
      <View style={styles.colorIndicator}>
        <View
          style={[
            styles.colorDot,
            { backgroundColor: getActiveColorHex(activeColor) },
          ]}
        />
        <Text style={styles.colorLabel}>
          {activeColor.toUpperCase()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  activeColorRing: {
    padding: 3,
    borderWidth: 2.5,
    borderRadius: 12,
  },
  colorIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    backgroundColor: '#111111',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#222222',
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  colorLabel: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
