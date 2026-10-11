import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { COLORS } from '../theme/colors.js';

interface Props {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<Props> = ({ visible, message = 'Loading...' }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={COLORS.primaryGold} />
          <Text style={styles.text}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: COLORS.surfaceElevated,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.metallicGold,
    alignItems: 'center',
    gap: 12,
  },
  text: {
    color: COLORS.primaryGold,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
