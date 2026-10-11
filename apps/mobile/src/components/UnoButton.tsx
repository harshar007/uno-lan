import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors.js';

interface Props {
  onPress: () => void;
  disabled?: boolean;
}

export const UnoButton: React.FC<Props> = ({ onPress, disabled = false }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, disabled && styles.disabledButton]}
    >
      <Text style={[styles.text, disabled && styles.disabledText]}>UNO!</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.brightYellow,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: COLORS.brightYellow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#333333',
    borderColor: '#222222',
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
