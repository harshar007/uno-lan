import React from 'react';
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { SPRING_CONFIG } from '../theme/animation';
import { haptic } from '../services/haptics';

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const GoldenButton: React.FC<Props> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      haptic.lightImpact();
      scale.value = withSpring(0.96, SPRING_CONFIG.buttonTap);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRING_CONFIG.buttonTap);
  };

  return (
    <Animated.View style={[styles.wrapper, style, animatedStyle, disabled && styles.disabledWrapper]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
      >
        <LinearGradient
          colors={
            disabled
              ? ['#3A3A3A', '#222222']
              : [colors.gold, colors.goldMetallic, colors.goldDeep]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {loading ? (
            <ActivityIndicator color="#080808" size="small" />
          ) : (
            <>
              {icon}
              <Text style={[styles.text, textStyle, disabled && styles.disabledText]}>
                {title}
              </Text>
            </>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledWrapper: {
    shadowOpacity: 0,
    elevation: 0,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  text: {
    color: '#080808',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  disabledText: {
    color: '#888888',
  },
});
