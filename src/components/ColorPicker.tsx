import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { CardColor } from '@stack-uno/game-engine';
import { colors } from '../theme/colors';
import { SPRING_CONFIG, ANIMATION_TIMING } from '../theme/animation';

interface Props {
  visible: boolean;
  onSelectColor: (color: CardColor) => void;
  onClose?: () => void;
}

export const ColorPicker: React.FC<Props> = ({ visible, onSelectColor, onClose }) => {
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, SPRING_CONFIG.modalPopup);
      opacity.value = withTiming(1, { duration: ANIMATION_TIMING.modalEntrance });
    } else {
      scale.value = 0.85;
      opacity.value = 0;
    }
  }, [visible, scale, opacity]);

  const dialogAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const colorOptions: Array<{ color: CardColor; label: string; hex: string }> = [
    { color: 'red', label: 'RED', hex: colors.cardRed },
    { color: 'blue', label: 'BLUE', hex: colors.cardBlue },
    { color: 'green', label: 'GREEN', hex: colors.cardGreen },
    { color: 'yellow', label: 'YELLOW', hex: colors.cardYellow },
  ];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View style={[styles.dialog, dialogAnimatedStyle]}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Text style={styles.title}>CHOOSE NEXT COLOR</Text>
            <Text style={styles.subtitle}>Select the color to continue gameplay</Text>

            <View style={styles.grid}>
              {colorOptions.map((item) => (
                <Pressable
                  key={item.color}
                  onPress={() => onSelectColor(item.color)}
                  style={({ pressed }) => [
                    styles.colorButton,
                    { backgroundColor: item.hex },
                    pressed && styles.colorButtonPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      item.color === 'yellow' && styles.darkText,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {onClose && (
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.cancelButtonPressed,
                ]}
              >
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </Pressable>
            )}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    borderWidth: 2,
    borderColor: colors.goldMetallic,
    alignItems: 'center',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.gold,
    letterSpacing: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginVertical: 12,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginTop: 8,
  },
  colorButton: {
    width: 120,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  colorButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 1,
  },
  darkText: {
    color: '#111111',
  },
  cancelButton: {
    marginTop: 18,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 10,
    backgroundColor: '#262626',
    borderWidth: 1,
    borderColor: '#3D3D3D',
    alignSelf: 'center',
  },
  cancelButtonPressed: {
    opacity: 0.7,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});
