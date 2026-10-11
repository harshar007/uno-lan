import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

interface Props {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  serverUrl?: string;
  isLocal?: boolean;
}

export const ConnectionBadge: React.FC<Props> = ({ status, serverUrl, isLocal = true }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return COLORS.success;
      case 'connecting':
        return COLORS.warning;
      case 'error':
        return COLORS.warning;
      case 'disconnected':
      default:
        return COLORS.primaryGold;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'LAN MULTIPLAYER ACTIVE';
      case 'connecting':
        return 'CONNECTING TO LAN...';
      case 'error':
        return 'STANDALONE (LOCAL READY)';
      case 'disconnected':
      default:
        return 'STANDALONE MODE • ZERO LAG';
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
      <Text style={styles.text}>{getStatusText()}</Text>
      {status === 'connected' && serverUrl && (
        <Text style={styles.url}>({serverUrl.replace(/^http:\/\//, '')})</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#121212',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#262626',
    alignSelf: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  text: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  url: {
    color: COLORS.primaryGold,
    fontSize: 9,
    fontWeight: '600',
  },
});
