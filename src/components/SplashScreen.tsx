import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { SPRING_CONFIG } from '../theme/animation';

interface Props {
  onFinish: () => void;
}

export const CinematicSplash: React.FC<Props> = ({ onFinish }) => {
  // Shared values for sequence
  const ringScale = useSharedValue(0.2);
  const ringOpacity = useSharedValue(0);

  const card1Translate = useSharedValue(-120);
  const card2Translate = useSharedValue(120);
  const cardsOpacity = useSharedValue(0);

  const logoScale = useSharedValue(0.7);
  const logoOpacity = useSharedValue(0);

  const taglineOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(15);

  useEffect(() => {
    // 1. Reveal gold ring
    ringScale.value = withTiming(1, { duration: 550, easing: Easing.out(Easing.cubic) });
    ringOpacity.value = withTiming(1, { duration: 400 });

    // 2. Animate cards into center
    cardsOpacity.value = withDelay(250, withTiming(1, { duration: 350 }));
    card1Translate.value = withDelay(250, withSpring(-15, SPRING_CONFIG.cardLift));
    card2Translate.value = withDelay(250, withSpring(15, SPRING_CONFIG.cardLift));

    // 3. Reveal logo with shimmer
    logoOpacity.value = withDelay(500, withTiming(1, { duration: 400 }));
    logoScale.value = withDelay(500, withSpring(1, SPRING_CONFIG.cardLift));

    // 4. Reveal tagline
    taglineOpacity.value = withDelay(800, withTiming(1, { duration: 450 }));
    taglineTranslateY.value = withDelay(800, withTiming(0, { duration: 450 }));

    // 5. Automatically complete after 2.3 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 2300);

    return () => clearTimeout(timer);
  }, [ringScale, ringOpacity, cardsOpacity, card1Translate, card2Translate, logoOpacity, logoScale, taglineOpacity, taglineTranslateY, onFinish]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const card1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: card1Translate.value }, { rotate: '-12deg' }],
    opacity: cardsOpacity.value,
  }));

  const card2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: card2Translate.value }, { rotate: '12deg' }],
    opacity: cardsOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: taglineTranslateY.value }],
    opacity: taglineOpacity.value,
  }));

  return (
    <Pressable onPress={onFinish} style={styles.container}>
      {/* Background ring */}
      <Animated.View style={[styles.goldRing, ringStyle]} />

      {/* Flanking mini cards */}
      <View style={styles.cardsRow}>
        <Animated.View style={[styles.miniCard, styles.cardRed, card1Style]}>
          <Text style={styles.miniCardText}>7</Text>
        </Animated.View>
        <Animated.View style={[styles.miniCard, styles.cardBlue, card2Style]}>
          <Text style={styles.miniCardText}>⇄</Text>
        </Animated.View>
      </View>

      {/* Main Logo */}
      <Animated.View style={[styles.logoBox, logoStyle]}>
        <Text style={styles.brandStack}>STACK</Text>
        <View style={styles.unoTag}>
          <Text style={styles.brandUno}>UNO</Text>
        </View>
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={taglineStyle}>
        <Text style={styles.tagline}>Stack Your Cards. Rule the Game.</Text>
      </Animated.View>

      <Text style={styles.tapPrompt}>Tap anywhere to continue</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  goldRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.5,
    borderColor: colors.goldMetallic,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  cardsRow: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniCard: {
    width: 48,
    height: 72,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#FFFFFF66',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  cardRed: {
    backgroundColor: colors.cardRed,
  },
  cardBlue: {
    backgroundColor: colors.cardBlue,
  },
  miniCardText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 20,
  },
  logoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  brandStack: {
    fontSize: 44,
    fontWeight: '900',
    color: colors.gold,
    letterSpacing: 4,
    textShadowColor: 'rgba(212, 175, 55, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  unoTag: {
    backgroundColor: colors.brightYellow,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    transform: [{ rotate: '-4deg' }],
  },
  brandUno: {
    fontSize: 44,
    fontWeight: '900',
    color: '#080808',
    letterSpacing: 2,
  },
  tagline: {
    marginTop: 14,
    color: colors.goldMetallic,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  tapPrompt: {
    position: 'absolute',
    bottom: 40,
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 1,
  },
});
