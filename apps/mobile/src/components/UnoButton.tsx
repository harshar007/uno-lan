import React, { useEffect } from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../theme/colors.js';
import { SPRING_CONFIG } from '../theme/animation.js';
import { haptic } from '../services/haptics.js';

interface Props {
  onPress: () => void;
  disabled?: boolean;
}

export const UnoButton: React.FC<Props> = ({ onPress, disabled = false }) => {
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (!disabled) {
      pulseScale.value = withRepeat(
        withTiming(1.08, { duration: 650, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      );
    } else {
      pulseScale.value = 1;
    }
  }, [disabled, pulseScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulseScale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) {
      haptic.heavyImpact();
      scale.value = withSpring(0.92, SPRING_CONFIG.buttonTap);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRING_CONFIG.buttonTap);
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        disabled={disabled}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.button, disabled && styles.disabledButton]}
      >
        <Text style={[styles.text, disabled && styles.disabledText]}>UNO!</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.brightYellow,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: colors.brightYellow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#303030',
    borderColor: '#202020',
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    color: '#080808',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 2,
  },
  disabledText: {
    color: '#666666',
  },
});
