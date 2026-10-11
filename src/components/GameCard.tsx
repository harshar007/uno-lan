import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
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
  card?: Card;
  faceDown?: boolean;
  size?: 'small' | 'medium' | 'large';
  isSelected?: boolean;
  isPlayable?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

const CARD_PALETTE = {
  red: { main: '#E71D36', dark: '#B7091E', highlight: '#FF4D63' },
  blue: { main: '#0066FF', dark: '#0047B3', highlight: '#3385FF' },
  green: { main: '#00B894', dark: '#00876C', highlight: '#2CE6BE' },
  yellow: { main: '#FFB800', dark: '#D99B00', highlight: '#FFCE33' },
  wild: { main: '#181818', dark: '#080808', highlight: '#2E2E2E' },
};

export const GameCard: React.FC<Props> = ({
  card = { id: 'unknown', type: 'number', value: 0 },
  faceDown = false,
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
      translateY.value = withSpring(-20, SPRING_CONFIG.cardLift);
      scale.value = withSpring(1.08, SPRING_CONFIG.cardLift);
    } else {
      translateY.value = withSpring(0, SPRING_CONFIG.cardLift);
      scale.value = withSpring(1, SPRING_CONFIG.cardLift);
    }
  }, [isSelected, translateY, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const cardColorKey = (card.color || 'wild') as keyof typeof CARD_PALETTE;
  const palette = CARD_PALETTE[cardColorKey] || CARD_PALETTE.wild;
  const isYellow = card.color === 'yellow';
  const isWild = card.type === 'wild' || card.type === 'wild_draw_four';

  // Authentic Playing Card Dimensions (Standard 1 : 1.48 aspect ratio)
  const isSmall = size === 'small';
  const isLarge = size === 'large';

  const width = isSmall ? 48 : isLarge ? 82 : 70;
  const height = isSmall ? 70 : isLarge ? 122 : 104;
  const borderRadius = isSmall ? 8 : isLarge ? 14 : 12;

  // Typography sizing
  const numberFontSize = isSmall ? 22 : isLarge ? 46 : 36;
  const cornerFontSize = isSmall ? 10 : isLarge ? 15 : 12;
  const actionIconSize = isSmall ? 22 : isLarge ? 46 : 36;
  const cornerIconSize = isSmall ? 10 : isLarge ? 14 : 12;

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
              color: palette.main,
            },
          ]}
        >
          {renderNumberText(card.value)}
        </Text>
      );
    }

    if (card.type === 'skip') {
      return <SkipIcon color={palette.main} size={actionIconSize} />;
    }

    if (card.type === 'reverse') {
      return <ReverseIcon color={palette.main} size={actionIconSize} />;
    }

    if (card.type === 'draw_two') {
      return (
        <View style={styles.centerActionCol}>
          <DrawTwoIcon color={palette.main} size={actionIconSize * 0.85} />
          <Text style={[styles.actionBadgeText, { color: palette.main }]}>+2</Text>
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

  // -------------------------------------------------------------
  // REAL FACE-DOWN CARD BACK (Deep black with iconic tilted red oval)
  // -------------------------------------------------------------
  if (faceDown) {
    return (
      <Animated.View style={[animatedStyle, { zIndex: isSelected ? 50 : 1 }]}>
        <View
          style={[
            styles.cardOuterBezel,
            {
              width,
              height,
              borderRadius,
            },
          ]}
        >
          <LinearGradient
            colors={['#181818', '#0A0A0A']}
            style={[styles.cardInnerField, { borderRadius: borderRadius - 2 }]}
          >
            {/* Inner Gold Border */}
            <View style={styles.cardBackGoldRim}>
              {/* Tilted Signature Red Oval */}
              <View style={styles.cardBackRedOval}>
                <Text style={styles.cardBackUnoText}>UNO</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </Animated.View>
    );
  }

  // -------------------------------------------------------------
  // REAL FACE-UP CARD
  // -------------------------------------------------------------
  return (
    <Animated.View style={[animatedStyle, { zIndex: isSelected ? 50 : 1 }]}>
      <Pressable
        disabled={disabled || !onPress}
        onPress={() => {
          haptic.selection();
          onPress?.();
        }}
        style={[
          styles.cardOuterBezel,
          {
            width,
            height,
            borderRadius,
          },
          isSelected && styles.selectedGlow,
          isPlayable && !isSelected && styles.playableGlow,
          disabled && !isPlayable && styles.disabledCard,
        ]}
      >
        {/* Inner Colored Field with Satin Light Gradient */}
        <LinearGradient
          colors={[palette.highlight, palette.main, palette.dark]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={[
            styles.cardInnerField,
            { borderRadius: borderRadius - 2 },
            isWild && styles.wildCardBorder,
          ]}
        >
          {/* Top-Left Corner */}
          <View style={styles.topLeftCorner}>{renderCornerContent()}</View>

          {/* Tilted Signature White Center Oval */}
          <View
            style={[
              styles.centerWhiteOval,
              isWild && styles.wildCenterOval,
            ]}
          >
            {renderCenterContent()}
          </View>

          {/* Bottom-Right Corner (180° rotated) */}
          <View style={styles.bottomRightCorner}>{renderCornerContent()}</View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardOuterBezel: {
    backgroundColor: '#FFFFFF',
    padding: 3.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  cardInnerField: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  wildCardBorder: {
    borderWidth: 1.5,
    borderColor: '#D4AF37',
  },
  selectedGlow: {
    borderColor: colors.gold,
    shadowColor: colors.gold,
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 14,
    backgroundColor: '#FFEFA6',
  },
  playableGlow: {
    borderColor: '#FFF5B8',
    shadowColor: colors.gold,
    shadowOpacity: 0.7,
    shadowRadius: 8,
  },
  disabledCard: {
    opacity: 0.68,
  },
  topLeftCorner: {
    position: 'absolute',
    top: 3,
    left: 4,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomRightCorner: {
    position: 'absolute',
    bottom: 3,
    right: 4,
    zIndex: 10,
    transform: [{ rotate: '180deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerText: {
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.65)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  darkCornerText: {
    color: '#151515',
    textShadowColor: 'rgba(255,255,255,0.4)',
  },
  centerWhiteOval: {
    width: '84%',
    height: '66%',
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-28deg' }],
    shadowColor: '#000000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  wildCenterOval: {
    backgroundColor: '#0F0F0F',
    borderColor: '#D4AF37',
    borderWidth: 2,
  },
  centerNumber: {
    fontWeight: '900',
    fontStyle: 'italic',
    transform: [{ rotate: '28deg' }], // counter-rotate upright
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 2,
    includeFontPadding: false,
  },
  centerActionCol: {
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '28deg' }], // counter-rotate upright
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
  cardBackGoldRim: {
    width: '92%',
    height: '92%',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBackRedOval: {
    width: '82%',
    height: '62%',
    backgroundColor: '#E71D36',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-28deg' }],
    shadowColor: '#000000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  cardBackUnoText: {
    color: '#FFD700',
    fontWeight: '900',
    fontStyle: 'italic',
    fontSize: 17,
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
});
