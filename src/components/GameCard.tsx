import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Card } from '@stack-uno/game-engine';
import { colors } from '../theme/colors';
import { SPRING_CONFIG } from '../theme/animation';
import { haptic } from '../services/haptics';
import {
  SkipIcon,
  ReverseIcon,
  DrawTwoIcon,
  WildPinwheel,
  WildDrawFourGraphic,
} from './CardSvgIcons';

interface Props {
  card: Card;
  size?: 'small' | 'medium' | 'large';
  isSelected?: boolean;
  isPlayable?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

const CARD_COLORS = {
  red: '#EA2027',
  blue: '#0652DD',
  green: '#009432',
  yellow: '#FFC312',
  wild: '#121212',
};

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
      translateY.value = withSpring(-18, SPRING_CONFIG.cardLift);
      scale.value = withSpring(1.06, SPRING_CONFIG.cardLift);
    } else {
      translateY.value = withSpring(0, SPRING_CONFIG.cardLift);
      scale.value = withSpring(1, SPRING_CONFIG.cardLift);
    }
  }, [isSelected, translateY, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const cardColorHex = card.color ? CARD_COLORS[card.color] : CARD_COLORS.wild;
  const isYellow = card.color === 'yellow';
  const isWild = card.type === 'wild' || card.type === 'wild_draw_four';

  // Card dimensions (aspect ratio ~ 1 : 1.45)
  const isSmall = size === 'small';
  const isLarge = size === 'large';

  const width = isSmall ? 48 : isLarge ? 80 : 68;
  const height = isSmall ? 70 : isLarge ? 118 : 100;
  const borderWidth = isSmall ? 2.5 : isLarge ? 4 : 3.5;
  const borderRadius = isSmall ? 8 : isLarge ? 14 : 12;

  // Typography sizing
  const numberFontSize = isSmall ? 20 : isLarge ? 44 : 34;
  const cornerFontSize = isSmall ? 10 : isLarge ? 14 : 12;
  const actionIconSize = isSmall ? 20 : isLarge ? 44 : 34;
  const cornerIconSize = isSmall ? 9 : isLarge ? 13 : 11;

  // Format number text (underline 6 and 9)
  const renderNumberText = (val?: number) => {
    if (val === undefined) return '';
    if (val === 6) return '6̲';
    if (val === 9) return '9̲';
    return String(val);
  };

  // Render corner content
  const renderCornerContent = () => {
    if (card.type === 'number') {
      return (
        <Text
          style={[
            styles.cornerText,
            { fontSize: cornerFontSize },
            isYellow && styles.darkCornerText,
          ]}
        >
          {renderNumberText(card.value)}
        </Text>
      );
    }

    if (card.type === 'skip') {
      return (
        <SkipIcon
          color={isYellow ? '#111111' : '#FFFFFF'}
          size={cornerIconSize}
        />
      );
    }

    if (card.type === 'reverse') {
      return (
        <ReverseIcon
          color={isYellow ? '#111111' : '#FFFFFF'}
          size={cornerIconSize}
        />
      );
    }

    if (card.type === 'draw_two') {
      return (
        <Text
          style={[
            styles.cornerText,
            { fontSize: cornerFontSize - 1 },
            isYellow && styles.darkCornerText,
          ]}
        >
          +2
        </Text>
      );
    }

    if (card.type === 'wild_draw_four') {
      return (
        <Text
          style={[
            styles.cornerText,
            { fontSize: cornerFontSize - 2, color: colors.gold },
          ]}
        >
          +4
        </Text>
      );
    }

    return (
      <Text
        style={[
          styles.cornerText,
          { fontSize: cornerFontSize - 1, color: colors.gold },
        ]}
      >
        ✦
      </Text>
    );
  };

  // Render center oval content
  const renderCenterContent = () => {
    if (card.type === 'number') {
      return (
        <Text
          style={[
            styles.centerNumber,
            {
              fontSize: numberFontSize,
              color: cardColorHex,
            },
          ]}
        >
          {renderNumberText(card.value)}
        </Text>
      );
    }

    if (card.type === 'skip') {
      return <SkipIcon color={cardColorHex} size={actionIconSize} />;
    }

    if (card.type === 'reverse') {
      return <ReverseIcon color={cardColorHex} size={actionIconSize} />;
    }

    if (card.type === 'draw_two') {
      return (
        <View style={styles.centerActionCol}>
          <DrawTwoIcon color={cardColorHex} size={actionIconSize * 0.85} />
          <Text style={[styles.actionBadgeText, { color: cardColorHex }]}>+2</Text>
        </View>
      );
    }

    if (card.type === 'wild') {
      return (
        <View style={styles.centerActionCol}>
          <WildPinwheel size={actionIconSize * 0.9} />
          <Text style={styles.wildLabel}>WILD</Text>
        </View>
      );
    }

    if (card.type === 'wild_draw_four') {
      return (
        <View style={styles.centerActionCol}>
          <WildDrawFourGraphic size={actionIconSize * 0.85} />
          <Text style={styles.wildDrawFourText}>+4</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <Animated.View style={[animatedStyle, { zIndex: isSelected ? 50 : 1 }]}>
      <Pressable
        disabled={disabled || !onPress}
        onPress={() => {
          haptic.selection();
          onPress?.();
        }}
        style={[
          styles.cardOuter,
          {
            width,
            height,
            borderRadius,
            borderWidth,
            borderColor: '#FFFFFF',
          },
          isSelected && styles.selectedGlow,
          isPlayable && !isSelected && styles.playableGlow,
          disabled && !isPlayable && styles.disabledCard,
        ]}
      >
        {/* Inner Colored Field */}
        <View
          style={[
            styles.cardInner,
            {
              backgroundColor: cardColorHex,
              borderRadius: borderRadius - 2,
            },
            isWild && styles.wildCardInner,
          ]}
        >
          {/* Top-Left Corner */}
          <View style={styles.topLeftCorner}>{renderCornerContent()}</View>

          {/* Tilted Signature White Center Oval */}
          <View
            style={[
              styles.centerOval,
              isWild && styles.wildCenterOval,
            ]}
          >
            {renderCenterContent()}
          </View>

          {/* Bottom-Right Corner (180° rotated) */}
          <View style={styles.bottomRightCorner}>{renderCornerContent()}</View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardOuter: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 6,
    overflow: 'hidden',
  },
  cardInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  wildCardInner: {
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  selectedGlow: {
    borderColor: colors.gold,
    borderWidth: 4,
    shadowColor: colors.gold,
    shadowOpacity: 0.95,
    shadowRadius: 12,
    elevation: 12,
  },
  playableGlow: {
    borderColor: '#FFF3B0',
    borderWidth: 3.5,
    shadowColor: colors.gold,
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  disabledCard: {
    opacity: 0.65,
  },
  topLeftCorner: {
    position: 'absolute',
    top: 4,
    left: 5,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomRightCorner: {
    position: 'absolute',
    bottom: 4,
    right: 5,
    zIndex: 10,
    transform: [{ rotate: '180deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerText: {
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  darkCornerText: {
    color: '#111111',
    textShadowColor: 'rgba(255,255,255,0.4)',
  },
  centerOval: {
    width: '84%',
    height: '66%',
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-26deg' }],
    shadowColor: '#000000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  wildCenterOval: {
    backgroundColor: '#0F0F0F',
    borderColor: '#D4AF37',
    borderWidth: 2,
  },
  centerNumber: {
    fontWeight: '900',
    fontStyle: 'italic',
    transform: [{ rotate: '26deg' }], // counter-rotate so number stands upright
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 2,
    includeFontPadding: false,
  },
  centerActionCol: {
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '26deg' }], // counter-rotate
  },
  actionBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    fontStyle: 'italic',
    marginTop: -2,
  },
  wildLabel: {
    color: colors.gold,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 2,
  },
  wildDrawFourText: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '900',
    fontStyle: 'italic',
    marginTop: -2,
  },
});
