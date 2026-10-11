import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Card } from '@stack-uno/game-engine';
import { colors } from '../theme/colors';
import { SPRING_CONFIG, ANIMATION_TIMING } from '../theme/animation';
import { haptic } from '../services/haptics';

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
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isSelected) {
      translateY.value = withSpring(-16, SPRING_CONFIG.cardLift);
      scale.value = withSpring(1.06, SPRING_CONFIG.cardLift);
    } else {
      translateY.value = withSpring(0, SPRING_CONFIG.cardLift);
      scale.value = withSpring(1, SPRING_CONFIG.cardLift);
    }
  }, [isSelected, translateY, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const getBackgroundColor = (): string => {
    switch (card.color) {
      case 'red':
        return colors.cardRed;
      case 'blue':
        return colors.cardBlue;
      case 'green':
        return colors.cardGreen;
      case 'yellow':
        return colors.cardYellow;
      default:
        return colors.cardWild;
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
  const isYellow = card.color === 'yellow';

  return (
    <Animated.View style={[animatedStyle, { zIndex: isSelected ? 50 : 1 }]}>
      <Pressable
        disabled={disabled || !onPress}
        onPress={() => {
          haptic.selection();
          onPress?.();
        }}
        style={[
          styles.cardContainer,
          {
            width,
            height,
            backgroundColor: getBackgroundColor(),
          },
          isSelected && styles.selectedGlow,
          isPlayable && !isSelected && styles.playableGlow,
          disabled && !isPlayable && styles.disabledCard,
        ]}
      >
        {/* Top Left Corner */}
        <View style={styles.topLeft}>
          <Text
            style={[
              styles.cornerText,
              { fontSize: cornerFontSize },
              isYellow && styles.darkText,
            ]}
          >
            {symbol}
          </Text>
        </View>

        {/* Center Oval & Graphic */}
        <View
          style={[
            styles.centerOval,
            isWild && styles.wildOval,
            isYellow && styles.yellowCenterOval,
          ]}
        >
          <Text
            style={[
              styles.centerText,
              { fontSize: symbolFontSize },
              isWild && styles.wildText,
              isYellow && styles.darkText,
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
              isYellow && styles.darkText,
            ]}
          >
            {symbol}
          </Text>
        </View>

        {/* Wild 4-Quadrant Accent */}
        {isWild && (
          <View style={styles.wildAccent}>
            <View style={[styles.wildDot, { backgroundColor: colors.cardRed }]} />
            <View style={[styles.wildDot, { backgroundColor: colors.cardBlue }]} />
            <View style={[styles.wildDot, { backgroundColor: colors.cardYellow }]} />
            <View style={[styles.wildDot, { backgroundColor: colors.cardGreen }]} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF40',
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
    borderColor: colors.gold,
    borderWidth: 2.5,
    shadowColor: colors.gold,
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 10,
  },
  playableGlow: {
    borderColor: colors.goldSoft,
    borderWidth: 2,
    shadowColor: colors.gold,
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  disabledCard: {
    opacity: 0.72,
  },
  topLeft: {
    position: 'absolute',
    top: 5,
    left: 6,
  },
  bottomRight: {
    position: 'absolute',
    bottom: 5,
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
    borderColor: colors.goldMetallic,
    backgroundColor: '#080808AA',
  },
  yellowCenterOval: {
    borderColor: '#00000022',
    backgroundColor: '#FFFFFF33',
  },
  centerText: {
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  wildText: {
    color: colors.gold,
  },
  darkText: {
    color: '#111111',
  },
  wildAccent: {
    position: 'absolute',
    top: 5,
    right: 5,
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
