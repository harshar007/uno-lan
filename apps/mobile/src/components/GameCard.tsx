import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, CardColor } from '@stack-uno/game-engine';
import { COLORS } from '../theme/colors.js';

interface Props {
  card: Card;
  size?: 'small' | 'medium' | 'large';
  isSelected?: boolean;
  isPlayable?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

export const GameCard: React.FC<Props> = ({
  card,
  size = 'medium',
  isSelected = false,
  isPlayable = false,
  onPress,
  disabled = false,
}) => {
  const getBackgroundColor = (): string => {
    switch (card.color) {
      case 'red':
        return COLORS.cardRed;
      case 'blue':
        return COLORS.cardBlue;
      case 'green':
        return COLORS.cardGreen;
      case 'yellow':
        return COLORS.cardYellow;
      default:
        return COLORS.cardWild;
    }
  };

  const getSymbol = (): string => {
    switch (card.type) {
      case 'number':
        return String(card.value ?? '');
      case 'skip':
        return '⊘';
      case 'reverse':
        return '⇄';
      case 'draw_two':
        return '+2';
      case 'wild':
        return '✦';
      case 'wild_draw_four':
        return '+4';
      default:
        return '';
    }
  };

  const isSmall = size === 'small';
  const isLarge = size === 'large';

  const width = isSmall ? 44 : isLarge ? 88 : 66;
  const height = isSmall ? 64 : isLarge ? 128 : 96;
  const symbolFontSize = isSmall ? 18 : isLarge ? 38 : 28;
  const cornerFontSize = isSmall ? 10 : isLarge ? 16 : 12;

  const symbol = getSymbol();
  const isWild = card.type === 'wild' || card.type === 'wild_draw_four';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={[
        styles.cardContainer,
        {
          width,
          height,
          backgroundColor: getBackgroundColor(),
        },
        isSelected && styles.selectedGlow,
        isPlayable && !isSelected && styles.playableGlow,
      ]}
    >
      {/* Top Left Corner */}
      <View style={styles.topLeft}>
        <Text
          style={[
            styles.cornerText,
            { fontSize: cornerFontSize },
            card.color === 'yellow' && styles.darkText,
          ]}
        >
          {symbol}
        </Text>
      </View>

      {/* Center Oval & Symbol */}
      <View
        style={[
          styles.centerOval,
          isWild && styles.wildOval,
          card.color === 'yellow' && styles.yellowCenterOval,
        ]}
      >
        <Text
          style={[
            styles.centerText,
            { fontSize: symbolFontSize },
            isWild && styles.wildText,
            card.color === 'yellow' && styles.darkText,
          ]}
        >
          {symbol}
        </Text>
      </View>

      {/* Bottom Right Corner */}
      <View style={styles.bottomRight}>
        <Text
          style={[
            styles.cornerText,
            { fontSize: cornerFontSize },
            card.color === 'yellow' && styles.darkText,
          ]}
        >
          {symbol}
        </Text>
      </View>

      {/* Wild 4-color Corner Accent */}
      {isWild && (
        <View style={styles.wildAccent}>
          <View style={[styles.wildDot, { backgroundColor: COLORS.cardRed }]} />
          <View style={[styles.wildDot, { backgroundColor: COLORS.cardBlue }]} />
          <View style={[styles.wildDot, { backgroundColor: COLORS.cardYellow }]} />
          <View style={[styles.wildDot, { backgroundColor: COLORS.cardGreen }]} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FFFFFF33',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  selectedGlow: {
    borderColor: COLORS.primaryGold,
    borderWidth: 3,
    shadowColor: COLORS.primaryGold,
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 10,
    transform: [{ translateY: -12 }],
  },
  playableGlow: {
    borderColor: COLORS.brightYellow,
    borderWidth: 2,
    shadowColor: COLORS.brightYellow,
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  topLeft: {
    position: 'absolute',
    top: 4,
    left: 6,
  },
  bottomRight: {
    position: 'absolute',
    bottom: 4,
    right: 6,
    transform: [{ rotate: '180deg' }],
  },
  cornerText: {
    fontWeight: '900',
    color: '#FFFFFF',
  },
  centerOval: {
    width: '74%',
    height: '62%',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FFFFFF44',
    backgroundColor: '#00000022',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-18deg' }],
  },
  wildOval: {
    borderColor: COLORS.primaryGold,
    backgroundColor: '#08080888',
  },
  yellowCenterOval: {
    borderColor: '#00000022',
    backgroundColor: '#FFFFFF33',
  },
  centerText: {
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  wildText: {
    color: COLORS.primaryGold,
  },
  darkText: {
    color: '#111111',
  },
  wildAccent: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 14,
    gap: 2,
  },
  wildDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
