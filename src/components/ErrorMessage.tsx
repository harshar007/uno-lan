import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme/colors';

interface Props {
  message: string | null;
  onDismiss?: () => void;
}

export const ErrorMessage: React.FC<Props> = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.text}>{message}</Text>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.dismiss}>
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#2D1212',
    borderColor: COLORS.error,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  icon: {
    fontSize: 16,
  },
  text: {
    color: '#FF8888',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  dismiss: {
    padding: 4,
  },
  dismissText: {
    color: '#AAAAAA',
    fontSize: 14,
    fontWeight: '700',
  },
});
