import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { TurnDirection, GameMode } from '@stack-uno/game-engine';
import { colors } from '../theme/colors';
import { ANIMATION_TIMING } from '../theme/animation';

interface Props {
  direction: TurnDirection;
  mode: GameMode;
}

export const DirectionIndicator: React.FC<Props> = ({ direction, mode }) => {
  const isClockwise = direction === 1;
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Animate sweep rotation when direction changes
    rotation.value = withTiming(isClockwise ? 0 : 180, {
      duration: ANIMATION_TIMING.reverseEffect,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [direction, isClockwise, rotation]);

  const arrowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Animated.View style={arrowAnimatedStyle}>
          <Text style={styles.arrow}>{isClockwise ? '↻' : '↺'}</Text>
        </Animated.View>
        <Text style={styles.label}>
          {isClockwise ? 'CLOCKWISE' : 'COUNTER-CLOCKWISE'}
        </Text>
      </View>
      {mode === 'reverse' && (
        <View style={styles.reverseModeTag}>
          <Text style={styles.reverseText}>REVERSE MODE</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#141414',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.goldMetallic,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  arrow: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: '900',
  },
  label: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  reverseModeTag: {
    backgroundColor: colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
  },
  reverseText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
