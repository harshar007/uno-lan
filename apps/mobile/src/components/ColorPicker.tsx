import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { CardColor } from '@stack-uno/game-engine';
import { COLORS } from '../theme/colors.js';

interface Props {
  visible: boolean;
  onSelectColor: (color: CardColor) => void;
  onClose?: () => void;
}

export const ColorPicker: React.FC<Props> = ({ visible, onSelectColor }) => {
  const colorOptions: Array<{ color: CardColor; label: string; hex: string }> = [
    { color: 'red', label: 'RED', hex: COLORS.cardRed },
    { color: 'blue', label: 'BLUE', hex: COLORS.cardBlue },
    { color: 'green', label: 'GREEN', hex: COLORS.cardGreen },
    { color: 'yellow', label: 'YELLOW', hex: COLORS.cardYellow },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>CHOOSE NEXT COLOR</Text>
          <Text style={styles.subtitle}>Select the color to continue gameplay</Text>

          <View style={styles.grid}>
            {colorOptions.map((item) => (
              <TouchableOpacity
                key={item.color}
                activeOpacity={0.8}
                onPress={() => onSelectColor(item.color)}
                style={[styles.colorButton, { backgroundColor: item.hex }]}
              >
                <Text
                  style={[
                    styles.buttonText,
                    item.color === 'yellow' && styles.darkText,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    borderWidth: 2,
    borderColor: COLORS.metallicGold,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primaryGold,
    letterSpacing: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
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
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  darkText: {
    color: '#111111',
  },
});
